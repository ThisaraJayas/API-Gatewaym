import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.use(
  "/",
  createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL,
    changeOrigin: true,
    // On AWS, ensure your Target Group/Security Groups allow traffic on this port
    
    pathRewrite: (path) => {
      // If the path already has the prefix, don't add it again
      if (path.startsWith("/api/payments") || path.startsWith("/api/webhook")) {
        return path;
      }
      return `/api/payments${path}`;
    },

    onProxyReq: (proxyReq, req) => {
      // 1. Log outgoing request for debugging in AWS CloudWatch
      console.log(`[PROXY] ${req.method} ${req.originalUrl} -> ${process.env.PAYMENT_SERVICE_URL}`);

      // 2. Pass through ALL headers (including Authorization and Content-Type)
      Object.keys(req.headers).forEach((key) => {
        proxyReq.setHeader(key, req.headers[key]);
      });

      // 3. Fix for Body Parser (If you use express.json() in index.js)
      if (req.body && Object.keys(req.body).length) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },

    onError: (err, req, res) => {
      console.error("Payment Proxy Error:", err.message);
      res.status(502).json({ message: "Payment Service Gateway Error" });
    },
  })
);

export default router;