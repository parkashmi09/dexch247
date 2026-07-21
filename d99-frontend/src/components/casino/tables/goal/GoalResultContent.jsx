export default function GoalResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { mtime = "", rdesc = "", rid = "", winnat = "" } = t1;

  // rdesc: "Harry Kane#Shot Goal"
  const parts = rdesc.split("#");
  const player = parts[0] || winnat || "";
  const method = parts[1] || "";
  const displayText = method ? `${method} by ${player}` : player;

  let formattedTime = mtime;
  try {
    const d = new Date(mtime);
    if (!isNaN(d)) {
      formattedTime = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    }
  } catch { /* keep original */ }

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formattedTime}</span>
      </div>
      <div className="row mt-2">
        <div className="text-center">
          <div className="goal-result cricket20ballresult">
            <img src="/assets/img/balls/soccer-ball.png" alt="" />
            <span>{displayText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
