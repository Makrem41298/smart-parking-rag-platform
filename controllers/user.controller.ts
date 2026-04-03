import {Request, Response} from "express";
import {UserModel} from "../models/user.model";
import {AccountStatus, Role} from "../models/enum.type";


// Get all users
export const getAllUsers = async (_req: Request, res: Response) => {
    try {
        const users = await UserModel.findAll({
            attributes: ["id", "firstName", "lastName", "email", "phone","CIN","accountStatus","role",],
            where:{
                role:Role.CLIENT
            }
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const user = await UserModel.findOne({
            where: {
                id: id,
                role: Role.CLIENT,
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
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const user = await UserModel.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            CIN,
            role,
            accountStatus
        } = req.body;

        // Validate ENUMs
        if (role && !Object.values(Role).includes(role)) {
            return res.status(400).json({
                message: `Invalid role. Allowed: ${Object.values(Role).join(", ")}`
            });
        }

        if (accountStatus && !Object.values(AccountStatus).includes(accountStatus)) {
            return res.status(400).json({
                message: `Invalid accountStatus. Allowed: ${Object.values(AccountStatus).join(", ")}`
            });
        }

        // Check email uniqueness
        if (email && email !== user.email) {
            const existing = await UserModel.findOne({ where: { email } });
            if (existing) {
                return res.status(409).json({ message: "Email already exists" });
            }
        }

        await user.update({
            firstName,
            lastName,
            email,
            password,
            phone,
            CIN,
            role,
            accountStatus
        });

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
