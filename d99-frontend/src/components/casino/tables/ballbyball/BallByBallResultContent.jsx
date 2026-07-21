function formatTime(mtime) {
  if (!mtime) return "01/01/1900 00:00:00";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

export default function BallByBallResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { win = "", rdesc = "", mtime = "", rid = "" } = t1;

  const resultText = rdesc || (win ? `${win} Runs` : "");

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formatTime(mtime)}</span>
      </div>
      <div className="row mt-2">
        <div className="text-center">
          <div className="cricket20ballpopup cricket20ballresult">
            <img src="/assets/img/balls/ball-blank.png" alt="" />
            <span>{resultText || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
