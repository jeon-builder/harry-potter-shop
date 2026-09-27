const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const major = Number(process.versions.node.split(".")[0]);
const args = process.argv.slice(2);
const localNode = path.resolve(__dirname, "../../.tools/node/bin/node");
const nodeBin = major >= 18 ? process.execPath : localNode;

if (nodeBin !== process.execPath && !fs.existsSync(nodeBin)) {
  console.error("Vite needs Node 18+. Install Node 18+ or restore .tools/node.");
  process.exit(1);
}

const child = spawn(nodeBin, args, {
  stdio: "inherit",
  cwd: path.resolve(__dirname, ".."),
});

child.on("exit", (code) => {
  process.exit(code == null ? 1 : code);
});
