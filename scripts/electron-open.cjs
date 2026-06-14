const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const {
  getDefaultRendererUrl,
  getProjectRoot,
  readDevServerState,
  waitForDevServerState,
} = require("./dev-server-state.cjs");

const resolveElectronBinary = () => {
  // `require("electron")` reads node_modules/electron/path.txt, which only
  // exists once the postinstall step has downloaded the Electron binary.
  // Detect the missing/incomplete install and surface a clear fix instead
  // of the raw ENOENT on path.txt.
  const electronDir = path.dirname(require.resolve("electron/package.json"));
  const pathTxt = path.join(electronDir, "path.txt");

  if (!fs.existsSync(pathTxt)) {
    throw new Error(
      "Electron binary is not installed (missing node_modules/electron/path.txt).\n" +
        "The postinstall download did not complete. Fix it with:\n\n" +
        "  node node_modules/electron/install.js\n\n" +
        "If that fails (proxy/firewall blocking github.com), use a mirror:\n\n" +
        "  ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ node node_modules/electron/install.js\n",
    );
  }

  const binary = require("electron");

  if (typeof binary !== "string" || !fs.existsSync(binary)) {
    throw new Error(
      `Electron binary path is invalid: ${binary}\n` +
        "Reinstall it with: node node_modules/electron/install.js",
    );
  }

  return binary;
};

const start = async () => {
  const electronBinary = resolveElectronBinary();
  const projectRoot = getProjectRoot();
  const initialRendererUrl = process.env.ELECTRON_RENDERER_URL;
  const serverState = initialRendererUrl
    ? null
    : await waitForDevServerState(10000);
  const rendererUrl =
    initialRendererUrl ||
    serverState?.rendererUrl ||
    readDevServerState()?.rendererUrl ||
    getDefaultRendererUrl();

  console.log(`Starting Electron against ${rendererUrl}`);

  const child = spawn(electronBinary, ["."], {
    cwd: projectRoot,
    env: {
      ...process.env,
      ELECTRON_RENDERER_URL: rendererUrl,
    },
    stdio: "inherit",
  });

  child.once("exit", (code) => {
    process.exit(code ?? 0);
  });
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
