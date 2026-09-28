// The page: state, controls, spots editor, list and map rendering, share, offline.
import { R, BOUNDS, SPLITS, SEGMENTS, HOTSPOTS, PALETTE, WAVES, RACE_DATE } from "./course-data.js";
import {
  projectRoute, posAt, resolveHotspots, computeSplits, finishFor, runnerMileAt, isRaceDay, colorsFor, groupKey,
  fmtClock, fmtElapsed, fmtPace, fmtPacePerKm, startLineMinutes, whereAt, directionsUrl, latLonAt,
  normalizeState, normalizeSpot, newId, encodeShare, decodeShare, DEFAULT_STATE, LIMITS
} from "./pace.js";
import { buildMap, drawMarker } from "./map.js";
import { SUPPORT_URL } from "./config.js";

const STORAGE = "paceCard.v2";
const $ = id => document.getElementById(id);
const ua = navigator.userAgent;
const IOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
const APPLE_MAPS = IOS || (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua));

const route = projectRoute(R, BOUNDS);
const hotspots = resolveHotspots(route, HOTSPOTS);
const ctx = { route, splits: SPLITS, hotspots, segments: SEGMENTS, palette: PALETTE };

let state;
let selectedKey = null;
let layers;

// ---------- persistence ----------
function loadStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE) || "null"); } catch { return null; }
}
function save() {
  try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch { /* private mode etc. */ }
}

// ---------- small DOM helpers ----------
function h(tag, attrs, ...children) {
  const e = document.createElement(tag);
  for (const k in attrs || {}) {
    if (k === "class") e.className = attrs[k];
    else if (k === "text") e.textContent = attrs[k];
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), attrs[k]);
    else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  }
  for (const c of children) if (c != null) e.append(c);
  return e;
}
const STAR_D = "M12 1.5l2.6 5.2 5.8-.9-3.2 4.9 3.2 4.9-5.8-.9L12 20l-2.6-5.3-5.8.9 3.2-4.9-3.2-4.9 5.8.9z";
function iconSvg(kind, color) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("aria-hidden", "true");
  const mk = (tag, attrs) => { const e = document.createElementNS("http://www.w3.org/2000/svg", tag); for (const k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; };
  if (kind === "spot") mk("path", { d: STAR_D, fill: color });
  else if (kind === "hot") { mk("path", { d: "M12 2 L22 12 L12 22 L2 12 Z", fill: "var(--paper)", stroke: "#41B6E6", "stroke-width": 3 }); mk("circle", { cx: 12, cy: 12, r: 2.5, fill: "#0F2340" }); }
  else if (kind === "finish") { mk("path", { d: "M7 21V4h11l-3 4 3 4H9", fill: "none", stroke: color || "#fff", "stroke-width": 2.2, "stroke-linejoin": "round", "stroke-linecap": "round" }); }
  else mk("circle", { cx: 12, cy: 12, r: 8, fill: "var(--paper)", stroke: "#41B6E6", "stroke-width": 4 });
  return svg;
}
function directionsLinks(latlon, small) {
  const [lat, lon] = latlon;
  const cls = "btn" + (small ? " small" : "");
  const primary = h("a", { class: cls, href: directionsUrl(lat, lon, APPLE_MAPS ? "ios" : "other"), target: "_blank", rel: "noopener", text: "Directions" });
  const wrap = h("span", { class: "links" }, primary);
  if (APPLE_MAPS) wrap.append(h("a", { class: "btn quiet small", href: directionsUrl(lat, lon, "other"), target: "_blank", rel: "noopener", text: "Google Maps" }));
  return wrap;
}

// ---------- controls ----------
function fillControls() {
  $("name").value = state.name;
  $("pmin").value = Math.floor(state.paceSec / 60);
  $("psec").value = state.paceSec % 60;
  $("wave").value = String(state.wave);
  $("delay").value = state.delay;
  $("showHot").checked = state.showHot;
}
function readControls() {
  const pm = parseFloat($("pmin").value), ps = parseFloat($("psec").value);
  const paceSec = (Number.isFinite(pm) ? pm : 0) * 60 + (Number.isFinite(ps) ? ps : 0);
  state = normalizeState({ ...state, name: $("name").value, paceSec: paceSec || DEFAULT_STATE.paceSec,
    wave: parseInt($("wave").value, 10), delay: $("delay").value, showHot: $("showHot").checked });
  save(); render();
}

// ---------- spots editor ----------
function landmarkOptions() {
  const frag = document.createDocumentFragment();
  frag.append(h("option", { value: "", text: "Custom mile" }));
  const pop = h("optgroup", { label: "Popular spots" });
  for (const hs of hotspots) pop.append(h("option", { value: String(hs.mile), text: hs.name }));
  const along = h("optgroup", { label: "Along the course" });
  for (const s of SEGMENTS) along.append(h("option", { value: String(s.at), text: `Mile ${s.at}: ${s.street}, ${s.hood}` }));
  frag.append(pop, along);
  return frag;
}
function syncLandmark(select, mile) {
  const v = String(mile);
  select.value = [...select.options].some(o => o.value === v) ? v : "";
}
function spotCard(sp) {
  const who = h("input", { type: "text", placeholder: "Who is there? e.g. Mom & Dad", maxlength: LIMITS.whoLen, "aria-label": "Who is there", value: sp.who });
  const remove = h("button", { class: "btn quiet small", type: "button", text: "Remove", "aria-label": "Remove this spot" });
  const landmark = h("select", { "aria-label": "Place along the course" });
  landmark.append(landmarkOptions());
  const mile = h("input", { type: "number", inputmode: "decimal", min: 0, max: LIMITS.maxMile, step: 0.1, "aria-label": "Mile", value: sp.mile });
  const note = h("input", { type: "text", placeholder: "Note, e.g. north side of the street", maxlength: LIMITS.noteLen, "aria-label": "Note", value: sp.note });
  const where = h("span", { class: "where" });
  const links = h("span", { class: "links" });
  const card = h("div", { class: "spot-card", "data-id": sp.id },
    h("div", { class: "full who-row" }, who, remove),
    h("div", { class: "mile-row" }, landmark, mile),
    h("div", { class: "full" }, note),
    h("div", { class: "foot-row" }, where, links));

  const refresh = () => {
    syncLandmark(landmark, sp.mile);
    where.textContent = `Mile ${sp.mile}: ${whereAt(SEGMENTS, sp.mile)}`;
    links.replaceChildren(directionsLinks(latLonAt(route, sp.mile), true));
    card.style.borderLeftColor = colorsFor(state.spots, PALETTE).get(groupKey(sp.who)) || "var(--sky)";
  };
  const commit = () => { Object.assign(sp, normalizeSpot(sp)); save(); refresh(); render(); };

  who.addEventListener("input", () => { sp.who = who.value; commit(); refreshCardColors(); });
  note.addEventListener("input", () => { sp.note = note.value; commit(); });
  landmark.addEventListener("change", () => { if (landmark.value !== "") { sp.mile = parseFloat(landmark.value); mile.value = sp.mile; commit(); } });
  mile.addEventListener("input", () => { const m = parseFloat(mile.value); if (Number.isFinite(m)) { sp.mile = m; commit(); } });
  mile.addEventListener("blur", () => { mile.value = sp.mile; });
  remove.addEventListener("click", () => {
    state.spots = state.spots.filter(s => s.id !== sp.id);
    if (selectedKey === "spot:" + sp.id) selectedKey = null;
    card.remove(); save(); refreshCardColors(); render(); updateEmpty();
  });
  refresh();
  return card;
}
function refreshCardColors() {
  const colors = colorsFor(state.spots, PALETTE);
  for (const card of $("spots").children) {
    const sp = state.spots.find(s => s.id === card.dataset.id);
    if (sp) card.style.borderLeftColor = colors.get(groupKey(sp.who)) || "var(--sky)";
  }
}
function updateEmpty() {
  $("spotsEmpty").style.display = state.spots.length ? "none" : "";
  $("addSpot").disabled = state.spots.length >= LIMITS.maxSpots;
}
function buildSpotsEditor() {
  $("spots").replaceChildren(...state.spots.map(spotCard));
  updateEmpty();
}
function addSpot(preset) {
  if (state.spots.length >= LIMITS.maxSpots) return;
  const last = state.spots[state.spots.length - 1];
  const nextSeg = last ? SEGMENTS.find(s => s.at > last.mile) : SEGMENTS[3];
  const sp = normalizeSpot({ id: newId(), who: preset?.who ?? (last ? last.who : ""), mile: preset?.mile ?? (nextSeg ? nextSeg.at : 0), note: preset?.note ?? "" });
  state.spots.push(sp);
  const card = spotCard(sp);
  $("spots").append(card);
  updateEmpty(); save(); render();
  if (!preset) card.querySelector("input").focus();
  else card.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ---------- rendering ----------
function select(key) { selectedKey = selectedKey === key ? null : key; render(); }

function renderLegend() {
  const legend = $("legend");
  legend.replaceChildren();
  const item = (svg, text) => legend.append(h("span", {}, svg, document.createTextNode(text)));
  item(iconSvg("split"), "5K splits");
  if (state.showHot) item(iconSvg("hot"), "Popular spot");
  for (const [k, color] of colorsFor(state.spots, PALETTE)) {
    const who = state.spots.find(s => groupKey(s.who) === k)?.who.trim() || "Cheer spot";
    item(iconSvg("spot", color), who);
  }
  legend.append(h("span", { text: "Tap a marker or row to see more" }));
}

function render() {
  const ok = state.paceSec > 0;
  const name = state.name.trim();
  const fin = finishFor(state);
  const startLine = startLineMinutes(state.wave, state.delay);
  $("kmPace").textContent = ok ? "That's " + fmtPacePerKm(state.paceSec) + " per km" : "";
  $("bibName").textContent = name || "Your runner";
  $("bibWave").textContent = "Wave " + state.wave;
  $("bibLead").textContent = name ? "Finishes around" : "Add a name and pace";
  $("finishClock").textContent = ok ? fmtClock(fin.clockMin) : "–";
  $("bibMeta").textContent = ok
    ? `${fmtPace(state.paceSec)} per mile. Across the start line at ${fmtClock(startLine)} Race time ${fmtElapsed(fin.elapsedMin)}.`
    : "";

  const now = new Date();
  const raceDay = isRaceDay(now, RACE_DATE);
  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const runnerMile = raceDay ? runnerMileAt(state, nowMin) : null;
  if (runnerMile != null) {
    const [x, y] = posAt(route, runnerMile);
    layers.runner.setAttribute("transform", `translate(${x},${y})`); layers.runner.style.display = "";
  } else layers.runner.style.display = "none";

  const rows = computeSplits(state, ctx);
  layers.markerLayer.replaceChildren();
  const list = $("course"); list.replaceChildren();
  let nextFound = false;
  for (const row of rows) {
    let phase = "";
    if (raceDay && ok) { if (row.clockMin < nowMin) phase = "passed"; else if (!nextFound) { phase = "next"; nextFound = true; } }
    const selected = selectedKey === row.key;

    const g = drawMarker(layers.markerLayer, route, row, { selected, passed: phase === "passed", timeText: ok ? fmtClock(row.clockMin, true) : "" });
    g.addEventListener("click", () => select(row.key));
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(row.key); } });

    const signText = { Halfway: "Half", Start: "Start" }[row.label] || row.label;
    const sign = row.kind === "split" ? h("span", { class: "sign", text: signText }) : h("span", { class: "sign" }, iconSvg(row.kind, "#FFFFFF"));
    const li = h("li", { class: ["row", "k-" + row.kind, phase, selected ? "sel" : ""].filter(Boolean).join(" "), tabindex: "0", "aria-expanded": String(selected) },
      sign,
      h("span", { class: "name", text: row.label }),
      h("span", { class: "time", text: ok ? fmtClock(row.clockMin) : "–" }),
      h("span", { class: "where", text: row.kind === "spot" ? `Mile ${row.mile}, ${row.where}${row.note ? ". " + row.note[0].toUpperCase() + row.note.slice(1) : ""}` : row.where }),
      h("span", { class: "el", text: ok ? fmtElapsed(row.elapsedMin) : "" }));
    if (row.kind === "spot") { li.querySelector(".sign").style.background = row.color; li.querySelector(".time").style.color = row.color; }
    if (selected) {
      const detail = h("div", { class: "detail" });
      if (row.hot) {
        detail.append(h("p", { text: row.hot.blurb }));
        if (row.hot.transit) detail.append(h("p", { class: "transit", text: "Transit: " + row.hot.transit }));
      }
      const actions = h("div", { class: "actions" }, directionsLinks(row.latlon, true));
      if (row.hot) actions.append(h("button", { class: "btn small", type: "button", text: "Add as my spot",
        onclick: e => { e.stopPropagation(); addSpot({ mile: row.mile, note: row.hot.name }); } }));
      detail.append(actions);
      detail.addEventListener("click", e => e.stopPropagation());
      li.append(detail);
    }
    li.addEventListener("click", () => select(row.key));
    li.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target === li) { e.preventDefault(); select(row.key); } });
    list.append(li);
  }
  const sel = layers.markerLayer.querySelector(".sel"); if (sel) layers.markerLayer.appendChild(sel);
  layers.markerLayer.parentNode.appendChild(layers.runner);
  renderLegend();
  renderNext(rows, raceDay && ok, nowMin, startLine, fin);
}

// Race-day line on the bib: where to look next.
function renderNext(rows, live, nowMin, startLine, fin) {
  const el = $("bibNext");
  if (!live) { el.hidden = true; return; }
  let text;
  if (nowMin < startLine) text = "Starts at " + fmtClock(startLine) + ", in " + Math.ceil(startLine - nowMin) + " min.";
  else if (nowMin >= fin.clockMin) text = "Finished around " + fmtClock(fin.clockMin) + ". Go find them at Grant Park.";
  else {
    const next = rows.find(r => r.clockMin >= nowMin);
    const mins = Math.max(1, Math.ceil(next.clockMin - nowMin));
    text = "Up next: " + next.label + ", " + next.where + ". About " + fmtClock(next.clockMin) + ", in " + mins + " min.";
  }
  el.textContent = text; el.hidden = false;
}

// ---------- share ----------
async function share() {
  const url = location.origin + location.pathname + "#" + encodeShare(state);
  const btn = $("share");
  const done = msg => { const old = btn.textContent; btn.textContent = msg; setTimeout(() => { btn.textContent = old; }, 2000); };
  if (navigator.share) {
    try { await navigator.share({ title: "Chicago Marathon pace card", text: state.name ? `Pace card for ${state.name}` : "Pace card", url }); return; }
    catch (e) { if (e && e.name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(url); done("Link copied"); return; } catch { /* fall through */ }
  window.prompt("Copy this link", url);
}

// ---------- offline ----------
function registerSW() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  window.addEventListener("load", () => {
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hadController && !reloaded) { reloaded = true; location.reload(); }
    });
    navigator.serviceWorker.register("/sw.js").catch(() => { /* offline support is a bonus, not a requirement */ });
  });
}

// ---------- boot ----------
// A share link in the hash wins over what this phone remembered. Strip it once applied,
// so later edits are not clobbered on the next reload.
function applyHash() {
  const shared = decodeShare(location.hash);
  if (!shared) return false;
  state = normalizeState(shared); save();
  history.replaceState(null, "", location.pathname + location.search);
  return true;
}

function boot() {
  for (const w of WAVES) $("wave").append(h("option", { value: String(w.n), text: w.label }));
  if (!applyHash()) state = normalizeState(loadStored() || DEFAULT_STATE);
  window.addEventListener("hashchange", () => {
    if (applyHash()) { selectedKey = null; fillControls(); buildSpotsEditor(); render(); }
  });

  const svg = $("map");
  layers = buildMap(svg, route);
  fillControls();
  buildSpotsEditor();
  for (const id of ["name", "pmin", "psec", "wave", "delay"]) $(id).addEventListener("input", readControls);
  $("showHot").addEventListener("change", readControls);
  $("addSpot").addEventListener("click", () => addSpot());
  $("share").addEventListener("click", share);
  const setEditor = open => {
    $("editor").hidden = !open;
    $("editToggle").setAttribute("aria-expanded", String(open));
    $("editToggle").textContent = open ? "Close" : "Edit runner";
    if (open) $("name").focus({ preventScroll: true });
  };
  $("editToggle").addEventListener("click", () => setEditor($("editor").hidden));
  $("editDone").addEventListener("click", () => { setEditor(false); $("editToggle").focus(); });
  setEditor(!state.name);
  if (/^https:\/\//.test(SUPPORT_URL)) { $("supportLink").href = SUPPORT_URL; $("support").hidden = false; }
  render();
  setInterval(render, 60000);
  registerSW();
}
boot();
