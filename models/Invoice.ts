import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import {PaymentTransaction} from "./PaymentTransaction";

export interface InvoiceAttributes {
    id: number;
    startTime: Date;
    endTime: Date;
    totalPrice: number;
    paymentTranslationId: number;
}

export interface CreateInvoiceAttributes
    extends Optional<InvoiceAttributes, "id"> {}

export class Invoice
    extends Model<InvoiceAttributes, CreateInvoiceAttributes>
    implements InvoiceAttributes
{
    declare id: number;
    declare startTime: Date;
    declare endTime: Date;
    declare totalPrice: number;
    declare paymentTranslationId: number;
}

export const initInvoice = (sequelize: Sequelize): void => {
    Invoice.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            startTime: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            endTime: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            totalPrice: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            paymentTranslationId: {
                type:DataTypes.INTEGER,
                allowNull: false,
                unique: true, // 🔥 IMPORTANT for 1:1

                references: {
                    model: 'payment_transactions',
                    key: 'id',
                }
            }
        },
        {
            sequelize,
            modelName: "Invoice",
            tableName: "invoices",
            timestamps: true,
        }
    );
};

Invoice.belongsTo(PaymentTransaction, {
    foreignKey: "paymentTransactionId",
    as: "paymentTransaction",
});