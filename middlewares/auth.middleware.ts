import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AccountStatus, Role } from "../models/enum.type";

export interface JwtUser {
    id: number;
    email: string;
    role: Role;
    accountStatus: AccountStatus;
}

export interface AuthRequest extends Request {
    user?: JwtUser;
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token missing" });
        }

        const token = authHeader.split(" ")[1];

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtUser;

        if (!decoded?.id || !decoded?.email) {
            return res.status(401).json({ message: "Invalid token payload" });
        }

        if (decoded.accountStatus !== AccountStatus.ACTIVE) {
            return res.status(403).json({ message: "Account is not active or blocked" });
        }

        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
