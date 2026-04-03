import { Request, Response } from "express";
import { SubscriptionModel } from "../models/subscription.model";
import { UserModel } from "../models/user.model";
import { PlanParkingLotModel } from "../models/planParkingLot.model";
import { SubscriptionStatus } from "../models/enum.type";

// Create subscription
export const createSubscription = async (req: Request, res: Response) => {
    try {
        const { userId, planParkingLotId, startDate, endDate, status } = req.body;

        if (!userId || !planParkingLotId || !startDate || !endDate) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        const user = await UserModel.findByPk(userId);
        if (!user) return res.status(400).json({ message: "Invalid userId" });

        const planParkingLot = await PlanParkingLotModel.findByPk(planParkingLotId);
        if (!planParkingLot)
            return res.status(400).json({ message: "Invalid planParkingLotId" });

        if (status && !Object.values(SubscriptionStatus).includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Allowed: ${Object.values(SubscriptionStatus).join(", ")}`
            });
        }

        const subscription = await SubscriptionModel.create({
            userId,
            planParkingLotId,
            startDate,
            endDate,
            status
        });

        return res.status(201).json(subscription);
    } catch (error) {
        console.error("Create subscription error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get all subscriptions
export const getAllSubscriptions = async (_req: Request, res: Response) => {
    try {
        const subscriptions = await SubscriptionModel.findAll({
            include: [
                { model: UserModel, as: "users" },
                { model: PlanParkingLotModel, as: "PlanParkingLots" }
            ]
        });


        return res.status(200).json(subscriptions);
    } catch (error) {
        console.error("Fetch subscriptions error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get subscription by ID
export const getSubscriptionById = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const subscription = await SubscriptionModel.findByPk(req.params.id);
        if (!subscription)
            return res.status(404).json({ message: "Subscription not found" });

        return res.status(200).json(subscription);
    } catch (error) {
        console.error("Fetch subscription error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



