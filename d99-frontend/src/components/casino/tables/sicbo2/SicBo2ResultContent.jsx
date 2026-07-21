export default function SicBo2ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { mtime = "", rid = "", rdesc = "", win = "" } = t1;

  // rdesc: "3,4,4" (individual dice values)
  const diceValues = rdesc ? rdesc.split(",").map((d) => d.trim()) : [];

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
        <div className="col-md-12 text-center">
          <div className="casino-result-cards">
            {diceValues.map((val, i) => (
              <img key={i} src={`/assets/img/dice/dice${val}.png`} alt={`Dice ${val}`} />
            ))}
          </div>
        </div>
      </div>
      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Desc</div>
              <div>{rdesc}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Win</div>
              <div>{win}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
