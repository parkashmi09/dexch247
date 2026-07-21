/**
 * Bet table for Mogambo – HTML structure and class names match reference UI.
 * Reference CSS: src/styles/casino-table-reference.css
 * Uses global classes: teen1daycasino-container, teen1dayleft, teen1dayright,
 * casino-box-row, casino-nation-name, casino-bl-box, casino-bl-box-item,
 * back, lay, suspended, book-red, casino-min-max.
 */
const BetTableMogambo = ({
  data = [],
  onBetClick,
  exposures = {},
  myBets = [],
}) => {
  const getScore = (name) =>
    data.find((item) => item?.nat === name) || {
      b: 0,
      l: 0,
      bbhav: 0,
      lbhav: 0,
      min: 0,
      max: 0,
      gstatus: "",
    };

  const dagaTeja = getScore("Daga / Teja");
  const mogambo = getScore("Mogambo");
  const cardTotalItem = getScore("3 Card Total");

  /** Format min/max: thousands as K, lakhs as L (e.g. 100000 → 1L, 500000 → 5L) */
  const formatMinMax = (num) => {
    if (num == null || num === "") return "0";
    const n = Number(num);
    if (isNaN(n)) return String(num);
    if (n >= 100000) return `${n / 100000}L`;
    if (n >= 1000) return `${n / 1000}K`;
    return String(n);
  };

  const getExposure = (betType, nat, oddsValue = null, cellBetType = null) => {
    const exposureKeys = [
      nat,
      betType,
      nat?.toLowerCase?.()?.trim?.(),
      betType?.toLowerCase?.()?.trim?.(),
      nat?.replace?.(/\s+/g, " ")?.trim?.(),
    ];
    for (const key of exposureKeys) {
      if (key && exposures[key] !== undefined) return exposures[key];
    }
    if (nat === "3 Card Total" && oddsValue != null) {
      const oddsNum = parseFloat(oddsValue);
      if (!isNaN(oddsNum)) {
        for (const key in exposures) {
          if (!key || !key.startsWith("3 Card Total")) continue;
          const keyMatch = key.match(/3 Card Total\s*(\d+(?:\.\d+)?)/);
          if (keyMatch) {
            const keyOdds = parseFloat(keyMatch[1]);
            if (Math.abs(keyOdds - oddsNum) < 0.01) {
              if (cellBetType && myBets?.length > 0) {
                const hasMatch = myBets.some((bet) => {
                  const sel = (bet.matchedBet || bet.selection || "").trim().replace(/\s+/g, " ");
                  const normKey = key.replace(/\s+/g, " ");
                  if (sel === normKey || sel.includes(String(keyOdds))) {
                    const bt = (bet.type || "").toLowerCase();
                    return bt === (cellBetType || "").toLowerCase();
                  }
                  return false;
                });
                if (hasMatch) return exposures[key];
                return 0;
              }
              return exposures[key];
            }
          }
        }
      }
    }
    return 0;
  };

  const isSuspended = (item) =>
    !item || item?.gstatus === "SUSPENDED" || item?.gstatus === "0" || (item?.b === 0 && item?.l === 0);

  /** Single back cell (Daga/Teja, Mogambo) – exposure shown in nation-name row only */
  const renderBackCell = (item, label) => {
    const value = item?.b ?? 0;
    const suspended = isSuspended(item);
    const oddDisplay = value ? Number(value).toFixed(2) : "0";

    return (
      <div
        className={`back casino-bl-box-item${suspended ? " suspended" : ""}`}
        onClick={() => !suspended && onBetClick?.(value, label, "back", item)}
      >
        <span className="casino-box-odd">{oddDisplay}</span>
      </div>
    );
  };

  /** 3 Card Total: lay and back cells with two numbers each (odd + small value); exposure in row header */
  const renderTotalCell = (item, label, type) => {
    const isLay = type === "lay";
    const value = isLay ? (item?.l ?? 0) : (item?.b ?? 0);
    const smallVal = isLay ? (item?.lbhav ?? 0) : (item?.bbhav ?? 0);
    const suspended = isSuspended(item) || value === 0;

    return (
      <div
        className={`${isLay ? "lay" : "back"} casino-bl-box-item${suspended ? " suspended" : ""}`}
        onClick={() => !suspended && onBetClick?.(value, label, type, item)}
      >
        <span className="casino-box-odd">{value}</span>
        <span>{smallVal}</span>
      </div>
    );
  };

  const renderExposure = (exposure) => {
    const val = exposure !== 0 && exposure != null ? (exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`) : "0";
    return (
      <div className="float-right">
        <span className="mr-2 book-red">{val}</span>
      </div>
    );
  };

  return (
    <div className="d-none-small casino-table mogambo">
      <div className="teen1daycasino-container">
        {/* Daga / Teja – structure matches reference exactly */}
        <div className="teen1dayleft">
          <div className="casino-box-row">
            <div className="casino-nation-name">
              <b>Daga / Teja</b>{" "}
              {renderExposure(getExposure("Daga / Teja", dagaTeja?.nat))}
            </div>
            <div className="casino-bl-box casino-bl-boxfull">
              {renderBackCell(dagaTeja, "Daga / Teja")}
            </div>
          </div>
          <div className="text-right casino-min-max">
            R:<span>{formatMinMax(dagaTeja?.min)}</span>-<span>{formatMinMax(dagaTeja?.max)}</span>
          </div>
        </div>

        {/* Mogambo */}
        <div className="teen1dayright">
          <div className="casino-box-row">
            <div className="casino-nation-name">
              <b>Mogambo</b>{" "}
              {renderExposure(getExposure("Mogambo", mogambo?.nat))}
            </div>
            <div className="casino-bl-box casino-bl-boxfull">
              {renderBackCell(mogambo, "Mogambo")}
            </div>
          </div>
          <div className="text-right casino-min-max">
            R:<span>{formatMinMax(mogambo?.min)}</span>-<span>{formatMinMax(mogambo?.max)}</span>
          </div>
        </div>

        {/* 3 Card Total – lay then back, min-max with w-100 */}
        <div className="casino-box-row three-card-total">
          <div className="casino-nation-name">
            <b className="pointer">3 Card Total</b>{" "}
            {renderExposure(
              getExposure("3 Card Total", cardTotalItem?.nat, cardTotalItem?.b, "back") +
                getExposure("3 Card Total", cardTotalItem?.nat, cardTotalItem?.l, "lay")
            )}
          </div>
          <div className="casino-bl-box">
            {renderTotalCell(cardTotalItem, "3 Card Total", "lay")}
            {renderTotalCell(cardTotalItem, "3 Card Total", "back")}
          </div>
          <div className="text-right casino-min-max w-100">
            R:<span>{formatMinMax(cardTotalItem?.min)}</span>-<span>{formatMinMax(cardTotalItem?.max)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetTableMogambo;
