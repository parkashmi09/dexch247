function rankToRuns(code) {
  if (!code) return "";
  const match = code.match(/^(\d+|[AJQK])/);
  if (!match) return "";
  const rank = match[1];
  if (rank === "K") return "W";
  if (rank === "10") return "0";
  if (rank === "A") return "1";
  return rank;
}

export default function SuperOverResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { mtime = "", rid = "", card = "", winnat = "" } = t1;

  // card: pipe-separated, first 4 = innings 1 (IND), next 4 = innings 2 (AUS)
  // Or could be comma-separated with all balls
  const balls = card.includes("|") ? card.split("|") : card.split(",");

  const inn1Balls = balls.slice(0, 4).map((c) => rankToRuns(c?.trim()));
  const inn2Balls = balls.slice(4, 8).map((c) => rankToRuns(c?.trim()));

  function calcScore(runs) {
    let total = 0, wickets = 0;
    runs.forEach((r) => {
      if (r === "W") wickets++;
      else { const n = parseInt(r, 10); if (!isNaN(n)) total += n; }
    });
    return { total, wickets, runPerOver: total };
  }

  const inn1 = calcScore(inn1Balls);
  const inn2 = calcScore(inn2Balls);

  const team1 = "IND";
  const team2 = "AUS";
  const winner = winnat || (inn1.total > inn2.total ? team1 : inn2.total > inn1.total ? team2 : "TIE");

  let formattedTime = mtime;
  try {
    const d = new Date(mtime);
    if (!isNaN(d)) {
      formattedTime = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    }
  } catch { /* keep original */ }

  function renderInning(team, ballRuns, score) {
    return (
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>{team}</th>
              {[1, 2, 3, 4].map((n) => <th key={n} className="text-center">{n}</th>)}
              <th className="text-center">Run/Over</th>
              <th className="text-center">Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Over 1</td>
              {ballRuns.map((r, i) => (
                <td key={i} className="text-center"><span>{r || ""}</span></td>
              ))}
              <td className="text-center">{score.runPerOver}</td>
              <td className="text-center">{score.total}/{score.wickets}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formattedTime}</span>
      </div>
      <div className="five-cricket-result">
        <div className="mt-2">
          <div className="text-end score-head">
            Winner:<span className="text-fancy"> {winner}</span> | {team1} : {inn1.total} | {team2} : {inn2.total}
          </div>
        </div>
        <div className="mt-2">
          <h4>First Inning</h4>
          {renderInning(team1, inn1Balls, inn1)}
        </div>
        <div className="mt-2">
          <h4>Second Inning</h4>
          {renderInning(team2, inn2Balls, inn2)}
        </div>
      </div>
    </div>
  );
}
