import {Request, Response} from "express";
import {ReservationModel} from "../models/reservation.model";
import {ParkingLots} from "../models/parkingLot.model";
import {UserModel} from "../models/user.model";
import {ReservationStatus, Role} from "../models/enum.type";
import {AuthRequest} from "../middlewares/auth.middleware";
import {TarifGridModel} from "../models/tarifGrid.model";
import sequelize from "../models";

// Create reservation

export const createReservation = async (req: AuthRequest, res: Response) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            parkingLotId,
            startTimeDate,
            endTimeDate,
            status,
            entryTime,
            leaveTime,
        } = req.body;

        const userId = req.user?.id;

        if (!parkingLotId || !userId || !startTimeDate || !endTimeDate) {
            await transaction.rollback();
            return res.status(400).json({
                message: "Missing required fields: parkingLotId, startTimeDate, endTimeDate",
            });
        }

        const parking = await ParkingLots.findByPk(parkingLotId, {
            include: [{ model: TarifGridModel, as: "tarifGrid" }],
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!parking) {
            await transaction.rollback();
            return res.status(400).json({ message: "Invalid parkingLotId" });
        }

        if (!parking.reservationAvailability || parking.numberOfPlaceAvailable <= 0) {
            await transaction.rollback();
            return res.status(400).json({
                message: "Parking lot is not available for reservations",
            });
        }

        const startDate = new Date(startTimeDate);
        const endDate = new Date(endTimeDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            await transaction.rollback();
            return res.status(400).json({ message: "Invalid date format" });
        }

        if (endDate <= startDate) {
            await transaction.rollback();
            return res.status(400).json({
                message: "endTimeDate must be after startTimeDate",
            });
        }

        const user = await UserModel.findByPk(userId, { transaction });

        if (!user) {
            await transaction.rollback();
            return res.status(400).json({ message: "Invalid userId" });
        }

        if (status && !Object.values(ReservationStatus).includes(status)) {
            await transaction.rollback();
            return res.status(400).json({
                message: `Invalid status. Allowed: ${Object.values(ReservationStatus).join(", ")}`,
            });
        }

        const diffInMinutes = Math.floor(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60)
        );

        const totalPrice = calculatePrice(
            diffInMinutes,
            parking.tarifGrid.dataValues.grid
        );

        const reservation = await ReservationModel.create(
            {
                parkingLotId,
                userId,
                startTimeDate,
                endTimeDate,
                totalPrice,
                status,
                entryTime,
                leaveTime,
            },
            { transaction }
        );

        await parking.update(
            {
                numberOfPlaceAvailable: parking.numberOfPlaceAvailable - 1,
            },
            { transaction }
        );

        await transaction.commit();

        return res.status(201).json({
            message: "Reservation created successfully",
            reservation,
        });
    } catch (error) {
        await transaction.rollback();

        console.error("Error creating reservation:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
// Get all reservations
export const getAllReservations = async (_req: AuthRequest, res: Response) => {
    try {
        if (!_req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const whereCondition =  _req.user?.role === Role.ADMIN || _req.user?.role === Role.SUPER_ADMIN? {} : { userId: _req.user.id };

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
        const whereCondition =  req.user?.role === Role.ADMIN || req.user?.role === Role.SUPER_ADMIN? {id:id} : { userId: req.user.id ,id:id};
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

        const whereCondition =  req.user?.role === Role.ADMIN || req.user?.role === Role.SUPER_ADMIN ? {id:id} : { userId: req.user.id ,id:id};
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



