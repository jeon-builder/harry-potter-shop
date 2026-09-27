import fs from "fs";
import net from "net";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: "127.0.0.1" }, () => {
      socket.end();
      resolve(true);
    });
    socket.setTimeout(500);
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => resolve(false));
  });
}

function findMongod() {
  const mongodbDir = path.join(serverRoot, ".mongodb");
  if (!fs.existsSync(mongodbDir)) return null;

  const entries = fs.readdirSync(mongodbDir);
  for (const entry of entries) {
    const candidate = path.join(mongodbDir, entry, "bin", "mongod");
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

export async function ensureLocalMongo() {
  if (await isPortOpen(27017)) return;

  const mongod = findMongod();
  if (!mongod) {
    throw new Error(
      "MongoDB is not running on 127.0.0.1:27017. Place a mongod binary under server/.mongodb or start MongoDB first.",
    );
  }

  const dbPath = path.join(serverRoot, "data", "db");
  const logPath = path.join(serverRoot, "data", "mongod.log");
  fs.mkdirSync(dbPath, { recursive: true });

  const result = spawnSync(
    mongod,
    [
      "--dbpath",
      dbPath,
      "--bind_ip",
      "127.0.0.1",
      "--port",
      "27017",
      "--fork",
      "--logpath",
      logPath,
    ],
    { encoding: "utf8" },
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "Failed to start mongod");
  }

  for (let i = 0; i < 25; i += 1) {
    if (await isPortOpen(27017)) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error("mongod started but port 27017 is not ready");
}
