// Pure functions: no DOM, no storage. Everything here is covered by test/pace.test.js.
import { MI, MAR_KM, SEGMENTS, WAVES, PALETTE } from "./course-data.js";

const FIN_MI = MAR_KM / MI; // the Finish split, in miles

export const DEFAULT_STATE = Object.freeze({
  v: 1, name: "", paceSec: 660, wave: 3, delay: 10, showHot: true, units: "km", spots: []
});
export const LIMITS = Object.freeze({
  maxSpots: 12, whoLen: 40, noteLen: 80, paceMin: 240, paceMax: 1500, delayMax: 45, maxMile: 26.2
});

// ---------- Route geometry ----------

// Project lat/lon waypoints onto a flat pixel canvas and give every waypoint a mile.
export function projectRoute(R, bounds, K = 100) {
  const kx = 111.2 * Math.cos(41.89 * Math.PI / 180) * K, ky = 111.2 * K;
  const W = Math.round((bounds.e - bounds.w) * kx), H = Math.round((bounds.n - bounds.s) * ky);
  const P = (lat, lon) => [(lon - bounds.w) * kx, (bounds.n - lat) * ky];
  const xy = R.map(r => P(r[0], r[1]));
  const seg = [0];
  for (let i = 1; i < xy.length; i++) seg.push(seg[i - 1] + Math.hypot(xy[i][0] - xy[i - 1][0], xy[i][1] - xy[i - 1][1]));
  const miles = new Array(R.length);
  const anchors = R.map((r, i) => r[2] != null ? i : -1).filter(i => i >= 0);
  for (let a = 0; a < anchors.length - 1; a++) {
    const i0 = anchors[a], i1 = anchors[a + 1];
    const m0 = R[i0][2], m1 = R[i1][2], d0 = seg[i0], d1 = seg[i1];
    for (let i = i0; i <= i1; i++) miles[i] = m0 + (m1 - m0) * (seg[i] - d0) / (d1 - d0);
  }
  return { xy, miles, W, H, P, latlon: R.map(r => [r[0], r[1]]) };
}

function segmentFor(route, mile) {
  const { miles } = route;
  for (let i = 1; i < miles.length; i++) {
    if (mile <= miles[i]) return { i, t: Math.max(0, (mile - miles[i - 1]) / (miles[i] - miles[i - 1])) };
  }
  return { i: miles.length - 1, t: 1 };
}

const lerp2 = (a, b, t) => [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];

// Map coordinates for a mile along the route.
export function posAt(route, mile) {
  const { i, t } = segmentFor(route, mile);
  return lerp2(route.xy[i - 1], route.xy[i], t);
}

// Real-world lat/lon for a mile along the route.
export function latLonAt(route, mile) {
  const { i, t } = segmentFor(route, mile);
  return lerp2(route.latlon[i - 1], route.latlon[i], t);
}

// Nearest mile to a map point. `alt` is a second candidate when another leg of the
// course is close by but more than a mile away (out-and-back streets overlap on the map).
export function nearestMile(route, x, y, altWithin = 25) {
  const { xy, miles } = route;
  const cands = [];
  for (let i = 1; i < xy.length; i++) {
    const [ax, ay] = xy[i - 1], [bx, by] = xy[i];
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    let t = L ? ((x - ax) * dx + (y - ay) * dy) / L : 0;
    t = Math.max(0, Math.min(1, t));
    const d = Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
    cands.push({ mile: miles[i - 1] + t * (miles[i] - miles[i - 1]), dist: d });
  }
  cands.sort((a, b) => a.dist - b.dist);
  const best = cands[0];
  const alt = cands.find(c => c.dist <= altWithin && Math.abs(c.mile - best.mile) > 1);
  return alt ? { ...best, alt } : { ...best };
}

// Dominant compass direction the course is running at a mile (map y grows southward).
export function headingAt(route, mile) {
  const { i } = segmentFor(route, mile);
  const [ax, ay] = route.xy[i - 1], [bx, by] = route.xy[i];
  const dx = bx - ax, dy = by - ay;
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "E" : "W") : (dy > 0 ? "S" : "N");
}

// Put the label on the side the course is not running toward, so paired legs don't collide.
export function sideFor(heading) {
  return { N: "r", S: "l", E: "b", W: "t" }[heading] || "r";
}

export function whereAt(segments, mile) {
  const last = segments[segments.length - 1];
  const s = segments.find(s => mile >= s.from && mile < s.to) || (mile >= last.from ? last : segments[0]);
  return s.street + ", " + s.hood;
}

// Give each popular zone the route mile nearest its real intersection.
export function resolveHotspots(route, hotspots) {
  return hotspots.map(h => {
    const [x, y] = route.P(h.lat, h.lon);
    const n = nearestMile(route, x, y);
    return { ...h, mile: Math.round(n.mile * 10) / 10, routeDist: n.dist };
  });
}

// ---------- Directions ----------

export function directionsUrl(lat, lon, platform) {
  const ll = lat.toFixed(5) + "," + lon.toFixed(5);
  if (platform === "ios") return "https://maps.apple.com/?daddr=" + ll + "&dirflg=r";
  return "https://www.google.com/maps/dir/?api=1&destination=" + ll + "&travelmode=transit";
}

// ---------- Formatting ----------

export function fmtClock(totalMin, short) {
  let h = Math.floor(totalMin / 60), m = Math.round(totalMin % 60);
  if (m === 60) { h += 1; m = 0; }
  const h12 = ((h + 11) % 12) + 1, s = h12 + ":" + String(m).padStart(2, "0");
  return short ? s : s + (h % 24 >= 12 ? " p.m." : " a.m.");
}

export function fmtElapsed(min) {
  const s = Math.round(min * 60), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h + ":" + String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

export function fmtPace(sec) {
  const m = Math.floor(sec / 60), s = Math.round(sec - m * 60);
  return m + ":" + String(s).padStart(2, "0");
}

export function fmtPacePerKm(paceSec) {
  return fmtPace(paceSec / MI);
}

// ---------- Timing ----------

export function startLineMinutes(wave, delay, waves = WAVES) {
  const w = waves.find(w => w.n === wave) || waves[waves.length - 1];
  const [h, m] = w.start.split(":").map(Number);
  return h * 60 + m + delay;
}

const KIND_ORDER = { split: 0, finish: 1, hot: 2, spot: 3 };

export function colorsFor(spots, palette = PALETTE) {
  const map = new Map();
  for (const s of spots) {
    const k = groupKey(s.who);
    if (!map.has(k)) map.set(k, palette[map.size % palette.length]);
  }
  return map;
}
export const groupKey = who => (who || "").trim().toLowerCase();

// The list by miles: start, every mile, halfway and the finish. Miles that are not a
// multiple of five are `minor`: small numbered dots on the map, full rows in the list.
export function mileSplits(kmSplits, segments = SEGMENTS) {
  const start = kmSplits.find(s => s.label === "Start"), finish = kmSplits.find(s => s.finish);
  const half = kmSplits.find(s => s.label === "Halfway");
  const rows = [{ ...start, short: "Start" }];
  for (let m = 1; m <= 26; m++) rows.push({ label: "Mile " + m, short: String(m), mi: m, where: whereAt(segments, m), minor: m % 5 !== 0 });
  if (half) rows.push({ ...half, short: "Half" });
  rows.push({ ...finish, short: "Finish" });
  return rows;
}

// One time-ordered list of everything worth knowing the time for.
// ctx: { route, splits, mileSplits, hotspots (resolved), segments, palette }
export function computeSplits(state, ctx) {
  const paceMin = state.paceSec / 60;
  const start = startLineMinutes(state.wave, state.delay);
  const colors = colorsFor(state.spots, ctx.palette);
  const rows = [];
  const splits = state.units === "mi" ? (ctx.mileSplits || mileSplits(ctx.splits, ctx.segments)) : ctx.splits;
  for (const s of splits) {
    const mile = s.mi != null ? s.mi : s.km / MI;
    rows.push({ kind: s.finish ? "finish" : "split", key: "split:" + s.label, label: s.label, short: s.short || s.label, minor: !!s.minor,
      mile, where: s.where, side: s.side || sideFor(headingAt(ctx.route, mile)), latlon: latLonAt(ctx.route, mile) });
  }
  if (state.showHot) for (const h of ctx.hotspots) {
    rows.push({ kind: "hot", key: "hot:" + h.key, label: h.name, short: h.short, mile: h.mile, where: h.where,
      side: h.side || sideFor(headingAt(ctx.route, h.mile)), latlon: [h.lat, h.lon], hot: h });
  }
  for (const sp of state.spots) {
    const who = (sp.who || "").trim();
    rows.push({ kind: "spot", key: "spot:" + sp.id, label: who || "Cheer spot", short: who || "Cheer spot", mile: sp.mile,
      where: whereAt(ctx.segments || SEGMENTS, sp.mile), side: sideFor(headingAt(ctx.route, sp.mile)),
      color: colors.get(groupKey(sp.who)), latlon: latLonAt(ctx.route, sp.mile), spot: sp, note: (sp.note || "").trim() });
  }
  for (const r of rows) { r.km = r.mile * MI; r.elapsedMin = r.mile * paceMin; r.clockMin = start + r.elapsedMin; }
  rows.sort((a, b) => (a.mile - b.mile) || (KIND_ORDER[a.kind] - KIND_ORDER[b.kind]));
  return assignSides(rows, m => posAt(ctx.route, m));
}

// Map labels are wide and short. Estimate each label's box from its side and text length,
// and flip a label to the opposite side when its preferred box overlaps one already placed
// (out-and-back streets run a block apart, so this happens a lot).
const OPPOSITE = { l: "r", r: "l", t: "b", b: "t" };
const LABEL_H = 26, CHAR_W = 11, GAP = 20;
function labelBox(x, y, side, chars) {
  const w = chars * CHAR_W;
  if (side === "l") return { x0: x - GAP - w, x1: x - GAP, y0: y - LABEL_H / 2, y1: y + LABEL_H / 2 };
  if (side === "r") return { x0: x + GAP, x1: x + GAP + w, y0: y - LABEL_H / 2, y1: y + LABEL_H / 2 };
  if (side === "t") return { x0: x - w / 2, x1: x + w / 2, y0: y - 22 - LABEL_H, y1: y - 22 + 4 };
  return { x0: x - w / 2, x1: x + w / 2, y0: y + 38 - LABEL_H, y1: y + 38 + 4 };
}
const overlaps = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
export function assignSides(rows, posOf) {
  const placed = [];
  for (const r of rows) {
    if (r.minor) continue;
    const [x, y] = posOf ? posOf(r.mile) : [r.mile * 1000, 0];
    const chars = ((r.short || "") + " 00:00").length;
    const box = side => labelBox(x, y, side, chars);
    const free = side => !placed.some(p => overlaps(p, box(side)));
    const order = [r.side, OPPOSITE[r.side], ...["l", "r", "t", "b"].filter(x => x !== r.side && x !== OPPOSITE[r.side])];
    r.side = order.find(free) || r.side;
    placed.push(box(r.side));
  }
  return rows;
}

export function finishFor(state) {
  const paceMin = state.paceSec / 60;
  const elapsedMin = FIN_MI * paceMin;
  return { elapsedMin, clockMin: startLineMinutes(state.wave, state.delay) + elapsedMin };
}

// Where the runner is right now, or null when the race is not in progress for them.
export function runnerMileAt(state, nowMin) {
  const paceMin = state.paceSec / 60;
  const start = startLineMinutes(state.wave, state.delay);
  const fin = start + FIN_MI * paceMin;
  if (nowMin <= start || nowMin >= fin) return null;
  return (nowMin - start) / paceMin;
}

export function isRaceDay(date, raceDate) {
  return date.getFullYear() === raceDate.year && date.getMonth() + 1 === raceDate.month && date.getDate() === raceDate.day;
}

// ---------- State ----------

export function newId() {
  return Math.random().toString(36).slice(2, 6);
}

const num = (v, def) => { const n = typeof v === "string" ? parseFloat(v) : v; return Number.isFinite(n) ? n : def; };
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export function normalizeSpot(raw) {
  if (!raw || typeof raw !== "object") return null;
  const mile = num(raw.mile, NaN);
  if (!Number.isFinite(mile)) return null;
  return {
    id: typeof raw.id === "string" && /^[a-z0-9]{1,8}$/.test(raw.id) ? raw.id : newId(),
    who: String(raw.who || "").slice(0, LIMITS.whoLen),
    mile: Math.round(clamp(mile, 0, LIMITS.maxMile) * 10) / 10,
    note: String(raw.note || "").slice(0, LIMITS.noteLen)
  };
}

export function normalizeState(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  const wave = Math.round(num(r.wave, DEFAULT_STATE.wave));
  return {
    v: 1,
    name: String(r.name || "").slice(0, LIMITS.whoLen),
    paceSec: Math.round(clamp(num(r.paceSec, DEFAULT_STATE.paceSec), LIMITS.paceMin, LIMITS.paceMax)),
    wave: WAVES.some(w => w.n === wave) ? wave : DEFAULT_STATE.wave,
    delay: Math.round(clamp(num(r.delay, DEFAULT_STATE.delay), 0, LIMITS.delayMax)),
    showHot: r.showHot === undefined ? DEFAULT_STATE.showHot : !!(r.showHot === true || r.showHot === "1" || r.showHot === 1),
    units: r.units === "mi" ? "mi" : "km",
    shared: r.shared === true,
    spots: (Array.isArray(r.spots) ? r.spots : []).map(normalizeSpot).filter(Boolean).slice(0, LIMITS.maxSpots)
  };
}

// ---------- Share link (URL fragment) ----------
// #v=1&n=Adem&p=660&w=3&d=10&h=1&u=mi&s=3.1~Mom~by%20the%20bank&s=14~Dad
// `~` separates the fields of a spot, so `~` inside a name is encoded as %7E.

const enc = s => encodeURIComponent(s).replace(/~/g, "%7E");

export function encodeShare(state) {
  const parts = ["v=1"];
  if (state.name) parts.push("n=" + enc(state.name));
  parts.push("p=" + state.paceSec, "w=" + state.wave, "d=" + state.delay, "h=" + (state.showHot ? 1 : 0));
  if (state.units === "mi") parts.push("u=mi");
  for (const sp of state.spots) {
    let s = String(sp.mile) + "~" + enc(sp.who || "");
    if (sp.note) s += "~" + enc(sp.note);
    parts.push("s=" + s);
  }
  return parts.join("&");
}

const dec = s => { try { return decodeURIComponent(s); } catch { return ""; } };

// Returns a partial state (run it through normalizeState), or null when the hash has nothing for us.
export function decodeShare(hash) {
  const h = (hash || "").replace(/^#/, "");
  if (!h) return null;
  const out = { spots: [] };
  let found = false;
  for (const part of h.split("&")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const k = part.slice(0, eq), v = part.slice(eq + 1);
    switch (k) {
      case "n": out.name = dec(v); found = true; break;
      case "p": out.paceSec = parseFloat(v); found = true; break;
      case "w": out.wave = parseFloat(v); found = true; break;
      case "d": out.delay = parseFloat(v); found = true; break;
      case "h": out.showHot = v === "1"; found = true; break;
      case "u": out.units = v; found = true; break;
      case "s": {
        const f = v.split("~");
        const mile = parseFloat(f[0]);
        if (Number.isFinite(mile)) { out.spots.push({ mile, who: dec(f[1] || ""), note: dec(f[2] || "") }); found = true; }
        break;
      }
      default: break; // unknown keys are ignored
    }
  }
  return found ? out : null;
}
