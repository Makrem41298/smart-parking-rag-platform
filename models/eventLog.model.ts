import { Model, Sequelize, DataTypes, Optional, ForeignKey } from "sequelize";
import { PaymentTransactionModel } from "./paymentTransaction.model";

export interface EventLogAttributes {
    id: number;
    paymentTransactionId: number;
    status: string;
    message: string | null;
}

interface EventLogCreationAttributes
    extends Optional<EventLogAttributes, "id" | "message"> {}

export class EventLogModel
    extends Model<EventLogAttributes, EventLogCreationAttributes>
    implements EventLogAttributes
{
    declare id: number;
    declare paymentTransactionId: ForeignKey<PaymentTransactionModel["id"]>;
    declare status: string;
    declare message: string | null;
}

export const initEventLog = (sequelize: Sequelize): void => {
    EventLogModel.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            paymentTransactionId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "payment_transactions",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "EventLogModel",
            tableName: "event_logs",
            timestamps: true,
            updatedAt: false, // Logs are immutable, only createdAt
        }
    );
};
