import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.use(
  "/",
  createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL, // Ensure this is set in your .env (e.g., http://localhost:8083)
    changeOrigin: true,
    secure: false,
    cookieDomainRewrite: "",
    
    // 🔥 PATH REWRITE LOGIC
    pathRewrite: (path, req) => {
      // 1. If it's a webhook call, keep the path as is
      if (path.startsWith("/api/webhook")) {
        return path;
      }
      // 2. Prevent double prefixing if the gateway already received /api/payments
      if (path.startsWith("/api/payments")) {
        return path;
      }
      // 3. Default: prepend /api/payments for general payment requests
      return `/api/payments${path}`;
    },

    onProxyReq: (proxyReq, req, res) => {
      console.log(`[GATEWAY → PAYMENT] ${req.method} ${req.originalUrl}`);

      // Forward Authorization header for protected routes
      if (req.headers.authorization) {
        proxyReq.setHeader("Authorization", req.headers.authorization);
      }

      /**
       * ⚠️ CRITICAL FOR WEBHOOKS:
       * If you are using body-parser or express.json() in your main index.js/server.js, 
       * the request body is already consumed. We must "re-stream" it so Spring Boot 
       * can read the raw body for signature verification.
       */
      if (req.body && Object.keys(req.body).length) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },

    onProxyRes: (proxyRes) => {
      console.log(`[PAYMENT RESPONSE] Status: ${proxyRes.statusCode}`);
    },

    onError: (err, req, res) => {
      console.error("Proxy Error (Payment):", err.message);
      res.status(500).json({
        message: "Payment Service is currently unavailable",
        error: err.message
      });
    },
  })
);

export default router;