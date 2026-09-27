import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { ensureLocalMongo } from "./config/ensure-mongo.js";

const PORT = Number(process.env.PORT) || 4000;
const LOCAL_MONGODB_URI = "mongodb://127.0.0.1:27017/harry-potter-shop";
const ATLAS_URL = process.env.MONGODB_ATLAS_URL;
const MONGODB_URI = ATLAS_URL || LOCAL_MONGODB_URI;
const isHeroku = Boolean(process.env.DYNO);

async function start() {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });

  try {
    if (!ATLAS_URL && !isHeroku) {
      await ensureLocalMongo();
    }

    if (!ATLAS_URL && isHeroku) {
      console.error("MONGODB_ATLAS_URL is missing. Set it in Heroku Config Vars.");
      return;
    }

    await connectDB(MONGODB_URI);
  } catch (error) {
    console.error("Failed to connect MongoDB:", error.message);
    if (!isHeroku) {
      process.exit(1);
    }
  }
}

start();
