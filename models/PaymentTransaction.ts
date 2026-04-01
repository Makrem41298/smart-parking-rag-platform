import { Model, Optional, DataTypes, Sequelize } from "sequelize";
import { PaymentStatus } from "./EnumType";
import {Invoice} from "./Invoice";
import {Reservation} from "./Reservation";
import {Subscription} from "./Subscription";

export interface PaymentTransactionAttributes {
    id: number;
    amount: number;
    paymentDateTime: Date;
    method: string;
    status: PaymentStatus;
    paymentableId: number;
    paymentableType:string;
}

export interface CreatePaymentTransactionAttributes
    extends Optional<PaymentTransactionAttributes, "id" | "status"> {}

const uppercaseFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);export class PaymentTransaction
    extends Model<PaymentTransactionAttributes, CreatePaymentTransactionAttributes>
    implements PaymentTransactionAttributes
{
    declare id: number;
    declare amount: number;
    declare paymentDateTime: Date;
    declare method: string;
    declare status: PaymentStatus;
    declare paymentableId: number;
    declare paymentableType: string;

    async getPaymentable(options?: any) {
        if (!this.paymentableType) return null;
        const methodName = `get${uppercaseFirst(this.paymentableType)}` as keyof this;
        const method = this[methodName] as any;
        if (typeof method === "function") {
            return method.call(this, options);
        }
        return null;
    }
}
export const initPaymentTransaction = (sequelize: Sequelize): void => {
    PaymentTransaction.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            paymentDateTime: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            method: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM(...Object.values(PaymentStatus)),
                allowNull: false,
                defaultValue: PaymentStatus.PENDING,
            },
            paymentableId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            paymentableType: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "PaymentTransaction",
            tableName: "payment_transactions",
            timestamps: true,
        }
    );
};
