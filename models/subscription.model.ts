import {Sequelize, DataTypes, Model, Optional, ForeignKey} from "sequelize";
import {UserModel} from "./user.model";
import {PlanParkingLotModel} from "./planParkingLot.model";
import {SubscriptionStatus} from "./enum.type";
import {PaymentTransactionModel} from "./paymentTransaction.model";
import {ReservationModel} from "./reservation.model";

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

export class SubscriptionModel extends Model<SubscriptionAttributes, CreateSubscriptionAttributes>
    implements SubscriptionAttributes {
    declare id: number;
    declare status: SubscriptionStatus;
    declare planParkingLotId: ForeignKey<PlanParkingLotModel["id"]>;
    declare userId: ForeignKey<UserModel["id"]>;
    declare startDate: Date;
    declare endDate: Date;
}

export const initSubscription = (sequelize: Sequelize): void => {
    SubscriptionModel.init(
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
            modelName: "SubscriptionModel",
            tableName: "subscriptions",
            timestamps: true,

        }
    );
};

