const { spawn } = require("node:child_process");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

let shuttingDown = false;
let webProcess;
let electronProcess;

const terminateChild = (child) => {
  if (!child || child.killed) {
    return;
  }

  child.kill("SIGTERM");
};

const shutdown = (exitCode = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  terminateChild(electronProcess);
  terminateChild(webProcess);
  process.exit(exitCode);
};

const pipeLogs = (child, prefix) => {
  child.stdout?.on("data", (chunk) => {
    process.stdout.write(`[${prefix}] ${chunk}`);
  });

  child.stderr?.on("data", (chunk) => {
    process.stderr.write(`[${prefix}] ${chunk}`);
  });
};
const start = () => {
  webProcess = spawn(process.execPath, [path.join("scripts", "web-dev.cjs")], {
    cwd: projectRoot,
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
  });

  pipeLogs(webProcess, "web");

  webProcess.once("exit", (code) => {
    if (shuttingDown) {
      return;
    }

    shutdown(code ?? 1);
  });

  electronProcess = spawn(
    process.execPath,
    [path.join("scripts", "electron-open.cjs")],
    {
      cwd: projectRoot,
      env: process.env,
      stdio: ["inherit", "pipe", "pipe"],
    },
  );

  pipeLogs(electronProcess, "electron");

  electronProcess.once("exit", (code) => {
    if (shuttingDown) {
      return;
    }

    shutdown(code ?? 0);
  });
};

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

try {
  start();
} catch (error) {
  console.error(error);
  shutdown(1);
}
