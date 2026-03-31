import { Sequelize } from "sequelize";
import config from "../config/config.json";
import { initUserModel } from "./User";
import {initInvoice} from "./Invoice";
import {initPaymentTransaction} from "./PaymentTransaction";
import {initSubscription} from "./Subscription";
import {initPlanParkingLot} from "./PlanParkingLot";
import {initPlan} from "./Plan";
import {initParkingLotModel} from "./ParkingLot";
import {initReservation} from "./Reservation";

const env = process.env.NODE_ENV || "development";
const dbConfig = (config as any)[env];

export const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
);

// init models
initUserModel(sequelize);
initReservation(sequelize);
initParkingLotModel(sequelize);
initPlan(sequelize);
initPlanParkingLot(sequelize);
initSubscription(sequelize);
initPaymentTransaction(sequelize);
initInvoice(sequelize);


export default sequelize;