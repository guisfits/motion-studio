// Turns each open-collection API's answer into one candidate shape, and keeps only what a film
// may use without asking anyone: public domain or CC0. Pure functions; find.mjs does the I/O.
//
// Candidate: { source, ref, title, author, date, licence, url, thumb, page, w, h }
//   url    the largest file the source serves freely (what `kit.mjs fetch` downloads)
//   page   the object's own page: where the licence was read, recorded as the kit's `source`
//   w, h   pixel size of `url` (null when the API does not say; Met)

// The only licences a candidate may carry. Anything else (CC BY, BY-SA, NC, ND, "copyrighted",
// "non-commercial use", a fee for commercial use) is null and the candidate is dropped.
export function licenceOf(raw) {
  const s = String(raw ?? "").trim().toLowerCase();
  if (/^(pdm|pd|public domain)\b/.test(s)) return "public domain";
  if (/^cc0\b/.test(s)) return "CC0";
  return null;
}

// Commons metadata is HTML ("<bdi><a …>Lucas Cranach</a></bdi>", "1522 <span…>").
const text = (html) =>
  String(html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;| /g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const withoutTracking = (url) => url.replace(/\?utm_[^#]*$/, "");

// AIC serves public-domain images through IIIF up to 1686 px wide.
const AIC_MAX_W = 1686;

export const normalize = {
  openverse: (json) =>
    (json.results ?? []).map((r) => ({
      source: "openverse",
      ref: r.id,
      title: text(r.title),
      author: text(r.creator),
      date: "",
      licence: licenceOf(r.license),
      url: r.url,
      // Openverse's own thumbnail proxy is slow (timeouts); the provider's file is a preview anyway.
      thumb: r.url,
      page: r.foreign_landing_url ?? r.detail_url,
      w: r.width ?? null,
      h: r.height ?? null,
    })).filter((c) => c.licence),

  commons: (json) =>
    Object.values(json.query?.pages ?? {}).flatMap((p) => {
      const ii = p.imageinfo?.[0];
      if (!ii) return [];
      const m = ii.extmetadata ?? {};
      // `License` is the machine code (pd, cc0, cc-by-sa-4.0); the display name only stands in
      // when the code is absent.
      const licence = licenceOf(m.License ? m.License.value : m.LicenseShortName?.value);
      if (!licence) return [];
      return [{
        source: "commons",
        ref: p.title,
        title: text(m.ObjectName?.value) || p.title.replace(/^File:/, ""),
        author: text(m.Artist?.value),
        date: text(m.DateTimeOriginal?.value),
        licence,
        url: withoutTracking(ii.url),
        thumb: withoutTracking(ii.thumburl ?? ii.url),
        page: ii.descriptionurl,
        w: ii.width ?? null,
        h: ii.height ?? null,
      }];
    }),

  cleveland: (json) =>
    (json.data ?? []).flatMap((a) => {
      const licence = licenceOf(a.share_license_status);
      const img = a.images?.print ?? a.images?.web;
      if (!licence || !img) return [];
      return [{
        source: "cleveland",
        ref: String(a.id),
        title: a.title ?? "",
        author: (a.creators ?? []).map((c) => c.description).join("; "),
        date: a.creation_date ?? "",
        licence,
        url: img.url,
        thumb: a.images?.web?.url ?? img.url,
        page: a.url,
        w: Number(img.width) || null,
        h: Number(img.height) || null,
      }];
    }),

  aic: (json) =>
    (json.data ?? []).flatMap((a) => {
      if (!a.is_public_domain || !a.image_id) return [];
      const fullW = a.thumbnail?.width ?? AIC_MAX_W;
      const w = Math.min(fullW, AIC_MAX_W);
      const h = a.thumbnail?.height ? Math.round((a.thumbnail.height * w) / fullW) : null;
      const iiif = `https://www.artic.edu/iiif/2/${a.image_id}/full`;
      return [{
        source: "aic",
        ref: String(a.id),
        title: a.title ?? "",
        author: String(a.artist_display ?? "").split("\n")[0],
        date: a.date_display ?? "",
        licence: "public domain",
        url: `${iiif}/${w},/0/default.jpg`,
        thumb: `${iiif}/400,/0/default.jpg`,
        page: `https://www.artic.edu/artworks/${a.id}`,
        w,
        h,
      }];
    }),

  // Met: the search answers ids only; each object is fetched and checked on its own record.
  // Its Open Access images are CC0.
  met: (objects) =>
    objects.flatMap((o) =>
      o?.isPublicDomain && o.primaryImage
        ? [{
            source: "met",
            ref: String(o.objectID),
            title: o.title ?? "",
            author: o.artistDisplayName ?? "",
            date: o.objectDate ?? "",
            licence: "CC0",
            url: o.primaryImage,
            thumb: o.primaryImageSmall || o.primaryImage,
            page: o.objectURL,
            w: null,
            h: null,
          }]
        : [],
    ),
};

// Drops candidates narrower than `minW` (unknown widths stay: check them on the sheet) and
// repeats of one file found through two sources.
export function keep(candidates, { minW = 0 } = {}) {
  const seen = new Set();
  return candidates.filter((c) => {
    if (seen.has(c.url)) return false;
    seen.add(c.url);
    return c.w == null || c.w >= minW;
  });
}

// One kit catalog row (`kit.mjs fetch` then `build`). The licence is re-checked here so nothing
// outside public domain / CC0 can enter the catalog through this door.
export function catalogEntry(c, { id, kind, cut, tags = [] }) {
  if (!licenceOf(c.licence)) throw new Error(`${id}: licence "${c.licence}" is not public domain or CC0`);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id ?? "")) throw new Error(`id "${id}" must be kebab-case`);
  const ext = (new URL(c.url).pathname.match(/\.(jpe?g|png|tiff?|webp|gif)$/i)?.[0] ?? ".jpg").toLowerCase();
  return {
    id,
    kind,
    url: c.url,
    file: `${id}${ext === ".jpeg" ? ".jpg" : ext}`,
    cut,
    tags,
    title: c.title,
    author: c.author,
    date: c.date,
    source: c.page,
    license: licenceOf(c.licence),
  };
}
