import { DataTypes, ForeignKey, Model, Optional, Sequelize } from "sequelize";
import { ParkingStatus } from "./EnumType";
import { TarifGrid } from "./TarifGrid";
import {Reservation} from "./Reservation";
import {User} from "./User";
import {Plan} from "./Plan";
import {PlanParkingLot} from "./PlanParkingLot";

export interface ParkingLotAttributes {
    id: number;
    name: string;
    address: string;
    city: string;
    country: string;
    covered: boolean;
    numberOfPlaces: number;
    numberOfPlaceAvailable: number;
    description: string | null;
    statusParking: ParkingStatus;
    tarifGridId: number | null;
    reservationAvailability: boolean;
    subscriptionAvailability: boolean;
}

interface ParkingLotCreationAttributes
    extends Optional<
        ParkingLotAttributes,
        | "id"
        | "numberOfPlaceAvailable"
        | "statusParking"
        | "reservationAvailability"
        | "subscriptionAvailability"
        | "tarifGridId"
        | "description"
    > {}

export class ParkingLots
    extends Model<ParkingLotAttributes, ParkingLotCreationAttributes>
    implements ParkingLotAttributes
{
    declare id: number;
    declare name: string;
    declare address: string;
    declare city: string;
    declare country: string;
    declare covered: boolean;
    declare numberOfPlaces: number;
    declare numberOfPlaceAvailable: number;
    declare description: string | null;
    declare statusParking: ParkingStatus;
    declare reservationAvailability: boolean;
    declare subscriptionAvailability: boolean;
    declare tarifGridId: ForeignKey<TarifGrid["id"]> | null;
}

export const initParkingLotModel = (sequelize: Sequelize): void => {
    ParkingLots.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            address: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            city: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            country: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            covered: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            numberOfPlaces: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            numberOfPlaceAvailable: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            statusParking: {
                type: DataTypes.ENUM(...Object.values(ParkingStatus)),
                allowNull: false,
                defaultValue: ParkingStatus.OPEN,
            },
            reservationAvailability: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            subscriptionAvailability: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            tarifGridId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "tariff_grids",
                    key: "id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
        },
        {
            sequelize,
            modelName: "Parking",
            tableName: "parking_lots",
            timestamps: true,
        }
    );
};


ParkingLots.hasMany(Reservation, {
    foreignKey: "parkingLotId",
    as: "reservations",
});


ParkingLots.belongsToMany(Plan, {
    through: PlanParkingLot,
    foreignKey: "parkingLotId",
    otherKey: "planId",
    as: "plans",
});

ParkingLots.belongsTo(TarifGrid, {
    foreignKey: "tarifGridId",
    as: "tarifGrid",
});
