import { Application } from "express";
import {getProfile, login, logout, refreshToken, register} from "../controllers/auth.controller";
import test from "node:test";
import {authMiddleware} from "../middlewares/auth.middleware";


export default function routes(app: Application): void {
    app.get("/", (req, res) => {
        res.send({
            status: "success",
            message: "Welcome back!",
        })
    });
    app.post("/register", register);
    app.post("/login", login);
    app.post("/refresh", refreshToken);
// 🔐 Protected routes
    app.post("/logout", authMiddleware, logout);
    app.get("/profile", authMiddleware, getProfile);
}