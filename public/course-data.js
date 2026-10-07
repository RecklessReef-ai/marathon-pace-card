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

// Course waypoints [lat, lon, mile]. From the official 2025 course GPS track, lightly
// simplified; miles are the track distance scaled so the finish lands on 26.2188.
// One correction for 2026: the southbound Loop leg between Grand Ave. and Jackson Blvd.
// (R[8]..R[13]) moved from State St. to Dearborn St., per the official 2026 Bank of America
// Chicago Marathon course map (PDF dated August 18 2026, chicagomarathon.com).
// Those points sit on the OpenStreetMap centreline of Dearborn; their miles were
// recomputed along the new path so R[14] onward is untouched.
export const R = [
  [41.8809,-87.62068,0.0],[41.88176,-87.62061,0.058],[41.88189,-87.62052,0.068],[41.88206,-87.6205,0.08],
  [41.88772,-87.62059,0.465],[41.89,-87.62024,0.622],[41.891,-87.62019,0.69],[41.89178,-87.62023,0.743],
  [41.89164,-87.62964,1.22],[41.88943,-87.62958,1.371],[41.88912,-87.62968,1.393],[41.88693,-87.62953,1.542],
  [41.88332,-87.62952,1.788],[41.87818,-87.62929,2.138],[41.87816,-87.63226,2.289],[41.89563,-87.63263,3.479],
  [41.90632,-87.63299,4.207],[41.91276,-87.6331,4.646],[41.91317,-87.63248,4.688],[41.9133,-87.6318,4.724],
  [41.9141,-87.63175,4.778],[41.91452,-87.63209,4.812],[41.915,-87.63262,4.854],[41.91563,-87.6329,4.899],
  [41.91673,-87.6339,4.99],[41.91727,-87.63416,5.029],[41.91882,-87.63451,5.136],[41.91911,-87.63467,5.157],
  [41.91976,-87.63527,5.211],[41.9202,-87.63555,5.244],[41.92494,-87.63577,5.567],[41.92562,-87.636,5.615],
  [41.92568,-87.63434,5.699],[41.92576,-87.63357,5.739],[41.92752,-87.6346,5.869],[41.93116,-87.63698,6.145],
  [41.93211,-87.63839,6.242],[41.93298,-87.63921,6.314],[41.94175,-87.63972,6.912],[41.95091,-87.64474,7.586],
  [41.95192,-87.645,7.655],[41.95262,-87.64508,7.703],[41.95292,-87.64568,7.74],[41.95276,-87.64955,7.936],
  [41.95129,-87.64957,8.036],[41.94777,-87.64751,8.298],[41.94277,-87.64443,8.672],[41.9344,-87.64422,9.243],
  [41.93347,-87.6447,9.31],[41.93274,-87.64489,9.361],[41.932,-87.6447,9.412],[41.93011,-87.64356,9.553],
  [41.92959,-87.64279,9.606],[41.92555,-87.64045,9.905],[41.92199,-87.63822,10.173],[41.92195,-87.63893,10.209],
  [41.91103,-87.63856,10.954],[41.91109,-87.63472,11.148],[41.8908,-87.63401,12.531],[41.8869,-87.63399,12.797],
  [41.88688,-87.63534,12.865],[41.88619,-87.63667,12.947],[41.88573,-87.63701,12.983],[41.88282,-87.63701,13.181],
  [41.87939,-87.63692,13.415],[41.87934,-87.63737,13.438],[41.8793,-87.64321,13.734],[41.87874,-87.67657,15.426],
  [41.87746,-87.67654,15.513],[41.87769,-87.66462,16.118],[41.87785,-87.6522,16.748],[41.87796,-87.64726,16.998],
  [41.87438,-87.6471,17.243],[41.86966,-87.647,17.564],[41.86934,-87.66163,18.306],[41.85789,-87.66133,19.086],
  [41.85806,-87.64663,19.831],[41.85395,-87.64656,20.111],[41.85393,-87.64815,20.192],[41.85267,-87.65111,20.365],
  [41.85259,-87.65096,20.374],[41.85282,-87.63728,21.068],[41.85291,-87.63595,21.136],[41.8529,-87.63483,21.192],
  [41.8528,-87.63361,21.255],[41.8528,-87.63198,21.338],[41.84833,-87.63193,21.642],[41.8476,-87.63218,21.693],
  [41.84714,-87.63218,21.725],[41.84637,-87.63209,21.777],[41.84569,-87.63192,21.825],[41.84553,-87.63175,21.839],
  [41.84566,-87.62368,22.248],[41.83104,-87.62328,23.244],[41.83107,-87.62174,23.322],[41.83833,-87.62194,23.817],
  [41.83832,-87.62323,23.882],[41.84099,-87.62334,24.064],[41.84598,-87.62338,24.404],[41.84757,-87.62363,24.514],
  [41.86741,-87.62413,25.865],[41.86748,-87.6204,26.054],[41.86989,-87.62051,26.2188]
];

export const BOUNDS = { n: 41.958, s: 41.824, w: -87.692, e: -87.594 };

// Official timing splits. Map labels pick a side from the direction of travel unless `side` is set.
export const SPLITS = [
  { label: "Start",   mi: 0.02,      where: "Columbus Dr., Grant Park",        side: "r" },
  { label: "5K",      km: 5,         where: "LaSalle St., the Loop" },
  { label: "10K",     km: 10,        where: "Stockton Dr., Lincoln Park" },
  { label: "15K",     km: 15,        where: "Broadway, Lakeview" },
  { label: "20K",     km: 20,        where: "Wells St., Old Town" },
  { label: "Halfway", km: 21.0975,   where: "Wells St. and Wacker Dr." },
  { label: "25K",     km: 25,        where: "Jackson Blvd., West Loop" },
  { label: "30K",     km: 30,        where: "Taylor St., Little Italy" },
  { label: "35K",     km: 35,        where: "Wentworth Ave., Chinatown" },
  { label: "40K",     km: 40,        where: "Michigan Ave., Bronzeville" },
  { label: "Finish",  km: MAR_KM,    where: "Grant Park",                      side: "r", finish: true }
];

// Which street and neighbourhood a mile falls in. from inclusive, to exclusive
// (last row includes the finish). `at` is the mile the landmark picker offers.
export const SEGMENTS = [
  { from: 0.0,  to: 0.74, at: 0.3,  street: "Columbus Dr.",                     hood: "Grant Park (start)" },
  { from: 0.74, to: 1.22, at: 0.9,  street: "Grand Ave.",                       hood: "Streeterville / River North" },
  { from: 1.22, to: 2.14, at: 1.6,  street: "Dearborn St.",                     hood: "River North / the Loop" },
  { from: 2.14, to: 2.29, at: 2.2,  street: "Jackson Blvd.",                    hood: "the Loop" },
  { from: 2.29, to: 3.6,  at: 3.0,  street: "LaSalle St.",                      hood: "the Loop / River North" },
  { from: 3.6,  to: 4.72, at: 4.2,  street: "LaSalle Dr.",                      hood: "Old Town / Lincoln Park" },
  { from: 4.72, to: 5.7,  at: 5.2,  street: "Stockton Dr.",                     hood: "Lincoln Park" },
  { from: 5.7,  to: 7.94, at: 7.0,  street: "Cannon Dr. / Sheridan Rd.",        hood: "Lakeview East" },
  { from: 7.94, to: 9.1,  at: 8.6,  street: "Broadway",                         hood: "Northalsted / Lakeview" },
  { from: 9.1,  to: 10.2, at: 9.6,  street: "Clark St.",                        hood: "Lincoln Park" },
  { from: 10.2, to: 10.95, at: 10.6, street: "Sedgwick St.",                    hood: "Lincoln Park / Old Town" },
  { from: 10.95, to: 11.15, at: 11.0, street: "North Ave.",                     hood: "Old Town" },
  { from: 11.15, to: 12.8, at: 12.0, street: "Wells St.",                       hood: "Old Town / River North" },
  { from: 12.8, to: 13.41, at: 13.1, street: "Wacker Dr. / Franklin St.",       hood: "the Loop (halfway at 13.1)" },
  { from: 13.41, to: 15.47, at: 14.0, street: "Adams St.",                      hood: "West Loop" },
  { from: 15.47, to: 17.0, at: 16.3, street: "Jackson Blvd.",                   hood: "West Loop / Greektown" },
  { from: 17.0, to: 18.31, at: 17.7, street: "Halsted St.",                     hood: "UIC / University Village" },
  { from: 18.31, to: 19.05, at: 18.6, street: "Taylor St.",                     hood: "Little Italy" },
  { from: 19.05, to: 19.83, at: 19.4, street: "Loomis St.",                     hood: "Pilsen" },
  { from: 19.83, to: 20.11, at: 20.0, street: "18th St.",                       hood: "Pilsen" },
  { from: 20.11, to: 21.14, at: 20.7, street: "Halsted St. / Canalport Ave.",   hood: "Pilsen / Chinatown" },
  { from: 21.14, to: 21.34, at: 21.2, street: "Cermak Rd.",                     hood: "Chinatown" },
  { from: 21.34, to: 21.84, at: 21.6, street: "Wentworth Ave.",                 hood: "Chinatown / Armour Square" },
  { from: 21.84, to: 22.25, at: 22.0, street: "26th St.",                       hood: "Armour Square / Bronzeville" },
  { from: 22.25, to: 23.24, at: 22.8, street: "Michigan Ave. (southbound)",     hood: "Bronzeville" },
  { from: 23.24, to: 23.32, at: 23.3, street: "35th St.",                       hood: "Bronzeville" },
  { from: 23.32, to: 23.85, at: 23.6, street: "Indiana Ave.",                   hood: "Bronzeville" },
  { from: 23.85, to: 25.85, at: 24.8, street: "Michigan Ave. (northbound)",     hood: "Bronzeville / South Loop" },
  { from: 25.85, to: 26.05, at: 25.9, street: "Roosevelt Rd.",                  hood: "South Loop / Museum Campus" },
  { from: 26.05, to: 26.3,  at: 26.15, street: "Columbus Dr.",                  hood: "Grant Park (finish)" }
];

// Popular places to watch. `mile` is derived from lat/lon at load so the marker
// sits on the drawn route. `expectMile` is what the tests check that against.
export const HOTSPOTS = [
  { key: "northalsted", name: "Mile 8: Northalsted", short: "Northalsted",
    lat: 41.9434, lon: -87.6448, where: "Broadway near Roscoe St.", side: "l", expectMile: 8.6,
    blurb: "A high-energy stretch with loud music, big crowds and street-side viewing.",
    transit: "Red Line, Belmont or Addison" },
  { key: "cheerzone", name: "Mile 13: Bank of America Cheer Zone", short: "Cheer Zone",
    lat: 41.8845, lon: -87.6370, where: "N. Wacker Dr. at the Bank of America Tower", side: "r", expectMile: 13.1,
    blurb: "Official entertainment and cheer gear, right in front of the Bank of America Tower at the halfway point.",
    transit: "" },
  { key: "charity", name: "Mile 15: Charity Block Party", short: "Charity Party",
    lat: 41.8792, lon: -87.6616, where: "Adams St. and Loomis St.", side: "t", expectMile: 14.7,
    blurb: "A community celebration near Whitney Young High School. Give the charity runners a big boost.",
    transit: "Blue Line, UIC-Halsted" },
  { key: "pilsen", name: "Miles 18 to 20: Pilsen", short: "Pilsen",
    lat: 41.8578, lon: -87.6560, where: "18th St. near Blue Island Ave.", side: "b", expectMile: 19.4,
    blurb: "One of the loudest, most colorful stretches of the whole course.",
    transit: "Pink Line, 18th" },
  { key: "chinatown", name: "Mile 21: Chinatown", short: "Chinatown",
    lat: 41.8528, lon: -87.6321, where: "Cermak Rd. and Wentworth Ave.", side: "l", expectMile: 21.3,
    blurb: "Where runners often hit the wall and need familiar faces most.",
    transit: "Red Line, Cermak-Chinatown" },
  { key: "finishstretch", name: "Mile 26: Michigan Ave. and Roosevelt Rd.", short: "Roosevelt",
    lat: 41.8674, lon: -87.6243, where: "Michigan Ave. and Roosevelt Rd.", side: "l", expectMile: 25.9,
    blurb: "The closest free official viewing area to the finish. Huge crowds and final-stretch energy.",
    transit: "" }
];

// One color per distinct cheer group name, in order of first appearance.
export const PALETTE = ["#E4002B", "#1B8A5A", "#E07B00", "#6A3FB5", "#0077B6", "#B5179E"];

// Neighbourhood labels for the map (lake, river and parks come from map-data.js).
export const MAP = {
  labels: [
    ["Lake Michigan", 41.905, -87.6085, "lake"],
    ["Wrigleyville", 41.9495, -87.661, "hood"], ["Northalsted", 41.9375, -87.6575, "hood"],
    ["Lincoln Park", 41.9235, -87.6545, "hood"], ["Old Town", 41.907, -87.645, "hood"], ["River North", 41.8975, -87.6455, "hood"],
    ["Streeterville", 41.892, -87.6165, "hood"], ["The Loop", 41.8755, -87.6275, "hood"], ["West Loop", 41.884, -87.660, "hood"],
    ["Greektown", 41.8745, -87.652, "hood"], ["Little Italy", 41.8725, -87.664, "hood"], ["University Village", 41.8645, -87.652, "hood"],
    ["Pilsen", 41.8512, -87.6665, "hood"], ["Chinatown", 41.8445, -87.6425, "hood"], ["Bridgeport", 41.839, -87.648, "hood"],
    ["Bronzeville", 41.836, -87.6125, "hood"], ["South Loop", 41.862, -87.631, "hood"], ["Grant Park", 41.8765, -87.6175, "hood"]
  ]
};
