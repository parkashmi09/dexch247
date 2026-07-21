function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExposureSpan({ exposures, nat }) {
  const raw = getExp(exposures, nat);
  if (raw === null || raw === undefined) return null;
  const n = parseFloat(raw);
  if (isNaN(n) || n === 0) return null;
  return (
    <div style={{ color: n < 0 ? "#ff0000" : "#00ff00", fontSize: 10, marginTop: 2 }}>
      {n < 0 ? n.toFixed(2) : `+${n.toFixed(2)}`}
    </div>
  );
}

function isSus(item) {
  return !item || item.gstatus !== "OPEN";
}

export default function BetTableDT6({ tableData = [], onBetClick, exposures = {} }) {
  const find = (nat) => tableData.find((d) => d.nat === nat);

  const dragon = find("Dragon");
  const tiger = find("Tiger");
  const pair = find("Pair");

  const dragonEven = find("Dragon Even");
  const dragonOdd = find("Dragon Odd");
  const dragonRed = find("Dragon Red");
  const dragonBlack = find("Dragon Black");

  const tigerEven = find("Tiger Even");
  const tigerOdd = find("Tiger Odd");
  const tigerRed = find("Tiger Red");
  const tigerBlack = find("Tiger Black");

  const dragonSpade = find("Dragon Spade");
  const dragonHeart = find("Dragon Heart");
  const dragonClub = find("Dragon Club");
  const dragonDiamond = find("Dragon Diamond");

  const tigerSpade = find("Tiger Spade");
  const tigerHeart = find("Tiger Heart");
  const tigerClub = find("Tiger Club");
  const tigerDiamond = find("Tiger Diamond");

  function renderBackLayRow(item, label) {
    const susBk = isSus(item);
    const susLay = isSus(item);
    const nat = item?.nat || label;
    const backOdds = susBk ? 0 : (item?.b || 0);
    const layOdds = susLay ? 0 : (item?.l || 0);

    return (
      <div className="casino-table-row">
        <div className="casino-nation-detail">
          <div className="casino-nation-name">{label}</div>
          <ExposureSpan exposures={exposures} nat={nat} />
        </div>
        <div
          className={`casino-odds-box back${susBk ? " suspended-box" : ""}`}
          onClick={() => !susBk && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")}
        >
          <span className="casino-odds">{backOdds}</span>
        </div>
        <div
          className={`casino-odds-box lay${susLay ? " suspended-box" : ""}`}
          onClick={() => !susLay && item?.l > 0 && onBetClick?.(item.l, nat, item, "lay")}
        >
          <span className="casino-odds">{layOdds}</span>
        </div>
      </div>
    );
  }

  function renderBackRow(item, label) {
    const sus = isSus(item);
    const nat = item?.nat || label;
    const odds = sus ? 0 : (item?.b || 0);

    return (
      <div className="casino-table-row">
        <div className="casino-nation-detail">
          <div className="casino-nation-name">{label}</div>
          <ExposureSpan exposures={exposures} nat={nat} />
        </div>
        <div
          className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")}
        >
          <span className="casino-odds">{odds}</span>
        </div>
      </div>
    );
  }

  function renderEvenOddRow(evenItem, oddItem, label) {
    const susEven = isSus(evenItem);
    const susOdd = isSus(oddItem);
    const evenNat = evenItem?.nat || `${label} Even`;
    const oddNat = oddItem?.nat || `${label} Odd`;
    const evenOdds = susEven ? 0 : (evenItem?.b || 0);
    const oddOdds = susOdd ? 0 : (oddItem?.b || 0);

    return (
      <div className="casino-table-row">
        <div className="casino-nation-detail">
          <div className="casino-nation-name">{label}</div>
        </div>
        <div
          className={`casino-odds-box back${susEven ? " suspended-box" : ""}`}
          onClick={() => !susEven && evenItem?.b > 0 && onBetClick?.(evenItem.b, evenNat, evenItem, "back")}
        >
          <span className="casino-odds">{evenOdds}</span>
          <ExposureSpan exposures={exposures} nat={evenNat} />
        </div>
        <div
          className={`casino-odds-box back${susOdd ? " suspended-box" : ""}`}
          onClick={() => !susOdd && oddItem?.b > 0 && onBetClick?.(oddItem.b, oddNat, oddItem, "back")}
        >
          <span className="casino-odds">{oddOdds}</span>
          <ExposureSpan exposures={exposures} nat={oddNat} />
        </div>
      </div>
    );
  }

  function renderRedBlackRow(redItem, blackItem, label) {
    const susRed = isSus(redItem);
    const susBlack = isSus(blackItem);
    const redNat = redItem?.nat || `${label} Red`;
    const blackNat = blackItem?.nat || `${label} Black`;
    const redOdds = susRed ? 0 : (redItem?.b || 0);
    const blackOdds = susBlack ? 0 : (blackItem?.b || 0);

    return (
      <div className="casino-table-row">
        <div className="casino-nation-detail">
          <div className="casino-nation-name">{label}</div>
        </div>
        <div
          className={`casino-odds-box back${susRed ? " suspended-box" : ""}`}
          onClick={() => !susRed && redItem?.b > 0 && onBetClick?.(redItem.b, redNat, redItem, "back")}
        >
          <span className="casino-odds">{redOdds}</span>
          <ExposureSpan exposures={exposures} nat={redNat} />
        </div>
        <div
          className={`casino-odds-box back${susBlack ? " suspended-box" : ""}`}
          onClick={() => !susBlack && blackItem?.b > 0 && onBetClick?.(blackItem.b, blackNat, blackItem, "back")}
        >
          <span className="casino-odds">{blackOdds}</span>
          <ExposureSpan exposures={exposures} nat={blackNat} />
        </div>
      </div>
    );
  }

  function renderSuitRow(spadeItem, heartItem, clubItem, diamondItem, label) {
    const items = [
      { item: spadeItem, nat: spadeItem?.nat || `${label} Spade` },
      { item: heartItem, nat: heartItem?.nat || `${label} Heart` },
      { item: clubItem, nat: clubItem?.nat || `${label} Club` },
      { item: diamondItem, nat: diamondItem?.nat || `${label} Diamond` },
    ];

    return (
      <div className="casino-table-row">
        <div className="casino-nation-detail">
          <div className="casino-nation-name">{label}</div>
        </div>
        {items.map(({ item, nat }) => {
          const sus = isSus(item);
          const odds = sus ? 0 : (item?.b || 0);
          return (
            <div
              key={nat}
              className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
              onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")}
            >
              <span className="casino-odds">{odds}</span>
              <ExposureSpan exposures={exposures} nat={nat} />
            </div>
          );
        })}
      </div>
    );
  }

  const pairSus = isSus(pair);
  const pairOdds = pairSus ? 0 : (pair?.b || 0);

  return (
    <div className="casino-table dt1day">
      {/* Section 1: Dragon/Tiger Back & Lay + Pair */}
      <div className="casino-table-box">
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail"></div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            {renderBackLayRow(dragon, "Dragon")}
            {renderBackLayRow(tiger, "Tiger")}
          </div>
        </div>
        <div className="casino-table-right-box dtpair">
          <div className="casino-odds text-center">{pairOdds}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme${pairSus ? " suspended-box" : ""}`}
            onClick={() => !pairSus && pair?.b > 0 && onBetClick?.(pair.b, pair?.nat || "Pair", pair, "back")}
          >
            <span className="casino-odds">Pair</span>
            <ExposureSpan exposures={exposures} nat={pair?.nat || "Pair"} />
          </div>
        </div>
      </div>

      {/* Section 2: Even/Odd + Red/Black */}
      <div className="casino-table-box mt-3">
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail"></div>
            <div className="casino-odds-box back">Even</div>
            <div className="casino-odds-box back">Odd</div>
          </div>
          <div className="casino-table-body">
            {renderEvenOddRow(dragonEven, dragonOdd, "Dragon")}
            {renderEvenOddRow(tigerEven, tigerOdd, "Tiger")}
          </div>
        </div>
        <div className="casino-table-right-box dtredblack">
          <div className="casino-table-header">
            <div className="casino-nation-detail"></div>
            <div className="casino-odds-box back">
              <span>Red</span>
              <span className="card-icon ms-1"><span className="card-red">{"{"}</span></span>
              <span className="card-icon ms-1"><span className="card-red">{"["}</span></span>
            </div>
            <div className="casino-odds-box back">
              <span>Black</span>
              <span className="card-icon ms-1"><span className="card-black">{"}"}</span></span>
              <span className="card-icon ms-1"><span className="card-black">{"]"}</span></span>
            </div>
          </div>
          <div className="casino-table-body">
            {renderRedBlackRow(dragonRed, dragonBlack, "Dragon")}
            {renderRedBlackRow(tigerRed, tigerBlack, "Tiger")}
          </div>
        </div>
      </div>

      {/* Section 3: Individual Suits */}
      <div className="casino-table-full-box dt1day-other-odds mt-3">
        <div className="casino-table-header">
          <div className="casino-nation-detail"></div>
          <div className="casino-odds-box">
            <span className="card-icon ms-1"><span className="card-black">{"}"}</span></span>
          </div>
          <div className="casino-odds-box">
            <span className="card-icon ms-1"><span className="card-red">{"{"}</span></span>
          </div>
          <div className="casino-odds-box">
            <span className="card-icon ms-1"><span className="card-black">{"]"}</span></span>
          </div>
          <div className="casino-odds-box">
            <span className="card-icon ms-1"><span className="card-red">{"["}</span></span>
          </div>
        </div>
        <div className="casino-table-body">
          {renderSuitRow(dragonSpade, dragonHeart, dragonClub, dragonDiamond, "Dragon")}
          {renderSuitRow(tigerSpade, tigerHeart, tigerClub, tigerDiamond, "Tiger")}
        </div>
      </div>

      <div className="casino-remark mt-1">
        <marquee scrollamount="3"> </marquee>
      </div>
    </div>
  );
}
