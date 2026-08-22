import { useMemo, useRef } from "react";
import { parseBalls, rankFromCode } from "./SuperOverBalls.jsx";

function rankToRuns(rank) {
  if (!rank) return null;
  if (rank === "K") return "W";
  if (rank === "10") return 0;
  if (rank === "A") return 1;
  const n = parseInt(rank, 10);
  return isNaN(n) ? null : n;
}

function computeScore(ballCodes) {
  let runs = 0, wickets = 0, deliveries = 0;
  const ballValues = [];
  for (const code of ballCodes) {
    if (code === null) continue;
    deliveries++;
    const rank = rankFromCode(code);
    const val = rankToRuns(rank);
    if (val === "W") { wickets++; ballValues.push("W"); }
    else if (val !== null) { runs += val; ballValues.push(String(val)); }
  }
  return { runs, wickets, deliveries, ballValues };
}

/**
 * Which side is at the crease right now.
 *
 * The feed never states this directly, but every fancy / fancy1 line is named
 * after the batting team — "0.1 Over Wicket AUS", "1 over run IND" — so the
 * trailing word identifies the innings. Falls back to null when nothing matches
 * (e.g. between rounds, when every market is empty).
 */
function findBattingTeam(markets, team1, team2) {
  for (const m of markets || []) {
    if (Number(m?.dtype) === 2 || m?.gtype === "match1") continue; // bookmaker names both
    for (const s of m?.section || []) {
      const nat = String(s?.nat || "").trim();
      if (!nat) continue;
      if (team2 && nat.endsWith(` ${team2}`)) return team2;
      if (team1 && nat.endsWith(` ${team1}`)) return team1;
    }
  }
  return null;
}

/**
 * Mini SuperOver scorecard.
 *
 * WHY THIS IS NOT JUST `scard`: the vendor field that would carry both innings
 * ("IND:14-0(1.0)|AUS:5-0(0.2)|…") is not being sent — the live feed ships
 * `scard: 1`, a NUMBER. The old code tested `scard !== "1"`, which is always true
 * for the number 1, then called `.split()` on it and threw straight into an empty
 * catch. So the parse silently never ran and the card fell back to:
 *   • team 1's row = whatever the current innings shows, whoever is batting
 *   • team 2's row = the literal string "0-0 (0.0)", forever
 *
 * And `t1.card` only ever holds the CURRENT innings' 4 balls — at the innings
 * change it resets to "1|1|1|1" under the SAME gmid (verified against the live
 * feed). So the first innings' total is not in the feed at all once the second
 * begins; it has to be remembered here, which is why this component keeps a ref.
 *
 * Precedence is unchanged: a real `scard` string still wins outright. Everything
 * below is the fallback for when the feed doesn't send one.
 */
export default function SuperOverScorecard({
  team1 = "IND",
  team2 = "AUS",
  cardString = "",
  scard,
  markets = [],
  gmid,
  ballsPerOver = 4,
}) {
  const current = useMemo(
    () => computeScore(parseBalls(cardString)), [cardString]
  );

  const battingTeam = useMemo(
    () => findBattingTeam(markets, team1, team2), [markets, team1, team2]
  );

  function oversStr(d) {
    return `${Math.floor(d / ballsPerOver)}.${d % ballsPerOver}`;
  }
  const fmt = (s) => `${s.runs}-${s.wickets} (${oversStr(s.deliveries)})`;

  // First-innings memory. While team1 bats we keep overwriting it, so the last
  // value written is that innings' final score; once team2 comes in, the feed no
  // longer carries it. Keyed by gmid so a new match starts clean. If the page is
  // opened midway through the second innings we never saw the first, and the row
  // shows "-" rather than a fabricated 0-0.
  const firstInnings = useRef({ gmid: null, score: null });
  if (firstInnings.current.gmid !== gmid) {
    firstInnings.current = { gmid, score: null };
  }
  const isSecondInnings = !!battingTeam && battingTeam === team2 && team1 !== team2;
  if (battingTeam && battingTeam === team1) {
    firstInnings.current.score = current;
  }

  const t1Computed = isSecondInnings ? firstInnings.current.score : current;
  let t1Score = t1Computed ? fmt(t1Computed) : "-";
  let t2Score = isSecondInnings ? fmt(current) : "-";

  const shown = isSecondInnings ? current : (battingTeam ? current : null);
  let crr = shown && shown.deliveries > 0
    ? ((shown.runs / shown.deliveries) * ballsPerOver).toFixed(2)
    : "0.00";
  let rr = "";
  let neededText = "";

  // A real scard, when the vendor sends one, overrides everything above.
  const scardStr = typeof scard === "string" ? scard : "";
  if (scardStr && scardStr !== "1" && scardStr.includes(":")) {
    try {
      const parts = scardStr.split("|");
      if (parts[0]) {
        const m1 = parts[0].match(/([^:]+):(.+)/);
        if (m1) { team1 = m1[1]; t1Score = m1[2]; }
      }
      if (parts[1]) {
        const m2 = parts[1].match(/([^:]+):(.+)/);
        if (m2) { team2 = m2[1]; t2Score = m2[2]; }
      }
      if (parts[2]) crr = parts[2];
      if (parts[3]) rr = parts[3];
      if (parts[4]) neededText = parts[4];
    } catch { /* keep the derived values */ }
  }

  // Only meaningful once a target exists — i.e. in the second innings.
  if (!neededText && isSecondInnings && firstInnings.current.score) {
    const need = firstInnings.current.score.runs - current.runs + 1;
    const ballsLeft = ballsPerOver - current.deliveries;
    if (need > 0 && ballsLeft > 0) {
      neededText = `${team2} Needed ${need} runs from ${ballsLeft} balls`;
    }
  }

  return (
    <div className="scorecard mb-1">
      <div className="row">
        <div className="col-12 col-md-6">
          <p className="team-1 row">
            <span className="team-name col-3">{team1}</span>
            <span className="score col-4 text-end">{t1Score}</span>
            <span className="team-name col-5">
              <span>CRR {crr} </span>
              {rr && <span>RR {rr}</span>}
            </span>
          </p>
          <p className="team-1 row mt-2">
            <span className="team-name col-3">{team2}</span>
            <span className="score col-4 text-end">{t2Score}</span>
            <span className="team-name col-5"></span>
          </p>
        </div>
        <div className="col-12 col-md-6">
          <div className="row">
            <div className="col-12">
              <div className="text-xl-end">
                <span>{neededText}</span>
              </div>
              <div className="row">
                <div className="col-12">
                  <p className="text-xl-end ball-by-ball mt-2">
                    {current.ballValues.map((v, i) => (
                      <span key={i} className={`ball-runs${v === "4" ? " four" : v === "6" ? " six" : ""}`}>{v}</span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
