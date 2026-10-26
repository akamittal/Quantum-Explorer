import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const dist = path.resolve("frontend/dist");
const manifestPath = path.join(dist, ".vite", "manifest.json");
const MAX_INITIAL_JS_BYTES = 1024 * 1024;
const MAX_TOTAL_JS_BYTES = 2.5 * 1024 * 1024;

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
// Vite marks index.html as the HTML entry; its imports point to the initial JS graph.
const entryKey =
  Object.keys(manifest).find((key) => key === "index.html" && manifest[key].isEntry) ??
  Object.keys(manifest).find((key) => manifest[key].isEntry && /main\\.jsx$/.test(manifest[key].src ?? ""));
if (!entryKey) throw new Error("Could not find the HTML entry in Vite's build manifest.");

const initialFiles = new Set();
function collect(key) {
  if (initialFiles.has(key)) return;
  initialFiles.add(key);
  const item = manifest[key];
  if (!item) return;
  for (const imported of item.imports ?? []) collect(imported);
}
collect(entryKey);

async function jsBytes(files) {
  let total = 0;
  for (const key of files) {
    const file = manifest[key]?.file;
    if (file?.endsWith(".js")) total += (await stat(path.join(dist, file))).size;
  }
  return total;
}
async function allJsBytes(directory) {
  let total = 0;
  for (const name of await readdir(directory)) {
    const fullPath = path.join(directory, name);
    const info = await stat(fullPath);
    if (info.isDirectory()) total += await allJsBytes(fullPath);
    else if (name.endsWith(".js")) total += info.size;
  }
  return total;
}
function kib(bytes) { return (bytes / 1024).toFixed(1) + " KiB"; }

const initialBytes = await jsBytes(initialFiles);
const totalBytes = await allJsBytes(path.join(dist, "assets"));
console.log(`Initial JS: ${kib(initialBytes)} / ${kib(MAX_INITIAL_JS_BYTES)} budget`);
console.log(`Total JS:   ${kib(totalBytes)} / ${kib(MAX_TOTAL_JS_BYTES)} budget`);

const violations = [];
if (initialBytes > MAX_INITIAL_JS_BYTES) violations.push("Initial JavaScript exceeds the 1 MiB budget.");
if (totalBytes > MAX_TOTAL_JS_BYTES) violations.push("Total JavaScript exceeds the 2.5 MiB budget.");
if (violations.length) {
  for (const violation of violations) console.error(`BUNDLE BUDGET FAILED: ${violation}`);
  process.exitCode = 1;
}
