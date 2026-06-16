// ============================================================
// Prediction model — Elo-based, with host advantage and a
// Dixon-Coles-adjusted bivariate Poisson scoreline grid. Pure
// functions, no DOM (also runs under Node for testing).
// ============================================================

const HOST_OF_CITY = {
  "Mexico City": "MEX", "Guadalajara": "MEX", "Monterrey": "MEX", "Guadalupe": "MEX",
  "Toronto": "CAN", "Vancouver": "CAN",
  "Inglewood": "USA", "Santa Clara": "USA", "East Rutherford": "USA", "Foxborough": "USA",
  "Houston": "USA", "Arlington": "USA", "Philadelphia": "USA", "Atlanta": "USA",
  "Seattle": "USA", "Miami": "USA", "Kansas City": "USA",
};

const HOME_ADVANTAGE = 50;   // Elo bonus when a host nation plays in its own country
const BASE_LAMBDA = 1.30;    // expected goals each for two even teams. Trimmed from
                             // 1.40 after the recent-World-Cup goal level (2018: 2.64,
                             // 2022: 2.69, 2026-so-far: 2.88 goals/game) showed the model
                             // running ~0.2-0.4 goals/game high. Lower goals also lift the
                             // even-team draw rate slightly (to ~29%), consistent with how
                             // draw-heavy the modern group stage has become.
const DC_RHO = -0.114;       // Dixon-Coles low-score correlation parameter. Independent
                             // Poisson treats the two teams' goal counts as independent,
                             // which under-states 0-0 and 1-1 and over-states 1-0/0-1.
                             // A negative rho re-weights exactly those four corner cells
                             // (lifting the draws, trimming the 1-0/0-1) to capture the
                             // real correlation. Tuned so even teams draw ~28% (the
                             // historical World Cup group-stage rate), which lets the
                             // single rho replace the old global DRAW_BOOST hack: the
                             // draw rate is now an emergent property of a properly
                             // calibrated scoreline grid, not a separate multiplier.

// Host-nation Elo bonus for a team playing in the given city.
// In the knockout projection (no city), hosts keep the bonus —
// every venue is on home soil for MEX/USA/CAN.
function hostBonus(code, city) {
  if (code !== "MEX" && code !== "USA" && code !== "CAN") return 0;
  if (!city) return HOME_ADVANTAGE;
  return HOST_OF_CITY[city] === code ? HOME_ADVANTAGE : 0;
}

function effectiveDiff(teams, hCode, aCode, city) {
  return (teams[hCode].elo + hostBonus(hCode, city)) -
         (teams[aCode].elo + hostBonus(aCode, city));
}

// Classic Elo expectation
function eloExpectation(diff) {
  return 1 / (1 + Math.pow(10, -diff / 400));
}

// Dixon-Coles dependence factor for the four low-score cells. With rho < 0
// it lifts 0-0 and 1-1 and trims 1-0 and 0-1; every other cell is unchanged
// (factor 1), so the marginals are very nearly preserved.
function dcTau(i, j, lh, la, rho) {
  if (i === 0 && j === 0) return 1 - lh * la * rho;
  if (i === 0 && j === 1) return 1 + lh * rho;
  if (i === 1 && j === 0) return 1 + la * rho;
  if (i === 1 && j === 1) return 1 - rho;
  return 1;
}

// Full joint scoreline grid (0..max each), Dixon-Coles adjusted and
// normalised to sum to 1. This single grid is the source of truth for the
// draw probability, the projected scoreline and any goal-based market
// (BTTS, totals, exact score, handicaps).
function scoreGrid(diff, max = 12) {
  const { h: lh, a: la } = expectedGoals(diff);
  const ph = [], pa = [];
  for (let k = 0; k <= max; k++) { ph[k] = poisson(lh, k); pa[k] = poisson(la, k); }
  const grid = [];
  let total = 0;
  for (let i = 0; i <= max; i++) {
    grid[i] = [];
    for (let j = 0; j <= max; j++) {
      const p = ph[i] * pa[j] * dcTau(i, j, lh, la, DC_RHO);
      grid[i][j] = p;
      total += p;
    }
  }
  for (let i = 0; i <= max; i++)
    for (let j = 0; j <= max; j++) grid[i][j] /= total;
  return grid;
}

// Draw probability = the diagonal of the Dixon-Coles scoreline grid, so it
// stays exactly consistent with likelyScore and decays realistically for
// mismatches. The DC corner re-weighting alone lands even teams at ~28%
// (historical group-stage rate) — no separate boost needed. Computed in a
// single pass without materialising the grid (this is the Monte Carlo hot
// path), but numerically identical to summing scoreGrid's diagonal.
function drawProb(diff, max = 12) {
  const { h: lh, a: la } = expectedGoals(diff);
  const ph = [], pa = [];
  for (let k = 0; k <= max; k++) { ph[k] = poisson(lh, k); pa[k] = poisson(la, k); }
  let total = 0, diag = 0;
  for (let i = 0; i <= max; i++) {
    for (let j = 0; j <= max; j++) {
      const p = ph[i] * pa[j] * dcTau(i, j, lh, la, DC_RHO);
      total += p;
      if (i === j) diag += p;
    }
  }
  return diag / total;
}

// Group-stage outcome probabilities {h, d, a}. The Elo expectation sets the
// win/loss balance; the draw mass is the Poisson-grid value above.
function outcomeProbs(teams, hCode, aCode, city) {
  const diff = effectiveDiff(teams, hCode, aCode, city);
  const e = eloExpectation(diff);
  const pDraw = drawProb(diff);
  return { h: e * (1 - pDraw), d: pDraw, a: (1 - e) * (1 - pDraw), diff };
}

// Expected goals for each side from the Elo gap. The clamp ceiling (3.0)
// reflects that even elite teams average ~2.5-3.0 expected goals against
// minnows rather than running away to 3.6+; the floor (0.40) keeps a weak
// side's chance of nicking one alive. A tighter range than the original
// [0.25, 3.6] — it makes lopsided draws less of a mathematical impossibility
// (a 3.6-vs-0.35 Poisson essentially can't draw) and keeps projected
// scorelines realistic, while leaving even-match goal levels untouched.
function expectedGoals(diff) {
  const clamp = (x) => Math.max(0.40, Math.min(3.0, x));
  return {
    h: clamp(BASE_LAMBDA * Math.pow(10, diff / 900)),
    a: clamp(BASE_LAMBDA * Math.pow(10, -diff / 900)),
  };
}

function poisson(lambda, k) {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return Math.exp(-lambda) * Math.pow(lambda, k) / f;
}

// Most likely exact scoreline, read off the Dixon-Coles scoreline grid
// (0–6 window), constrained to agree with the most likely W/D/L outcome.
function likelyScore(teams, hCode, aCode, city) {
  const p = outcomeProbs(teams, hCode, aCode, city);
  const grid = scoreGrid(p.diff);
  const want = p.h >= p.d && p.h >= p.a ? "h" : (p.a >= p.d ? "a" : "d");
  let best = [1, 1], bestP = -1;
  for (let i = 0; i <= 6; i++) {
    for (let j = 0; j <= 6; j++) {
      const kind = i > j ? "h" : i < j ? "a" : "d";
      if (kind !== want) continue;
      if (grid[i][j] > bestP) { bestP = grid[i][j]; best = [i, j]; }
    }
  }
  return best;
}

// Knockout: no draws — draw mass reallocated, slightly favouring the
// stronger side (who would also be favoured in extra time / penalties).
function knockoutProb(teams, hCode, aCode) {
  const diff = effectiveDiff(teams, hCode, aCode, null);
  return eloExpectation(diff);
}

// World Football Elo goal-difference multiplier: a bigger winning margin
// counts as stronger evidence. 1 for a one-goal win, 1.5 for two, then
// (11+|GD|)/8 for three or more.
function goalMultiplier(gd) {
  const a = Math.abs(gd);
  if (a <= 1) return 1;
  if (a === 2) return 1.5;
  return (11 + a) / 8;
}

// World Football Elo update for one played match. Returns the rating change
// to ADD to each side: R_new = R_old + K·G·(result − expected). K=60 for
// World Cup matches; the expectation uses the same effective diff (including
// host advantage) the match was predicted with, so beating the odds at home
// is rewarded a touch less. Zero-sum: the away delta is minus the home delta.
function eloUpdate(teams, hCode, aCode, hg, ag, city, K = 60) {
  const eH = eloExpectation(effectiveDiff(teams, hCode, aCode, city));
  const sH = hg > ag ? 1 : hg === ag ? 0.5 : 0;
  const dH = K * goalMultiplier(hg - ag) * (sH - eH);
  return { h: dH, a: -dH };
}

// ---- Group projection: expected points table ----
function projectGroup(teams, matches, group) {
  const rows = {};
  for (const code of Object.keys(teams)) {
    if (teams[code].group === group) {
      rows[code] = { code, xPts: 0, xGF: 0, xGA: 0, played: 0, actualPts: 0 };
    }
  }
  for (const m of matches) {
    if (m.g !== group) continue;
    if (m.result) {
      const [hg, ag] = m.result;
      rows[m.h].xPts += hg > ag ? 3 : hg === ag ? 1 : 0;
      rows[m.a].xPts += ag > hg ? 3 : hg === ag ? 1 : 0;
      rows[m.h].xGF += hg; rows[m.h].xGA += ag;
      rows[m.a].xGF += ag; rows[m.a].xGA += hg;
      rows[m.h].played++; rows[m.a].played++;
      continue;
    }
    const p = outcomeProbs(teams, m.h, m.a, m.city);
    const xg = expectedGoals(p.diff);
    rows[m.h].xPts += 3 * p.h + p.d;
    rows[m.a].xPts += 3 * p.a + p.d;
    rows[m.h].xGF += xg.h; rows[m.h].xGA += xg.a;
    rows[m.a].xGF += xg.a; rows[m.a].xGA += xg.h;
  }
  return Object.values(rows).sort((x, y) =>
    (y.xPts - x.xPts) || ((y.xGF - y.xGA) - (x.xGF - x.xGA)) || (teams[y.code].elo - teams[x.code].elo));
}

// ---- R32 pairing template ----
// FIFA's real R32 bracket depends on which 8 third-placed teams advance
// (Annex C, 495 scenarios). This builds an illustrative bracket honouring
// the published constraints: 8 winners vs thirds, 4 winners vs runners-up,
// 4 runner-up pairings, no same-group rematches, no winner-vs-winner.
function buildR32Pairings(W, RU, qualifiedThirds) {
  const winnerGroupsVsThirds = ["A", "C", "E", "F", "H", "I", "K", "L"];
  // Assign thirds to winner slots with backtracking: a same-group rematch is
  // never allowed, and since the 8 thirds come from distinct groups a valid
  // assignment always exists (each third is barred from at most one slot).
  const assigned = new Array(winnerGroupsVsThirds.length).fill(null);
  const used = new Array(qualifiedThirds.length).fill(false);
  (function place(i) {
    if (i === winnerGroupsVsThirds.length) return true;
    for (let j = 0; j < qualifiedThirds.length; j++) {
      if (used[j] || qualifiedThirds[j].g === winnerGroupsVsThirds[i]) continue;
      used[j] = true; assigned[i] = qualifiedThirds[j];
      if (place(i + 1)) return true;
      used[j] = false;
    }
    return false;
  })(0);
  const r32 = [];
  winnerGroupsVsThirds.forEach((g, i) => {
    const t = assigned[i];
    r32.push({ h: W[g], a: t.code, tag: `Winner ${g} vs 3rd ${t.g}` });
  });
  // 4 winners vs runners-up (fixed cross-group template)
  const wVsRu = [["B", "I"], ["D", "C"], ["G", "K"], ["J", "H"]];
  for (const [wg, rg] of wVsRu) r32.push({ h: W[wg], a: RU[rg], tag: `Winner ${wg} vs Runner-up ${rg}` });
  // remaining 8 runners-up pair off
  const ruPairs = [["A", "D"], ["B", "F"], ["E", "L"], ["G", "J"]];
  for (const [g1, g2] of ruPairs) r32.push({ h: RU[g1], a: RU[g2], tag: `Runner-up ${g1} vs Runner-up ${g2}` });

  // Interleave so winner-vs-third games meet winner/RU games in the R16
  const order = [0, 8, 1, 12, 2, 9, 3, 13, 4, 10, 5, 14, 6, 11, 7, 15];
  return order.map((i) => r32[i]);
}

// ---- Deterministic knockout projection (most likely path) ----
function projectKnockout(teams, matches, groups) {
  const standings = {};
  for (const g of groups) standings[g] = projectGroup(teams, matches, g);
  const W = {}, RU = {}, TH = [];
  for (const g of groups) {
    W[g] = standings[g][0].code;
    RU[g] = standings[g][1].code;
    TH.push({ g, ...standings[g][2] });
  }
  TH.sort((x, y) => (y.xPts - x.xPts) || (teams[y.code].elo - teams[x.code].elo));
  const qualifiedThirds = TH.slice(0, 8);
  const eliminatedThirds = TH.slice(8);
  const bracket = buildR32Pairings(W, RU, qualifiedThirds);

  const rounds = { r32: [], r16: [], qf: [], sf: [], final: [] };
  let current = bracket.map((m) => {
    const p = knockoutProb(teams, m.h, m.a);
    const winner = p >= 0.5 ? m.h : m.a;
    const entry = { ...m, p, winner };
    rounds.r32.push(entry);
    return winner;
  });
  for (const round of ["r16", "qf", "sf", "final"]) {
    const next = [];
    for (let i = 0; i < current.length; i += 2) {
      const h = current[i], a = current[i + 1];
      const p = knockoutProb(teams, h, a);
      const winner = p >= 0.5 ? h : a;
      rounds[round].push({ h, a, p, winner });
      next.push(winner);
    }
    current = next;
  }
  return { standings, rounds, champion: current[0], qualifiedThirds, eliminatedThirds };
}

// ---- Monte Carlo tournament simulation ----
// Samples every group game from the W/D/L probabilities, resolves group
// tables (points, then sampled goal swing, then Elo), fills the R32
// template and plays out the knockout tree with sampled winners.
// Returns per-team probabilities of reaching each stage / winning it all.
function simulateTournament(teams, matches, groups, nSims = 10000, rand = Math.random) {
  const codes = Object.keys(teams);
  const tally = {};
  for (const c of codes) tally[c] = { r32: 0, r16: 0, qf: 0, sf: 0, final: 0, champ: 0 };

  for (let s = 0; s < nSims; s++) {
    const pts = {}, swing = {};
    for (const c of codes) { pts[c] = 0; swing[c] = 0; }

    for (const m of matches) {
      if (m.result) {
        const [hg, ag] = m.result;
        pts[m.h] += hg > ag ? 3 : hg === ag ? 1 : 0;
        pts[m.a] += ag > hg ? 3 : hg === ag ? 1 : 0;
        swing[m.h] += hg - ag; swing[m.a] += ag - hg;
        continue;
      }
      const p = outcomeProbs(teams, m.h, m.a, m.city);
      const r = rand();
      if (r < p.h) { pts[m.h] += 3; swing[m.h] += 1; swing[m.a] -= 1; }
      else if (r < p.h + p.d) { pts[m.h] += 1; pts[m.a] += 1; }
      else { pts[m.a] += 3; swing[m.a] += 1; swing[m.h] -= 1; }
    }

    const W = {}, RU = {}, TH = [];
    for (const g of groups) {
      const rows = codes.filter((c) => teams[c].group === g)
        .sort((x, y) => (pts[y] - pts[x]) || (swing[y] - swing[x]) || (teams[y].elo - teams[x].elo));
      W[g] = rows[0]; RU[g] = rows[1];
      TH.push({ g, code: rows[2] });
    }
    TH.sort((x, y) => (pts[y.code] - pts[x.code]) || (swing[y.code] - swing[x.code]) || (teams[y.code].elo - teams[x.code].elo));
    const thirds = TH.slice(0, 8);

    let current = buildR32Pairings(W, RU, thirds).map((m) => {
      tally[m.h].r32++; tally[m.a].r32++;
      return rand() < knockoutProb(teams, m.h, m.a) ? m.h : m.a;
    });
    for (const stage of ["r16", "qf", "sf", "final"]) {
      for (const c of current) tally[c][stage]++;
      const next = [];
      for (let i = 0; i < current.length; i += 2) {
        next.push(rand() < knockoutProb(teams, current[i], current[i + 1]) ? current[i] : current[i + 1]);
      }
      current = next;
    }
    tally[current[0]].champ++;
  }

  const out = {};
  for (const c of codes) {
    out[c] = {};
    for (const k of Object.keys(tally[c])) out[c][k] = tally[c][k] / nSims;
  }
  return out;
}

if (typeof module !== "undefined") {
  module.exports = { outcomeProbs, likelyScore, knockoutProb, projectGroup, projectKnockout, simulateTournament, expectedGoals, drawProb, scoreGrid, dcTau, eloUpdate, goalMultiplier, hostBonus, buildR32Pairings };
}
