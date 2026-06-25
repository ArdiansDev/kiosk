const { spawn } = require("node:child_process");
const {
  clearDevServerState,
  getNextBin,
  getProjectRoot,
  getRendererUrl,
  reserveDevPort,
  writeDevServerState,
} = require("./dev-server-state.cjs");

const start = async () => {
  const projectRoot = getProjectRoot();
  const nextBin = getNextBin();
  const port = await reserveDevPort();
  const rendererUrl = getRendererUrl(port);

  writeDevServerState({ port, rendererUrl });
  console.log(`Starting shared web server at ${rendererUrl}`);

  // Bind to 0.0.0.0 so the dev server is reachable from other devices on the
  // LAN (e.g. http://192.168.x.x:port). The Electron window still connects via
  // the loopback rendererUrl (127.0.0.1).
  const child = spawn(
    process.execPath,
    [nextBin, "dev", "--hostname", "0.0.0.0", "--port", String(port)],
    {
      cwd: projectRoot,
      env: process.env,
      stdio: "inherit",
    },
  );

  child.once("exit", (code) => {
    clearDevServerState();
    process.exit(code ?? 0);
  });
};

start().catch((error) => {
  console.error(error);
  clearDevServerState();
  process.exit(1);
});
