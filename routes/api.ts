import { Application } from "express";

export default function authRoutes(app: Application): void {
    app.get("/", (req, res) => {
        res.send({
            status: "success",
            message: "Welcome back!",
        })
    });
}