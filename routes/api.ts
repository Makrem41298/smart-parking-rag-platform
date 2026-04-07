import { Application } from "express";
import {changePassword, getProfile, login, logout, refreshToken, register} from "../controllers/auth.controller";
import {authMiddleware} from "../middlewares/auth.middleware";
import {createTarifGrid, deleteTarifGrid, getAllTarifGrids, getTarifGridById, updateTarifGrid} from "../controllers/tarifGrid.controller";
import {createParkingLot, deleteParkingLot, getAllParkingLots, getParkingLotById, updateParkingLot} from "../controllers/parkingLot.controller";
import {getAllUsers, getUserById, updateStatusUser} from "../controllers/user.controller";
import {createReservation, getAllReservations, getReservationById, updateReservation} from "../controllers/reservation.controller";
import { createPlan, deletePlan, getAllPlans, getPlanById, updatePlan } from "../controllers/plan.controller";
import {createPlanParkingLot, deletePlanParkingLot, getAllPlanParkingLots, getPlanParkingLotById, updatePlanParkingLot} from "../controllers/planParkingLot.controller";
import {createSubscription, getAllSubscriptions, getSubscriptionById} from "../controllers/subscription.controller";
import {requireRole} from "../middlewares/role.middleware";
import {Role} from "../models/enum.type";
import {
    createReclamation,
    deleteReclamation,
    getAllReclamations,
    getReclamationById,
    updateReclamation
} from "../controllers/reclamation.controller";


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
    app.post("/refresh",authMiddleware, refreshToken);
    app.post("/logout", authMiddleware, logout);
    app.get("/profile", authMiddleware, getProfile);
    app.put("/change-password", authMiddleware, changePassword);


//tariff grids
    app.post("/tarif-grid", authMiddleware,requireRole([Role.ADMIN]), createTarifGrid);
    app.get("/tarif-grid", getAllTarifGrids);
    app.get("/tarif-grid/:id", getTarifGridById);
    app.put("/tarif-grid/:id", authMiddleware,requireRole([Role.ADMIN]), updateTarifGrid);
    app.delete("/tarif-grid/:id", authMiddleware,requireRole([Role.ADMIN]), deleteTarifGrid);


//parking Lots
    app.post("/parking-lot", authMiddleware,requireRole([Role.ADMIN]), createParkingLot);
    app.get("/parking-lot", getAllParkingLots);
    app.get("/parking-lot/:id", getParkingLotById);
    app.put("/parking-lot/:id", authMiddleware,requireRole([Role.ADMIN]), updateParkingLot);
    app.delete("/parking-lot/:id", authMiddleware,requireRole([Role.ADMIN]), deleteParkingLot);


//users
    app.get("/users", authMiddleware,requireRole([Role.ADMIN]), getAllUsers);
    app.get("/users/:id", authMiddleware,requireRole([Role.ADMIN]), getUserById);
    app.put("/users/:id", authMiddleware,requireRole([Role.ADMIN]), updateStatusUser);
//reservations
    app.post("/reservations", authMiddleware,requireRole([Role.CLIENT]), createReservation);
    app.get("/reservations",authMiddleware, getAllReservations);
    app.get("/reservations/:id",authMiddleware, getReservationById);
    app.put("/reservations/:id",authMiddleware, updateReservation);
// plans
    app.post("/plans", authMiddleware,requireRole([Role.ADMIN]), createPlan);
    app.get("/plans", authMiddleware,requireRole([Role.ADMIN]), getAllPlans);
    app.get("/plans/:id", authMiddleware,requireRole([Role.ADMIN]), getPlanById);
    app.put("/plans/:id", authMiddleware,requireRole([Role.ADMIN]), updatePlan);
    app.delete("/plans/:id", authMiddleware,requireRole([Role.ADMIN]), deletePlan);
//parking 's plan
    app.post("/plan-parking-lot", authMiddleware,requireRole([Role.ADMIN]), createPlanParkingLot);
    app.get("/plan-parking-lot", getAllPlanParkingLots);
    app.get("/plan-parking-lot/:id", getPlanParkingLotById);
    app.put("/plan-parking-lot/:id", authMiddleware,requireRole([Role.ADMIN]), updatePlanParkingLot);
    app.delete("/plan-parking-lot/:id", authMiddleware,requireRole([Role.ADMIN]), deletePlanParkingLot);

//subscription
    app.post("/subscriptions",authMiddleware,requireRole([Role.CLIENT]), createSubscription);
    app.get("/subscriptions",authMiddleware, getAllSubscriptions);
    app.get("/subscriptions/:id",authMiddleware, getSubscriptionById);
//Reclamation

    app.post("/reclamation",authMiddleware,createReclamation)
    app.get("/reclamation/:id",authMiddleware,getReclamationById)
    app.get("/reclamation",authMiddleware,getAllReclamations)
    app.delete("/reclamation/:id",authMiddleware,deleteReclamation)
    app.put("/reclamation/:id",authMiddleware,updateReclamation)




}