import {DataTypes, HasMany, Model, Optional, Sequelize} from "sequelize";
import { Role, AccountStatus } from "./EnumType";
import {Reservation} from "./Reservation";
import {PlanParkingLot} from "./PlanParkingLot";
import {Subscription} from "./Subscription";

export interface UserAttributes {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    accountStatus: AccountStatus;
    role: Role;
    CIN: string;
}

interface UserCreationAttributes
    extends Optional<UserAttributes, "id" | "role" | "accountStatus"> {}

export class User extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes {
    declare id: number;
    declare firstName: string;
    declare lastName: string;
    declare email: string;
    declare password: string;
    declare phone: string;
    declare accountStatus: AccountStatus;
    declare role: Role;
    declare CIN: string;


}

export const initUserModel = (sequelize: Sequelize) => {
    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },

            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            accountStatus: {
                type: DataTypes.ENUM(...Object.values(AccountStatus)),
                allowNull: false,
                defaultValue: AccountStatus.ACTIVE, // example
            },
            role: {
                type: DataTypes.ENUM(...Object.values(Role)),
                allowNull: false,
                defaultValue: Role.CLIENT,
            },
            CIN: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "User",
            tableName: "users",
            timestamps: true,
        }
    );
};



User.hasMany(Reservation, {
    foreignKey: "userId",
    as: "reservations",
});

User.belongsToMany(PlanParkingLot,{through:Subscription})

