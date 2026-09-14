#!/usr/bin/env node
/**
 * Boilerplate setup for running this content type against a local H5P CLI environment.
 *
 * Usage: node test/setup-h5p-env.js <h5pEnvPath> [--port 8080] [--no-server]
 *
 * Assumes the H5P CLI (`h5p`) is already installed and on PATH.
 *
 * Steps:
 *   1. Verify <h5pEnvPath> exists, running `h5p core` if content/libraries/temp/uploads are missing
 *   2. Look for <h5pEnvPath>/libraries/<machineName>-<major>.<minor>
 *   3. If it is missing, run `h5p setup <contentTypeName>` in <h5pEnvPath>
 *   4. Link that library folder to this repo
 *   5. Copy each folder in test/artifacts into <h5pEnvPath>/content
 *   6. Start `h5p server`
 */

const fs = require('fs');
const path = require('path');
const { spawnSync, spawn } = require('child_process');
const envConfig = require('./utilities/envConfig.js');

const fail = (message) => {
  console.error(message);
  process.exit(1);
};
const log = (message) => console.log(`[setup] ${message}`);

const args = process.argv.slice(2);
const envPath = args.find((arg) => !arg.startsWith('--')) ?? envConfig.envPath;
const portIndex = args.indexOf('--port');
const port = portIndex === -1 ? undefined : args[portIndex + 1];

if (!envPath) {
  fail('Usage: node test/setup-h5p-env.js <h5pEnvPath> [--port 8080] [--no-server]');
}
if (portIndex !== -1 && !/^\d+$/.test(port ?? '')) {
  fail(`Invalid --port value: ${port}`);
}

const repoDir = path.resolve(__dirname, '..');
const envDir = path.resolve(envPath);
const serverPort = port ?? envConfig.serverPort;
const serverUrl = port ? `http://localhost:${port}` : envConfig.serverUrl;

// `h5p setup` takes the repo name, but installs the library as <machineName>-<major>.<minor>.
const library = JSON.parse(fs.readFileSync(path.join(repoDir, 'library.json'), 'utf8'));
const libraryFolder = `${library.machineName}-${library.majorVersion}.${library.minorVersion}`;
const libraryLink = path.join(envDir, 'libraries', libraryFolder);
const artifactsDir = path.join(__dirname, 'artifacts');
const contentDir = path.join(envDir, 'content');

// The H5P CLI is a .cmd shim on Windows, so it needs a shell. Args are part of the command
// string (instead of an args array) to avoid the DEP0190 deprecation warning.
const spawnOptions = { cwd: envDir, stdio: 'inherit', shell: true };
const hasLibrary = () => fs.existsSync(libraryLink);

// rmSync recurses into a junction's target and fails with EPERM, so links are unlinked instead.
const removePath = (target) => {
  const stat = fs.lstatSync(target, { throwIfNoEntry: false });
  if (!stat) return;

  if (stat.isSymbolicLink()) {
    try {
      fs.unlinkSync(target);
    } catch {
      fs.rmdirSync(target);
    }
  } else {
    fs.rmSync(target, { recursive: true, force: true });
  }
};

const requiredFolders = ['content', 'libraries', 'temp', 'uploads'];
const missingFolders = () => requiredFolders.filter((folder) => !fs.existsSync(path.join(envDir, folder)));

if (!fs.existsSync(envDir)) {
  fail(`H5P environment not found: ${envDir}`);
}

// `h5p core` scaffolds the environment (core libraries plus the folders the server expects).
if (missingFolders().length > 0) {
  log(`Missing ${missingFolders().join(', ')} in ${envDir}, running h5p core...`);
  spawnSync('h5p core', spawnOptions);

  if (missingFolders().length > 0) {
    fail(`h5p core did not create: ${missingFolders().join(', ')}`);
  }
}

// `h5p setup` downloads many repos and can fail on a transient ECONNRESET; re-running it
// only fetches what is still missing.
for (let attempt = 1; attempt <= 3 && !hasLibrary(); attempt++) {
  log(`${libraryFolder} not found in ${envDir}, running h5p setup (attempt ${attempt}/3)...`);
  spawnSync(`h5p setup ${envConfig.contentTypeName}`, spawnOptions);
}

if (!hasLibrary()) {
  fail(`h5p setup failed to create ${libraryLink}`);
}

const linkStat = fs.lstatSync(libraryLink);
const linksToRepo = linkStat.isSymbolicLink() && path.resolve(fs.readlinkSync(libraryLink)) === repoDir;

if (!linksToRepo) {
  removePath(libraryLink);
  // 'junction' is ignored on non-Windows platforms.
  fs.symlinkSync(repoDir, libraryLink, 'junction');
}

log(`${libraryLink} -> ${repoDir}`);

const artifacts = fs.existsSync(artifactsDir)
  ? fs.readdirSync(artifactsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory())
  : [];

for (const { name } of artifacts) {
  const target = path.join(contentDir, name);
  removePath(target);
  fs.cpSync(path.join(artifactsDir, name), target, { recursive: true });
  log(`Copied artifact content "${name}" to ${target}`);
}

if (!fs.lstatSync(libraryLink).isSymbolicLink()) {
  fail(`${libraryLink} is not a link to ${repoDir}`);
}

const notCopied = artifacts.filter(({ name }) => !fs.existsSync(path.join(contentDir, name)));
if (notCopied.length > 0) {
  fail(`Artifact content missing from ${contentDir}: ${notCopied.map(({ name }) => name).join(', ')}`);
}

if (args.includes('--no-server')) {
  process.exit(0);
}

log(`Starting h5p server at ${serverUrl}`);
spawn(`h5p server ${serverPort}`, spawnOptions).on('exit', (code) => process.exit(code ?? 0));