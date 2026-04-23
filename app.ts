import dotenv from "dotenv";
import express, { Application } from "express";
import routes from "./routes/api";
import sequelize  from "./models/index";
import cors from "cors";

dotenv.config();
const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.FRONT_URL, // your React app
    credentials: true
}));
const port: number = Number(process.env.PORT) || 3000;

console.log("DATABASE_URL =", process.env.DB_HOST);
console.log("DATABASE_PORT =", process.env.DB_PORT);
console.log("DATABASE_NAME =", process.env.DB_NAME);
console.log("DATABASE_USERNAME =", process.env.DB_USER);
console.log("DATABASE_PASSWORD =", process.env.DB_PASSWORD);
console.log("DATABASE_CONNECTION=", process.env.DB_DIALECT);




async function startServer() {
    try {
        await sequelize.authenticate();
        console.log("🔄 Connecting to database...");

        await sequelize.authenticate();
        console.log("✅ Database connected");

        await sequelize.sync();
        console.log("✅ Database synced");
        routes(app);
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Unable to connect :", error);
    }
}


startServer();