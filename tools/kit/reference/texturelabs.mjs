// Texturelabs (free for commercial use, no login). A texture page lists its files as
// <span class="productDownloadLink" data-id="textures/Texturelabs_Paper_348L.jpg" data-product-id=".."
// data-size-field="l_dl">; the site's JS posts them to admin-ajax.php (action custom_one_click_purchase)
// and gets back a 20-minute signed S3 URL. This module does the same, so a signed URL is never stored.
const AJAX = "https://texturelabs.org/wp-admin/admin-ajax.php";
const SIZES = { S: "s_dl", M: "m_dl", L: "l_dl", XL: "xl_dl" };
export const LICENSE = "Texturelabs — free for commercial use";

export function pageUrl(slugOrUrl) {
  if (/^https?:\/\//.test(slugOrUrl)) return slugOrUrl.replace(/\/?$/, "/");
  if (!/^[a-z0-9_-]+$/i.test(slugOrUrl)) throw new Error(`texturelabs: "${slugOrUrl}" is not a slug or URL`);
  return `https://texturelabs.org/textures/${slugOrUrl.toLowerCase()}/`;
}

// The download spans of a texture page for one size: { path, productId, field }.
export function parseDownload(html, size = "L") {
  const field = SIZES[size.toUpperCase()];
  if (!field) throw new Error(`texturelabs: size must be one of ${Object.keys(SIZES).join(", ")}`);
  for (const m of html.matchAll(/<span[^>]*productDownloadLink[^>]*>/g)) {
    const a = (k) => m[0].match(new RegExp(`data-${k}="([^"]*)"`))?.[1];
    if (a("size-field") === field) return { path: a("id"), productId: a("product-id"), field };
  }
  throw new Error(`texturelabs: no ${size} download on the page`);
}

export function parseTitle(html) {
  const t = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1] ?? html.match(/<title>([^<|–-]+)/)?.[1];
  return t?.trim();
}

const UA = process.env.MOTION_USER_AGENT ?? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15";

export async function fetchPage(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

// Signed one-shot URL for the file (valid ~20 minutes).
export async function signedUrl({ path, productId, field }) {
  const res = await fetch(AJAX, {
    method: "POST",
    headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ action: "custom_one_click_purchase", product_path: path, product_parent_id: productId, product_size: field }),
  });
  const { downloadlink } = await res.json();
  if (!downloadlink) throw new Error(`texturelabs: no download link for ${path} (login or account needed?)`);
  return downloadlink;
}

export async function download(page, size, outFile) {
  const { writeFileSync, mkdirSync } = await import("node:fs");
  const { dirname } = await import("node:path");
  const link = await signedUrl(parseDownload(await fetchPage(page), size));
  const res = await fetch(link);
  if (!res.ok) throw new Error(`${res.status} downloading ${page}`);
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
}

export function catalogEntry(html, page, { id, kind = "texture", size = "L", cut = "none", tags = [] }) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id ?? "")) throw new Error(`id "${id}" must be kebab-case`);
  const { path } = parseDownload(html, size);
  const ext = path.match(/\.(jpe?g|png)$/i)?.[0].toLowerCase() ?? ".jpg";
  return {
    id,
    kind,
    url: page,
    resolve: "texturelabs",
    size: size.toUpperCase(),
    file: `${kind}/${id}${ext}`,
    cut,
    tags,
    title: parseTitle(html) ?? path,
    source: page,
    license: LICENSE,
  };
}
