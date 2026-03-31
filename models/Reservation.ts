import { Model, Optional, DataTypes, Sequelize, ForeignKey } from "sequelize";
import { ReservationStatus } from "./EnumType";
import { ParkingLots } from "./ParkingLot";
import { User } from "./User";
import {PaymentTransaction} from "./PaymentTransaction";

export interface ReservationAttributes {
    id: number;
    startTimeDate: Date;
    endTimeDate: Date;
    parkingLotId: number;
    userId: number;
    totalPrice: number;
    status: ReservationStatus;
}

export interface CreateReservationAttributes
    extends Optional<ReservationAttributes, "id" | "status"> {}

export class Reservation
    extends Model<ReservationAttributes, CreateReservationAttributes>
    implements ReservationAttributes
{
    declare id: number;
    declare parkingLotId: ForeignKey<ParkingLots["id"]>;
    declare userId: ForeignKey<User["id"]>;
    declare startTimeDate: Date;
    declare endTimeDate: Date;
    declare totalPrice: number;
    declare status: ReservationStatus;
}

export const initReservation = (sequelize: Sequelize): void => {
    Reservation.init(
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
        },
        {
            sequelize,
            modelName: "Reservation",
            tableName: "reservations",
            timestamps: true,
        }
    );
};


Reservation.belongsTo(User)
Reservation.belongsTo(ParkingLots)

Reservation.hasMany(PaymentTransaction,{
    foreignKey: "paymentableId",
    constraints: false,
    scope:{
        paymentableType:'reservation',

    }
})