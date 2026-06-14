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

// Remove the relative DATABASE_URL from the bundled standalone .env. Next's
// standalone server auto-loads this .env at runtime; a relative path like
// "file:./prisma/dev.db" breaks when the packaged app folder is moved,
// causing 500 errors on DB routes (e.g. /admin). The Electron main process
// supplies an absolute DATABASE_URL at runtime instead.
const standaloneEnvPath = path.join(standaloneDir, ".env");

if (fs.existsSync(standaloneEnvPath)) {
  const filteredEnv = fs
    .readFileSync(standaloneEnvPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => !/^\s*DATABASE_URL\s*=/.test(line))
    .join("\n");

  fs.writeFileSync(standaloneEnvPath, filteredEnv);
  console.log("Stripped relative DATABASE_URL from bundled standalone .env.");
}

console.log("Prepared standalone assets for Electron packaging.");
