import {Request, Response} from "express";
import {AccountStatus} from "../models/EnumType";
import {User} from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {AuthRequest} from "../middlewares/auth.middleware";


export const register = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password, phone, CIN } = req.body;



        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            accountStatus: AccountStatus.ACTIVE,
            CIN
        });

        return res.status(201).json(user);

    } catch (err) {
        return res.status(400).json({ error: err });
    }
};


export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({
            where: { email },
            attributes: ["id", "firstName", "lastName", "email", "password"],
        });

        if (!user || !user.password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        const token = jwt.sign(
            {
                id: user.id?.toString(),
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        // ✅ REMOVE PASSWORD
        const { password: _, ...userData } = user.toJSON();

        return res.status(200).json({
            token,
            user: userData,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }

};


export const logout = async (req: Request, res: Response) => {
    try {
        // For stateless JWT → nothing to do on server
        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};
export const refreshToken = async (req: Request, res: Response) => {
    try {

        const header = req.headers.authorization;

        if (!header) {
            return res.status(401).json({ message: "No token" });
        }


        const token = header.split(" ")[1];


        const decoded = jwt.verify(token, process.env.JWT_SECRET!);


        const newAccessToken = jwt.sign(
            { id: (decoded as any).id },
            process.env.JWT_SECRET!,
            { expiresIn: "1d" }
        );

        return res.json({ token: newAccessToken });
    } catch {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            attributes: ["id", "firstName", "lastName", "email", "phone","CIN","accountStatus","role",],
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json(user);
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};