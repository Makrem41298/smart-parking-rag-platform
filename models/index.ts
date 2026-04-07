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
import {initReclamation, Reclamation} from "./reclamation.model";
import {Role} from "./enum.type";

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
initReclamation(sequelize)


UserModel.hasMany(Reclamation, {
    foreignKey: "clientId",
    as: "reclamations",
});

UserModel.hasMany(Reclamation, {
    foreignKey: "adminId",
    as: "handledReclamations",
});


Reclamation.belongsTo(UserModel, {
    foreignKey: "clientId",
    as: "client",
});

Reclamation.belongsTo(UserModel, {
    foreignKey: "adminId",
    as: "admin",
});


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



ParkingLots.belongsTo(TarifGridModel, {
    foreignKey: "tarifGridId",
    as: "tarifGrid"
});



PaymentTransactionModel.hasOne(InvoiceModel, {
    foreignKey: "paymentTransactionId",
    as: "invoice",
});PaymentTransactionModel.belongsTo(ReservationModel, { foreignKey: 'paymentableId', constraints: false });
PaymentTransactionModel.belongsTo(SubscriptionModel, { foreignKey: 'paymentableId', constraints: false });

ReservationModel.belongsTo(UserModel, {
    foreignKey: "userId",
    as: "user"

});
PlanParkingLotModel.belongsToMany(UserModel, {
    through: SubscriptionModel,
    foreignKey: "planParkingLotId",
    otherKey: "userId",
    as: "users"
});

UserModel.belongsToMany(PlanParkingLotModel, {
    through: SubscriptionModel,
    foreignKey: "userId",
    otherKey: "planParkingLotId",
    as: "planParkingLots"
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

PlanParkingLotModel.belongsTo(PlanModel, {
    foreignKey: "planId",
    as: "plan"
});

PlanModel.hasMany(PlanParkingLotModel, {
    foreignKey: "planId",
    as: "planParkingLots"
});

PlanParkingLotModel.belongsTo(ParkingLots, {
    foreignKey: "parkingLotId",
    as: "parkingLot"
});

ParkingLots.hasMany(PlanParkingLotModel, {
    foreignKey: "parkingLotId",
    as: "planParkingLots"
});


SubscriptionModel.belongsTo(UserModel, {
    foreignKey: "userId",
    as: "users"
});

UserModel.hasMany(SubscriptionModel, {
    foreignKey: "userId",
    as: "subscriptions"
});



PlanParkingLotModel.hasMany(SubscriptionModel, {
    foreignKey: 'planParkingLotId',
    as: 'subscriptions'
});

SubscriptionModel.belongsTo(PlanParkingLotModel, {
    foreignKey: 'planParkingLotId',
    as: 'PlanParkingLots'
});




export default sequelize;