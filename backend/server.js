import express from "express";
import connectDB from "./config/dbconfig.js"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import colors from "colors"

dotenv.config();

//Local Imports
import authRoute from "./routes/authRoute.js";
import productRoute from "./routes/productRoute.js"


const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

//Auth Routes
app.use("/api/auth", authRoute);

//Product Routes 
app.use("/api/products", productRoute); 

app.listen(PORT, () => console.log(`SERVER IS RUNNING AT PORT : ${PORT}`.bgBlue));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Product Management API is running",
  })
})