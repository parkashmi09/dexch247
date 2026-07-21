import { useMemo } from "react";
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

export default function SuperOverScorecard({ team1 = "IND", team2 = "AUS", cardString = "", scard, ballsPerOver = 4 }) {
  const { runs, wickets, deliveries, ballValues } = useMemo(
    () => computeScore(parseBalls(cardString)), [cardString]
  );

  function oversStr(d) {
    return `${Math.floor(d / ballsPerOver)}.${d % ballsPerOver}`;
  }

  // Parse scard if available (from API: "IND:14-0(1.0)|AUS:5-0(0.2)|...")
  let t1Score = `${runs}-${wickets} (${oversStr(deliveries)})`;
  let t2Score = "0-0 (0.0)";
  let crr = deliveries > 0 ? ((runs / deliveries) * ballsPerOver).toFixed(2) : "0.00";
  let rr = "";
  let neededText = "";

  if (scard && scard !== "1") {
    try {
      const parts = scard.split("|");
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
    } catch { /* ignore */ }
  }

  const needsRuns = runs + 1;
  const remainBalls = ballsPerOver - deliveries;

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
                <span>{neededText || (deliveries > 0 ? `${team2} Needed ${needsRuns} runs from ${remainBalls} balls` : "")}</span>
              </div>
              <div className="row">
                <div className="col-12">
                  <p className="text-xl-end ball-by-ball mt-2">
                    {ballValues.map((v, i) => (
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
