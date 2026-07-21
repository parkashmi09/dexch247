const DICE_BASE = "/assets/img/dice";

export default function DoliDanaResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rdesc = "", rid = "", win = "", winnat = "" } = t1;

  // rdesc: "Player B#No#-#9#Odd#Greater than 7"
  const parts = rdesc.split("#");
  const turn = parts[0] || "";
  const anyPair = parts[1] || "";
  const particularPair = parts[2] || "-";
  const sumTotal = parts[3] || win || "";
  const oddEven = parts[4] || "";
  const lucky7 = parts[5] || "";

  const tokens = card.split(",").map((t) => t.trim()).filter(Boolean);

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

      <div className="row mt-2 align-items-center">
        <div className="col-md-6 text-center">
          <div className="casino-result-cards">
            {tokens.map((t, i) => (
              <img key={i} src={`${DICE_BASE}/dice${t}.png`} alt="" />
            ))}
          </div>
        </div>
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Turn</div>
              <div>{turn}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Any Pair</div>
              <div>{anyPair}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Particular Pair</div>
              <div>{particularPair}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Sum Total</div>
              <div>{sumTotal}</div>
            </div>
            {oddEven && (
              <div className="casino-result-desc-item">
                <div>Odd/Even</div>
                <div>{oddEven}</div>
              </div>
            )}
            {lucky7 && (
              <div className="casino-result-desc-item">
                <div>Lucky 7</div>
                <div>{lucky7}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
