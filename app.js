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
function buildRationale(m, p, score) {
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
    verdict = `<strong>Result:</strong> ${h.name} ${hg}–${ag} ${a.name}. ` +
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

  let shown = 0, currentDate = null;
  for (const m of MATCHES_SGT) {
    const h = T(m.h), a = T(m.a);
    if (groupFilter !== "all" && m.g !== groupFilter) continue;
    if (query && !(h.name.toLowerCase().includes(query) || a.name.toLowerCase().includes(query))) continue;
    shown++;

    if (m.sgt.date !== currentDate) {
      currentDate = m.sgt.date;
      const hd = document.createElement("div");
      hd.className = "date-header";
      hd.textContent = `${m.sgt.date}, 2026 — Singapore Time`;
      wrap.appendChild(hd);
    }

    const p = outcomeProbs(TEAMS, m.h, m.a, m.city);
    const score = m.result || likelyScore(TEAMS, m.h, m.a, m.city);
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
          ${m.result ? `<span class="badge played-badge">FT ${m.result[0]}–${m.result[1]}</span>` : ""}
        </div>
        <div class="teams">
          <span class="team ${fav === m.h && out !== "d" ? "fav" : ""}">${h.flag} ${h.name}</span>
          <span class="score">${m.result ? `${m.result[0]}–${m.result[1]}` : `${score[0]}–${score[1]}`}</span>
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
      <div class="rationale">${buildRationale(m, p, score)}</div>`;
    wrap.appendChild(card);
  }
  document.getElementById("match-count").textContent =
    `${shown} of ${MATCHES.length} group-stage matches`;
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
  document.getElementById("calc-out-btn").addEventListener("click", () => {
    const code = teamSel.value;
    const odds = parseFloat(document.getElementById("calc-out-odds").value);
    const box = document.getElementById("calc-out-result");
    if (!odds || odds <= 1) { box.innerHTML = `<p class="muted">Enter decimal odds above 1.00.</p>`; return; }
    const p = sim[code].champ;
    const { implied, ev, edge } = evRow(p, odds);
    box.innerHTML = `<p>${T(code).flag} <strong>${T(code).name}</strong> at <strong>${odds.toFixed(2)}</strong>:
      market implies ${pct(implied)}, model says ${pct(p)}
      (edge ${edge >= 0 ? "+" : ""}${(edge * 100).toFixed(1)}pp, EV ${ev >= 0 ? "+" : ""}${(ev * 100).toFixed(0)}% per $1). ${verdictBadge(ev)}</p>`;
  });

  // match 1X2 calculator
  const matchSel = document.getElementById("calc-match");
  matchSel.innerHTML = MATCHES.map((m, i) =>
    m.result ? "" : `<option value="${i}">${kickoffSGT(m).date}, ${kickoffSGT(m).time} SGT · ${T(m.h).name} vs ${T(m.a).name} (Grp ${m.g})</option>`).join("");
  document.getElementById("calc-match-btn").addEventListener("click", () => {
    const m = MATCHES[parseInt(matchSel.value, 10)];
    const oh = parseFloat(document.getElementById("calc-h").value);
    const od = parseFloat(document.getElementById("calc-d").value);
    const oa = parseFloat(document.getElementById("calc-a").value);
    const box = document.getElementById("calc-match-result");
    if (![oh, od, oa].every((x) => x > 1)) { box.innerHTML = `<p class="muted">Enter all three decimal odds (each above 1.00).</p>`; return; }
    const p = outcomeProbs(TEAMS, m.h, m.a, m.city);
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
  });
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

  initTabs();
  renderMatches();
  const proj = projectKnockout(TEAMS, MATCHES, GROUPS);
  renderGroups(proj);
  renderBracket(proj);
  renderOdds(simulateTournament(TEAMS, MATCHES, GROUPS, 10000));
});
