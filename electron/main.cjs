const { app, BrowserWindow, dialog, shell } = require("electron");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");

const DEV_SERVER_URL =
  process.env.ELECTRON_RENDERER_URL || "http://127.0.0.1:3000";
const PROD_SERVER_HOST = "127.0.0.1";
const PROD_SERVER_PORT_START = 3000;

let mainWindow = null;
let productionServerUrl = null;
let standaloneServerStarted = false;

const readJsonFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
};

const getElectronRuntimeConfig = () => {
  const configPaths = [
    path.join(app.getPath("userData"), "electron-config.json"),
  ];

  if (app.isPackaged) {
    configPaths.push(path.join(process.resourcesPath, "electron-config.json"));
  }

  for (const configPath of configPaths) {
    const config = readJsonFile(configPath);

    if (config) {
      return config;
    }
  }

  return null;
};

const applyElectronRuntimeConfig = () => {
  const runtimeConfig = getElectronRuntimeConfig();
  const remoteApiBaseUrl = runtimeConfig?.apiBaseUrl?.trim();

  if (remoteApiBaseUrl && !process.env.ELECTRON_API_BASE_URL) {
    process.env.ELECTRON_API_BASE_URL = remoteApiBaseUrl;
  }
};

const ensureSeedDatabase = () => {
  const targetDir = path.join(app.getPath("userData"), "prisma");
  const targetPath = path.join(targetDir, "dev.db");

  fs.mkdirSync(targetDir, { recursive: true });

  if (fs.existsSync(targetPath)) {
    return targetPath;
  }

  const sourcePath = app.isPackaged
    ? path.join(process.resourcesPath, "seed", "dev.db")
    : path.join(app.getAppPath(), "prisma", "prisma", "dev.db");

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
  }

  return targetPath;
};

const getDatabaseUrl = () => {
  const databasePath = ensureSeedDatabase();

  return `file:${databasePath.replace(/\\/g, "/")}`;
};

const isPortAvailable = (port) =>
  new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, PROD_SERVER_HOST);
  });

const findAvailablePort = async (startPort) => {
  let port = startPort;

  while (!(await isPortAvailable(port))) {
    port += 1;
  }

  return port;
};

const waitForServer = (targetUrl, timeoutMs = 30000) =>
  new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const tryConnect = () => {
      const request = http.get(targetUrl, (response) => {
        response.resume();
        resolve();
      });

      request.on("error", () => {
        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error(`Timed out waiting for ${targetUrl}`));
          return;
        }

        setTimeout(tryConnect, 500);
      });
    };

    tryConnect();
  });

const ensureStandaloneServer = async () => {
  if (productionServerUrl) {
    return productionServerUrl;
  }

  const serverPort = await findAvailablePort(PROD_SERVER_PORT_START);
  const standaloneDir = path.join(app.getAppPath(), ".next", "standalone");
  const serverEntry = path.join(standaloneDir, "server.js");

  if (!fs.existsSync(serverEntry)) {
    throw new Error(`Next standalone server not found at ${serverEntry}`);
  }

  process.env.NODE_ENV = "production";
  process.env.HOSTNAME = PROD_SERVER_HOST;
  process.env.PORT = String(serverPort);
  process.env.DATABASE_URL = process.env.DATABASE_URL || getDatabaseUrl();

  if (!standaloneServerStarted) {
    standaloneServerStarted = true;

    const previousCwd = process.cwd();
    process.chdir(standaloneDir);

    try {
      require(serverEntry);
    } finally {
      process.chdir(previousCwd);
    }
  }

  productionServerUrl = `http://${PROD_SERVER_HOST}:${serverPort}`;
  await waitForServer(productionServerUrl);

  return productionServerUrl;
};

const createMainWindow = async () => {
  const startUrl = app.isPackaged
    ? await ensureStandaloneServer()
    : DEV_SERVER_URL;

  if (!app.isPackaged) {
    await waitForServer(startUrl);
  }

  mainWindow = new BrowserWindow({
    width: 595,
    height: 1058,
    minWidth: 595,
    minHeight: 1058,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);

    return { action: "deny" };
  });

  await mainWindow.loadURL(startUrl);

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
};

app.whenReady().then(async () => {
  try {
    applyElectronRuntimeConfig();
    await createMainWindow();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    dialog.showErrorBox("Electron startup failed", message);
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
