import { MdLock } from "react-icons/md";
import styles from "./BetTableTeen.module.css";

const BetTableTeen = ({ data = [], onBetClick }) => {
  const renderCell = (valueObj) => {
    if (!valueObj || valueObj.b === 0) {
      return (
        <div className={styles.lockedCell}>
          <MdLock className={styles.whiteLockIcon} />
        </div>
      );
    }
    return <div className={styles.value}>{valueObj.b}</div>;
  };

  const playerA = data?.find((item) => item?.nat === "Player A") || {};
  const playerB = data?.find((item) => item?.nat === "Player B") || {};
  const cardObjects = data?.filter((item) => item?.subtype === "oddeven" && item?.etype === "fancy") || [];

  const handleCellClick = (valueObj) => {
    if (valueObj && valueObj.b > 0) {
      const betObj = {
        odds: valueObj.b,
        selectionName: valueObj.nat || "",
        type: valueObj.type || "back", // 🔄 Add default "back" if not present
      };
      onBetClick(betObj);
    }
  };

  return (
    <div className={styles.betTable}>
      <div className={styles.playerSection}>
        <div className={styles.playerTable}>
          <div className={styles.header}>
            <div className={styles.playerName}>Player A</div>
            <div className={styles.columnHeader}>Back</div>
            <div className={styles.columnHeader}>Lay</div>
          </div>
          <div className={styles.row}>
            <div className={styles.rowLabel}>Main</div>
            <div
              className={`${styles.cell} ${playerA.b > 0 ? styles.back : styles.locked}`}
              onClick={() => handleCellClick({ ...playerA, type: "back" })}
            >
              {renderCell(playerA)}
            </div>
            <div
              className={`${styles.cell} ${playerA.l > 0 ? styles.lay : styles.locked}`}
              onClick={() => handleCellClick({ ...playerA, b: playerA.l, type: "lay" })}
            >
              {renderCell({ b: playerA.l })}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.rowLabel}>Consecutive</div>
            <div className={styles.cell}>{renderCell({ b: 0 })}</div>
            <div className={styles.cell}>{renderCell({ b: 0 })}</div>
          </div>
        </div>

        <div className={styles.playerTable}>
          <div className={styles.header}>
            <div className={styles.playerName}>Player B</div>
            <div className={styles.columnHeader}>Back</div>
            <div className={styles.columnHeader}>Lay</div>
          </div>
          <div className={styles.row}>
            <div className={styles.rowLabel}>Main</div>
            <div
              className={`${styles.cell} ${playerB.b > 0 ? styles.back : styles.locked}`}
              onClick={() => handleCellClick({ ...playerB, type: "back" })}
            >
              {renderCell(playerB)}
            </div>
            <div
              className={`${styles.cell} ${playerB.l > 0 ? styles.lay : styles.locked}`}
              onClick={() => handleCellClick({ ...playerB, b: playerB.l, type: "lay" })}
            >
              {renderCell({ b: playerB.l })}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.rowLabel}>Consecutive</div>
            <div className={styles.cell}>{renderCell({ b: 0 })}</div>
            <div className={styles.cell}>{renderCell({ b: 0 })}</div>
          </div>
        </div>
      </div>

      <div className={styles.cardsSection}>
        <div className={styles.cardsTable}>
          <div className={styles.header}>
            <div className={styles.rowLabel}></div>
            {cardObjects.map((card, index) => (
              <div key={card.nat || index} className={styles.cardHeader}>
                {card.nat || `Card ${index + 1}`}
              </div>
            ))}
          </div>

          <div className={styles.row}>
            <div className={styles.rowLabel}>Odd</div>
            {cardObjects.map((card, index) => {
              const oddObj = card.odds?.find((o) => o.nat === "Odd");
              const value = oddObj || { b: 0 };
              return (
                <div
                  key={`odd-${index}`}
                  className={`${styles.cell} ${value.b > 0 ? styles.back : styles.locked}`}
                  onClick={() => value.b > 0 && handleCellClick({ ...value, type: "special" })}
                >
                  {renderCell(value)}
                </div>
              );
            })}
          </div>

          <div className={styles.row}>
            <div className={styles.rowLabel}>Even</div>
            {cardObjects.map((card, index) => {
              const evenObj = card.odds?.find((o) => o.nat === "Even");
              const value = evenObj || { b: 0 };
              return (
                <div
                  key={`even-${index}`}
                  className={`${styles.cell} ${value.b > 0 ? styles.back : styles.locked}`}
                  onClick={() => value.b > 0 && handleCellClick({ ...value, type: "special" })}
                >
                  {renderCell(value)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetTableTeen;
