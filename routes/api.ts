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
import {
    createParkingLot,
    deleteParkingLot,
    getAllParkingLots,
    getParkingLotById,
    updateParkingLot
} from "../controllers/parkingLot.controller";
import {getAllUsers, getUserById, updateUser} from "../controllers/user.controller";
import {
    createReservation,
    deleteReservation,
    getAllReservations,
    getReservationById,
    updateReservation
} from "../controllers/reservation.controller";
import { createPlan, deletePlan, getAllPlans, getPlanById, updatePlan } from "../controllers/plan.controller";
import {
    createPlanParkingLot
    , deletePlanParkingLot,
    getAllPlanParkingLots,
    getPlanParkingLotById, updatePlanParkingLot
} from "../controllers/planParkingLot.controller";
import {createSubscription, getAllSubscriptions, getSubscriptionById} from "../controllers/subscription.controller";


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


//parking Lots
    app.post("/parking-lot", createParkingLot);
    app.get("/parking-lot", getAllParkingLots);
    app.get("/parking-lot/:id", getParkingLotById);
    app.put("/parking-lot/:id", updateParkingLot);
    app.delete("/parking-lot/:id", deleteParkingLot);


//users
    app.get("/users", getAllUsers);
    app.get("/users/:id", getUserById);
    app.put("/users/:id", updateUser);
//reservations
    app.post("/reservations", createReservation);
    app.get("/reservations", getAllReservations);
    app.get("/reservations/:id", getReservationById);
    app.put("/reservations/:id", updateReservation);
    app.delete("/reservations/:id", deleteReservation);
// plans
    app.post("/plans", createPlan);
    app.get("/plans", getAllPlans);
    app.get("/plans/:id", getPlanById);
    app.put("/plans/:id", updatePlan);
    app.delete("/plans/:id", deletePlan);
//plan parking
    app.post("/plan-parking-lot", createPlanParkingLot);
    app.get("/plan-parking-lot", getAllPlanParkingLots);
    app.get("/plan-parking-lot/:id", getPlanParkingLotById);
    app.put("/plan-parking-lot/:id", updatePlanParkingLot);
    app.delete("/plan-parking-lot/:id", deletePlanParkingLot);



    app.post("/subscriptions", createSubscription);
    app.get("/subscriptions", getAllSubscriptions);
    app.get("/subscriptions/:id", getSubscriptionById);
}