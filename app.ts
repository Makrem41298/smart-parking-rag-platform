import dotenv from "dotenv";
import express, { Application } from "express";
import authRoutes from "./routes/api";
import { Sequelize } from "sequelize";

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port: number = Number(process.env.PORT) || 3000;

console.log("DATABASE_URL =", process.env.DATABASE_HOST);
console.log("DATABASE_PORT =", process.env.DATABASE_PORT);
console.log("DATABASE_NAME =", process.env.DATABASE_NAME);
console.log("DATABASE_USERNAME =", process.env.DATABASE_USERNAME);
console.log("DATABASE_PASSWORD =", process.env.DATABASE_PASSWORD);
console.log("DATABASE_CONNECTION=", process.env.DATABASE_CONNEXTION);


const sequelize = new Sequelize(String(process.env.DATABASE_NAME), String(process.env.DATABASE_USERNAME), String(process.env.DATABASE_PASSWORD), {
    host: process.env.DATABASE_HOST,
    port:Number(process.env.DATABASE_PORT) ,
    // @ts-ignore
    dialect: String(process.env.DATABASE_CONNEXTION)
});

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log("🔄 Connecting to database...");

        await sequelize.authenticate();
        console.log("✅ Database connected");

        await sequelize.sync();
        console.log("✅ Database synced");
        authRoutes(app);
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}


startServer();