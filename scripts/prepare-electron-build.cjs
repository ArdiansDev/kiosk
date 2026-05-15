const fs = require("node:fs");
const path = require("node:path");

const projectRoot = process.cwd();
const standaloneDir = path.join(projectRoot, ".next", "standalone");
const standaloneStaticDir = path.join(standaloneDir, ".next", "static");
const nextStaticDir = path.join(projectRoot, ".next", "static");
const publicDir = path.join(projectRoot, "public");
const standalonePublicDir = path.join(standaloneDir, "public");

if (!fs.existsSync(standaloneDir)) {
  throw new Error(
    "Next standalone output is missing. Run `npm run build` first.",
  );
}

fs.mkdirSync(path.dirname(standaloneStaticDir), { recursive: true });
fs.cpSync(nextStaticDir, standaloneStaticDir, { recursive: true, force: true });

if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, standalonePublicDir, { recursive: true, force: true });
}

console.log("Prepared standalone assets for Electron packaging.");
