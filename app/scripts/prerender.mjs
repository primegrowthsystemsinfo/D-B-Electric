// Turns the server-rendered site into static files for GitHub Pages.
// Run after `vite build`:  node scripts/prerender.mjs
// Env: BASE_PATH (e.g. "/D-B-Electric/") and VITE_SITE_URL (public address, no trailing slash).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(appDir, "dist", "client");
const base = (process.env.BASE_PATH || "/").replace(/\/?$/, "/");
const siteUrl = (process.env.VITE_SITE_URL || "").replace(/\/+$/, "");
if (!siteUrl) throw new Error("Set VITE_SITE_URL to the site's public address.");
const origin = new URL(siteUrl).origin;

const { default: worker } = await import(pathToFileURL(path.join(appDir, "dist", "server", "server.js")).href);
const ctx = { waitUntil() {}, passThroughOnException() {} };

async function render(urlPath, file, expectStatus) {
  const res = await worker.fetch(new Request(origin + urlPath), { HF_ENV: "production" }, ctx);
  const body = await res.text();
  if (res.status !== expectStatus) throw new Error(`${urlPath} returned ${res.status}, expected ${expectStatus}`);
  fs.writeFileSync(path.join(outDir, file), body);
  console.log(`${urlPath} -> ${file} (${res.status}, ${body.length} bytes)`);
  return body;
}

const home = await render(base, "index.html", 200);
await render(base + "__missing__", "404.html", 404);
if (!home.includes("Get My Free Quote")) throw new Error("Home page is missing the quote form.");

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  path.join(outDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n</urlset>\n`,
);
// Pages runs Jekyll by default, which hides files starting with "_".
fs.writeFileSync(path.join(outDir, ".nojekyll"), "");
// Template preset images aren't used by this site.
fs.rmSync(path.join(outDir, "presets"), { recursive: true, force: true });
console.log("Static site ready in dist/client");
