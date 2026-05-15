const { spawn } = require("node:child_process");
const electronBinary = require("electron");
const {
  getDefaultRendererUrl,
  getProjectRoot,
  readDevServerState,
  waitForDevServerState,
} = require("./dev-server-state.cjs");

const start = async () => {
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
