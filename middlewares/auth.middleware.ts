import {NextFunction, Request, Response} from "express";
import jwt, {JwtPayload} from "jsonwebtoken";
import Interceptors from "undici-types/interceptors";
import {Role} from "../models/enum.type";

export interface JwtUser {
    id: number;
    email: string;
    role: Role;
}


export interface AuthRequest extends Request {
    user?: JwtUser ;
}





export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const header = req.headers.authorization;

        if (!header) {
            return res.status(401).json({ message: "No token" });
        }



        const token = header.split(" ")[1];

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        req.user = jwt.verify(token, process.env.JWT_SECRET) as JwtUser;
        console.log(req.user);
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};