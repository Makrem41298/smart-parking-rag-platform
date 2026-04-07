import {Request, Response} from "express";
import {ReservationModel} from "../models/reservation.model";
import {ParkingLots} from "../models/parkingLot.model";
import {UserModel} from "../models/user.model";
import {ReservationStatus, Role} from "../models/enum.type";
import {AuthRequest} from "../middlewares/auth.middleware";
import {TarifGridModel} from "../models/tarifGrid.model";

// Create reservation
export const createReservation = async (req: AuthRequest, res: Response) => {
    try {
        const {
            parkingLotId,
            startTimeDate,
            endTimeDate,
            status,
            entryTime,
            leaveTime
        } = req.body;

       const userId:number|undefined=req.user?.id




        // Required fields
        if (!parkingLotId || !userId || !startTimeDate || !endTimeDate ) {
            return res.status(400).json({
                message: "Missing required fields: parkingLotId, userId, startTimeDate, endTimeDate, totalPrice"
            });
        }

        // Validate FK: parking lot
        const parking = await ParkingLots.findByPk(parkingLotId,
            {
                include: [{ model: TarifGridModel, as: "tarifGrid" }]
            });
        if (!parking) {
            return res.status(400).json({ message: "Invalid parkingLotId" });
        }
        const startDate = new Date(startTimeDate);
        const endDate = new Date(endTimeDate);
        const diffInMinutes = Math.floor(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60)
        );
        console.log("xxxxxxxxxxxxxxxxxxxxx",parking.tarifGrid)

        const totalPrice = calculatePrice(
            diffInMinutes,
            parking.tarifGrid.dataValues.grid
        );
        console.log("PRICE", totalPrice);

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
export const getAllReservations = async (_req: AuthRequest, res: Response) => {
    try {
        if (!_req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const whereCondition = _req.user.role === Role.ADMIN ? {} : { userId: _req.user.id };

        const reservations = await ReservationModel.findAll({
            where: whereCondition,
            include: [
                { model: ParkingLots, as: "parkingLot" },
                {
                    model: UserModel,
                    as: "user",
                    attributes: { exclude: ["password"] }
                }
            ]
        });

        return res.status(200).json(reservations);

    } catch (error) {
        console.error("Error fetching reservations:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get reservation by ID
export const getReservationById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const whereCondition = req.user.role === Role.ADMIN ? {id:id} : { userId: req.user.id ,id:id};
        const reservation = await ReservationModel.findOne({
            where: whereCondition,
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
export const updateReservation = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const whereCondition = req.user.role === Role.ADMIN ? {id:id} : { userId: req.user.id ,id:id};
        const reservation = await ReservationModel.findOne({
            where: whereCondition,
            include: [
                { model: ParkingLots, as: "parkingLot" },
                { model: UserModel, as: "user",attributes:{exclude:["password"] } }
            ]
        });

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
const calculatePrice = (diffInMinutes: number, tarifGrid: { price: number; minutes: number }[]): number =>

{

    const sortedGrid = tarifGrid.sort(
        (a, b) => a.minutes - b.minutes
    );

    const tarif = sortedGrid.find(
        t => diffInMinutes <= t.minutes
    );

    return tarif
        ? tarif.price
        : sortedGrid[sortedGrid.length - 1].price;
};



