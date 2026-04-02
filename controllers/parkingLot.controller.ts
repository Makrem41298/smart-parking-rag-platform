import { Request, Response } from "express";
import { ParkingLots } from "../models/parkingLot.model";
import { ParkingStatus } from "../models/enum.type";
import { TarifGridModel } from "../models/tarifGrid.model";

// Create a parking lot
export const createParkingLot = async (req: Request, res: Response) => {
    try {
        const {
            name,
            address,
            city,
            country,
            covered,
            numberOfPlaces,
            description,
            tarifGridId,
            reservationAvailability,
            subscriptionAvailability
        } = req.body;

        if (!name || !address || !city || !country || !numberOfPlaces) {
            return res.status(400).json({
                message: "Missing required fields: name, address, city, country, numberOfPlaces"
            });
        }

        // Validate tarifGridId if provided
        if (tarifGridId) {
            const grid = await TarifGridModel.findByPk(tarifGridId);
            if (!grid) {
                return res.status(400).json({ message: "Invalid tarifGridId" });
            }
        }

        const parking = await ParkingLots.create({
            name,
            address,
            city,
            country,
            covered,
            numberOfPlaces,
            description,
            tarifGridId,
            reservationAvailability,
            subscriptionAvailability
        });

        return res.status(201).json(parking);
    } catch (error) {
        console.error("Error creating parking lot:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get all parking lots
export const getAllParkingLots = async (_req: Request, res: Response) => {
    try {
        const parkings = await ParkingLots.findAll({
            include: [{ model: TarifGridModel, as: "tarifGrid" }]
        });

        return res.status(200).json(parkings);
    } catch (error) {
        console.error("Error fetching parking lots:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get parking lot by ID
export const getParkingLotById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const parking = await ParkingLots.findByPk(id, {
            include: [{ model: TarifGridModel, as: "tarifGrid" }]
        });

        if (!parking) {
            return res.status(404).json({ message: "Parking lot not found" });
        }

        return res.status(200).json(parking);
    } catch (error) {
        console.error("Error fetching parking lot:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Update parking lot
export const updateParkingLot = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const parking = await ParkingLots.findByPk(id);

        if (!parking) {
            return res.status(404).json({ message: "Parking lot not found" });
        }

        const {
            name,
            address,
            city,
            country,
            covered,
            numberOfPlaces,
            numberOfPlaceAvailable,
            description,
            statusParking,
            tarifGridId,
            reservationAvailability,
            subscriptionAvailability
        } = req.body;

        // Validate statusParking
        if (statusParking && !Object.values(ParkingStatus).includes(statusParking)) {
            return res.status(400).json({ message: "Invalid parking status" });
        }

        // Validate tarifGridId
        if (tarifGridId) {
            const grid = await TarifGridModel.findByPk(tarifGridId);
            if (!grid) {
                return res.status(400).json({ message: "Invalid tarifGridId" });
            }
        }

        await parking.update({
            name,
            address,
            city,
            country,
            covered,
            numberOfPlaces,
            numberOfPlaceAvailable,
            description,
            statusParking,
            tarifGridId,
            reservationAvailability,
            subscriptionAvailability
        });

        return res.status(200).json(parking);
    } catch (error) {
        console.error("Error updating parking lot:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Delete parking lot
export const deleteParkingLot = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const parking = await ParkingLots.findByPk(id);

        if (!parking) {
            return res.status(404).json({ message: "Parking lot not found" });
        }

        await parking.destroy();

        return res.status(200).json({ message: "Parking lot deleted successfully" });
    } catch (error) {
        console.error("Error deleting parking lot:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
