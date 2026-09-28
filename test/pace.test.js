import { test } from "node:test";
import assert from "node:assert/strict";
import { R, BOUNDS, SPLITS, SEGMENTS, HOTSPOTS, PALETTE, MI } from "../public/course-data.js";
import {
  projectRoute, posAt, latLonAt, nearestMile, headingAt, sideFor, whereAt, resolveHotspots,
  directionsUrl, fmtClock, fmtElapsed, fmtPacePerKm, computeSplits, finishFor, runnerMileAt,
  colorsFor, normalizeState, encodeShare, decodeShare, assignSides
} from "../public/pace.js";

const route = projectRoute(R, BOUNDS);
const hotspots = resolveHotspots(route, HOTSPOTS);
const ctx = { route, splits: SPLITS, hotspots, segments: SEGMENTS, palette: PALETTE };
const base = normalizeState({ paceSec: 660, wave: 3, delay: 10, spots: [] });

test("clock formatting rounds 59.6 minutes up to the next hour and flips a.m./p.m.", () => {
  assert.equal(fmtClock(7 * 60 + 59.6), "8:00 a.m.");
  assert.equal(fmtClock(12 * 60 + 5, true), "12:05");
  assert.equal(fmtClock(13 * 60 + 23), "1:23 p.m.");
});

test("elapsed formatting is h:mm:ss", () => {
  assert.equal(fmtElapsed(288.43), "4:48:26");
  assert.equal(fmtPacePerKm(660), "6:50");
});

test("computeSplits sorts by mile, puts a spot between Halfway and 25K, finish last", () => {
  const st = normalizeState({ ...base, spots: [{ id: "a1", who: "Mom", mile: 14.0 }] });
  const rows = computeSplits({ ...st, showHot: false }, ctx);
  for (let i = 1; i < rows.length; i++) assert.ok(rows[i].mile >= rows[i - 1].mile, "sorted by mile");
  const idx = k => rows.findIndex(r => r.key === k);
  assert.ok(idx("split:Halfway") < idx("spot:a1") && idx("spot:a1") < idx("split:25K"));
  assert.equal(rows[rows.length - 1].kind, "finish");
  const fin = finishFor(st);
  assert.ok(Math.abs(fin.elapsedMin - 42.195 * 11 / 1.609344) < 1e-9);
  assert.equal(fmtClock(fin.clockMin), "1:33 p.m.");
  assert.equal(fmtElapsed(fin.elapsedMin), "4:48:24");
  // spot row carries where text, a side and a color
  const spot = rows[idx("spot:a1")];
  assert.equal(spot.where, "Adams St., West Loop");
  assert.ok(spot.side === "t" || spot.side === "b", "label above or below a westbound street, got " + spot.side);
  const seg = SEGMENTS; for (let i = 1; i < seg.length; i++) assert.equal(seg[i].from, seg[i - 1].to, "segments are contiguous at " + seg[i].from);
  assert.equal(spot.color, PALETTE[0]);
});

test("posAt hits a waypoint exactly at its own mile and clamps past the finish", () => {
  const i = 40;
  assert.deepEqual(posAt(route, R[i][2]), route.xy[i]);
  assert.deepEqual(posAt(route, 99), route.xy[route.xy.length - 1]);
});

test("nearestMile snaps to the turnaround and surfaces the paired leg on LaSalle/Wells", () => {
  const [x, y] = route.xy[40];
  assert.ok(Math.abs(nearestMile(route, x, y).mile - R[40][2]) < 1e-6);
  const [lx, ly] = posAt(route, 3.4); // on LaSalle St., Wells St. runs a block west
  const n = nearestMile(route, lx + 4, ly);
  assert.ok(n.mile > 3.2 && n.mile < 3.6, "primary on LaSalle: " + n.mile);
  assert.ok(n.alt && n.alt.mile > 11.4 && n.alt.mile < 12.9, "alternate on Wells: " + JSON.stringify(n.alt));
});

test("label side follows the direction of travel", () => {
  assert.equal(sideFor(headingAt(route, 14.0)), "t");
  assert.equal(sideFor(headingAt(route, 16.5)), "b");
  assert.equal(sideFor(headingAt(route, 3.5)), "r");
  assert.equal(sideFor(headingAt(route, 12.5)), "l");
});

test("share link round-trips awkward names and stays short", () => {
  const st = normalizeState({ name: "Adem", paceSec: 660, wave: 3, delay: 10, showHot: false, spots: [
    { who: "Dad & Sis", mile: 3.1, note: "by ~the~ bank" },
    { who: "Mom 🎉", mile: 14 },
    { who: "Work friends", mile: 20.2, note: "18th & Blue Island" }
  ] });
  const hash = encodeShare(st);
  assert.ok(hash.length < 200, "length " + hash.length);
  const back = normalizeState(decodeShare("#" + hash));
  const strip = s => ({ ...s, spots: s.spots.map(({ id, ...rest }) => rest) });
  assert.deepEqual(strip(back), strip(st));
});

test("decodeShare tolerates junk and normalizeState clamps", () => {
  assert.equal(decodeShare(""), null);
  assert.equal(decodeShare("#utm_source=x"), null);
  const st = normalizeState(decodeShare("#v=1&p=660&w=9&d=-4&zzz=1&s=abc&s=40~Far&s=14~Ok"));
  assert.equal(st.wave, 3);
  assert.equal(st.delay, 0);
  assert.equal(st.spots.length, 2);
  assert.equal(st.spots[0].mile, 26.2);
  assert.equal(st.spots[1].who, "Ok");
  assert.equal(whereAt(SEGMENTS, 3.1), "LaSalle St., the Loop / River North");
  assert.match(whereAt(SEGMENTS, 26.2), /Grant Park/);
});

test("latLonAt returns waypoints exactly and interpolates between them", () => {
  assert.deepEqual(latLonAt(route, R[40][2]), [R[40][0], R[40][1]]);
  assert.deepEqual(latLonAt(route, 0), [R[0][0], R[0][1]]);
  const mid = (route.miles[40] + route.miles[41]) / 2;
  const [lat, lon] = latLonAt(route, mid);
  assert.ok(Math.abs(lat - (R[40][0] + R[41][0]) / 2) < 1e-9);
  assert.ok(Math.abs(lon - (R[40][1] + R[41][1]) / 2) < 1e-9);
});

test("directions URLs target Apple Maps on iOS and Google Maps elsewhere, both transit", () => {
  const ios = directionsUrl(41.8528, -87.6321, "ios");
  assert.ok(ios.startsWith("https://maps.apple.com/"));
  assert.ok(ios.includes("41.85280") && ios.includes("-87.63210") && ios.includes("dirflg=r"));
  const g = directionsUrl(41.8528, -87.6321, "other");
  assert.ok(g.startsWith("https://www.google.com/maps/dir/"));
  assert.ok(g.includes("travelmode=transit"));
});

test("every popular zone lands on the drawn route near its expected mile", () => {
  for (const h of hotspots) {
    assert.ok(Math.abs(h.mile - h.expectMile) <= 0.5, `${h.key}: mile ${h.mile} vs ${h.expectMile}`);
    assert.ok(h.routeDist <= 15, `${h.key}: ${h.routeDist}px off the route`);
  }
});

test("colors are per distinct name, case-insensitive", () => {
  const c = colorsFor([{ who: "Mom" }, { who: " mom " }, { who: "Dad" }], PALETTE);
  assert.equal(c.size, 2);
  assert.equal(c.get("mom"), PALETTE[0]);
  assert.equal(c.get("dad"), PALETTE[1]);
});

test("runnerMileAt is null before the start and after the finish", () => {
  const start = 8 * 60 + 45; // wave 3 + 10
  assert.equal(runnerMileAt(base, start - 1), null);
  assert.ok(Math.abs(runnerMileAt(base, start + 11) - 1) < 1e-9);
  assert.equal(runnerMileAt(base, start + 600), null);
});

test("labels at the same mile go to opposite sides", () => {
  const pos = { 1: [0, 0], 2: [10, 0], 3: [30, 0], 4: [500, 0], 5: [520, 0] };
  const rows = assignSides([{ mile: 1, side: "l" }, { mile: 2, side: "l" }, { mile: 3, side: "r" }, { mile: 4, side: "t" }, { mile: 5, side: "t" }], m => pos[m]);
  assert.deepEqual(rows.map(r => r.side), ["l", "r", "r", "t", "b"]);
  const zoneMile = hotspots.find(h => h.key === "chinatown").mile;
  const st = normalizeState({ paceSec: 660, wave: 3, delay: 10, spots: [{ id: "m1", who: "Mom", mile: zoneMile }] });
  const both = computeSplits(st, ctx).filter(r => Math.abs(r.mile - zoneMile) < 0.01);
  assert.equal(both.length, 2);
  assert.notEqual(both[0].side, both[1].side);
});
