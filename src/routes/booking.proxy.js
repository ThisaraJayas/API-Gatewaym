import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.use(
  "/",
  createProxyMiddleware({
    target: process.env.BOOKING_SERVICE_URL,
    changeOrigin: true,
    secure: false,
    cookieDomainRewrite: "",
    onProxyReq: (proxyReq, req) => {
      if (req.headers.authorization) {
        proxyReq.setHeader("Authorization", req.headers.authorization);
      }
    },
  }),
);

export default router;
