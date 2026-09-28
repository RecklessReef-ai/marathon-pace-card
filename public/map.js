// SVG map drawing. Knows about the DOM, knows nothing about pace or state.
import { MAP } from "./course-data.js";
import { LAKE, RIVERS, RIVER_LINES, PARKS } from "./map-data.js";
import { posAt } from "./pace.js";

const ns = "http://www.w3.org/2000/svg";

export function el(tag, attrs, parent) {
  const e = document.createElementNS(ns, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

const STAR = "M0 -17 L4.3 -8.4 L14 -9.8 L8.6 -1.8 L14 6.2 L4.3 4.8 L0 13.4 L-4.3 4.8 L-14 6.2 L-8.6 -1.8 L-14 -9.8 L-4.3 -8.4 Z";
const DIAMOND = "M0 -15 L15 0 L0 15 L-15 0 Z";
const LABEL_OFFSET = { l: [-20, 9, "end"], r: [20, 9, "start"], t: [0, -22, "middle"], b: [0, 38, "middle"] };

// Draw the static background and route once. Returns the layers the app updates.
export function buildMap(svg, route) {
  const { W, H, P, xy } = route;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  const pts = arr => arr.map(([la, lo]) => P(la, lo).map(v => v.toFixed(1)).join(",")).join(" ");

  el("rect", { x: 0, y: 0, width: W, height: H, fill: "var(--land)" }, svg);
  el("polygon", { points: pts(LAKE), fill: "var(--water)" }, svg);
  for (const park of PARKS) el("polygon", { points: pts(park), fill: "var(--park)" }, svg);
  for (const river of RIVERS) el("polygon", { points: pts(river), fill: "var(--water)" }, svg);
  for (const line of RIVER_LINES) el("polyline", { points: pts(line), fill: "none", stroke: "var(--water)", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
  for (const [t, la, lo, c] of MAP.labels) {
    const [x, y] = P(la, lo);
    const tx = el("text", { x, y, class: c, "text-anchor": "middle" }, svg);
    tx.textContent = t;
  }
  const routePts = xy.map(p => p.map(v => v.toFixed(1)).join(",")).join(" ");
  el("polyline", { points: routePts, fill: "none", stroke: "var(--paper)", "stroke-width": 13, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
  el("polyline", { points: routePts, fill: "none", stroke: "var(--route)", "stroke-width": 6, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
  const [sx, sy] = xy[0];
  el("rect", { x: sx - 10, y: sy - 5, width: 20, height: 10, fill: "#41B6E6", stroke: "var(--route)", "stroke-width": 2 }, svg);

  const mileLayer = el("g", { class: "miles", "aria-hidden": "true" }, svg);
  for (let m = 1; m <= 26; m++) {
    const [x, y] = posAt(route, m);
    const g = el("g", { transform: `translate(${x.toFixed(1)},${y.toFixed(1)})` }, mileLayer);
    el("circle", { r: 10, fill: "var(--paper)", stroke: "var(--route)", "stroke-width": 2 }, g);
    const t = el("text", { class: "milenum", y: 4.5, "text-anchor": "middle" }, g);
    t.textContent = String(m);
  }
  const markerLayer = el("g", {}, svg);
  const runner = el("g", { style: "display:none" }, svg);
  el("circle", { r: 16, fill: "#E4002B", opacity: 0.25 }, runner);
  el("circle", { r: 8, fill: "#E4002B", stroke: "#fff", "stroke-width": 3 }, runner);
  return { markerLayer, runner, mileLayer };
}

// One marker for a row from computeSplits. `timeText` is the short clock or "".
export function drawMarker(layer, route, row, opts) {
  const { selected, passed, timeText } = opts;
  const [x, y] = posAt(route, row.mile);
  const g = el("g", {
    class: "mk mk-" + row.kind + (selected ? " sel" : "") + (passed ? " passed" : ""),
    transform: `translate(${x.toFixed(1)},${y.toFixed(1)})`,
    tabindex: "0", role: "button",
    "aria-label": row.label + (timeText ? ", " + timeText : "")
  }, layer);
  if (row.minor) {
    el("circle", { class: "ring", r: 10, fill: "var(--paper)", stroke: "var(--route)", "stroke-width": 2 }, g);
    const n = el("text", { class: "milenum", y: 4.5, "text-anchor": "middle" }, g);
    n.textContent = row.short;
    if (selected && timeText) {
      const off = LABEL_OFFSET[row.side] || LABEL_OFFSET.r;
      const t = el("text", { class: "maplabel", x: off[0], y: off[1], "text-anchor": off[2] }, g);
      t.textContent = row.label + " " + timeText;
    }
    return g;
  }
  if (row.kind === "spot") {
    el("path", { class: "starp", d: STAR, fill: row.color, stroke: "#fff", "stroke-width": 2.5 }, g);
  } else if (row.kind === "hot") {
    el("path", { class: "ring", d: DIAMOND, fill: "var(--paper)", stroke: "#41B6E6", "stroke-width": 4 }, g);
    el("circle", { r: 3.5, fill: "#0F2340" }, g);
  } else if (row.kind === "finish") {
    el("circle", { class: "ring", r: 13, fill: "#0F2340", stroke: "#fff", "stroke-width": 3 }, g);
  } else {
    el("circle", { class: "ring", r: 11, fill: "#41B6E6", stroke: "#0F2340", "stroke-width": 3.5 }, g);
  }
  const off = LABEL_OFFSET[row.side] || LABEL_OFFSET.r;
  const t = el("text", { class: "maplabel" + (row.kind === "hot" ? " hot" : ""), x: off[0], y: off[1], "text-anchor": off[2] }, g);
  if (row.kind === "spot") t.style.fill = row.color;
  t.textContent = row.short + (timeText ? " " + timeText : "");
  return g;
}

// Convert a pointer event to viewBox coordinates (for tap-to-place).
export function svgPoint(svg, event) {
  const pt = svg.createSVGPoint();
  pt.x = event.clientX; pt.y = event.clientY;
  const m = svg.getScreenCTM();
  if (!m) return null;
  const p = pt.matrixTransform(m.inverse());
  return [p.x, p.y];
}
