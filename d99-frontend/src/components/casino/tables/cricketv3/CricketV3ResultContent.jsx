function parseScoreData(scoreArray) {
  if (!Array.isArray(scoreArray) || scoreArray.length === 0) return { inning1: [], inning2: [] };

  const process = (balls) => {
    const overMap = {};
    let cumRuns = 0, cumWkts = 0;
    balls.forEach((ball) => {
      const ov = ball.oc || 1;
      if (!overMap[ov]) overMap[ov] = { over: ov, team: ball.nat || "", balls: [], runs: 0, wickets: 0 };
      const isWkt = !!ball.wkt;
      const r = ball.run || 0;
      overMap[ov].balls.push(isWkt ? "ww" : String(r));
      overMap[ov].runs += r;
      if (isWkt) overMap[ov].wickets++;
      cumRuns += r;
      if (isWkt) cumWkts++;
      overMap[ov].cumRuns = cumRuns;
      overMap[ov].cumWkts = cumWkts;
    });
    return Object.values(overMap).sort((a, b) => a.over - b.over);
  };

  const inn1 = scoreArray.filter((b) => (b.ing || 1) === 1).sort((a, b) => (a.oc || 1) - (b.oc || 1));
  const inn2 = scoreArray.filter((b) => (b.ing || 1) === 2).sort((a, b) => (a.oc || 1) - (b.oc || 1));
  return { inning1: process(inn1), inning2: process(inn2) };
}

function parseRdesc(rdesc) {
  if (!rdesc) return {};
  const parts = rdesc.split("|");
  const result = {};
  parts.forEach((p) => {
    const m = p.trim().match(/(\w+)\s*:\s*(\d+)/);
    if (m) {
      if (!result.t1Name) { result.t1Name = m[1]; result.t1Score = parseInt(m[2]) || 0; }
      else { result.t2Name = m[1]; result.t2Score = parseInt(m[2]) || 0; }
    }
  });
  return result;
}

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

function InningTable({ title, teamName, overs }) {
  if (!overs.length) return null;
  return (
    <div className="mt-2">
      <h4>{title}</h4>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>{teamName}</th>
              <th className="text-center">1</th>
              <th className="text-center">2</th>
              <th className="text-center">3</th>
              <th className="text-center">4</th>
              <th className="text-center">5</th>
              <th className="text-center">6</th>
              <th className="text-center">Run/Over</th>
              <th className="text-center">Score</th>
            </tr>
          </thead>
          <tbody>
            {overs.map((ov) => (
              <tr key={ov.over}>
                <td>Over {ov.over}</td>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <td key={i} className="text-center">
                    {ov.balls[i] != null && (
                      <span className={ov.balls[i] === "ww" ? "text-danger" : ""}>{ov.balls[i]}</span>
                    )}
                  </td>
                ))}
                <td className="text-center">{ov.runs}</td>
                <td className="text-center">{ov.cumRuns}/{ov.cumWkts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CricketV3ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { score, rdesc = "", mtime = "", rid = "", winnat = "" } = t1;

  const { inning1, inning2 } = parseScoreData(score);
  const rd = parseRdesc(rdesc);

  const team1Name = inning1[0]?.team || rd.t1Name || "Team 1";
  const team2Name = inning2[0]?.team || rd.t2Name || "Team 2";
  const winner = winnat || "";
  const scoreDisplay = rdesc || `${team1Name} : ${rd.t1Score || 0} | ${team2Name} : ${rd.t2Score || 0}`;

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formatTime(mtime)}</span>
      </div>
      <div className="five-cricket-result">
        <div className="mt-2">
          <div className="text-end score-head">
            Winner:<span className="text-fancy"> {winner}</span> | {scoreDisplay}
          </div>
        </div>
        <InningTable title="First Inning" teamName={team1Name} overs={inning1} />
        <InningTable title="Second Inning" teamName={team2Name} overs={inning2} />
      </div>
    </div>
  );
}
