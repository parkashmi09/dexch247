function formatAmount(n) {
  if (!n && n !== 0) return "";
  // Show the full amount (e.g. 300000) rather than an abbreviation (3L / 10K).
  return String(n);
}

function isOddsEmpty(v) {
  return !v || Number(v) === 0;
}

// ---------------------------------------------------------------------------
// Session ("Fancy") lines price differently to every other market here.
//
// A Fancy section quotes a RUN LINE plus a RATE, not a decimal price:
//   odds → the line, e.g. 12 runs   (this is NOT a price)
//   size → the rate in bps, e.g. 75 back / 85 lay
// Same convention the reports side already documents — see
// d99-server/controller/admin/reportsController.js → computeProfit CASE 2:
// "`size` is the rate in bps; `odds` is NOT a decimal. profit = stake × size/100".
//
// Passing the LINE through as the price is what broke the P/L: a 100 stake was
// booked at odds 12, so placement locked stake×(12−1) = 1100 on a lay and
// settlement paid 1100 on a winning back, instead of the 75 the rate quotes.
//
// Converting to a decimal keeps the whole existing back/lay pipeline correct
// without special-casing settlement — stake×(decimal−1) == stake×rate/100:
//   back wins  → +stake × rate/100      lay loses → −stake × rate/100
//   lay  wins  → +stake                 back loses → −stake
// Mirrors how Trio Session and Patti2 Total already convert bhav in
// hooks/useCasinoGame.js (decimal = bhav/100 + 1).
export function sessionRateToDecimal(rate) {
  const r = Number(rate) || 0;
  return r > 0 ? r / 100 + 1 : 0;
}

// ---------------------------------------------------------------------------
// Book display
// The per-runner book (profit under the backed runner, worst-case exposure under
// the others; fancy/session worst case) is computed and stored SERVER-SIDE at
// placement — see d99-server/helper/casinoMarketBook.js + CasinoService.placeBet.
// The page polls it via getMatchExposure and passes it down as `exposures`; this
// component only renders whatever the server holds for each runner.
// ---------------------------------------------------------------------------
function getExisting(exposures, nat) {
  if (!nat || !exposures) return 0;
  const key = String(nat);
  return Number(exposures[key] ?? exposures[key.toLowerCase()] ?? 0) || 0;
}

// Renders the runner's stored book — green for profit, red for exposure.
function NationBook({ value }) {
  const n = Number(value);
  if (!Number.isFinite(n) || Math.round(n) === 0) return null;
  return <span className={`market-book ${n >= 0 ? "text-success" : "text-danger"}`}>{Math.round(n)}</span>;
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
          const exp = getExisting(exposures, sec.nat);

          return (
            <div key={sec.sid} className={`market-row${suspended ? " suspended-row" : ""}`} data-title={sec.gstatus}>
              <div className="market-nation-detail">
                <span className="market-nation-name">{sec.nat}</span>
                <div className="market-nation-book">
                  <NationBook value={exp} />
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

function TieMarket({ item, onBet, exposures }) {
  if (!item) return null;
  const suspended = item.gstatus === "SUSPENDED" || item.gstatus === "Ball Running";
  const backOdd = item.odds?.find((o) => o.otype === "back");
  const layOdd = item.odds?.find((o) => o.otype === "lay");
  const tieBack = backOdd?.odds || item.back || 0;
  const tieLay = layOdd?.odds || item.lay || 0;
  const tieExp = getExisting(exposures, item.nat || "Tie");

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
            {/* Was hardcoded `data-title="ACTIVE"` with no suspended class, so a
                suspended Tie never drew the SUSPENDED overlay (.suspended-row::after
                renders attr(data-title)) — the odds just blanked to "-" with no
                lock. Matches Fancy / Fancy1 / Bookmaker now. */}
            <div className={`fancy-market${suspended ? " suspended-row" : " "}`} data-title={suspended ? "SUSPENDED" : "ACTIVE"}>
              <div className="market-row">
                <div className="market-nation-detail">
                  <span className="market-nation-name">Tie</span>
                  <div className="market-nation-book">
                    <NationBook value={tieExp} />
                  </div>
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

function Fancy1Market({ items, onBet, exposures }) {
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
            const exp = getExisting(exposures, item.nat);
            return (
              <div key={item.sid || item.psid} className="col-md-6">
                <div className={`fancy-market${suspended ? " suspended-row" : " "}`} data-title={suspended ? "SUSPENDED" : "ACTIVE"}>
                  <div className="market-row">
                    <div className="market-nation-detail">
                      <span className="market-nation-name">{item.nat}</span>
                      <div className="market-nation-book">
                        <NationBook value={exp} />
                      </div>
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
          const exp = getExisting(exposures, sec.nat);

          return (
            <div key={sec.sid}>
              <div className={`fancy-market${suspended ? " suspended-row" : " "}`} data-title={suspended ? "SUSPENDED" : "ACTIVE"}>
                <div className="market-row">
                  <div className="market-nation-detail">
                    <span className="market-nation-name pointer">{sec.nat}</span>
                    <div className="market-nation-book">
                      <NationBook value={exp} />
                    </div>
                  </div>
                  {/* Bet at the RATE converted to a decimal; keep showing the
                      LINE big and the rate small, which is what the site shows. */}
                  <div className="market-odd-box lay "
                    onClick={() => !isOddsEmpty(layVal) && !isOddsEmpty(laySize) && !suspended && onBet?.(
                      sessionRateToDecimal(laySize), sec.nat,
                      { ...sec, _marketName: "Fancy", _sessionRate: true, _displayOdds: layVal }, "lay")}>
                    <span className="market-odd">{isOddsEmpty(layVal) || suspended ? "-" : layVal}</span>
                    {!isOddsEmpty(layVal) && !suspended && <span className="market-volume">{formatAmount(laySize)}</span>}
                  </div>
                  <div className="market-odd-box back "
                    onClick={() => !isOddsEmpty(backVal) && !isOddsEmpty(backSize) && !suspended && onBet?.(
                      sessionRateToDecimal(backSize), sec.nat,
                      { ...sec, _marketName: "Fancy", _sessionRate: true, _displayOdds: backVal }, "back")}>
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
      <TieMarket item={tieItem} onBet={onBet} exposures={exposures} />
      <Fancy1Market items={fancy1Items} onBet={onBet} exposures={exposures} />
    </>
  );
}
