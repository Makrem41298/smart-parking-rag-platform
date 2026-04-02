import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import {PlanParkingLotModel} from "./planParkingLot.model";
import {ParkingLots} from "./parkingLot.model";

export interface ActiveDay {
    day: string;
    hoursInterval: string;
}

export interface PlanAttributes {
    id: number;
    name: string;
    activeDays: ActiveDay[] | null;
    startDate: Date;
    endDate: Date;
}

export interface PlanCreationAttributes
    extends Optional<PlanAttributes, "id" | "activeDays"> {}

export class PlanModel
    extends Model<PlanAttributes, PlanCreationAttributes>
    implements PlanAttributes
{
    declare id: number;
    declare name: string;
    declare activeDays: ActiveDay[] | null;
    declare startDate: Date;
    declare endDate: Date;
}

export const initPlan = (sequelize: Sequelize): void => {
    PlanModel.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            activeDays: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: null,
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "PlanModel",
            tableName: "plans",
            timestamps: true,
        }
    );
};

