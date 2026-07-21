import styles from "./BetTableSuper3.module.css";

const formatAmount = (amount) => {
  if (!amount || isNaN(amount)) return "";
  if (amount >= 100000) return amount / 100000 + "L";
  return Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

const getFallbackData = () => {
  const dummyOdds = [
    { nat: "IND", odds: [{ otype: "back", odds: 0, size: null }, { otype: "lay", odds: 0, size: null }], min: 100, max: 300000 },
    { nat: "ENG", odds: [{ otype: "back", odds: 0, size: null }, { otype: "lay", odds: 0, size: null }], min: 100, max: 300000 },
  ];
  const fancyDummy = [
    { nat: "Common Wicket ENG", odds: [{ otype: "back", odds: 0, size: null }, { otype: "lay", odds: 0, size: null }], min: 100, max: 100000 },
    { nat: "Common Wicket ENG", odds: [{ otype: "back", odds: 0, size: null }, { otype: "lay", odds: 0, size: null }], min: 100, max: 100000 },
  ];
  return {
    bookmaker: dummyOdds,
    fancy: fancyDummy,
    fancy1: fancyDummy,
  };
};

const BetTableSuper3 = ({ data = [], onBetClick, exposures = {}, myBets = [] }) => {
  const bookmakerMarket = data.find((item) => item.gtype === "match1");
  const bookmaker = bookmakerMarket?.section;
  const bookmakerMin = bookmakerMarket?.min;
  const bookmakerMax = bookmakerMarket?.max;
  const fancy = data.find((item) => item.gtype === "fancy")?.section;
  const fancy1Raw = data.find((item) => item.gtype === "fancy1")?.section;
  const fancy1 = (fancy1Raw || []).filter((item) => item.nat?.toLowerCase() !== "tie");
  const fallback = getFallbackData();

  const getExposure = (selectionName) => {
    if (!selectionName) return 0;
    const exposureKeys = [
      selectionName,
      selectionName?.trim(),
      selectionName?.toLowerCase(),
      selectionName?.toLowerCase()?.trim(),
      selectionName?.toUpperCase(),
      selectionName?.toUpperCase()?.trim(),
    ];
    for (const key of exposureKeys) {
      if (key && exposures[key] !== undefined) return exposures[key];
    }
    return 0;
  };

  const formatSize = (val) => {
    if (val == null || val === "") return "";
    const n = Number(val);
    if (isNaN(n)) return String(val);
    if (n >= 100000) return n / 100000 + "L";
    if (n >= 1000) return n / 1000 + "K";
    return String(n);
  };

  const renderOddsCell = (value, size, isSuspended, typeClass, label, clickType, item) => {
    const noVal = isSuspended || value === 0;
    return (
      <div
        className={`${styles.betBox} ${styles[typeClass]} ${noVal ? styles.suspended : ""}`}
        onClick={() => !noVal && onBetClick?.(value, label, clickType, item)}
        style={{ cursor: noVal ? "not-allowed" : "pointer" }}
      >
        <span className={styles.odds}>{noVal ? "—" : value ?? "—"}</span>
        {!noVal && size != null && size !== "" && (
          <span className={styles.volume}>{formatSize(size)}</span>
        )}
      </div>
    );
  };

  const renderBookmakerSection = () => {
    const items = bookmaker || fallback.bookmaker;
    if (!items?.length) return null;
    const first = items[0];
    const min = bookmakerMin ?? first?.min;
    const max = bookmakerMax ?? first?.max;
    const maxBetStr = (min != null && max != null) ? `Min: ${formatAmount(min)}  Max: ${formatAmount(max)}` : "";

    return (
      <section className={styles.section}>
        <div className={styles.header} data-toggle="collapse" data-target="#market0" aria-expanded="true">
          Bookmaker
        </div>
        <div id="market0" className="collapse show">
          <div className={`${styles.tableHeader} ${styles.bookmakerHeader}`}>
            <span className={styles.headerLabel} />
            <span className={styles.headerMinMax}>{maxBetStr}</span>
            <div className={styles.headerOptions}>
              <span className={`${styles.headerCell} ${styles.backHeader}`}>Back</span>
              <span className={`${styles.headerCell} ${styles.layHeader}`}>Lay</span>
            </div>
          </div>
          {items.map((item, idx) => {
            const backObj = item.odds?.find((o) => o.otype === "back");
            const layObj = item.odds?.find((o) => o.otype === "lay");
            const back = backObj?.odds ?? 0;
            const lay = layObj?.odds ?? 0;
            const isSuspended = item.gstatus === "SUSPENDED" || (back === 0 && lay === 0);
            const exposure = getExposure(item.nat);
            const exposureNum = Number(exposure);
            const exposureStr = isNaN(exposureNum) ? "0.00" : (exposureNum >= 0 ? `+${exposureNum.toFixed(2)}` : exposureNum.toFixed(2));

            return (
              <div
                key={idx}
                className={`${styles.optionRow} ${isSuspended ? styles.suspendedRow : ""} ${isSuspended ? styles.bookmakerSuspendedRow : ""}`}
                data-title={isSuspended ? "SUSPENDED" : ""}
              >
                <div className={styles.label}>
                  <span>{item.nat}</span>
                  <span className={styles.exposure} style={{ color: exposureNum >= 0 ? "#0a7c42" : "#c53030" }}>
                    {exposureStr}
                  </span>
                </div>
                <div className={styles.betOptionsWrapper}>
                  <div className={styles.betOptions}>
                    {renderOddsCell(back, backObj?.size, isSuspended, "back", item.nat, "back", item)}
                    {renderOddsCell(lay, layObj?.size, isSuspended, "lay", item.nat, "lay", item)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderFancySection = () => {
    const items = fancy || fallback.fancy;
    if (!items?.length) return null;

    return (
      <section className={styles.section}>
        <div className={styles.header} data-toggle="collapse" data-target="#marketFancy" aria-expanded="true">
          Fancy
        </div>
        <div id="marketFancy" className="collapse show">
          <div className={styles.tableHeader}>
            <span className={styles.headerLabel} />
            <div className={styles.headerOptions}>
              <span className={`${styles.headerCell} ${styles.noHeader}`}>No</span>
              <span className={`${styles.headerCell} ${styles.yesHeader}`}>Yes</span>
            </div>
          </div>
          {items.map((item, idx) => {
            const layObj = item.odds?.find((o) => o.otype === "lay");
            const backObj = item.odds?.find((o) => o.otype === "back");
            const lay = layObj?.odds ?? 0;
            const back = backObj?.odds ?? 0;
            const isSuspended = item.gstatus === "SUSPENDED" || (back === 0 && lay === 0);
            const exposure = getExposure(item.nat);
            const exposureNum = Number(exposure);
            const exposureStr = isNaN(exposureNum) ? "0.00" : (exposureNum >= 0 ? `+${exposureNum.toFixed(2)}` : exposureNum.toFixed(2));

            return (
              <div
                key={idx}
                className={`${styles.optionRow} ${isSuspended ? styles.suspendedRow : ""}`}
                data-title={isSuspended ? "SUSPENDED" : ""}
              >
                <div className={styles.label}>
                  <span>{item.nat}</span>
                  <span className={styles.exposure} style={{ color: exposureNum >= 0 ? "#0a7c42" : "#c53030" }}>
                    {exposureStr}
                  </span>
                </div>
                <div className={styles.betOptionsWrapper}>
                  <div className={styles.betOptions}>
                    {renderOddsCell(lay, layObj?.size, isSuspended, "no", item.nat, "lay", item)}
                    {renderOddsCell(back, backObj?.size, isSuspended, "yes", item.nat, "back", item)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderFancy1Section = () => {
    const items = fancy1?.length ? fancy1 : fallback.fancy1;
    if (!items?.length) return null;

    return (
      <section className={styles.section}>
        <div className={styles.headerRow}>
          <div className={styles.header} data-toggle="collapse" data-target="#market1" aria-expanded="true">
            Fancy1
          </div>
          <a href="javascript:void(0)" className={styles.betLockBtn}>Bet Lock</a>
        </div>
        <div id="market1" className="collapse show">
          <div className={styles.tableHeader}>
            <span className={styles.headerLabel} />
            <div className={styles.headerOptions}>
              <span className={`${styles.headerCell} ${styles.backHeader}`}>Back</span>
              <span className={`${styles.headerCell} ${styles.layHeader}`}>Lay</span>
            </div>
          </div>
          {items.map((item, idx) => {
            const backObj = item.odds?.find((o) => o.otype === "back");
            const layObj = item.odds?.find((o) => o.otype === "lay");
            const back = backObj?.odds ?? 0;
            const lay = layObj?.odds ?? 0;
            const isSuspended = item.gstatus === "SUSPENDED" || (back === 0 && lay === 0);
            const exposure = getExposure(item.nat);
            const exposureNum = Number(exposure);
            const exposureStr = isNaN(exposureNum) ? "0.00" : (exposureNum >= 0 ? `+${exposureNum.toFixed(2)}` : exposureNum.toFixed(2));

            return (
              <div
                key={idx}
                className={`${styles.optionRow} ${isSuspended ? styles.suspendedRow : ""} ${isSuspended ? styles.fancy1SuspendedRow : ""}`}
                data-title={isSuspended ? "SUSPENDED" : ""}
              >
                <div className={styles.label}>
                  <span>{item.nat}</span>
                  <span className={styles.exposure} style={{ color: exposureNum >= 0 ? "#0a7c42" : "#c53030" }}>
                    {exposureStr}
                  </span>
                </div>
                <div className={styles.betOptionsWrapper}>
                  <div className={styles.betOptions}>
                    {renderOddsCell(back, backObj?.size, isSuspended, "back", item.nat, "back", item)}
                    {renderOddsCell(lay, layObj?.size, isSuspended, "lay", item.nat, "lay", item)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className={styles.betTable}>
      {renderBookmakerSection()}
      {fancy?.length > 0 && renderFancySection()}
      {renderFancy1Section()}
    </div>
  );
};

export default BetTableSuper3;
