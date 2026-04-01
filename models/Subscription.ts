import {Sequelize, DataTypes, Model, Optional, ForeignKey} from "sequelize";
import {User} from "./User";
import {PlanParkingLot} from "./PlanParkingLot";
import {SubscriptionStatus} from "./EnumType";
import {PaymentTransaction} from "./PaymentTransaction";
import {Reservation} from "./Reservation";

interface SubscriptionAttributes {
    id: number;
    status: SubscriptionStatus ;
    planParkingLotId: number;
    userId: number;
    startDate: Date;
    endDate: Date;
}

export interface CreateSubscriptionAttributes
    extends Optional<SubscriptionAttributes, "id"|"status"> {
}

export class Subscription
    extends Model<SubscriptionAttributes, CreateSubscriptionAttributes>
    implements SubscriptionAttributes {
    declare id: number;
    declare status: SubscriptionStatus;
    declare planParkingLotId: ForeignKey<PlanParkingLot["id"]>;
    declare userId: ForeignKey<User["id"]>;
    declare startDate: Date;
    declare endDate: Date;
}

export const initSubscription = (sequelize: Sequelize): void => {
    Subscription.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            status:{
              type:DataTypes.ENUM(...Object.values(SubscriptionStatus)),
              allowNull:false,
              defaultValue:SubscriptionStatus.ACTIVE
            },
            planParkingLotId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "plan_parking_lots",
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
            modelName: "Subscription",
            tableName: "subscriptions",
            timestamps: true,

        }
    );
};

