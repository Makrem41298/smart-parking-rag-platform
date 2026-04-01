import { Sequelize } from "sequelize";
// @ts-ignore
import config from "../config/config.js";
import {initUserModel, User} from "./User";
import {initInvoice, Invoice} from "./Invoice";
import {initPaymentTransaction, PaymentTransaction} from "./PaymentTransaction";
import {initSubscription, Subscription} from "./Subscription";
import {initPlanParkingLot, PlanParkingLot} from "./PlanParkingLot";
import {initPlan, Plan} from "./Plan";
import {initParkingLotModel, ParkingLots} from "./ParkingLot";
import {initReservation, Reservation} from "./Reservation";
import {initTarifGrid, TarifGrid} from "./TarifGrid";

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



TarifGrid.hasMany(ParkingLots)
Invoice.belongsTo(PaymentTransaction, {
    foreignKey: "paymentTransactionId",
    as: "paymentTransaction",
});
ParkingLots.hasMany(Reservation, {
    foreignKey: "parkingLotId",
    as: "reservations",
});
ParkingLots.belongsToMany(Plan, {
    through: PlanParkingLot,
    foreignKey: "parkingLotId",
    otherKey: "planId",
    as: "plans",
});
ParkingLots.belongsTo(TarifGrid, {
    foreignKey: "tarifGridId",
    as: "tarifGrid",
});
PaymentTransaction.hasOne(Invoice, {
    foreignKey: "paymentTransactionId",
    as: "invoice",
});PaymentTransaction.belongsTo(Reservation, { foreignKey: 'paymentableId', constraints: false });
PaymentTransaction.belongsTo(Subscription, { foreignKey: 'paymentableId', constraints: false });
Plan.belongsToMany(ParkingLots,{through:PlanParkingLot})
PlanParkingLot.belongsToMany(User,{through:Subscription})
Reservation.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});
Reservation.belongsTo(ParkingLots, {
    foreignKey: "parkingLotId",
    as: "parkingLot"
});
Reservation.hasMany(PaymentTransaction,{
    foreignKey: "paymentableId",
    constraints: false,
    scope:{
        paymentableType:'reservation',

    }
})
Subscription.hasMany(PaymentTransaction,{
    foreignKey: "paymentableId",
    constraints: false,
    scope:{
        paymentableType:'subscription',

    }
})
User.hasMany(Reservation, {
    foreignKey: "userId",
    as: "reservations",
});
User.belongsToMany(PlanParkingLot,{through:Subscription})


export default sequelize;