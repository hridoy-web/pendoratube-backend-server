import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

export const app = express();

// 1. CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// 2. Data parsing middleware with payload limits
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// 3. Static files & cookie parser setup
app.use(express.static("public"));
app.use(cookieParser());