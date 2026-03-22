import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { createProxyMiddleware } from "http-proxy-middleware";

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
