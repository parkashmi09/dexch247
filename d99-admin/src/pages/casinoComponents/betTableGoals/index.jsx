/**
 * BetTableGoals – Bet table for Goals game.
 * Uses CSS module classes to avoid global style.css conflicts.
 * Visual output matches the reference HTML structure and design.
 *
 * API `sub` array has two subtypes:
 *   subtype "player" (+ "match") → "Who Will Goal Next?"
 *   subtype "goal"               → "Method Of Next Goal"
 */
import styles from "./BetTableGoals.module.css";

const formatSize = (val) => {
  if (val == null || val === "" || val === 0) return "";
  const n = Number(val);
  if (isNaN(n)) return String(val);
  if (n >= 100000) return n / 100000 + "L";
  if (n >= 1000) return n / 1000 + "K";
  return String(n);
};

const formatMax = (val) => {
  if (val == null) return "100K";
  const n = Number(val);
  if (isNaN(n)) return String(val);
  if (n >= 100000) return n / 100000 + "L";
  if (n >= 1000) return n / 1000 + "K";
  return String(n);
};

const BetTableGoals = ({ data = [], onBetClick, exposures = {}, myBets = [] }) => {
  const whoWillGoalNext = data.filter(
    (item) =>
      (item?.subtype === "player" || item?.subtype === "match") &&
      (item?.visible === undefined || item?.visible === 1)
  );
  const methodOfNextGoal = data.filter(
    (item) =>
      item?.subtype === "goal" &&
      (item?.visible === undefined || item?.visible === 1)
  );

  const getExposure = (selectionName) => {
    if (!selectionName) return 0;
    const keys = [
      selectionName,
      selectionName.trim(),
      selectionName.toLowerCase(),
      selectionName.toLowerCase().trim(),
    ];
    for (const key of keys) {
      if (key && exposures[key] !== undefined) return exposures[key];
    }
    return 0;
  };

  const renderMarket = (title, items) => (
    <div className={styles.market6}>
      <div className={styles.betTable}>
        <div className={styles.betTableHeader}>
          <div className={styles.headerNationName}>
            <span title={title}>{title}</span>
          </div>
          {/* <div className={styles.blTitle}>Back</div> */}
        </div>
        <div className={styles.betTableBody}>
          {items.map((item, idx) => {
            const odds = item?.b ?? 0;
            const size = item?.bs;
            const isSuspended =
              item?.gstatus?.toUpperCase() === "SUSPENDED" || !odds || odds === 0;
            const exposure = getExposure(item?.nat);

            return (
              <div className={styles.fancyTripple} key={idx}>
                <div className={styles.betRow}>
                  <div className={styles.nationName}>
                    <p>{item?.nat}</p>
                    <p className={`mb-0 ${styles.bookRed}`}>{exposure || 0}</p>
                  </div>
                  {isSuspended ? (
                    <div className={styles.blBoxSuspended}>
                      <span>&mdash;</span>
                    </div>
                  ) : (
                    <div
                      className={styles.blBox}
                      onClick={() => onBetClick?.(odds, item?.nat, item)}
                    >
                      <span className={styles.odds}>{odds}</span>
                      <span>{formatSize(size)}</span>
                    </div>
                  )}
                  <div className={styles.fancyMinMax}>
                    Min:<span>{item?.min ?? 100}</span>
                    {" "}
                    Max:<span>{formatMax(item?.max)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.marketContainer}>
      {renderMarket("Who Will Goal Next?", whoWillGoalNext)}
      {renderMarket("Method Of Next Goal", methodOfNextGoal)}
    </div>
  );
};

export default BetTableGoals;
