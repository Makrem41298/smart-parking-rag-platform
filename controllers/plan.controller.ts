import { Request, Response } from "express";
import { PlanModel } from "../models/plan.model";

// Create a plan
export const createPlan = async (req: Request, res: Response) => {
    try {
        const { name, activeDays, startDate, endDate } = req.body;

        if (!name || !startDate || !endDate) {
            return res.status(400).json({
                message: "Missing required fields: name, startDate, endDate"
            });
        }

        const plan = await PlanModel.create({
            name,
            activeDays,
            startDate,
            endDate
        });

        return res.status(201).json(plan);
    } catch (error) {
        console.error("Error creating plan:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get all plans
export const getAllPlans = async (_req: Request, res: Response) => {
    try {
        const plans = await PlanModel.findAll();
        return res.status(200).json(plans);
    } catch (error) {
        console.error("Error fetching plans:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get plan by ID
export const getPlanById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const plan = await PlanModel.findByPk(id);

        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }

        return res.status(200).json(plan);
    } catch (error) {
        console.error("Error fetching plan:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Update plan
export const updatePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const plan = await PlanModel.findByPk(id);
        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }

        const { name, activeDays, startDate, endDate } = req.body;

        await plan.update({
            name,
            activeDays,
            startDate,
            endDate
        });

        return res.status(200).json(plan);
    } catch (error) {
        console.error("Error updating plan:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Delete plan
export const deletePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const plan = await PlanModel.findByPk(id);
        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }

        await plan.destroy();

        return res.status(200).json({ message: "Plan deleted successfully" });
    } catch (error) {
        console.error("Error deleting plan:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
