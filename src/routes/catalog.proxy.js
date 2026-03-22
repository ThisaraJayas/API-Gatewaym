import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.use(
  "/",
  createProxyMiddleware({
    target: process.env.CATALOG_SERVICE_URL,
    changeOrigin: true,
    secure: false,
    cookieDomainRewrite: "",

    // 🔥 FIX: Explicit path control
    pathRewrite: (path, req) => {
      return `/api/services${path}`;
    },

    onProxyReq: (proxyReq, req) => {
      console.log(`[GATEWAY → CATALOG] ${req.method} ${req.originalUrl}`);

      if (req.headers.authorization) {
        proxyReq.setHeader("Authorization", req.headers.authorization);
      }
    },

    onProxyRes: (proxyRes) => {
      console.log(`[CATALOG RESPONSE] Status: ${proxyRes.statusCode}`);
    },

    onError: (err, req, res) => {
      console.error("Proxy Error (Catalog):", err.message);

      res.status(500).json({
        message: "Catalog Service unavailable",
      });
    },
  }),
);

export default router;
