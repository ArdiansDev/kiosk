const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const nextBin = path.join(
  projectRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);
const host = process.env.KIOSK_DEV_HOST || "127.0.0.1";
const preferredPort = Number(process.env.KIOSK_DEV_PORT || "3000");
const devServerStatePath = path.join(projectRoot, ".next", "dev-server.json");

const getProjectRoot = () => projectRoot;

const getNextBin = () => nextBin;

const getRendererUrl = (port) => `http://${host}:${port}`;

const getDefaultRendererUrl = () => getRendererUrl(preferredPort);

const ensureStateDir = () => {
  fs.mkdirSync(path.dirname(devServerStatePath), { recursive: true });
};

const writeDevServerState = (value) => {
  ensureStateDir();
  fs.writeFileSync(devServerStatePath, JSON.stringify(value), "utf8");
};

const readDevServerState = () => {
  if (!fs.existsSync(devServerStatePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(devServerStatePath, "utf8"));
  } catch {
    return null;
  }
};

const clearDevServerState = () => {
  if (fs.existsSync(devServerStatePath)) {
    fs.unlinkSync(devServerStatePath);
  }
};

const reservePort = (port) =>
  new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", reject);
    server.once("listening", () => {
      const address = server.address();
      const actualPort =
        typeof address === "object" && address ? address.port : port;

      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        resolve(actualPort);
      });
    });

    server.listen(port, host);
  });

const reserveDevPort = async () => {
  try {
    return await reservePort(preferredPort);
  } catch {
    return reservePort(0);
  }
};

const waitForDevServerState = (timeoutMs = 10000) =>
  new Promise((resolve) => {
    const startedAt = Date.now();

    const tryRead = () => {
      const current = readDevServerState();

      if (current?.rendererUrl) {
        resolve(current);
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        resolve(null);
        return;
      }

      setTimeout(tryRead, 200);
    };

    tryRead();
  });

module.exports = {
  clearDevServerState,
  getDefaultRendererUrl,
  getNextBin,
  getProjectRoot,
  getRendererUrl,
  readDevServerState,
  reserveDevPort,
  waitForDevServerState,
  writeDevServerState,
};
