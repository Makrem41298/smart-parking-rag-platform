import { Response} from "express";
import {UserModel} from "../models/user.model";
import {AccountStatus, Role} from "../models/enum.type";
import {AuthRequest} from "../middlewares/auth.middleware";
import {Op} from "sequelize";
import bcrypt from "bcrypt";


// Get all users
export const getAllUsers = async (_req: AuthRequest, res: Response) => {
    try {


        const whereCondition = _req.user?.role === Role.SUPER_ADMIN ? {role: Role.SUPER_ADMIN} : { role: [Role.SUPER_ADMIN,Role.ADMIN],};

        const users = await UserModel.findAll({
            attributes: ["id", "firstName", "lastName", "email", "phone","CIN","accountStatus","role",],
            where:{  [Op.not]: whereCondition ,
            }
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get user by ID
export const getUserById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;




        const whereCondition = req.user?.role === Role.SUPER_ADMIN ? {role: Role.SUPER_ADMIN} : { role: [Role.SUPER_ADMIN,Role.ADMIN],};

        const user = await UserModel.findOne({
            where: {
                id: id,
                [Op.not]: whereCondition
            },
            attributes: [
                "id",
                "firstName",
                "lastName",
                "email",
                "phone",
                "CIN",
                "accountStatus",
                "role",
            ],
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Update user
export const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const {
            accountStatus,
            firstName,
            lastName,
            email,
            password,
            role,
            phone,
            CIN
        } = req.body;

        // Validate accountStatus
        if (accountStatus && !Object.values(AccountStatus).includes(accountStatus)) {
            return res.status(400).json({
                message: `Invalid accountStatus. Allowed: ${Object.values(AccountStatus).join(", ")}`,
            });
        }

        if (req.user?.role !== Role.SUPER_ADMIN && role) {
            return res.status(403).json({
                message: "You are not allowed to change roles",
            });
        }

        const dataToUpdate: any = {
            accountStatus,
            firstName,
            lastName,
            email,
            phone,
            CIN,
        };

        if (req.user?.role === Role.SUPER_ADMIN && role) {
            dataToUpdate.role = role;
        }

        // 🔐 hash password
        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        Object.keys(dataToUpdate).forEach((key) => {
            if (dataToUpdate[key] === undefined) {
                delete dataToUpdate[key];
            }
        });

        const forbiddenRoles =
            req.user?.role === Role.SUPER_ADMIN
                ? [Role.SUPER_ADMIN]
                : [Role.SUPER_ADMIN, Role.ADMIN];

        const [updatedRows] = await UserModel.update(dataToUpdate, {
            where: {
                id: id,
                role: {
                    [Op.notIn]: forbiddenRoles,
                },
            },
        });

        if (updatedRows === 0) {
            return res.status(404).json({
                message: "User not found or not allowed to update",
            });
        }

        return res.status(200).json({
            message: "User updated successfully",
        });

    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};


export const createAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const { firstName, lastName, email, password, phone, CIN } = req.body;

        if (!firstName || !lastName || !email || !password || !phone || !CIN) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        const admin = await UserModel.create({
            firstName,
            lastName,
            email,
            password,
            CIN,
            role:Role.ADMIN,
            phone
        })


        return res.status(201).json(admin)
    }catch (e){
        console.log(e)
        return res.status(400).json({message:"error:",e})
    }
}




