import { Request, Response } from "express";
import { PlanParkingLotModel } from "../models/planParkingLot.model";
import { PlanModel } from "../models/plan.model";
import { ParkingLots } from "../models/parkingLot.model";
import { PlanStatus } from "../models/enum.type";

// Create a plan-parking-lot link
export const createPlanParkingLot = async (req: Request, res: Response) => {
    try {
        const { planId, parkingLotId, renewFee, subscriptionFee, status } = req.body;

        // Required fields
        if (!planId || !parkingLotId || !renewFee || !subscriptionFee) {
            return res.status(400).json({
                message: "Missing required fields: planId, parkingLotId, renewFee, subscriptionFee"
            });
        }

        // Validate FK: plan
        const plan = await PlanModel.findByPk(planId);
        if (!plan) {
            return res.status(400).json({ message: "Invalid planId" });
        }

        // Validate FK: parking lot
        const parking = await ParkingLots.findByPk(parkingLotId);
        if (!parking) {
            return res.status(400).json({ message: "Invalid parkingLotId" });
        }

        // Validate ENUM
        if (status && !Object.values(PlanStatus).includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Allowed: ${Object.values(PlanStatus).join(", ")}`
            });
        }

        const link = await PlanParkingLotModel.create({
            planId,
            parkingLotId,
            renewFee,
            subscriptionFee,
            status
        });

        return res.status(201).json(link);
    } catch (error) {
        console.error("Error creating plan-parking-lot:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get all plan-parking-lot links
export const getAllPlanParkingLots = async (_req: Request, res: Response) => {
    try {
        const links = await PlanParkingLotModel.findAll({
            include: [
                { model: PlanModel, as: "plan" },
                { model: ParkingLots, as: "parkingLot" }
            ]
        });

        return res.status(200).json(links);
    } catch (error) {
        console.error("Error fetching plan-parking-lots:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get one link by ID
export const getPlanParkingLotById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const link = await PlanParkingLotModel.findByPk(id, {
            include: [
                { model: PlanModel, as: "plan" },
                { model: ParkingLots, as: "parkingLot" }
            ]
        });

        if (!link) {
            return res.status(404).json({ message: "Plan-ParkingLot link not found" });
        }

        return res.status(200).json(link);
    } catch (error) {
        console.error("Error fetching plan-parking-lot:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Update a link
export const updatePlanParkingLot = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const link = await PlanParkingLotModel.findByPk(id);
        if (!link) {
            return res.status(404).json({ message: "Plan-ParkingLot link not found" });
        }

        const { planId, parkingLotId, renewFee, subscriptionFee, status } = req.body;

        // Validate ENUM
        if (status && !Object.values(PlanStatus).includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Allowed: ${Object.values(PlanStatus).join(", ")}`
            });
        }

        // Validate FK: plan
        if (planId) {
            const plan = await PlanModel.findByPk(planId);
            if (!plan) {
                return res.status(400).json({ message: "Invalid planId" });
            }
        }

        // Validate FK: parking lot
        if (parkingLotId) {
            const parking = await ParkingLots.findByPk(parkingLotId);
            if (!parking) {
                return res.status(400).json({ message: "Invalid parkingLotId" });
            }
        }

        await link.update({
            planId,
            parkingLotId,
            renewFee,
            subscriptionFee,
            status
        });

        return res.status(200).json(link);
    } catch (error) {
        console.error("Error updating plan-parking-lot:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a link
export const deletePlanParkingLot = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const link = await PlanParkingLotModel.findByPk(id);
        if (!link) {
            return res.status(404).json({ message: "Plan-ParkingLot link not found" });
        }

        await link.destroy();

        return res.status(200).json({ message: "Plan-ParkingLot link deleted successfully" });
    } catch (error) {
        console.error("Error deleting plan-parking-lot:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
