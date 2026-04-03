import { Request, Response } from "express";
import { ReservationModel } from "../models/reservation.model";
import { ParkingLots } from "../models/parkingLot.model";
import { UserModel } from "../models/user.model";
import { ReservationStatus } from "../models/enum.type";

// Create reservation
export const createReservation = async (req: Request, res: Response) => {
    try {
        const {
            parkingLotId,
            userId,
            startTimeDate,
            endTimeDate,
            totalPrice,
            status,
            entryTime,
            leaveTime
        } = req.body;

        // Required fields
        if (!parkingLotId || !userId || !startTimeDate || !endTimeDate || !totalPrice) {
            return res.status(400).json({
                message: "Missing required fields: parkingLotId, userId, startTimeDate, endTimeDate, totalPrice"
            });
        }

        // Validate FK: parking lot
        const parking = await ParkingLots.findByPk(parkingLotId);
        if (!parking) {
            return res.status(400).json({ message: "Invalid parkingLotId" });
        }

        // Validate FK: user
        const user = await UserModel.findByPk(userId);
        if (!user) {
            return res.status(400).json({ message: "Invalid userId" });
        }

        // Validate ENUM
        if (status && !Object.values(ReservationStatus).includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Allowed: ${Object.values(ReservationStatus).join(", ")}`
            });
        }

        const reservation = await ReservationModel.create({
            parkingLotId,
            userId,
            startTimeDate,
            endTimeDate,
            totalPrice,
            status,
            entryTime,
            leaveTime
        });

        return res.status(201).json(reservation);
    } catch (error) {
        console.error("Error creating reservation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get all reservations
export const getAllReservations = async (_req: Request, res: Response) => {
    try {
        const reservations = await ReservationModel.findAll({
            include: [
                { model: ParkingLots, as: "parkingLot" },
                { model: UserModel, as: "user",attributes:{exclude:["password"] } }
            ]
        });

        return res.status(200).json(reservations);
    } catch (error) {
        console.error("Error fetching reservations:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get reservation by ID
export const getReservationById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const reservation = await ReservationModel.findByPk(id, {
            include: [
                { model: ParkingLots, as: "parkingLot" },
                { model: UserModel, as: "user",attributes:{exclude:["password"] } }
            ]
        });

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        return res.status(200).json(reservation);
    } catch (error) {
        console.error("Error fetching reservation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Update reservation
export const updateReservation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const reservation = await ReservationModel.findByPk(id);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        const {
            parkingLotId,
            userId,
            startTimeDate,
            endTimeDate,
            totalPrice,
            status,
            entryTime,
            leaveTime
        } = req.body;

        // Validate ENUM
        if (status && !Object.values(ReservationStatus).includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Allowed: ${Object.values(ReservationStatus).join(", ")}`
            });
        }

        // Validate FK: parking lot
        if (parkingLotId) {
            const parking = await ParkingLots.findByPk(parkingLotId);
            if (!parking) {
                return res.status(400).json({ message: "Invalid parkingLotId" });
            }
        }

        // Validate FK: user

        if (userId) {
            const user = await UserModel.findByPk(userId);
            if (!user) {
                return res.status(400).json({ message: "Invalid userId" });
            }
        }

        await reservation.update({
            parkingLotId,
            userId,
            startTimeDate,
            endTimeDate,
            totalPrice,
            status,
            entryTime,
            leaveTime
        });

        return res.status(200).json(reservation);
    } catch (error) {
        console.error("Error updating reservation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


