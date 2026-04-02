import { Application } from "express";
import {getProfile, login, logout, refreshToken, register} from "../controllers/auth.controller";
import test from "node:test";
import {authMiddleware} from "../middlewares/auth.middleware";
import {
    createTarifGrid, deleteTarifGrid,
    getAllTarifGrids,
    getTarifGridById,
    updateTarifGrid
} from "../controllers/tarifGrid.controller";


export default function routes(app: Application): void {
    app.get("/", (req, res) => {
        res.send({
            status: "success",
            message: "Welcome back!",
        })
    });

    //auth users
    app.post("/register", register);
    app.post("/login", login);
    app.post("/refresh", refreshToken);
// 🔐 Protected routes
    app.post("/logout", authMiddleware, logout);
    app.get("/profile", authMiddleware, getProfile);


//tariff grids
    app.post("/tarif-grid", createTarifGrid);
    app.get("/tarif-grid", getAllTarifGrids);
    app.get("/tarif-grid/:id", getTarifGridById);
    app.put("/tarif-grid/:id", updateTarifGrid);
    app.delete("/tarif-grid/:id", deleteTarifGrid);
}