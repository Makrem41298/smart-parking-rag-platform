import { Sequelize, DataTypes, Optional, Model } from "sequelize";
import {ParkingLots} from "./ParkingLot";

export interface TarifGridItem {
    minutes: number;
    price: number;
}

export interface TarifGridAttributes {
    id: number;
    name: string;
    grid: TarifGridItem[];
}

interface TarifGridCreationAttributes
    extends Optional<TarifGridAttributes, "id"> {}

export class TarifGrid
    extends Model<TarifGridAttributes, TarifGridCreationAttributes>
    implements TarifGridAttributes
{
    declare id: number;
    declare name: string;
    declare grid: TarifGridItem[];
}

export const initTarifGrid = (sequelize: Sequelize): void => {
    TarifGrid.init(
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
            grid: {
                type: DataTypes.JSON,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: "tariff_grids",
            modelName: "TarifGrid",
            timestamps: true,
        }
    );
};


TarifGrid.hasMany(ParkingLots)