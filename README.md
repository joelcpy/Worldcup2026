# ⚽ World Cup 2026 Predictor

An interactive, data-driven analysis of **every 2026 FIFA World Cup match** — win
probabilities, projected scores and written rationale for all 72 group-stage
fixtures, projected group tables, and a full knockout pathway down to a champion
pick. Snapshot taken **11 June 2026**, kick-off day.

## Run it

No build step, no dependencies — just open the page:

```bash
open index.html        # macOS
xdg-open index.html    # Linux
# or: python3 -m http.server  →  http://localhost:8000
```

## What's inside

| Tab | Contents |
|---|---|
| **Match predictions** | All 72 group games, day by day: W/D/L probability bars, projected scoreline, confidence badge, and an expandable written rationale (numbers + scouting context) for every match |
| **Group projections** | Expected-points tables for all 12 groups, with advancing teams and best third-placed qualifiers highlighted |
| **Knockout projection** | An illustrative Round-of-32 → Final bracket built from the projected group finishes |
| **Methodology & data** | The full model, its calibration, data sources, and honest limitations |

## Headline calls

- **Projected champion: 🇪🇸 Spain** — world #1 with the highest Elo rating
  (2157) ever recorded in international football, Euro 2024 champions, and a
  generational midfield. The model has them beating Brazil in the MetLife final.
- **Top contenders:** Argentina (2115), France (2063), England (2024) — the four
  highest-rated sides are clearly separated from the field.
- **Best dark horses:** Morocco (2022 semi-finalists, 2025 AFCON champs, on a
  long winning run), Norway (Haaland + a perfect qualifying campaign), and
  Türkiye (Güler's golden generation).
- **Host watch:** the +50 home-soil Elo boost makes Mexico comfortable Group A
  winners, tips Group D to the USA over Türkiye, and turns Switzerland–Canada
  into the closest "group final" of the first round (37/28/35).
- **Tightest games:** Switzerland vs Canada, Egypt vs Iran (a straight shootout
  for second in Group G), and Japan vs Netherlands.

## How the model works

1. **Elo ratings** (eloratings.net, 11 June 2026 snapshot; top values
   press-confirmed, mid-tier values closely estimated from the published
   early-2026 tables) measure team strength.
2. **+50 Elo host bonus** for Mexico / USA / Canada playing in their own country
   — the historically observed World Cup host effect.
3. **Win probability** via the classic Elo formula `P = 1/(1+10^(−diff/400))`.
4. **Draws** modelled as a Gaussian of the rating gap, peaking at 28% for even
   matchups — calibrated to historical World Cup group-stage draw rates.
5. **Scorelines** read off a joint Poisson grid around a 1.4-goal baseline.
6. **Groups** ranked by expected points (already-played results count at face
   value); **knockouts** advance the stronger side with draw mass reallocated.

The per-match rationale layers scouting context on top: FIFA rankings, recent
form, star players, squad notes and tournament history.

### Limitations, honestly

- A 65% favourite still fails to win more than one game in three — read the
  probabilities, not just the picks.
- The real Round-of-32 layout depends on *which* eight third-placed teams
  advance (FIFA Annex C defines 495 scenarios); the bracket shown is one
  illustrative path.
- Elo can't see late injuries, suspensions, or matchday-three rotation.

## Files

- `index.html` / `styles.css` — UI shell and theme
- `data.js` — 48 team profiles (Elo, FIFA rank, form, scouting notes) and all 72 fixtures
- `model.js` — pure prediction model (also runs under Node for testing)
- `app.js` — rendering and rationale generation
