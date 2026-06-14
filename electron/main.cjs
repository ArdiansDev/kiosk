const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");

const DEV_SERVER_URL =
  process.env.ELECTRON_RENDERER_URL || "http://127.0.0.1:3000";
const PROD_SERVER_HOST = "127.0.0.1";
const PROD_SERVER_PORT_START = 3000;

let mainWindow = null;
let productionServerUrl = null;
let standaloneServerStarted = false;
let appBaseUrl = null;

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

  // When packaged, standalone is in resources/standalone
  // When dev, it's in .next/standalone
  const standaloneDir = app.isPackaged
    ? path.join(process.resourcesPath, "standalone")
    : path.join(app.getAppPath(), ".next", "standalone");

  const serverEntry = path.join(standaloneDir, "server.js");

  if (!fs.existsSync(serverEntry)) {
    throw new Error(`Next standalone server not found at ${serverEntry}`);
  }

  process.env.NODE_ENV = "production";
  process.env.HOSTNAME = PROD_SERVER_HOST;
  process.env.PORT = String(serverPort);

  // Always use the absolute writable DB path in userData. The Next standalone
  // server bundles the project .env which sets a RELATIVE DATABASE_URL
  // ("file:./prisma/dev.db"); that path breaks when the app folder is moved,
  // causing 500 errors on DB routes like /admin. Force the absolute path and
  // override any value the bundled .env may set.
  const absoluteDatabaseUrl = getDatabaseUrl();
  process.env.DATABASE_URL = absoluteDatabaseUrl;
  // Guard: if Next's dotenv loader overrides it, restore the absolute path.
  process.env.__KIOSK_DATABASE_URL = absoluteDatabaseUrl;

  if (!standaloneServerStarted) {
    standaloneServerStarted = true;

    // The Next.js standalone server resolves its manifests (e.g.
    // .next/routes-manifest.json) relative to process.cwd() *lazily*, on the
    // first request — not during require(). If we restore the original cwd
    // after require(), Next later joins the launch directory with absolute
    // paths and produces a corrupted path, throwing ENOENT and returning 500
    // on API routes like /api/queue. Set the cwd to the standalone directory
    // and keep it there for the lifetime of the process.
    process.chdir(standaloneDir);
    require(serverEntry);
  }

  productionServerUrl = `http://${PROD_SERVER_HOST}:${serverPort}`;
  await waitForServer(productionServerUrl);

  return productionServerUrl;
};

const createMainWindow = async () => {
  const startUrl = app.isPackaged
    ? await ensureStandaloneServer()
    : DEV_SERVER_URL;

  appBaseUrl = startUrl;

  if (!app.isPackaged) {
    await waitForServer(startUrl);
  }

  mainWindow = new BrowserWindow({
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
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

const buildThermalPrintUrl = (params) => {
  const base = appBaseUrl || DEV_SERVER_URL;
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  }

  return `${base}/thermal-print?${search.toString()}`;
};

const resolvePrinterDeviceName = async () => {
  let printers = [];

  const sourceWebContents = mainWindow?.webContents;

  if (sourceWebContents) {
    try {
      printers = await sourceWebContents.getPrintersAsync();
    } catch (error) {
      console.error("[print] Failed to enumerate printers:", error);
    }
  }

  console.log(
    "[print] Available printers:",
    printers.map((p) => `${p.name}${p.isDefault ? " (default)" : ""}`),
  );

  const requested = process.env.ELECTRON_PRINTER_NAME?.trim();

  if (requested) {
    const match = printers.find((p) => p.name === requested);

    if (match || printers.length === 0) {
      console.log(`[print] Using configured printer: ${requested}`);
      return requested;
    }

    console.warn(
      `[print] Configured printer "${requested}" not found. Falling back to default.`,
    );
  }

  const def = printers.find((p) => p.isDefault);

  if (def) {
    console.log(`[print] Using default printer: ${def.name}`);
    return def.name;
  }

  if (printers[0]) {
    console.log(`[print] Using first available printer: ${printers[0].name}`);
    return printers[0].name;
  }

  return undefined;
};

const renderTicketToPdf = (params) =>
  new Promise((resolve, reject) => {
    const targetUrl = buildThermalPrintUrl(params);
    console.log("[print] Loading print page:", targetUrl);

    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    let settled = false;

    const cleanup = () => {
      if (!printWindow.isDestroyed()) {
        printWindow.destroy();
      }
    };

    const fail = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const succeed = (pdfBuffer) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(pdfBuffer);
    };

    printWindow.webContents.once("did-finish-load", () => {
      console.log("[print] Print page loaded, rendering PDF...");

      // Give the renderer a moment to lay out fonts/styles.
      setTimeout(async () => {
        try {
          const pdfBuffer = await printWindow.webContents.printToPDF({
            printBackground: true,
            margins: { marginType: "none" },
            // pageSize unit is microns. 80mm × 297mm matches the @page CSS
            // rule; the thermal driver auto-cuts to content length.
            pageSize: { width: 80000, height: 297000 },
          });
          succeed(pdfBuffer);
        } catch (error) {
          fail(error);
        }
      }, 400);
    });

    printWindow.webContents.once(
      "did-fail-load",
      (_event, errorCode, errorDescription) => {
        fail(
          new Error(
            `Failed to load print page (${errorCode}): ${errorDescription}`,
          ),
        );
      },
    );

    printWindow.loadURL(targetUrl).catch(fail);
  });

const printTicket = async (params) => {
  const deviceName = await resolvePrinterDeviceName();

  const pdfBuffer = await renderTicketToPdf(params);

  const tmpDir = path.join(os.tmpdir(), "pln-kiosk-tickets");
  fs.mkdirSync(tmpDir, { recursive: true });
  const pdfPath = path.join(tmpDir, `ticket-${Date.now()}.pdf`);
  fs.writeFileSync(pdfPath, pdfBuffer);
  console.log(`[print] PDF written: ${pdfPath} (${pdfBuffer.length} bytes)`);

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { print: printPdf } = require("pdf-to-printer");

  const options = {};
  if (deviceName) {
    options.printer = deviceName;
  }

  await printPdf(pdfPath, options);
  console.log(
    `[print] Job sent to printer "${deviceName || "default"}" via pdf-to-printer.`,
  );

  // Best-effort cleanup of the temp file.
  fs.unlink(pdfPath, () => {});

  return { success: true };
};

ipcMain.handle("print-ticket", async (_event, params) => {
  console.log("[print] IPC print-ticket received:", params);
  try {
    return await printTicket(params);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return { success: false, error: message };
  }
});

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
