import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authProxy from "./routes/auth.proxy.js";
import bookingProxy from "./routes/booking.proxy.js";
import paymentProxy from "./routes/payment.proxy.js";
import catalogProxy from "./routes/catalog.proxy.js";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    service: "API Gateway",
    status: "Running",
  });
});

// app.use(
//   "/uploads",
//   createProxyMiddleware({
//     target: process.env.CATALOG_SERVICE_URL,
//     changeOrigin: true,
//   }),
// );

app.use("/api/auth", authProxy);
app.use("/api/bookings", bookingProxy);
app.use("/api/payments", paymentProxy);
app.use("/api/services", catalogProxy);

export default app;
