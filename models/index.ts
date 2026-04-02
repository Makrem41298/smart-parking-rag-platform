import { Sequelize } from "sequelize";
// @ts-ignore
import config from "../config/config.js";
import {initUserModel, UserModel} from "./user.model";
import {initInvoice, InvoiceModel} from "./invoice.model";
import {initPaymentTransaction, PaymentTransactionModel} from "./paymentTransaction.model";
import {initSubscription, SubscriptionModel} from "./subscription.model";
import {initPlanParkingLot, PlanParkingLotModel} from "./planParkingLot.model";
import {initPlan, PlanModel} from "./plan.model";
import {initParkingLotModel, ParkingLots} from "./parkingLot.model";
import {initReservation, ReservationModel} from "./reservation.model";
import {initTarifGrid, TarifGridModel} from "./tarifGrid.model";

const env = process.env.NODE_ENV || "development";
const dbConfig = (config as any)[env];

export const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
);

initUserModel(sequelize);
initReservation(sequelize);
initParkingLotModel(sequelize);
initPlan(sequelize);
initPlanParkingLot(sequelize);
initSubscription(sequelize);
initPaymentTransaction(sequelize);
initInvoice(sequelize);
initTarifGrid(sequelize); // ✅ ADD THIS



TarifGridModel.hasMany(ParkingLots, {
    foreignKey: "tarifGridId",
    as: "parkingLots"
});
InvoiceModel.belongsTo(PaymentTransactionModel, {
    foreignKey: "paymentTransactionId",
    as: "paymentTransaction",
});
ParkingLots.hasMany(ReservationModel, {
    foreignKey: "parkingLotId",
    as: "reservations",
});
ParkingLots.belongsToMany(PlanModel, {
    through: PlanParkingLotModel,
    foreignKey: "parkingLotId",
    otherKey: "planId",
    as: "plans",
});
ParkingLots.belongsTo(TarifGridModel, {
    foreignKey: "tarifGridId",
    as: "tarifGrid"
});



PaymentTransactionModel.hasOne(InvoiceModel, {
    foreignKey: "paymentTransactionId",
    as: "invoice",
});PaymentTransactionModel.belongsTo(ReservationModel, { foreignKey: 'paymentableId', constraints: false });
PaymentTransactionModel.belongsTo(SubscriptionModel, { foreignKey: 'paymentableId', constraints: false });
PlanModel.belongsToMany(ParkingLots,{through:PlanParkingLotModel})
PlanParkingLotModel.belongsToMany(UserModel,{through:SubscriptionModel})
ReservationModel.belongsTo(UserModel, {
    foreignKey: "userId",
    as: "user"
});
ReservationModel.belongsTo(ParkingLots, {
    foreignKey: "parkingLotId",
    as: "parkingLot"
});
ReservationModel.hasMany(PaymentTransactionModel,{
    foreignKey: "paymentableId",
    constraints: false,
    scope:{
        paymentableType:'reservation',

    }
})
SubscriptionModel.hasMany(PaymentTransactionModel,{
    foreignKey: "paymentableId",
    constraints: false,
    scope:{
        paymentableType:'subscription',

    }
})
UserModel.hasMany(ReservationModel, {
    foreignKey: "userId",
    as: "reservations",
});
UserModel.belongsToMany(PlanParkingLotModel,{through:SubscriptionModel})


export default sequelize;