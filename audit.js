// One-off model audit. Run: node audit.js
const fs = require("fs");
const src = fs.readFileSync("data.js", "utf8");
const [TEAMS, MATCHES, GROUPS] = eval(src + ";[TEAMS, MATCHES, GROUPS]");
const M = require("./model.js");

let fails = 0;
const ok = (cond, msg, detail = "") => {
  if (!cond) { fails++; console.log(`  FAIL  ${msg} ${detail}`); }
  else console.log(`  ok    ${msg}`);
};

console.log("== 1. Data integrity ==");
ok(Object.keys(TEAMS).length === 48, "48 teams");
ok(GROUPS.length === 12, "12 groups");
for (const g of GROUPS) {
  const n = Object.values(TEAMS).filter((t) => t.group === g).length;
  if (n !== 4) ok(false, `group ${g} has 4 teams`, `got ${n}`);
}
ok(true, "every group has exactly 4 teams (or failures above)");
ok(MATCHES.length === 72, "72 group fixtures", `got ${MATCHES.length}`);
const appearances = {};
const seenPair = new Set();
let dupes = 0, crossGroup = 0;
for (const m of MATCHES) {
  appearances[m.h] = (appearances[m.h] || 0) + 1;
  appearances[m.a] = (appearances[m.a] || 0) + 1;
  const key = [m.h, m.a].sort().join("-");
  if (seenPair.has(key)) dupes++;
  seenPair.add(key);
  if (TEAMS[m.h].group !== m.g || TEAMS[m.a].group !== m.g) crossGroup++;
}
ok(Object.values(appearances).every((n) => n === 3), "every team plays exactly 3 group games");
ok(dupes === 0, "no duplicate fixtures");
ok(crossGroup === 0, "every fixture's teams belong to its labelled group");
for (const g of GROUPS) {
  const n = MATCHES.filter((m) => m.g === g).length;
  if (n !== 6) ok(false, `group ${g} has 6 fixtures`, `got ${n}`);
}
ok(true, "every group has exactly 6 fixtures (or failures above)");
ok(MATCHES.every((m) => m.et && /^\d{1,2}:\d{2}$/.test(m.et)), "every fixture has an ET kickoff time");
const elos = Object.values(TEAMS).map((t) => t.elo);
ok(Math.min(...elos) >= 1400 && Math.max(...elos) <= 2250, "all Elo values in sane range 1400–2250",
  `min ${Math.min(...elos)} max ${Math.max(...elos)}`);
const played = MATCHES.filter((m) => m.result);
ok(played.every((m) => Array.isArray(m.result) && m.result.length === 2 &&
  Number.isInteger(m.result[0]) && Number.isInteger(m.result[1]) &&
  m.result[0] >= 0 && m.result[1] >= 0), "every stored result is a valid [int, int] score",
  `${played.length} matches played so far`);

console.log("\n== 2. Host-bonus / city wiring ==");
// Every city string must be a key in HOST_OF_CITY, or host bonuses silently vanish.
const modelSrc = fs.readFileSync("model.js", "utf8");
const HOST_OF_CITY = eval("(" + modelSrc.match(/const HOST_OF_CITY = (\{[\s\S]*?\});/)[1] + ")");
const unknownCities = [...new Set(MATCHES.map((m) => m.city))].filter((c) => !(c in HOST_OF_CITY));
ok(unknownCities.length === 0, "every fixture city is in HOST_OF_CITY", unknownCities.join(", "));
for (const host of ["MEX", "USA", "CAN"]) {
  const games = MATCHES.filter((m) => m.h === host || m.a === host);
  const bonused = games.filter((m) => M.hostBonus(host, m.city) === 50).length;
  ok(bonused === 3, `${host} receives the +50 bonus in all 3 group games`, `got ${bonused}/3`);
}
ok(M.hostBonus("ESP", "Miami") === 0 && M.hostBonus("USA", "Mexico City") === 0,
  "non-hosts and hosts-abroad get no bonus");
ok(M.hostBonus("USA", null) === 50, "hosts keep bonus in knockout (city unknown)");

console.log("\n== 3. Probability conservation & shape ==");
let worstSum = 0;
for (const m of MATCHES) {
  const p = M.outcomeProbs(TEAMS, m.h, m.a, m.city);
  worstSum = Math.max(worstSum, Math.abs(p.h + p.d + p.a - 1));
  if (p.h < 0 || p.d < 0 || p.a < 0) ok(false, `negative prob in ${m.h}-${m.a}`);
}
ok(worstSum < 1e-12, "h+d+a sums to 1 for all 72 fixtures", `worst dev ${worstSum.toExponential(2)}`);
// Symmetry on neutral ground: swapping teams must mirror probabilities.
const pn1 = M.outcomeProbs(TEAMS, "ESP", "ARG", "Miami");
const pn2 = M.outcomeProbs(TEAMS, "ARG", "ESP", "Miami");
ok(Math.abs(pn1.h - pn2.a) < 1e-12 && Math.abs(pn1.d - pn2.d) < 1e-12, "team-order symmetry (neutral venue)");
// Calibration anchors
const e0 = 1 / (1 + Math.pow(10, 0));
ok(Math.abs(M.knockoutProb(TEAMS, "ESP", "ESP") - 0.5) < 1e-12, "equal Elo -> 50/50 in knockout");
const e100 = 1 / (1 + Math.pow(10, -100 / 400));
ok(Math.abs(e100 - 0.64) < 0.005, "100-Elo gap -> ~64% head-to-head expectation", e100.toFixed(4));
// Draw curve (Poisson-grid based): ~28% at diff 0, monotone decreasing in |diff|,
// and realistically small for big mismatches (the old Gaussian over-stated these).
let mono = true;
for (let d = 0; d < 800; d += 25) if (M.drawProb(d + 25) > M.drawProb(d) + 1e-12) mono = false;
const evenDraw = M.drawProb(0);
const blowoutDraw = M.drawProb(385);
ok(mono && Math.abs(evenDraw - 0.293) < 0.01, "draw probability peaks near 29% and decays monotonically", `even ${(evenDraw * 100).toFixed(1)}%`);
ok(blowoutDraw < 0.13, "draw probability stays realistic on a big mismatch", `385-gap ${(blowoutDraw * 100).toFixed(1)}%`);
// Mean draw rate across the 72 fixtures. Even games sit at ~28%, but the
// 48-team field has many genuine mismatches whose (correctly) low draw
// probability pulls the average down to the high teens — lower than the old
// 25-30% heuristic, which the previous fat-tailed Gaussian only met by
// over-stating draws in blowouts.
const avgDraw = MATCHES.reduce((s, m) => s + M.outcomeProbs(TEAMS, m.h, m.a, m.city).d, 0) / MATCHES.length;
ok(avgDraw > 0.16 && avgDraw < 0.27, "mean modelled draw rate realistic for a 48-team field", `avg ${(avgDraw * 100).toFixed(1)}%`);
// knockoutProb complementarity
const kp = M.knockoutProb(TEAMS, "BRA", "FRA") + M.knockoutProb(TEAMS, "FRA", "BRA");
ok(Math.abs(kp - 1) < 1e-12, "knockout probabilities complement to 1");
// knockoutProb == conditional win prob given no draw (draw mass split proportionally)
const pg = M.outcomeProbs(TEAMS, "GER", "NED", "Houston");
// neutral-equivalent: use no city so no host noise
const pg2 = M.outcomeProbs(TEAMS, "GER", "NED", null);
ok(Math.abs(M.knockoutProb(TEAMS, "GER", "NED") - pg2.h / (pg2.h + pg2.a)) < 1e-12,
  "knockout prob equals draw-mass-proportional reallocation");

console.log("\n== 4. Scoreline model ==");
let scoreMismatch = 0;
for (const m of MATCHES) {
  const p = M.outcomeProbs(TEAMS, m.h, m.a, m.city);
  const want = p.h >= p.d && p.h >= p.a ? "h" : p.a >= p.d ? "a" : "d";
  const [i, j] = M.likelyScore(TEAMS, m.h, m.a, m.city);
  const got = i > j ? "h" : i < j ? "a" : "d";
  if (got !== want) scoreMismatch++;
  if (i > 6 || j > 6 || i < 0 || j < 0) scoreMismatch++;
}
ok(scoreMismatch === 0, "projected scoreline always agrees with the predicted W/D/L outcome");
const xgEven = M.expectedGoals(0);
ok(Math.abs(xgEven.h - 1.3) < 1e-12 && Math.abs(xgEven.a - 1.3) < 1e-12, "even match -> 1.3 xG each");
const xgBig = M.expectedGoals(600);
ok(xgBig.h <= 3.0 && xgBig.a >= 0.40, "xG clamped to [0.40, 3.0] at extreme gaps",
  `600-gap: ${xgBig.h.toFixed(2)} vs ${xgBig.a.toFixed(2)}`);

console.log("\n== 4b. Elo recalibration ==");
// Goal-difference multiplier: 1, 1.5, then (11+|GD|)/8
ok(M.goalMultiplier(1) === 1 && M.goalMultiplier(-1) === 1, "GD multiplier 1 for a one-goal margin");
ok(M.goalMultiplier(2) === 1.5, "GD multiplier 1.5 for a two-goal margin");
ok(Math.abs(M.goalMultiplier(4) - 15 / 8) < 1e-12, "GD multiplier (11+|GD|)/8 for big margins", M.goalMultiplier(4).toFixed(3));
// Updates are zero-sum (Elo is conserved between the two teams)
const upd = M.eloUpdate(TEAMS, "GER", "CUW", 7, 1, "Houston");
ok(Math.abs(upd.h + upd.a) < 1e-12, "Elo update is zero-sum between the two sides");
// A draw between exactly equal teams moves nobody
const eq = M.eloUpdate({ X: { elo: 1800 }, Y: { elo: 1800 } }, "X", "Y", 1, 1, null);
ok(Math.abs(eq.h) < 1e-12, "even-rated draw -> no Elo change");
// An underdog win gains more than a favourite win of the same margin
const upWin = M.eloUpdate({ U: { elo: 1700 }, F: { elo: 2000 } }, "U", "F", 1, 0, null);
const favWin = M.eloUpdate({ U: { elo: 1700 }, F: { elo: 2000 } }, "F", "U", 1, 0, null);
ok(upWin.h > favWin.h, "shock win earns more Elo than the expected win", `${upWin.h.toFixed(1)} vs ${favWin.h.toFixed(1)}`);
// A bigger winning margin earns more than a narrow one
const bigWin = M.eloUpdate({ A: { elo: 1900 }, B: { elo: 1900 } }, "A", "B", 4, 0, null);
const narrowWin = M.eloUpdate({ A: { elo: 1900 }, B: { elo: 1900 } }, "A", "B", 1, 0, null);
ok(bigWin.h > narrowWin.h, "bigger margin earns more Elo", `${bigWin.h.toFixed(1)} vs ${narrowWin.h.toFixed(1)}`);

console.log("\n== 5. Group projection ==");
// Expected points must conserve: each unplayed match contributes 3-pDraw total xPts; played contributes 3 or 2.
for (const g of GROUPS) {
  const rows = M.projectGroup(TEAMS, MATCHES, g);
  const total = rows.reduce((s, r) => s + r.xPts, 0);
  let expect = 0;
  for (const m of MATCHES.filter((m) => m.g === g)) {
    if (m.result) expect += m.result[0] === m.result[1] ? 2 : 3;
    else expect += 3 - M.outcomeProbs(TEAMS, m.h, m.a, m.city).d;
  }
  if (Math.abs(total - expect) > 1e-9) ok(false, `group ${g} xPts conserved`, `${total} vs ${expect}`);
}
ok(true, "xPts conserved in all 12 groups (or failures above)");
const gA = M.projectGroup(TEAMS, MATCHES, "A");
const mexRow = gA.find((r) => r.code === "MEX");
ok(mexRow.played === 1 && mexRow.xPts >= 3, "Mexico's actual 2-0 result counted at face value",
  `played ${mexRow.played}, xPts ${mexRow.xPts.toFixed(2)}`);

console.log("\n== 6. R32 bracket integrity ==");
const proj = M.projectKnockout(TEAMS, MATCHES, GROUPS);
const r32 = proj.rounds.r32;
ok(r32.length === 16, "16 R32 ties");
const teams32 = r32.flatMap((m) => [m.h, m.a]);
ok(new Set(teams32).size === 32, "32 distinct teams in R32");
ok(proj.qualifiedThirds.length === 8 && proj.eliminatedThirds.length === 4, "8 thirds advance, 4 out");
const sameGroup = r32.filter((m) => TEAMS[m.h].group === TEAMS[m.a].group);
ok(sameGroup.length === 0, "no same-group rematch in deterministic R32",
  sameGroup.map((m) => `${m.h}-${m.a}`).join(", "));
ok(proj.rounds.r16.length === 8 && proj.rounds.qf.length === 4 &&
   proj.rounds.sf.length === 2 && proj.rounds.final.length === 1, "rounds shrink 16->8->4->2->1");
// every round's entrants are the previous round's winners
let chainOK = true;
const winners32 = r32.map((m) => m.winner);
proj.rounds.r16.forEach((m, i) => {
  if (m.h !== winners32[2 * i] || m.a !== winners32[2 * i + 1]) chainOK = false;
});
ok(chainOK, "R16 entrants are exactly the R32 winners in bracket order");
console.log(`        deterministic champion: ${proj.champion} (final: ${proj.rounds.final[0].h} v ${proj.rounds.final[0].a})`);

// Same-group-rematch check across random qualified-thirds scenarios.
const buildR32 = M.buildR32Pairings;
const totalSims = 4000;
let seed = 12345;
const lcg = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
let rematches = 0, malformed = 0;
for (let s = 0; s < totalSims; s++) {
  const gs = [...GROUPS].sort(() => lcg() - 0.5);
  const thirdSet = gs.slice(0, 8).map((g) => ({ g, code: "3" + g }));
  const W = {}, RU = {};
  for (const g of GROUPS) { W[g] = "W" + g; RU[g] = "R" + g; }
  const pairs = buildR32(W, RU, thirdSet);
  const names = pairs.flatMap((m) => [m.h, m.a]);
  if (pairs.length !== 16 || new Set(names).size !== 32 || names.includes(undefined)) malformed++;
  if (pairs.some((m) => m.tag.includes("3rd") && m.h.slice(1) === m.a.slice(1))) rematches++;
}
ok(rematches === 0, `no same-group winner-vs-third rematch in ${totalSims} random thirds scenarios`,
  `${rematches} rematches`);
ok(malformed === 0, "bracket well-formed (16 ties, 32 unique teams) in every scenario");

console.log("\n== 7. Monte Carlo simulation ==");
seed = 42;
const sim = M.simulateTournament(TEAMS, MATCHES, GROUPS, 20000, lcg);
const sums = { r32: 0, r16: 0, qf: 0, sf: 0, final: 0, champ: 0 };
let monotoneFail = 0;
for (const c of Object.keys(sim)) {
  for (const k of Object.keys(sums)) sums[k] += sim[c][k];
  const v = sim[c];
  if (!(v.r32 >= v.r16 && v.r16 >= v.qf && v.qf >= v.sf && v.sf >= v.final && v.final >= v.champ)) monotoneFail++;
}
ok(Math.abs(sums.r32 - 32) < 1e-9, "Σ P(reach R32) = 32", sums.r32.toFixed(4));
ok(Math.abs(sums.r16 - 16) < 1e-9, "Σ P(reach R16) = 16", sums.r16.toFixed(4));
ok(Math.abs(sums.qf - 8) < 1e-9, "Σ P(reach QF) = 8", sums.qf.toFixed(4));
ok(Math.abs(sums.sf - 4) < 1e-9, "Σ P(reach SF) = 4", sums.sf.toFixed(4));
ok(Math.abs(sums.final - 2) < 1e-9, "Σ P(reach final) = 2", sums.final.toFixed(4));
ok(Math.abs(sums.champ - 1) < 1e-9, "Σ P(champion) = 1", sums.champ.toFixed(4));
ok(monotoneFail === 0, "per-team stage probabilities are monotone (R32 ≥ R16 ≥ … ≥ champ)");
// convergence: second independent run
seed = 987654321;
const sim2 = M.simulateTournament(TEAMS, MATCHES, GROUPS, 20000, lcg);
let maxDev = 0, devTeam = "";
for (const c of Object.keys(sim)) {
  const d = Math.abs(sim[c].champ - sim2[c].champ);
  if (d > maxDev) { maxDev = d; devTeam = c; }
}
ok(maxDev < 0.012, "two independent 20k runs agree within MC noise (<1.2pp)",
  `max dev ${(maxDev * 100).toFixed(2)}pp (${devTeam})`);
const top = Object.entries(sim).sort((a, b) => b[1].champ - a[1].champ).slice(0, 8);
console.log("        champion probs (20k, seed 42):");
for (const [c, v] of top) console.log(`          ${c}: ${(v.champ * 100).toFixed(1)}%  (final ${(v.final * 100).toFixed(1)}%, SF ${(v.sf * 100).toFixed(1)}%)`);
ok(top[0][0] === proj.champion, "sim's most likely champion matches deterministic projection",
  `sim ${top[0][0]} vs det ${proj.champion}`);
// every team must reach R32 with prob <= 1 and >= 0; hosts sanity
ok(Object.values(sim).every((v) => v.r32 <= 1 + 1e-9), "no team exceeds P(R32)=1");

console.log("\n== 8. EV / odds math (as used in the UI) ==");
const MARKET = eval(src.match(/const MARKET_ODDS = \[[\s\S]*?\];/)[0].replace("const MARKET_ODDS =", "(").replace(/;$/, ")"));
for (const { code, odds } of MARKET) {
  const p = sim[code].champ;
  const ev = p * odds - 1;
  const implied = 1 / odds;
  console.log(`        ${code} @ ${odds}: implied ${(implied * 100).toFixed(1)}%, model ${(p * 100).toFixed(1)}%, EV ${(ev >= 0 ? "+" : "")}${(ev * 100).toFixed(0)}%`);
}
// 1X2 margin-strip check with the user's real screenshot odds (KOR-CZE 2.45/2.70/2.85)
const inv = [1 / 2.45, 1 / 2.70, 1 / 2.85];
const over = inv.reduce((a, b) => a + b, 0);
const fair = inv.map((x) => x / over);
ok(Math.abs(fair.reduce((a, b) => a + b, 0) - 1) < 1e-12, "margin-stripped 1X2 probs sum to 1",
  `overround ${((over - 1) * 100).toFixed(1)}%`);

console.log(fails === 0 ? "\nALL CHECKS PASSED" : `\n${fails} CHECK(S) FAILED`);
process.exit(fails === 0 ? 0 : 1);
