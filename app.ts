import dotenv from "dotenv";
import express, { Application } from "express";
import authRoutes from "./routes/api";

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbUrl: string | undefined = process.env.DATABASE_URL;
const port: number = Number(process.env.PORT) || 3000;


authRoutes(app);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});