// Chicago Marathon course data. Everything Chicago-specific lives here.
// The route is a simplified drawing: waypoints are approximate and miles between
// anchors are interpolated. Good enough to know roughly when and where; not a survey.

export const MI = 1.609344;          // km per mile
export const MAR_MI = 26.2188;       // marathon in miles
export const MAR_KM = 42.195;        // marathon in km
export const RACE_DATE = { year: 2026, month: 10, day: 11 }; // Sunday, October 11, 2026

export const WAVES = [
  { n: 1, start: "7:35", label: "Wave 1, 7:35 a.m." },
  { n: 2, start: "8:00", label: "Wave 2, 8:00 a.m." },
  { n: 3, start: "8:35", label: "Wave 3, 8:35 a.m." }
];

// Course waypoints [lat, lon, anchorMile?]. Anchors pin known mile points.
export const R = [
  [41.8800,-87.6205,0],[41.8917,-87.6205],[41.8917,-87.6293],[41.8781,-87.6294],[41.8781,-87.6323,3.0],
  [41.9000,-87.6323],[41.9110,-87.6330],[41.9150,-87.6335],[41.9215,-87.6342],[41.9255,-87.6355],[41.9260,-87.6325],
  [41.9325,-87.6360],[41.9400,-87.6385],[41.9470,-87.6440],[41.9500,-87.6490,8.4],[41.9375,-87.6440],[41.9325,-87.6445],
  [41.9255,-87.6400],[41.9217,-87.6370],[41.9217,-87.6390],[41.9108,-87.6385],[41.9108,-87.6348],[41.9000,-87.6343],
  [41.8865,-87.6341],[41.8857,-87.6370,13.1],[41.8795,-87.6370],[41.8795,-87.6765],[41.8778,-87.6765,15.3],
  [41.8778,-87.6470,17.4],[41.8695,-87.6470],[41.8695,-87.6605],[41.8577,-87.6605,19.9],[41.8577,-87.6465],[41.8540,-87.6465],
  [41.8540,-87.6420],[41.8527,-87.6390],[41.8527,-87.6320,21.5],[41.8455,-87.6320],[41.8455,-87.6235],[41.8310,-87.6230],
  [41.8310,-87.6215],[41.8385,-87.6215],[41.8385,-87.6232],[41.8675,-87.6245,26.0],[41.8675,-87.6200],[41.8735,-87.6200,MAR_MI]
];

export const BOUNDS = { n: 41.956, s: 41.826, w: -87.684, e: -87.597 };

// Official timing splits. `side` is where the map label goes (l/r/t/b).
export const SPLITS = [
  { label: "Start",   mi: 0.02,      where: "Columbus Dr., Grant Park",        side: "r" },
  { label: "5K",      km: 5,         where: "LaSalle St., the Loop",           side: "l" },
  { label: "10K",     km: 10,        where: "Stockton Dr., Lincoln Park",      side: "r" },
  { label: "15K",     km: 15,        where: "Broadway, Lakeview",              side: "r" },
  { label: "20K",     km: 20,        where: "Wells St., Old Town",             side: "l" },
  { label: "Halfway", km: 21.0975,   where: "Wells St. and Wacker Dr.",        side: "l" },
  { label: "25K",     km: 25,        where: "Jackson Blvd., West Loop",        side: "b" },
  { label: "30K",     km: 30,        where: "Taylor St., Little Italy",        side: "t" },
  { label: "35K",     km: 35,        where: "Wentworth Ave., Chinatown",       side: "b" },
  { label: "40K",     km: 40,        where: "Michigan Ave., Bronzeville",      side: "r" },
  { label: "Finish",  km: MAR_KM,    where: "Grant Park",                      side: "r", finish: true }
];

// Which street and neighbourhood a mile falls in. from inclusive, to exclusive
// (last row includes the finish). `at` is the mile the landmark picker offers.
export const SEGMENTS = [
  { from: 0.0,  to: 1.0,  at: 0.0,  street: "Columbus Dr.",                    hood: "Grant Park (start)" },
  { from: 1.0,  to: 1.6,  at: 1.3,  street: "Grand Ave.",                      hood: "River North" },
  { from: 1.6,  to: 2.8,  at: 2.2,  street: "State St.",                       hood: "River North / the Loop" },
  { from: 2.8,  to: 4.5,  at: 3.1,  street: "Jackson Blvd. and LaSalle St.",   hood: "the Loop" },
  { from: 4.5,  to: 6.5,  at: 5.5,  street: "Stockton Dr.",                    hood: "Lincoln Park" },
  { from: 6.5,  to: 8.4,  at: 7.5,  street: "Sheridan Rd.",                    hood: "Lakeview" },
  { from: 8.4,  to: 10.4, at: 9.3,  street: "Broadway / Clark St.",            hood: "Lakeview (turnaround at 8.4)" },
  { from: 10.4, to: 11.4, at: 11.0, street: "Sedgwick St. / North Ave.",       hood: "Old Town" },
  { from: 11.4, to: 13.1, at: 12.3, street: "Wells St.",                       hood: "Old Town / River North" },
  { from: 13.1, to: 13.5, at: 13.3, street: "Franklin St.",                    hood: "the Loop (halfway at 13.1)" },
  { from: 13.5, to: 15.3, at: 14.0, street: "Adams St.",                       hood: "West Loop" },
  { from: 15.3, to: 17.4, at: 17.0, street: "Jackson Blvd.",                   hood: "West Loop / Greektown" },
  { from: 17.4, to: 18.1, at: 17.8, street: "Halsted St.",                     hood: "UIC" },
  { from: 18.1, to: 18.9, at: 18.5, street: "Taylor St.",                      hood: "Little Italy" },
  { from: 18.9, to: 19.9, at: 19.4, street: "Loomis St.",                      hood: "Pilsen" },
  { from: 19.9, to: 20.6, at: 20.2, street: "18th St.",                        hood: "Pilsen" },
  { from: 20.6, to: 21.5, at: 21.3, street: "Halsted St. / Archer Ave. / Cermak Rd.", hood: "Chinatown" },
  { from: 21.5, to: 22.4, at: 21.8, street: "Wentworth Ave.",                  hood: "Chinatown / Armour Square" },
  { from: 22.4, to: 24.0, at: 23.4, street: "33rd to 35th St. loop",           hood: "Bronzeville / Sox Park" },
  { from: 24.0, to: 26.0, at: 24.8, street: "Michigan Ave.",                   hood: "Bronzeville / South Loop" },
  { from: 26.0, to: 26.3, at: 26.1, street: "Roosevelt Rd. / Columbus Dr.",    hood: "Grant Park (finish)" }
];

// Popular places to watch. `mile` is derived from lat/lon at load so the marker
// sits on the drawn route. `expectMile` is what the tests check that against.
export const HOTSPOTS = [
  { key: "northalsted", name: "Mile 8: Northalsted (Boystown)", short: "Northalsted",
    lat: 41.9434, lon: -87.6448, where: "Broadway near Roscoe St.", side: "l", expectMile: 8.9,
    blurb: "A high-energy stretch with loud music, big crowds and street-side viewing.",
    transit: "Red Line, Belmont or Addison" },
  { key: "cheerzone", name: "Mile 13: Bank of America Cheer Zone", short: "Cheer Zone",
    lat: 41.8845, lon: -87.6370, where: "N. Wacker Dr. at the Bank of America Tower", side: "r", expectMile: 13.2,
    blurb: "Official entertainment and cheer gear, right in front of the Bank of America Tower at the halfway point.",
    transit: "" },
  { key: "charity", name: "Mile 15: Charity Block Party", short: "Charity Party",
    lat: 41.8792, lon: -87.6616, where: "Adams St. and Loomis St.", side: "t", expectMile: 14.6,
    blurb: "A community celebration near Whitney Young High School. Give the charity runners a big boost.",
    transit: "Blue Line, UIC-Halsted" },
  { key: "pilsen", name: "Miles 18 to 20: Pilsen", short: "Pilsen",
    lat: 41.8578, lon: -87.6560, where: "18th St. near Blue Island Ave.", side: "b", expectMile: 20.1,
    blurb: "One of the loudest, most colorful stretches of the whole course.",
    transit: "Pink Line, 18th" },
  { key: "chinatown", name: "Mile 21: Chinatown", short: "Chinatown",
    lat: 41.8528, lon: -87.6321, where: "Cermak Rd. and Wentworth Ave.", side: "l", expectMile: 21.5,
    blurb: "Where runners often hit the wall and need familiar faces most.",
    transit: "Red Line, Cermak-Chinatown" },
  { key: "finishstretch", name: "Mile 26: Michigan Ave. and Roosevelt Rd.", short: "Roosevelt",
    lat: 41.8674, lon: -87.6243, where: "Michigan Ave. and Roosevelt Rd.", side: "l", expectMile: 26.0,
    blurb: "The closest free official viewing area to the finish. Huge crowds and final-stretch energy.",
    transit: "" }
];

// One color per distinct cheer group name, in order of first appearance.
export const PALETTE = ["#E4002B", "#1B8A5A", "#E07B00", "#6A3FB5", "#0077B6", "#B5179E"];

// Background geography for the map drawing.
export const MAP = {
  parks: [
    [[41.956,-87.6415],[41.945,-87.6395],[41.932,-87.6345],[41.924,-87.6365],[41.912,-87.6325],[41.912,-87.6245],[41.926,-87.627],[41.940,-87.6305],[41.956,-87.636]],
    [[41.8845,-87.6245],[41.8845,-87.6150],[41.8665,-87.6140],[41.8665,-87.6245]]
  ],
  shore: [[41.956,-87.636],[41.940,-87.6305],[41.926,-87.627],[41.912,-87.6245],[41.902,-87.6230],[41.8935,-87.6150],[41.8925,-87.5995],[41.8905,-87.5995],[41.8895,-87.6120],[41.8820,-87.6145],[41.8720,-87.6135],[41.8660,-87.6100],[41.8600,-87.6080],[41.8500,-87.6110],[41.8380,-87.6060],[41.826,-87.6010]],
  rivers: [
    [[41.8888,-87.6135],[41.8872,-87.6280],[41.8868,-87.6375],[41.8920,-87.6405],[41.8990,-87.6440],[41.9090,-87.6505],[41.9200,-87.6560]],
    [[41.8868,-87.6375],[41.8760,-87.6378],[41.8660,-87.6365],[41.8570,-87.6385],[41.8500,-87.6455],[41.8460,-87.6560],[41.8440,-87.6700]]
  ],
  labels: [
    ["Lake Michigan", 41.915, -87.6125, "lake"], ["Lakeview", 41.9445, -87.6560, "hood"], ["Lincoln Park", 41.9235, -87.6560, "hood"],
    ["Old Town", 41.9075, -87.6530, "hood"], ["The Loop", 41.8745, -87.6300, "hood"], ["West Loop", 41.8840, -87.6620, "hood"],
    ["Little Italy", 41.8650, -87.6680, "hood"], ["Pilsen", 41.8530, -87.6700, "hood"], ["Chinatown", 41.8490, -87.6425, "hood"],
    ["Bronzeville", 41.8330, -87.6120, "hood"], ["Grant Park", 41.8760, -87.6190, "hood"]
  ]
};
