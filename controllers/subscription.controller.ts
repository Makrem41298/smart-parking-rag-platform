import {  Response } from "express";
import { SubscriptionModel } from "../models/subscription.model";
import { UserModel } from "../models/user.model";
import { PlanParkingLotModel } from "../models/planParkingLot.model";
import {Role} from "../models/enum.type";
import {AuthRequest} from "../middlewares/auth.middleware";
import {PlanModel} from "../models/plan.model";


// Create subscription
export const createSubscription = async (req: AuthRequest, res: Response) => {
    try {
        const { planParkingLotId } = req.body;
        if (!planParkingLotId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({ message: "not authorized" });
        }

        const planParkingLot = await PlanParkingLotModel.findByPk(planParkingLotId);
        if (!planParkingLot) {
            return res.status(400).json({ message: "Invalid planParkingLotId" });
        }

        const plan = await PlanModel.findByPk(planParkingLot.planId);
        if (!plan) {
            return res.status(400).json({ message: "Invalid plan" });
        }

        const numberOfBenefitDays = plan.NumberOfBenefitDays;

        const startDate = new Date();

        if (startDate < plan.startDate || startDate > plan.endDate) {
            return res.status(400).json({ message: "Invalid startDate" });
        }

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + numberOfBenefitDays);

        const subscription = await SubscriptionModel.create({
            userId,
            planParkingLotId,
            startDate,
            endDate,
        });

        return res.status(201).json(subscription);
    } catch (error) {
        console.error("Create subscription error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// Get all subscriptions
export const getAllSubscriptions = async (_req: AuthRequest, res: Response) => {
    try {


        if (!_req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const whereCondition = _req.user?.role === Role.ADMIN ? {} : { userId: _req.user.id };

        const subscriptions = await SubscriptionModel.findAll({
            where: whereCondition,
            include: [

                { model: UserModel, as: "users",attributes:["id","firstName","lastName","email"] },
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
export const getSubscriptionById = async (req: AuthRequest, res: Response) => {
    try {


        const {id}= req.params;
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const whereCondition = req.user.role === Role.ADMIN ? {id:id} : { userId: req.user.id ,id:id};



        const subscription = await SubscriptionModel.findOne({
            where: whereCondition,
            include: [

                { model: UserModel, as: "users",attributes:["id","firstName","lastName","email"] },

                { model: PlanParkingLotModel, as: "PlanParkingLots" }
            ]
        });
        if (!subscription)
            return res.status(404).json({ message: "Subscription not found" });

        return res.status(200).json(subscription);
    } catch (error) {
        console.error("Fetch subscription error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



