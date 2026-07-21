import { useMemo } from "react";

function parseScard(scard) {
  const result = { t1Name: "AUS", t1Score: "0-0 (0.0)", t2Name: "IND", t2Score: "0-0 (0.0)", crr: "", rr: "", balls: [] };
  if (!scard) return result;
  try {
    const parts = scard.split("|");
    if (parts[0]) {
      const m = parts[0].match(/([^:]+):(.+)/);
      if (m) { result.t1Name = m[1]; result.t1Score = m[2]; }
    }
    if (parts[1]) {
      const m = parts[1].match(/([^:]+):(.+)/);
      if (m) { result.t2Name = m[1]; result.t2Score = m[2]; }
    }
    if (parts[2]) result.crr = parts[2];
    if (parts[3]) result.rr = parts[3];
  } catch { /* ignore */ }
  return result;
}

function parseBallByBall(ballStr) {
  if (!ballStr) return [];
  return ballStr.split(",").map((b) => b.trim()).filter(Boolean);
}

function ballClass(val) {
  const v = val.toLowerCase();
  if (v === "4") return "four";
  if (v === "6") return "six";
  if (v.includes("w")) return "wicket";
  return "";
}

export default function CricketV3Scorecard({ scard, ballByBall }) {
  const sc = useMemo(() => parseScard(scard), [scard]);
  const balls = useMemo(() => parseBallByBall(ballByBall), [ballByBall]);

  return (
    <div className="scorecard mb-1">
      <div className="row">
        <div className="col-12 col-md-6">
          <p className="team-1 row">
            <span className="team-name col-3">{sc.t1Name}</span>
            <span className="score col-4 text-end">{sc.t1Score}</span>
            <span className="team-name col-5">
              {sc.crr && <span>CRR {sc.crr} </span>}
            </span>
          </p>
          <p className="team-1 row mt-2">
            <span className="team-name col-3">{sc.t2Name}</span>
            <span className="score col-4 text-end">{sc.t2Score}</span>
            <span className="team-name col-5">
              {sc.rr && <span>RR {sc.rr}</span>}
            </span>
          </p>
        </div>
        <div className="col-12 col-md-6">
          <div className="row">
            <div className="col-12">
              <div className="text-xl-end"></div>
              <div className="row">
                <div className="col-12">
                  <p className="text-xl-end ball-by-ball mt-2">
                    {balls.map((b, i) => (
                      <span key={i} className={`ball-runs${ballClass(b) ? ` ${ballClass(b)}` : ""}`}>{b}</span>
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
