import { Request, Response } from "express";
import { TarifGridModel } from "../models/tarifGrid.model";

// Create a new tariff grid
export const createTarifGrid = async (req: Request, res: Response) => {
    try {
        const { name, grid } = req.body;

        if (!name || !grid) {
            return res.status(400).json({ message: "Name and grid are required" });
        }

        const newGrid = await TarifGridModel.create({ name, grid });

        return res.status(201).json(newGrid);
    } catch (error) {
        console.error("Error creating tariff grid:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get all tariff grids
export const getAllTarifGrids = async (_req: Request, res: Response) => {
    try {
        const grids = await TarifGridModel.findAll();
        return res.status(200).json(grids);
    } catch (error) {
        console.error("Error fetching tariff grids:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get one tariff grid by ID
export const getTarifGridById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const grid = await TarifGridModel.findByPk(id);

        if (!grid) {
            return res.status(404).json({ message: "Tariff grid not found" });
        }

        return res.status(200).json(grid);
    } catch (error) {
        console.error("Error fetching tariff grid:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Update a tariff grid
export const updateTarifGrid = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, grid } = req.body;

        // @ts-ignore
        const existing = await TarifGridModel.findByPk(id);

        if (!existing) {
            return res.status(404).json({ message: "Tariff grid not found" });
        }

        await existing.update({ name, grid });

        return res.status(200).json(existing);
    } catch (error) {
        console.error("Error updating tariff grid:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a tariff grid
export const deleteTarifGrid = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const existing = await TarifGridModel.findByPk(id);

        if (!existing) {
            return res.status(404).json({ message: "Tariff grid not found" });
        }

        await existing.destroy();

        return res.status(200).json({ message: "Tariff grid deleted successfully" });
    } catch (error) {
        console.error("Error deleting tariff grid:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
