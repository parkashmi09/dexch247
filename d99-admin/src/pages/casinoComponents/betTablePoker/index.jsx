import styles from "./BetTablePoker.module.css";
import { MdLock } from "react-icons/md";

export default function BetTablePoker({ data = {}, onBetClick, playerLabel, exposures = {}, myBets = [] }) {
  const {
    b = 0,
    l = 0,
    nat = playerLabel || "Player",
    gstatus,
    bonus2Card = 0,
    bonus2CardStatus,
    bonus2CardNat,
    bonus7Card = 0,
    bonus7CardStatus,
    bonus7CardNat,
  } = data;

  const isSuspended = gstatus?.toUpperCase() === "SUSPENDED";
  const isLocked = (value) => value === 0 || value === undefined;

  // Get exposure value - try different key formats
  const getExposure = (baseKey, betType = null) => {
    const exposureKeys = [
      betType ? `${baseKey} ${betType}` : null,
      baseKey,
      `${nat}`,
      betType ? `${nat} ${betType}` : null,
    ].filter(Boolean);

    for (const key of exposureKeys) {
      if (exposures[key] !== undefined) {
        return exposures[key];
      }
    }
    return 0;
  };

  // Check if there's a bet placed for this selection and type
  const hasBackBet = myBets.some(bet => {
    const betSelection = (bet.matchedBet || bet.selection || "").toLowerCase();
    const playerName = nat.toLowerCase();
    return betSelection.includes(playerName) && bet.type === "back";
  });

  const hasLayBet = myBets.some(bet => {
    const betSelection = (bet.matchedBet || bet.selection || "").toLowerCase();
    const playerName = nat.toLowerCase();
    return betSelection.includes(playerName) && bet.type === "lay";
  });

  const backExposure = hasBackBet ? getExposure(nat, "back") : 0;
  const layExposure = hasLayBet ? getExposure(nat, "lay") : 0;

  const renderCell = (value, styleClass, type, betData) => {
    const locked = isSuspended || isLocked(value);
    const exposure = type === "back" ? backExposure : layExposure;
    
    if (locked) {
      return (
        <td className={styles.lockedCell}>
          <MdLock color="white" />
        </td>
      );
    }
    // Ensure betData contains nat value from API
    const fullBetData = betData || { nat, b, l };
    return (
      <td className={styleClass} onClick={() => onBetClick(value, fullBetData.nat, type, fullBetData)}>
        <div className={styles.cellContent}>
        <span>{value}</span>
          {exposure !== 0 && (
            <div className={styles.exposure} style={{ 
              color: exposure < 0 ? '#ff0000' : '#00ff00',
            }}>
              {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
            </div>
          )}
        </div>
      </td>
    );
  };

  const renderBonusBox = (value, label, natValue, status, bonusData = null) => {
    const isBonusSuspended = status?.toUpperCase() === "SUSPENDED";
    const locked = isBonusSuspended || isLocked(value);
    // Use full API data if available, otherwise create object with nat
    const betData = bonusData || { nat: natValue, b: value };

    // Check if there's a bet placed for this bonus selection
    const hasBonusBet = myBets.some(bet => {
      const betSelection = (bet.matchedBet || bet.selection || "").toLowerCase();
      const bonusNat = natValue?.toLowerCase() || "";
      return betSelection.includes(bonusNat) && bet.type === "back";
    });

    // Get exposure for this bonus selection
    const bonusExposure = hasBonusBet ? getExposure(natValue, "back") : 0;

    return (
      <div
        className={`${styles.bonusBox} ${locked ? styles.bonusLock : ""}`}
        onClick={!locked ? () => onBetClick(value, betData.nat, "back", betData) : undefined}
      >
        {locked ? (
          <div className={styles.lockedContent}>
            <MdLock className={styles.lockIcon} />
            {/* <span className={styles.lockedText}>{label}</span> */}
          </div>
        ) : (
          <div className={styles.bonusContent}>
            <span>{label}</span>
            {bonusExposure !== 0 && (
              <div className={styles.bonusExposure} style={{ 
                color: bonusExposure < 0 ? '#ff0000' : '#00ff00',
              }}>
                {bonusExposure < 0 ? bonusExposure.toFixed(2) : `+${bonusExposure.toFixed(2)}`}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.betTable}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <tbody>
            <tr className={styles.tableRow}>
              <td className={styles.playerName}>{nat}</td>
              {renderCell(b, styles.backCell, "back", data.matchData)}
              {renderCell(l, styles.layCell, "lay", data.matchData)}
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.section2}>
        {renderBonusBox(bonus2Card, "2 Cards Bonus", bonus2CardNat, bonus2CardStatus, data.bonus2CardData)}
        {renderBonusBox(bonus7Card, "7 Cards Bonus", bonus7CardNat, bonus7CardStatus, data.bonus7CardData)}
      </div>
    </div>
  );
}
