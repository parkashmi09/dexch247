function formatAmount(n) {
  if (!n && n !== 0) return "";
  if (n >= 100000) return `${n / 100000}L`;
  if (n >= 1000) return `${n / 1000}K`;
  return String(n);
}

function isOddsEmpty(v) {
  return !v || Number(v) === 0;
}

function BookmakerMarket({ market, onBet, exposures }) {
  if (!market) return null;
  const sections = market.section || [];
  const min = market.min || 0;
  const max = market.max || 0;

  return (
    <div className="game-market market-2 ">
      <div className="market-title"><span>Bookmaker</span></div>
      <div className="market-header">
        <div className="market-nation-detail">
          <span className="market-nation-name">Min: {formatAmount(min)} Max: {formatAmount(max)}</span>
        </div>
        <div className="market-odd-box back"><b>Back</b></div>
        <div className="market-odd-box lay"><b>Lay</b></div>
      </div>
      <div className="market-body " data-title="OPEN">
        {sections.map((sec) => {
          const backOdd = sec.odds?.find((o) => o.otype === "back");
          const layOdd = sec.odds?.find((o) => o.otype === "lay");
          const backVal = backOdd?.odds;
          const layVal = layOdd?.odds;
          const suspended = sec.gstatus === "SUSPENDED" || sec.gstatus === "Ball Running";
          const exp = exposures?.[sec.nat] || 0;

          return (
            <div key={sec.sid} className={`market-row${suspended ? " suspended-row" : ""}`} data-title={sec.gstatus}>
              <div className="market-nation-detail">
                <span className="market-nation-name">{sec.nat}</span>
                <div className="market-nation-book">
                  {exp !== 0 && <span className={exp >= 0 ? "text-success" : "text-danger"}>{Math.round(exp)}</span>}
                </div>
              </div>
              <div className={`market-odd-box back`}
                onClick={() => !isOddsEmpty(backVal) && !suspended && onBet?.(backVal, sec.nat, { ...sec, _marketName: "Bookmaker", min, max }, "back")}>
                <span className="market-odd">{isOddsEmpty(backVal) || suspended ? "-" : backVal}</span>
                <span className="market-volume">{!isOddsEmpty(backVal) && !suspended ? formatAmount(backOdd?.size) : "0.00"}</span>
              </div>
              <div className={`market-odd-box lay`}
                onClick={() => !isOddsEmpty(layVal) && !suspended && onBet?.(layVal, sec.nat, { ...sec, _marketName: "Bookmaker", min, max }, "lay")}>
                <span className="market-odd">{isOddsEmpty(layVal) || suspended ? "-" : layVal}</span>
                <span className="market-volume">{!isOddsEmpty(layVal) && !suspended ? formatAmount(layOdd?.size) : "0.00"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TieMarket({ item, onBet }) {
  if (!item) return null;
  const suspended = item.gstatus === "SUSPENDED" || item.gstatus === "Ball Running";
  const backOdd = item.odds?.find((o) => o.otype === "back");
  const layOdd = item.odds?.find((o) => o.otype === "lay");
  const tieBack = backOdd?.odds || item.back || 0;
  const tieLay = layOdd?.odds || item.lay || 0;

  return (
    <div className="game-market market-6">
      <div className="market-title"><span>Tie</span></div>
      <div className="row row10">
        <div className="col-md-12">
          <div className="market-header">
            <div className="market-nation-detail"></div>
            <div className="market-odd-box back"><b>Back</b></div>
            <div className="market-odd-box lay"><b>Lay</b></div>
            <div className="fancy-min-max-box"></div>
          </div>
        </div>
      </div>
      <div className="market-body " data-title="OPEN">
        <div className="row row10">
          <div className="col-md-12">
            <div className="fancy-market " data-title="ACTIVE">
              <div className="market-row">
                <div className="market-nation-detail">
                  <span className="market-nation-name">Tie</span>
                  <div className="market-nation-book"></div>
                </div>
                <div className={`market-odd-box back`}
                  onClick={() => !isOddsEmpty(tieBack) && !suspended && onBet?.(tieBack, "Tie", { ...item, _marketName: "Tie" }, "back")}>
                  <span className="market-odd">{isOddsEmpty(tieBack) || suspended ? "-" : tieBack}</span>
                  <span className="market-volume">{!isOddsEmpty(tieBack) && !suspended ? formatAmount(item.min) : ""}</span>
                </div>
                <div className={`market-odd-box lay`}
                  onClick={() => !isOddsEmpty(tieLay) && !suspended && onBet?.(tieLay, "Tie", { ...item, _marketName: "Tie" }, "lay")}>
                  <span className="market-odd">{isOddsEmpty(tieLay) || suspended ? "-" : tieLay}</span>
                  <span className="market-volume">{!isOddsEmpty(tieLay) && !suspended ? formatAmount(item.min) : ""}</span>
                </div>
                <div className="fancy-min-max-box">
                  <div className="fancy-min-max">
                    <span className="w-100 d-block">Min: {formatAmount(item.min)}</span>
                    <span className="w-100 d-block">Max: {formatAmount(item.max)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fancy1Market({ items, onBet }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="game-market market-6">
      <div className="market-title"><span>Fancy1</span></div>
      <div className="row row10">
        <div className="col-md-6">
          <div className="market-header">
            <div className="market-nation-detail"></div>
            <div className="market-odd-box back"><b>Back</b></div>
            <div className="market-odd-box lay"><b>Lay</b></div>
            <div className="fancy-min-max-box"></div>
          </div>
        </div>
        <div className="col-md-6 d-none d-xl-block">
          <div className="market-header">
            <div className="market-nation-detail"></div>
            <div className="market-odd-box back"><b>Back</b></div>
            <div className="market-odd-box lay"><b>Lay</b></div>
            <div className="fancy-min-max-box"></div>
          </div>
        </div>
      </div>
      <div className="market-body " data-title="OPEN">
        <div className="row row10">
          {items.map((item) => {
            const suspended = item.gstatus === "SUSPENDED" || item.gstatus === "Ball Running";
            // Extract odds from odds array OR direct fields
            const backOdd = item.odds?.find((o) => o.otype === "back");
            const layOdd = item.odds?.find((o) => o.otype === "lay");
            const backVal = backOdd?.odds || item.back || 0;
            const layVal = layOdd?.odds || item.lay || 0;
            const backSize = backOdd?.size || item.min || 0;
            const laySize = layOdd?.size || 0;
            return (
              <div key={item.sid || item.psid} className="col-md-6">
                <div className={`fancy-market${suspended ? " suspended-row" : " "}`} data-title={suspended ? "SUSPENDED" : "ACTIVE"}>
                  <div className="market-row">
                    <div className="market-nation-detail">
                      <span className="market-nation-name">{item.nat}</span>
                      <div className="market-nation-book"></div>
                    </div>
                    <div className={`market-odd-box back `}
                      onClick={() => !isOddsEmpty(backVal) && !suspended && onBet?.(backVal, item.nat, { ...item, _marketName: "Fancy1" }, "back")}>
                      <span className="market-odd">{isOddsEmpty(backVal) || suspended ? "-" : backVal}</span>
                      {!isOddsEmpty(backVal) && !suspended && <span className="market-volume">{formatAmount(backSize)}</span>}
                    </div>
                    <div className={`market-odd-box lay `}
                      onClick={() => !isOddsEmpty(layVal) && !suspended && onBet?.(layVal, item.nat, { ...item, _marketName: "Fancy1" }, "lay")}>
                      <span className="market-odd">{isOddsEmpty(layVal) || suspended ? "-" : layVal}</span>
                      {!isOddsEmpty(layVal) && !suspended && <span className="market-volume">{formatAmount(laySize)}</span>}
                    </div>
                    <div className="fancy-min-max-box">
                      <div className="fancy-min-max">
                        <span className="w-100 d-block">Min: {formatAmount(item.min)}</span>
                        <span className="w-100 d-block">Max: {formatAmount(item.max)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FancyMarket({ market, onBet, exposures }) {
  if (!market) return null;
  const sections = market.section || [];
  if (sections.length === 0) return null;

  return (
    <div className="game-market market-6">
      <div className="market-title"><span>Fancy</span></div>
      <div className="market-header">
        <div className="market-nation-detail"></div>
        <div className="market-odd-box lay"><b>No</b></div>
        <div className="market-odd-box back"><b>Yes</b></div>
        <div className="fancy-min-max-box"></div>
      </div>
      <div className="market-body " data-title="OPEN">
        {sections.map((sec) => {
          const suspended = sec.gstatus === "SUSPENDED" || sec.gstatus === "Ball Running";
          const backOdd = sec.odds?.find((o) => o.otype === "back");
          const layOdd = sec.odds?.find((o) => o.otype === "lay");
          const backVal = backOdd?.odds;
          const layVal = layOdd?.odds;
          const laySize = layOdd?.size || 0;
          const backSize = backOdd?.size || 0;

          return (
            <div key={sec.sid}>
              <div className={`fancy-market${suspended ? " suspended-row" : " "}`} data-title={suspended ? "SUSPENDED" : "ACTIVE"}>
                <div className="market-row">
                  <div className="market-nation-detail">
                    <span className="market-nation-name pointer">{sec.nat}</span>
                    <div className="market-nation-book"></div>
                  </div>
                  <div className="market-odd-box lay "
                    onClick={() => !isOddsEmpty(layVal) && !suspended && onBet?.(layVal, sec.nat, { ...sec, _marketName: "Fancy" }, "lay")}>
                    <span className="market-odd">{isOddsEmpty(layVal) || suspended ? "-" : layVal}</span>
                    {!isOddsEmpty(layVal) && !suspended && <span className="market-volume">{formatAmount(laySize)}</span>}
                  </div>
                  <div className="market-odd-box back "
                    onClick={() => !isOddsEmpty(backVal) && !suspended && onBet?.(backVal, sec.nat, { ...sec, _marketName: "Fancy" }, "back")}>
                    <span className="market-odd">{isOddsEmpty(backVal) || suspended ? "-" : backVal}</span>
                    {!isOddsEmpty(backVal) && !suspended && <span className="market-volume">{formatAmount(backSize)}</span>}
                  </div>
                  <div className="fancy-min-max-box">
                    <div className="fancy-min-max">
                      <span className="w-100 d-block">Min: {formatAmount(sec.min)}</span>
                      <span className="w-100 d-block">Max: {formatAmount(sec.max)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SuperOverMarkets({ markets = [], onBet, exposures = {} }) {
  const bookmakerMarket = markets.find((m) => m.dtype === 2 || m.gtype === "match1");
  const fancyMarket = markets.find((m) => m.dtype === 6 || m.gtype === "fancy");
  const fancy1Market = markets.find((m) => m.dtype === 7 || m.gtype === "fancy1");

  const fancy1Sections = fancy1Market?.section || [];
  const tieItem = fancy1Sections.find((s) => s.nat === "Tie");
  const fancy1Items = fancy1Sections.filter((s) => s.nat !== "Tie");

  return (
    <>
      <BookmakerMarket market={bookmakerMarket} onBet={onBet} exposures={exposures} />
      <FancyMarket market={fancyMarket} onBet={onBet} exposures={exposures} />
      <TieMarket item={tieItem} onBet={onBet} />
      <Fancy1Market items={fancy1Items} onBet={onBet} />
    </>
  );
}
