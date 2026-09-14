const { playwrightLauncher } = require("@web/test-runner-playwright");
const { spawn } = require("child_process");
const { setTimeout: delay } = require("timers/promises");
const envConfig = require("./test/utilities/envConfig.js");

const launcherArgs = [
  // Disable local network access checks or restrictions if needed
  "--disable-features=LocalNetworkAccessCheck",
  // Add other flags like --no-sandbox if running in constrained environments
  "--no-sandbox",
];

// Paths owned by the h5p server. They are proxied unprefixed because the served pages
// reference their assets with absolute URLs.
const h5pPaths = [
  "/view/",
  "/split/",
  "/assets/",
  "/libraries/",
  "/content/",
  "/content-user-data/",
  "/temp/",
  "/uploads/",
];

const isServerUp = async () => {
  try {
    await fetch(envConfig.serverUrl, { method: "HEAD" });
    return true;
  } catch {
    return false;
  }
};

const h5pServerPlugin = () => {
  let child;

  return {
    name: "h5p-server",
    async serverStart() {
      if (await isServerUp()) {
        console.log(`[wtr] Reusing h5p server at ${envConfig.serverUrl}`);
        return;
      }

      child = spawn(
        process.execPath,
        ["test/setup-h5p-env.js", envConfig.envPath, "--port", envConfig.serverPort],
        { stdio: "inherit" }
      );

      for (let attempt = 0; attempt < 60; attempt++) {
        if (await isServerUp()) return;
        await delay(500);
      }

      throw new Error(`h5p server did not start at ${envConfig.serverUrl}`);
    },
    serverStop() {
      if (!child) return;

      // The setup script starts `h5p server` in a shell, so the whole tree has to go.
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", child.pid, "/T", "/F"], { stdio: "ignore" });
      } else {
        child.kill();
      }
    },
  };
};

const h5pProxy = async (ctx, next) => {
  if (!h5pPaths.some((prefix) => ctx.url.startsWith(prefix))) return next();

  const upstream = await fetch(`${envConfig.serverUrl}${ctx.url}`, {
    method: ctx.method,
    headers: { ...ctx.headers, host: new URL(envConfig.serverUrl).host },
    body: ["GET", "HEAD"].includes(ctx.method) ? undefined : ctx.req,
    duplex: "half",
    redirect: "manual",
  });

  ctx.status = upstream.status;
  upstream.headers.forEach((value, key) => {
    // Let Koa recalculate the body framing headers.
    if (!["content-encoding", "content-length", "transfer-encoding"].includes(key)) {
      ctx.set(key, value);
    }
  });
  ctx.body = Buffer.from(await upstream.arrayBuffer());
};

module.exports = {
  nodeResolve: true,
  files: "test/**/*.test.js",
  plugins: [h5pServerPlugin()],
  middleware: [h5pProxy],
  // H5P pages pull in a lot of assets, so the 2s Mocha default is not enough.
  testFramework: { config: { timeout: "10000" } },
  browsers: [
    playwrightLauncher({
      product: "chromium",
      launchOptions: { args: launcherArgs },
    }),
    playwrightLauncher({
      product: "firefox",
      launchOptions: { args: launcherArgs },
    }),
    playwrightLauncher({
      product: "webkit",
      launchOptions: { args: launcherArgs },
    }),
  ],
  watch: true,
};
