import {Application} from "express";
import {changePassword, getProfile, login, logout, refreshToken, register} from "../controllers/auth.controller";
import {authMiddleware} from "../middlewares/auth.middleware";

import express from "express";

import {
    createTarifGrid,
    deleteTarifGrid,
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
import {createAdmin, getAllUsers, getUserById, updateUser} from "../controllers/user.controller";
import {
    createReservation,
    getAllReservations,
    getReservationById,
    updateReservation
} from "../controllers/reservation.controller";
import {createPlan, deletePlan, getAllPlans, getPlanById, updatePlan} from "../controllers/plan.controller";
import {
    createPlanParkingLot,
    deletePlanParkingLot,
    getAllPlanParkingLots,
    getPlanParkingLotById,
    updatePlanParkingLot
} from "../controllers/planParkingLot.controller";
import {createSubscription, getAllSubscriptions, getSubscriptionById, updateSubscription} from "../controllers/subscription.controller";
import {requireRole} from "../middlewares/role.middleware";
import {Role} from "../models/enum.type";
import {
    createReclamation,
    deleteReclamation,
    getAllReclamations,
    getReclamationById,
    updateReclamation
} from "../controllers/reclamation.controller";
import {
    agentAnonymousResponse,
    agentClientResponse,
    agentResponse,
    deleteFiles,
    downloadFile,
    getFiles,
    getVectorstoreStatus,
    uploadFiles
} from "../controllers/agent.controller";
import sequelize from "../models";
import { QueryTypes } from "sequelize";

import {  Request, Response } from "express";
import multer from "multer";
import {initCheckout, webhook, getPaymentByReservation, getAllTransactions, getTransactionById, requestRefund, approveRefund, rejectRefund} from "../controllers/payment.controller";
export default function routes(app: Application): void {


    //auth users
    app.post("/register", register);
    app.post("/login", login);
    app.post("/refresh",authMiddleware, refreshToken);
    app.post("/logout", authMiddleware, logout);
    app.get("/profile", authMiddleware, getProfile);
    app.put("/change-password", authMiddleware, changePassword);


//tariff grids
    app.post("/tarif-grid", authMiddleware,requireRole([Role.ADMIN,Role.SUPER_ADMIN]), createTarifGrid);
    app.get("/tarif-grid", getAllTarifGrids);
    app.get("/tarif-grid/:id", getTarifGridById);
    app.put("/tarif-grid/:id", authMiddleware,requireRole([Role.ADMIN,Role.SUPER_ADMIN]), updateTarifGrid);
    app.delete("/tarif-grid/:id", authMiddleware,requireRole([Role.ADMIN,Role.SUPER_ADMIN]), deleteTarifGrid);


//parking Lots
    const uploadParking = multer({ dest: "uploads/parking-lots/" });

    app.post("/parking-lot", uploadParking.single("image"), authMiddleware,requireRole([Role.ADMIN,Role.SUPER_ADMIN]), createParkingLot);
    app.get("/parking-lot", getAllParkingLots);
    app.get("/parking-lot/:id", getParkingLotById);
    app.put("/parking-lot/:id",uploadParking.single("image"),authMiddleware,requireRole([Role.ADMIN,Role.SUPER_ADMIN]), updateParkingLot);
    app.delete("/parking-lot/:id", authMiddleware,requireRole([Role.ADMIN,Role.SUPER_ADMIN]), deleteParkingLot);


//users
    app.get("/users", authMiddleware,requireRole([Role.ADMIN,Role.SUPER_ADMIN]), getAllUsers);
    app.get("/users/:id", authMiddleware,requireRole([Role.ADMIN,Role.SUPER_ADMIN]), getUserById);
    app.put("/users/:id", authMiddleware,requireRole([Role.ADMIN,Role.SUPER_ADMIN]), updateUser);
    app.post("/users", authMiddleware,requireRole([Role.SUPER_ADMIN]), createAdmin);
//reservations
    app.post("/reservations", authMiddleware,requireRole([Role.CLIENT]), createReservation);
    app.get("/reservations",authMiddleware, getAllReservations);
    app.get("/reservations/:id",authMiddleware, getReservationById);
    app.put("/reservations/:id",authMiddleware, updateReservation);
// plans
    app.post("/plans", authMiddleware,requireRole([Role.ADMIN,Role.SUPER_ADMIN]), createPlan);
    app.get("/plans", getAllPlans);
    app.get("/plans/:id", getPlanById);
    app.put("/plans/:id", authMiddleware,requireRole([Role.ADMIN,Role.SUPER_ADMIN]), updatePlan);
    app.delete("/plans/:id", authMiddleware,requireRole([Role.ADMIN,Role.SUPER_ADMIN]), deletePlan);
//parking's plan
    app.post("/plan-parking-lot", authMiddleware,requireRole([Role.ADMIN,Role.SUPER_ADMIN]), createPlanParkingLot);
    app.get("/plan-parking-lot", getAllPlanParkingLots);
    app.get("/plan-parking-lot/:id", getPlanParkingLotById);
    app.put("/plan-parking-lot/:id", authMiddleware,requireRole([Role.ADMIN,Role.SUPER_ADMIN]), updatePlanParkingLot);
    app.delete("/plan-parking-lot/:id", authMiddleware,requireRole([Role.ADMIN,Role.SUPER_ADMIN]), deletePlanParkingLot);

//subscription
    app.post("/subscriptions",authMiddleware,requireRole([Role.CLIENT]), createSubscription);
    app.get("/subscriptions",authMiddleware, getAllSubscriptions);
    app.get("/subscriptions/:id",authMiddleware, getSubscriptionById);
    app.put("/subscriptions/:id",authMiddleware,updateSubscription)
//Reclamation

    app.post("/reclamation",authMiddleware,requireRole([Role.CLIENT]),createReclamation)
    app.get("/reclamation/:id",authMiddleware,getReclamationById)
    app.get("/reclamations",authMiddleware,getAllReclamations)
    app.delete("/reclamation/:id",authMiddleware,deleteReclamation)
    app.put("/reclamation/:id",authMiddleware,updateReclamation)

    const upload = multer({
        dest: "temp/",
    });
    app.post("/upload",authMiddleware,requireRole([Role.SUPER_ADMIN]), upload.array("files"),uploadFiles)
    app.post("/agent",authMiddleware,requireRole([Role.SUPER_ADMIN,Role.ADMIN]),agentResponse)
    app.post("/agent-client",authMiddleware,requireRole([Role.CLIENT]),agentClientResponse)
    app.post("/agent-anonymous",agentAnonymousResponse)

    app.get("/files",authMiddleware,requireRole([Role.SUPER_ADMIN]),getFiles)

    app.post("/files/delete-batch", authMiddleware,requireRole([Role.SUPER_ADMIN]), deleteFiles);
    app.get("/files/:filename/download", authMiddleware,requireRole([Role.SUPER_ADMIN]), downloadFile);
    app.get("/vectorstore/status", authMiddleware,requireRole([Role.SUPER_ADMIN]),getVectorstoreStatus);


    app.post("/create-checkout-session", authMiddleware, initCheckout)
    app.post("/api/stripe/webhook",  express.raw({ type: "application/json" }), webhook);
    app.get("/payments/reservation/:reservationId", authMiddleware, getPaymentByReservation);
    app.get("/transactions", authMiddleware, getAllTransactions);
    app.get("/transactions/:id", authMiddleware, getTransactionById);
    app.post("/transactions/:id/refund-request", authMiddleware, requestRefund);
    app.post("/transactions/:id/refund-approve", authMiddleware, requireRole([Role.ADMIN, Role.SUPER_ADMIN]), approveRefund);
    app.post("/transactions/:id/refund-reject", authMiddleware, requireRole([Role.ADMIN, Role.SUPER_ADMIN]), rejectRefund);

}