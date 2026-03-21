import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.use(
  "/",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    secure: false,
    cookieDomainRewrite: "",

    // 🔥 FINAL FIX
    pathRewrite: (path, req) => {
      return `/api/auth${path}`;
    },

    onProxyReq: (proxyReq, req) => {
      console.log(`[GATEWAY → AUTH] ${req.method} ${req.originalUrl}`);

      if (req.headers.authorization) {
        proxyReq.setHeader("Authorization", req.headers.authorization);
      }
    },

    onProxyRes: (proxyRes) => {
      console.log(`[AUTH RESPONSE] Status: ${proxyRes.statusCode}`);
    },

    onError: (err, req, res) => {
      console.error("Proxy Error (Auth):", err.message);

      res.status(500).json({
        message: "Auth Service is unavailable",
      });
    },
  }),
);

export default router;
