// ============================================================
// UI — renders predictions, group tables, knockout projection
// ============================================================

const pct = (x) => `${Math.round(x * 100)}%`;
const T = (c) => TEAMS[c];

// Kickoff in Singapore Time. Schedule times are stored as US Eastern
// (EDT, UTC-4 in June); SGT is UTC+8, i.e. ET + 12h — so most games land
// on the following SGT morning/afternoon.
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function kickoffSGT(m) {
  const [mon, day] = m.d.split(" ");
  const [hh, mm] = m.et.split(":").map(Number);
  const utc = Date.UTC(2026, MONTH_NAMES.indexOf(mon), +day, hh + 4, mm);
  const sgt = new Date(utc + 8 * 3600 * 1000);
  const h = sgt.getUTCHours();
  const h12 = ((h + 11) % 12) + 1;
  return {
    ts: utc,
    date: `${MONTH_NAMES[sgt.getUTCMonth()]} ${sgt.getUTCDate()}`,
    time: `${h12}:${String(sgt.getUTCMinutes()).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`,
  };
}
const MATCHES_SGT = MATCHES
  .map((m) => ({ ...m, sgt: kickoffSGT(m) }))
  .sort((x, y) => x.sgt.ts - y.sgt.ts);

// ---------- Team-news Elo adjustments (persisted in the browser) ----------
function loadAdj() {
  try { return JSON.parse(localStorage.getItem("eloAdj") || "{}"); } catch { return {}; }
}
function saveAdj(adj) {
  try { localStorage.setItem("eloAdj", JSON.stringify(adj)); } catch { /* private mode */ }
}
let ELO_ADJ = loadAdj();
let TEAMS_EFF = TEAMS;
let MATCHES_EFF = MATCHES;

// Whether to hide matches that already have a result (persisted in the browser)
let HIDE_PLAYED = (() => {
  try { return localStorage.getItem("hidePlayed") === "1"; } catch { return false; }
})();

// ---------- User-entered match results (persisted in the browser) ----------
// Keyed by "HOME-AWAY" (each group-stage pairing is unique). These are
// local what-ifs layered on top of the official results already in data.js;
// they recalibrate Elo live but don't touch the repo.
function loadResults() {
  try { return JSON.parse(localStorage.getItem("userResults") || "{}"); } catch { return {}; }
}
function saveResults(r) {
  try { localStorage.setItem("userResults", JSON.stringify(r)); } catch { /* private mode */ }
}
let USER_RESULTS = loadResults();
const matchKey = (m) => `${m.h}-${m.a}`;

// A user result only applies to matches without an official result in data.js
// (those are already baked into the baseline Elo — overriding them is the
// commit path, not the UI).
function userResultOf(m) {
  if (m.result) return null;
  const r = USER_RESULTS[matchKey(m)];
  return Array.isArray(r) && r.length === 2 ? r : null;
}
const resultOf = (m) => m.result || userResultOf(m);

function adjustedTeams() {
  const out = {};
  for (const [c, v] of Object.entries(TEAMS)) out[c] = { ...v, elo: v.elo + (ELO_ADJ[c] || 0) };
  return out;
}

// Baseline Elo (with team-news nudges) plus the cumulative recalibration from
// every user-entered result, applied in kickoff order so each update sees the
// ratings the earlier games produced.
function effectiveTeams() {
  const t = adjustedTeams();
  for (const m of MATCHES_SGT) {
    const r = userResultOf(m);
    if (!r) continue;
    const d = eloUpdate(t, m.h, m.a, r[0], r[1], m.city);
    t[m.h] = { ...t[m.h], elo: t[m.h].elo + d.h };
    t[m.a] = { ...t[m.a], elo: t[m.a].elo + d.a };
  }
  return t;
}

// Recompute every view from the (possibly adjusted) ratings and the
// user-entered results folded in.
function refreshAll() {
  TEAMS_EFF = effectiveTeams();
  MATCHES_EFF = MATCHES.map((m) => {
    const r = userResultOf(m);
    return r ? { ...m, result: r } : m;
  });
  renderMatches();
  const proj = projectKnockout(TEAMS_EFF, MATCHES_EFF, GROUPS);
  renderGroups(proj);
  renderBracket(proj);
  renderOdds(simulateTournament(TEAMS_EFF, MATCHES_EFF, GROUPS, 10000));
  renderAdjList();
  renderResultList();
}

function renderAdjList() {
  const box = document.getElementById("adj-list");
  const entries = Object.entries(ELO_ADJ).filter(([, d]) => d);
  box.innerHTML = entries.length
    ? "Active adjustments: " + entries.map(([c, d]) =>
        `${T(c).flag} ${T(c).name} ${d > 0 ? "+" : ""}${d}`).join(" · ")
    : "No adjustments active — model is using the baseline Elo ratings.";
}

// List the user-entered results with a per-result clear button, plus the Elo
// swing each one produced, so the recalibration is transparent.
function renderResultList() {
  const box = document.getElementById("res-list");
  if (!box) return;
  const t = adjustedTeams();
  const items = [];
  for (const m of MATCHES_SGT) {
    const r = userResultOf(m);
    if (!r) continue;
    const d = eloUpdate(t, m.h, m.a, r[0], r[1], m.city);
    t[m.h] = { ...t[m.h], elo: t[m.h].elo + d.h };
    t[m.a] = { ...t[m.a], elo: t[m.a].elo + d.a };
    const swing = (d.h >= 0 ? "+" : "") + Math.round(d.h);
    items.push(`<span class="res-item">${m.sgt.date} · ${T(m.h).flag} ${T(m.h).name} ${r[0]}–${r[1]} ${T(m.a).name} ${T(m.a).flag}
      <span class="muted">(Elo ${swing} / ${swing.startsWith("-") ? "+" + swing.slice(1) : "-" + swing})</span>
      <button class="res-clear" data-key="${matchKey(m)}" title="Clear this result">×</button></span>`);
  }
  box.innerHTML = items.length
    ? "Entered results: " + items.join(" ")
    : "No results entered — paste tonight's final scores above as they come in.";
}

// ---------- Per-match news headlines (fetched by YOUR browser) ----------
const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
async function loadHeadlines(btn) {
  const out = btn.closest(".news-row").querySelector(".news-out");
  out.innerHTML = `<p class="muted">Fetching latest headlines…</p>`;
  const q = `${btn.dataset.h} vs ${btn.dataset.a} World Cup`;
  const rss = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-SG&gl=SG&ceid=SG:en`;
  try {
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(rss)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
    const items = [...xml.querySelectorAll("item")].slice(0, 5);
    if (!items.length) throw new Error("no items");
    out.innerHTML = `<ul class="news-list">` + items.map((it) => {
      const title = escapeHtml(it.querySelector("title")?.textContent || "");
      const link = escapeHtml(it.querySelector("link")?.textContent || "#");
      const mins = Math.max(1, Math.round((Date.now() - new Date(it.querySelector("pubDate")?.textContent || 0)) / 60000));
      const age = mins < 60 ? `${mins}m ago` : mins < 2880 ? `${Math.round(mins / 60)}h ago` : `${Math.round(mins / 1440)}d ago`;
      return `<li><a href="${link}" target="_blank" rel="noopener">${title}</a> <span class="muted">(${age})</span></li>`;
    }).join("") + `</ul>
      <p class="muted news-tip">Spotted a big story (star ruled out, heavy rotation)? Apply a team adjustment above and everything recomputes.</p>`;
  } catch {
    out.innerHTML = `<p class="muted">Couldn't fetch headlines just now (the free CORS proxy can be flaky) — use the "open Google News" link instead.</p>`;
  }
}

function pickOutcome(p) {
  if (p.d >= p.h && p.d >= p.a) return "d";
  return p.h >= p.a ? "h" : "a";
}

function confidenceLabel(pWin) {
  if (pWin >= 0.65) return ["strong", "Strong pick"];
  if (pWin >= 0.50) return ["moderate", "Moderate pick"];
  return ["lean", "Lean / toss-up"];
}

// Build the written rationale for a match from the model output + team facts
function buildRationale(m, p, score, projScore) {
  const h = T(m.h), a = T(m.a);
  const out = pickOutcome(p);
  const fav = p.h >= p.a ? m.h : m.a;
  const dog = fav === m.h ? m.a : m.h;
  const favP = Math.max(p.h, p.a);
  const f = T(fav), u = T(dog);
  const hb = hostBonus(m.h, m.city) - hostBonus(m.a, m.city);
  const gap = Math.abs(Math.round(p.diff));

  const parts = [];

  // The numbers
  let nums = `<strong>The numbers:</strong> ${f.name} hold an effective Elo edge of ${gap} points`;
  if (hb !== 0) {
    const beneficiary = hb > 0 ? h.name : a.name;
    nums += ` (including a +50 host-nation boost for ${beneficiary} playing in ${m.city})`;
  }
  nums += `, which converts to a ${pct(favP)} win probability with the draw at ${pct(p.d)}. ` +
          `FIFA ranking: ${h.name} #${h.rank} vs ${a.name} #${a.rank}. ` +
          `Recent form — ${h.name}: ${fmtForm(h.form)}, ${a.name}: ${fmtForm(a.form)}.`;
  const adjH = ELO_ADJ[m.h] || 0, adjA = ELO_ADJ[m.a] || 0;
  if (adjH || adjA) {
    const bits = [];
    if (adjH) bits.push(`${h.name} ${adjH > 0 ? "+" : ""}${adjH}`);
    if (adjA) bits.push(`${a.name} ${adjA > 0 ? "+" : ""}${adjA}`);
    nums += ` <em>Includes your team-news Elo adjustments: ${bits.join(", ")}.</em>`;
  }
  parts.push(nums);

  // The football
  parts.push(`<strong>${f.flag} ${f.name}:</strong> ${f.note}`);
  parts.push(`<strong>${u.flag} ${u.name}:</strong> ${u.note}`);

  // Analyst angle
  if (m.note) parts.push(`<strong>Analyst angle:</strong> ${m.note}`);

  // Verdict
  let verdict;
  if (m.result) {
    const [hg, ag] = m.result;
    const actual = hg > ag ? "h" : hg < ag ? "a" : "d";
    const got = actual === out || (out !== "d" && actual === out);
    const projStr = projScore ? ` Model projected ${h.name} ${projScore[0]}–${projScore[1]} ${a.name}.` : "";
    verdict = `<strong>Result:</strong> ${h.name} ${hg}–${ag} ${a.name}.${projStr} ` +
      (got ? `The model's pick (${f.name}) was correct.` : `The model's pick (${f.name}) missed.`);
  } else if (out === "d") {
    verdict = `<strong>Verdict:</strong> A draw (${pct(p.d)}) is the single most likely outcome — these sides are separated by almost nothing — ` +
      `but if forced to pick a winner, ${f.name} edge it at ${pct(favP)} vs ${pct(Math.min(p.h, p.a))}. Projected score: ${score[0]}–${score[1]}.`;
  } else {
    const [cls] = confidenceLabel(favP);
    const margin = cls === "strong"
      ? `${f.name} should win this comfortably`
      : cls === "moderate"
        ? `${f.name} are favourites, but ${u.name} have a real path to a result`
        : `genuine coin flip — ${f.name} by the slimmest of margins`;
    verdict = `<strong>Verdict:</strong> ${margin}. Projected score: ${h.name} ${score[0]}–${score[1]} ${a.name}.`;
  }
  parts.push(verdict);
  return parts.map((s) => `<p>${s}</p>`).join("");
}

function fmtForm(f) {
  return f.split("").map((c) => `<span class="form form-${c}">${c}</span>`).join("");
}

// ---------- Match cards ----------
function renderMatches() {
  const groupFilter = document.getElementById("filter-group").value;
  const query = document.getElementById("filter-search").value.trim().toLowerCase();
  const wrap = document.getElementById("matches");
  wrap.innerHTML = "";

  let shown = 0, hidden = 0, currentDate = null;
  for (const m of MATCHES_SGT) {
    const h = T(m.h), a = T(m.a);
    if (groupFilter !== "all" && m.g !== groupFilter) continue;
    if (query && !(h.name.toLowerCase().includes(query) || a.name.toLowerCase().includes(query))) continue;
    const result = resultOf(m);
    const isUserResult = !m.result && !!result;
    if (HIDE_PLAYED && result) { hidden++; continue; }
    shown++;

    if (m.sgt.date !== currentDate) {
      currentDate = m.sgt.date;
      const hd = document.createElement("div");
      hd.className = "date-header";
      hd.textContent = `${m.sgt.date}, 2026 — Singapore Time`;
      wrap.appendChild(hd);
    }

    const p = outcomeProbs(TEAMS_EFF, m.h, m.a, m.city);
    const projScore = likelyScore(TEAMS_EFF, m.h, m.a, m.city);
    const score = result || projScore;
    const out = pickOutcome(p);
    const fav = p.h >= p.a ? m.h : m.a;
    const favP = Math.max(p.h, p.a);
    const [cls, label] = confidenceLabel(favP);

    const card = document.createElement("details");
    card.className = "match";
    const pickText = out === "d"
      ? `Draw likely · edge ${T(fav).name}`
      : `${T(fav).flag} ${T(fav).name} ${pct(favP)}`;

    card.innerHTML = `
      <summary>
        <div class="match-top">
          <span class="badge group-badge">Group ${m.g}</span>
          <span class="venue">${m.sgt.time} SGT · ${m.city}</span>
          ${result ? `<span class="badge played-badge${isUserResult ? " user-badge" : ""}">${isUserResult ? "FT✎" : "FT"} ${result[0]}–${result[1]}</span>` : ""}
        </div>
        <div class="teams">
          <span class="team ${fav === m.h && out !== "d" ? "fav" : ""}">${h.flag} ${h.name}</span>
          ${result
            ? `<span class="score score-result">
                ${result[0]}–${result[1]}
                <span class="score-label">${isUserResult ? "your result" : "FT"} · proj ${projScore[0]}–${projScore[1]}</span>
               </span>`
            : `<span class="score score-proj">
                ${projScore[0]}–${projScore[1]}
                <span class="score-label">proj</span>
               </span>`
          }
          <span class="team right ${fav === m.a && out !== "d" ? "fav" : ""}">${a.name} ${a.flag}</span>
        </div>
        <div class="prob-bar" title="${h.name} ${pct(p.h)} · Draw ${pct(p.d)} · ${a.name} ${pct(p.a)}">
          <span class="ph" style="width:${p.h * 100}%"></span><span class="pd" style="width:${p.d * 100}%"></span><span class="pa" style="width:${p.a * 100}%"></span>
        </div>
        <div class="prob-labels">
          <span>${pct(p.h)}</span><span>draw ${pct(p.d)}</span><span>${pct(p.a)}</span>
        </div>
        <div class="pick-row">
          <span class="badge pick-badge ${cls}">${label}</span>
          <span class="pick">Pick: ${pickText}</span>
          <span class="expand-hint">rationale ▾</span>
        </div>
      </summary>
      <div class="rationale">${buildRationale(m, p, score, projScore)}
        <div class="news-row">
          <button class="news-load btn btn-ghost" data-h="${h.name}" data-a="${a.name}">📰 Load latest headlines</button>
          <a class="news-ext muted" href="https://news.google.com/search?q=${encodeURIComponent(`${h.name} vs ${a.name} World Cup 2026`)}" target="_blank" rel="noopener">open Google News ↗</a>
          <div class="news-out"></div>
        </div>
      </div>`;
    wrap.appendChild(card);
  }
  document.getElementById("match-count").textContent =
    `${shown} of ${MATCHES.length} group-stage matches` +
    (hidden ? ` · ${hidden} finished hidden` : "");
  updatePlayedToggle();
}

// Keep the hide/show button label in sync with how many matches have finished.
function updatePlayedToggle() {
  const btn = document.getElementById("toggle-played");
  if (!btn) return;
  const finished = MATCHES.filter((m) => resultOf(m)).length;
  btn.textContent = HIDE_PLAYED
    ? `Show ${finished} finished match${finished === 1 ? "" : "es"}`
    : `Hide ${finished} finished match${finished === 1 ? "" : "es"}`;
  btn.classList.toggle("active", HIDE_PLAYED);
  btn.disabled = finished === 0;
}

// ---------- Group tables ----------
function renderGroups(proj) {
  const wrap = document.getElementById("groups");
  wrap.innerHTML = "";
  const thirdSet = new Set(proj.qualifiedThirds.map((t) => t.code));
  for (const g of GROUPS) {
    const rows = proj.standings[g];
    const div = document.createElement("div");
    div.className = "group-card";
    div.innerHTML = `<h3>Group ${g}</h3>
      <table>
        <thead><tr><th></th><th>Team</th><th title="Projected points (expected value)">xPts</th><th>xGF</th><th>xGA</th><th></th></tr></thead>
        <tbody>${rows.map((r, i) => {
          const t = T(r.code);
          const status = i < 2 ? "adv" : thirdSet.has(r.code) ? "third" : "out";
          const tag = i === 0 ? "Winner" : i === 1 ? "Runner-up" : thirdSet.has(r.code) ? "Best 3rd" : "Out";
          return `<tr class="${status}">
            <td>${i + 1}</td>
            <td>${t.flag} ${t.name}</td>
            <td>${r.xPts.toFixed(1)}</td>
            <td>${r.xGF.toFixed(1)}</td>
            <td>${r.xGA.toFixed(1)}</td>
            <td><span class="badge st-${status}">${tag}</span></td>
          </tr>`;
        }).join("")}</tbody>
      </table>`;
    wrap.appendChild(div);
  }
}

// ---------- Knockout bracket ----------
function renderBracket(proj) {
  const wrap = document.getElementById("bracket");
  const roundNames = { r32: "Round of 32", r16: "Round of 16", qf: "Quarter-finals", sf: "Semi-finals", final: "Final" };
  wrap.innerHTML = Object.entries(roundNames).map(([key, label]) => `
    <div class="round">
      <h3>${label}</h3>
      ${proj.rounds[key].map((m) => {
        const w = T(m.winner), l = T(m.winner === m.h ? m.a : m.h);
        const wp = m.winner === m.h ? m.p : 1 - m.p;
        return `<div class="ko-match">
          ${m.tag ? `<div class="ko-tag">${m.tag}</div>` : ""}
          <div class="ko-row ${m.winner === m.h ? "win" : ""}"><span>${T(m.h).flag} ${T(m.h).name}</span><span>${pct(m.winner === m.h ? wp : 1 - wp)}</span></div>
          <div class="ko-row ${m.winner === m.a ? "win" : ""}"><span>${T(m.a).flag} ${T(m.a).name}</span><span>${pct(m.winner === m.a ? wp : 1 - wp)}</span></div>
        </div>`;
      }).join("")}
    </div>`).join("");

  const champ = T(proj.champion);
  const final = proj.rounds.final[0];
  const runnerUp = T(final.winner === final.h ? final.a : final.h);
  document.getElementById("champion-banner").innerHTML =
    `<div class="champ-flag">${champ.flag}</div>
     <div>
       <div class="champ-label">Projected champion</div>
       <div class="champ-name">${champ.name}</div>
       <div class="champ-sub">defeating ${runnerUp.flag} ${runnerUp.name} in the final at MetLife Stadium, July 19</div>
     </div>`;
}

// ---------- Odds & value ----------
function evRow(p, odds) {
  const implied = 1 / odds;
  const ev = p * odds - 1;
  return { implied, ev, edge: p - implied };
}

function verdictBadge(ev) {
  if (ev >= 0.05) return `<span class="badge st-adv">Value ✅</span>`;
  if (ev >= -0.05) return `<span class="badge st-third">Fair</span>`;
  return `<span class="badge st-out">No value</span>`;
}

function renderOdds(sim) {
  // outright comparison table
  const tbody = document.querySelector("#outright-table tbody");
  tbody.innerHTML = MARKET_ODDS.map(({ code, odds }) => {
    const t = T(code), p = sim[code].champ;
    const { implied, ev, edge } = evRow(p, odds);
    return `<tr>
      <td>${t.flag} ${t.name}</td><td>${odds.toFixed(2)}</td>
      <td>${pct(implied)}</td><td>${pct(p)}</td>
      <td class="${edge >= 0 ? "pos" : "neg"}">${edge >= 0 ? "+" : ""}${(edge * 100).toFixed(1)}pp</td>
      <td class="${ev >= 0 ? "pos" : "neg"}">${ev >= 0 ? "+" : ""}${(ev * 100).toFixed(0)}%</td>
      <td>${verdictBadge(ev)}</td>
    </tr>`;
  }).join("");

  // outright calculator
  const teamSel = document.getElementById("calc-out-team");
  const byChamp = Object.keys(TEAMS).sort((a, b) => sim[b].champ - sim[a].champ);
  teamSel.innerHTML = byChamp.map((c) =>
    `<option value="${c}">${T(c).name} — model ${(sim[c].champ * 100).toFixed(1)}%</option>`).join("");
  document.getElementById("calc-out-btn").onclick = () => {
    const code = teamSel.value;
    const odds = parseFloat(document.getElementById("calc-out-odds").value);
    const box = document.getElementById("calc-out-result");
    if (!odds || odds <= 1) { box.innerHTML = `<p class="muted">Enter decimal odds above 1.00.</p>`; return; }
    const p = sim[code].champ;
    const { implied, ev, edge } = evRow(p, odds);
    box.innerHTML = `<p>${T(code).flag} <strong>${T(code).name}</strong> at <strong>${odds.toFixed(2)}</strong>:
      market implies ${pct(implied)}, model says ${pct(p)}
      (edge ${edge >= 0 ? "+" : ""}${(edge * 100).toFixed(1)}pp, EV ${ev >= 0 ? "+" : ""}${(ev * 100).toFixed(0)}% per $1). ${verdictBadge(ev)}</p>`;
  };

  // match 1X2 calculator
  const matchSel = document.getElementById("calc-match");
  matchSel.innerHTML = MATCHES.map((m, i) =>
    m.result ? "" : `<option value="${i}">${kickoffSGT(m).date}, ${kickoffSGT(m).time} SGT · ${T(m.h).name} vs ${T(m.a).name} (Grp ${m.g})</option>`).join("");
  document.getElementById("calc-match-btn").onclick = () => {
    const m = MATCHES[parseInt(matchSel.value, 10)];
    const oh = parseFloat(document.getElementById("calc-h").value);
    const od = parseFloat(document.getElementById("calc-d").value);
    const oa = parseFloat(document.getElementById("calc-a").value);
    const box = document.getElementById("calc-match-result");
    if (![oh, od, oa].every((x) => x > 1)) { box.innerHTML = `<p class="muted">Enter all three decimal odds (each above 1.00).</p>`; return; }
    const p = outcomeProbs(TEAMS_EFF, m.h, m.a, m.city);
    const raw = [1 / oh, 1 / od, 1 / oa];
    const book = raw[0] + raw[1] + raw[2];
    const rows = [
      { label: `${T(m.h).flag} ${T(m.h).name} win`, odds: oh, model: p.h },
      { label: `Draw`, odds: od, model: p.d },
      { label: `${T(m.a).flag} ${T(m.a).name} win`, odds: oa, model: p.a },
    ].map((r, i) => ({ ...r, fair: raw[i] / book, ...evRow(r.model, r.odds) }));
    const best = rows.reduce((x, y) => (y.ev > x.ev ? y : x));
    box.innerHTML = `
      <p class="muted">Bookmaker margin on this market: <strong>${((book - 1) * 100).toFixed(1)}%</strong></p>
      <table class="odds-table">
        <thead><tr><th>Outcome</th><th>Odds</th><th>Implied (fair)</th><th>Model</th><th>EV / $1</th><th>Verdict</th></tr></thead>
        <tbody>${rows.map((r) => `<tr>
          <td>${r.label}</td><td>${r.odds.toFixed(2)}</td>
          <td>${pct(r.fair)}</td><td>${pct(r.model)}</td>
          <td class="${r.ev >= 0 ? "pos" : "neg"}">${r.ev >= 0 ? "+" : ""}${(r.ev * 100).toFixed(0)}%</td>
          <td>${verdictBadge(r.ev)}</td>
        </tr>`).join("")}</tbody>
      </table>
      <p>${best.ev >= 0.05
        ? `Best of the three: <strong>${best.label}</strong> — the price beats the model by ${(best.ev * 100).toFixed(0)}% EV.`
        : `None of the three prices beats the model after the bookmaker margin — the model says pass on this market.`}</p>`;
  };
}

// ---------- Tabs ----------
function initTabs() {
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.panel).classList.add("active");
    });
  });
}

// ---------- Boot ----------
document.addEventListener("DOMContentLoaded", () => {
  const sel = document.getElementById("filter-group");
  for (const g of GROUPS) {
    const o = document.createElement("option");
    o.value = g; o.textContent = `Group ${g}`;
    sel.appendChild(o);
  }
  sel.addEventListener("change", renderMatches);
  document.getElementById("filter-search").addEventListener("input", renderMatches);
  document.getElementById("toggle-played").addEventListener("click", () => {
    HIDE_PLAYED = !HIDE_PLAYED;
    try { localStorage.setItem("hidePlayed", HIDE_PLAYED ? "1" : "0"); } catch { /* private mode */ }
    renderMatches();
  });

  // team-news adjustment controls
  const adjTeam = document.getElementById("adj-team");
  adjTeam.innerHTML = Object.keys(TEAMS)
    .sort((a, b) => TEAMS[a].name.localeCompare(TEAMS[b].name))
    .map((c) => `<option value="${c}">${TEAMS[c].flag} ${TEAMS[c].name}</option>`).join("");
  document.getElementById("adj-apply").addEventListener("click", () => {
    const code = adjTeam.value;
    let delta = parseInt(document.getElementById("adj-delta").value, 10) || 0;
    delta = Math.max(-200, Math.min(200, delta));
    if (delta === 0) delete ELO_ADJ[code]; else ELO_ADJ[code] = delta;
    saveAdj(ELO_ADJ);
    refreshAll();
  });
  document.getElementById("adj-reset").addEventListener("click", () => {
    ELO_ADJ = {};
    saveAdj(ELO_ADJ);
    document.getElementById("adj-delta").value = "";
    refreshAll();
  });

  // match-result entry controls — list only fixtures without an official result,
  // in kickoff order
  const resMatch = document.getElementById("res-match");
  resMatch.innerHTML = MATCHES_SGT
    .filter((m) => !m.result)
    .map((m) => `<option value="${matchKey(m)}">${m.sgt.date} · Grp ${m.g} · ${T(m.h).name} v ${T(m.a).name}</option>`)
    .join("");
  const findMatch = (key) => MATCHES.find((m) => matchKey(m) === key);
  document.getElementById("res-apply").addEventListener("click", () => {
    const key = resMatch.value;
    if (!key) return;
    const hg = parseInt(document.getElementById("res-h").value, 10);
    const ag = parseInt(document.getElementById("res-a").value, 10);
    if (!Number.isInteger(hg) || !Number.isInteger(ag) || hg < 0 || ag < 0) {
      alert("Enter both scores as whole numbers (0 or more).");
      return;
    }
    USER_RESULTS[key] = [hg, ag];
    saveResults(USER_RESULTS);
    document.getElementById("res-h").value = "";
    document.getElementById("res-a").value = "";
    refreshAll();
  });
  document.getElementById("res-reset").addEventListener("click", () => {
    USER_RESULTS = {};
    saveResults(USER_RESULTS);
    refreshAll();
  });
  // per-result clear buttons (event delegation — the list re-renders)
  document.getElementById("res-list").addEventListener("click", (e) => {
    const btn = e.target.closest(".res-clear");
    if (!btn) return;
    delete USER_RESULTS[btn.dataset.key];
    saveResults(USER_RESULTS);
    refreshAll();
  });

  // per-match news loader (event delegation — cards are re-rendered often)
  document.getElementById("matches").addEventListener("click", (e) => {
    const btn = e.target.closest(".news-load");
    if (btn) { e.preventDefault(); loadHeadlines(btn); }
  });

  initTabs();
  refreshAll();
});
