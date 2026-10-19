// Where the site is served from. "/" on Higgsfield; "/D-B-Electric/" on GitHub
// Pages (set by BASE_PATH at build time — see vite.config.ts and pages.yml).
export const BASE_URL: string = import.meta.env.BASE_URL || "/";

/** Router basepath: BASE_URL without the trailing slash ("" at the root). */
export const ROUTER_BASEPATH = BASE_URL.replace(/\/+$/, "") || "/";

/** URL for a file in public/ (e.g. "assets/og.jpg"), respecting the base path. */
export function publicUrl(path: string) {
  return BASE_URL + path.replace(/^\/+/, "");
}
