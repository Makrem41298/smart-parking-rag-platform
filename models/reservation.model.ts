import { Model, Optional, DataTypes, Sequelize, ForeignKey } from "sequelize";
import { ReservationStatus } from "./enum.type";
import { ParkingLots } from "./parkingLot.model";
import { UserModel } from "./user.model";
import {PaymentTransactionModel} from "./paymentTransaction.model";

export interface ReservationAttributes {
    id: number;
    startTimeDate: Date;
    endTimeDate: Date;
    parkingLotId: number;
    userId: number;
    totalPrice: number;
    status: ReservationStatus;
    entryTime: Date | null;
    leaveTime: Date | null;
}

export interface CreateReservationAttributes
    extends Optional<ReservationAttributes, "id" | "status"|"leaveTime"|"entryTime"> {}

export class ReservationModel
    extends Model<ReservationAttributes, CreateReservationAttributes>
    implements ReservationAttributes
{
    declare id: number;
    declare parkingLotId: ForeignKey<ParkingLots["id"]>;
    declare userId: ForeignKey<UserModel["id"]>;
    declare startTimeDate: Date;
    declare endTimeDate: Date;
    declare totalPrice: number;
    declare status: ReservationStatus;
    declare entryTime: Date;
    declare leaveTime: Date;
}

export const initReservation = (sequelize: Sequelize): void => {
    ReservationModel.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            parkingLotId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "parking_lots",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            startTimeDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            endTimeDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            totalPrice: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM(...Object.values(ReservationStatus)),
                allowNull: false,
                defaultValue: ReservationStatus.REQUESTED,
            },
            entryTime: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue:null
            },
            leaveTime: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue:null
            }

        },
        {
            sequelize,
            modelName: "ReservationModel",
            tableName: "reservations",
            timestamps: true,
        }
    );
};

