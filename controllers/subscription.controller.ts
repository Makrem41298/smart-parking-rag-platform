import {Response} from "express";
import {SubscriptionModel} from "../models/subscription.model";
import {UserModel} from "../models/user.model";
import {PlanParkingLotModel} from "../models/planParkingLot.model";
import {Role, SubscriptionStatus} from "../models/enum.type";
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
            return res.status(400).json({ message: "Invalid plan date expires or don't  starts" });
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
        const whereCondition =
            _req.user?.role === Role.ADMIN || _req.user?.role === Role.SUPER_ADMIN
                ? {}
                : { userId: _req.user.id };
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
        const whereCondition =  req.user?.role === Role.ADMIN || req.user?.role === Role.SUPER_ADMIN? {id:id} : { userId: req.user.id ,id:id};



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



export const updateSubscription = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;





        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        if (!Object.values(SubscriptionStatus).includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Allowed values: ${Object.values(SubscriptionStatus).join(", ")}`
            });
        }

        if (status === SubscriptionStatus.EXPIRED) {
            return res.status(400).json({
                message: "You cannot manually set subscription as expired"
            });
        }

        // @ts-ignore
        const subscription = await SubscriptionModel.findByPk(id);
        if (req.user?.role==Role.CLIENT){
            if (subscription.userId!=req.user?.id){
                return res.status(400).json({ message: "Unauthorized" });
            }
        }



        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        if (subscription.status === SubscriptionStatus.CANCELED) {
            return res.status(400).json({
                message: "Subscription is already canceled"
            });
        }

        if (subscription.endDate < new Date()) {
            return res.status(400).json({
                message: "Subscription already expired"
            });
        }

        await subscription.update({ status });

        return res.status(200).json({
            message: "Subscription updated successfully",
            subscription
        });

    } catch (error) {
        console.error("Error updating subscription:", error);

        return res.status(500).json({
            message: "Internal server error",
            error
        });
    }
};