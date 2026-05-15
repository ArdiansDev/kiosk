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

  const child = spawn(
    process.execPath,
    [nextBin, "dev", "--hostname", "127.0.0.1", "--port", String(port)],
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
