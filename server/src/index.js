import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { ensureLocalMongo } from "./config/ensure-mongo.js";

const PORT = Number(process.env.PORT) || 4000;
const LOCAL_MONGODB_URI = "mongodb://127.0.0.1:27017/harry-potter-shop";
const MONGODB_URI = process.env.MONGODB_ATLAS_URL || LOCAL_MONGODB_URI;

async function start() {
  try {
    if (!process.env.MONGODB_ATLAS_URL) {
      await ensureLocalMongo();
    }
    await connectDB(MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

start();
