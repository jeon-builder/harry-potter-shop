import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client/dist");

const configuredOrigins = [
  "http://localhost:5173",
  "https://harry-potter-shop.vercel.app",
  ...String(process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
];

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (configuredOrigins.includes(origin)) return true;
  return /^https:\/\/harry-potter-shop(-[a-z0-9]+)?\.vercel\.app$/.test(origin);
}

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    },
  }),
);
app.use(express.json());

app.use("/api", routes);

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    if (field === "sku") {
      return res.status(409).json({ message: "이미 존재하는 SKU입니다." });
    }
    if (field === "email") {
      return res.status(409).json({ message: "Email already exists" });
    }
    return res.status(409).json({ message: "이미 존재하는 값입니다." });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

export default app;
