import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// Load env FIRST
dotenv.config();

// Import proxies
import authProxy from "./src/routes/auth.proxy.js";
import bookingProxy from "./src/routes/booking.proxy.js";
import paymentProxy from "./src/routes/payment.proxy.js";
import catalogProxy from "./src/routes/catalog.proxy.js";

const app = express();
const PORT = process.env.PORT || 4000;

/* ===========================
   MIDDLEWARES
=========================== */

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(cookieParser());

/* ===========================
   HEALTH CHECK
=========================== */

app.get("/", (req, res) => {
  res.json({
    service: "API Gateway",
    status: "Running",
  });
});

/* ===========================
   ROUTES (PROXY)
=========================== */

app.use("/api/auth", authProxy);
app.use("/api/bookings", bookingProxy);
app.use("/api/payments", paymentProxy);
app.use("/api/services", catalogProxy);



app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/* ===========================
   START SERVER
=========================== */

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});
