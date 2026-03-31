import {Sequelize, DataTypes, Model, Optional, ForeignKey} from "sequelize";
import { PlanStatus } from "./EnumType";
import {ParkingLots} from "./ParkingLot";
import {Plan} from "./Plan";
import {User} from "./User";
import {Subscription} from "./Subscription";

export interface PlanParkingLotAttributes {
    id: number;
    planId: number;
    parkingLotId: number;
    status: PlanStatus;
    renewFee: number;
    subscriptionFee: number;
}

export interface CreatePlanParkingLotAttributes
    extends Optional<PlanParkingLotAttributes, "id" | "status"> {}

export class PlanParkingLot
    extends Model<PlanParkingLotAttributes, CreatePlanParkingLotAttributes>
    implements PlanParkingLotAttributes
{
    declare id: number;
    declare planId: ForeignKey<Plan["id"]>;
    declare parkingLotId: ForeignKey<ParkingLots["id"]>;
    declare status: PlanStatus;
    declare renewFee: number;
    declare subscriptionFee: number;
}

export const initPlanParkingLot = (sequelize: Sequelize): void => {
    PlanParkingLot.init(
        {
            id: {
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            planId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "plans",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
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
            status: {
                type: DataTypes.ENUM(...Object.values(PlanStatus)),
                defaultValue: PlanStatus.ACTIVE,
                allowNull: false,
            },
            renewFee: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            subscriptionFee: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "PlanParkingLot",
            tableName: "plan_parking_lots",
            timestamps: true,

        }
    );
};


PlanParkingLot.belongsToMany(User,{through:Subscription})