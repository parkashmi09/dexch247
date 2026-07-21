import { MdLock } from "react-icons/md";
import styles from "./BetTableTeenPatti3.module.css";

export default function BetTableTeenPatti3({ data, onBetClick, exposures = {}, myBets = [] }) {
  const { nat = "Player", b, l, gstatus } = data || {};
  const selectionLabel = "Main";
  const isSuspended = gstatus?.toUpperCase() === "SUSPENDED";

  // Get exposure value - try different key formats to match API team_name
  const getExposure = (baseKey, betType = null) => {
    const exposureKeys = [
      betType ? `${baseKey} ${betType}` : null, // "Player A Main back", "Player A Main lay"
      baseKey, // "Player A Main", "Player B Main"
      `${nat} ${selectionLabel}`, // "Player A Main"
      betType ? `${nat} ${selectionLabel} ${betType}` : null, // "Player A Main back"
      betType ? `${nat} ${betType}` : null, // "Player A back"
      `${nat}`, // "Player A"
      betType ? `${selectionLabel} ${betType}` : null, // "Main back"
      selectionLabel, // "Main"
    ].filter(Boolean); // Remove null values
    
    for (const key of exposureKeys) {
      if (exposures[key] !== undefined) {
        return exposures[key];
      }
    }
    return 0;
  };

  // Find bets for this selection
  const backBet = myBets.find(bet => {
    const betSelection = (bet.matchedBet || bet.selection || bet.player_name || "").toLowerCase();
    const playerName = nat.toLowerCase();
    const selection = selectionLabel.toLowerCase();
    return (
      ((betSelection.includes(playerName) && betSelection.includes(selection)) ||
      betSelection === selection ||
      betSelection === playerName ||
      (betSelection.includes("box a") && playerName.includes("player a")) ||
      (betSelection.includes("box b") && playerName.includes("player b")))
    ) && (bet.type === "back" || bet.betType === "back");
  });

  const layBet = myBets.find(bet => {
    const betSelection = (bet.matchedBet || bet.selection || bet.player_name || "").toLowerCase();
    const playerName = nat.toLowerCase();
    const selection = selectionLabel.toLowerCase();
    return (
      ((betSelection.includes(playerName) && betSelection.includes(selection)) ||
      betSelection === selection ||
      betSelection === playerName ||
      (betSelection.includes("box a") && playerName.includes("player a")) ||
      (betSelection.includes("box b") && playerName.includes("player b")))
    ) && (bet.type === "lay" || bet.betType === "lay");
  });

  // Get exposure values - try bet.exposer first, then exposure map
  let backExposure = 0;
  if (backBet) {
    if (backBet.exposer !== undefined && backBet.exposer !== null && backBet.exposer !== 0) {
      backExposure = backBet.exposer;
    } else {
      backExposure = getExposure(`${nat} ${selectionLabel}`, "back") || 
                     getExposure(`${nat} ${selectionLabel}`) ||
                     getExposure(nat) ||
                     0;
    }
  }

  let layExposure = 0;
  if (layBet) {
    if (layBet.exposer !== undefined && layBet.exposer !== null && layBet.exposer !== 0) {
      layExposure = layBet.exposer;
    } else {
      layExposure = getExposure(`${nat} ${selectionLabel}`, "lay") || 
                    getExposure(`${nat} ${selectionLabel}`) ||
                    getExposure(nat) ||
                    0;
    }
  }

  return (
    <div className={styles.betTable4}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHeaderRow}>
            <th className={styles.playerName}>{nat}</th>
            <th className={styles.backHeader}>Back</th>
            <th className={styles.layHeader}>Lay</th>
          </tr>
        </thead>
        <tbody>
          <tr className={styles.tableRow}>
            <td className={styles.mainCell}>Main</td>

            {/* Back */}
            {isSuspended || b === 0 || b === undefined ? (
              <td className={styles.lockedCell}>
                <MdLock color="white" />
              </td>
            ) : (
              <td
                className={styles.backCell}
                onClick={() => onBetClick(b, selectionLabel, "back", data)}
              >
                <span>{b}</span>
                {backExposure !== 0 && (
                  <div style={{ 
                    fontSize: '10px', 
                    color: backExposure < 0 ? '#ff0000' : '#00ff00',
                    marginTop: '2px',
                    fontWeight: 'bold',
                  }}>
                    {backExposure < 0 ? backExposure.toFixed(2) : `+${backExposure.toFixed(2)}`}
                  </div>
                )}
              </td>
            )}

            {/* Lay */}
            {isSuspended || l === 0 || l === undefined ? (
              <td className={styles.lockedCell}>
                <MdLock color="white" />
              </td>
            ) : (
              <td
                className={styles.layCell}
                onClick={() => onBetClick(l, selectionLabel, "lay", data)}
              >
                <span>{l}</span>
                {layExposure !== 0 && (
                  <div style={{ 
                    fontSize: '10px', 
                    color: layExposure < 0 ? '#ff0000' : '#00ff00',
                    marginTop: '2px',
                    fontWeight: 'bold',
                  }}>
                    {layExposure < 0 ? layExposure.toFixed(2) : `+${layExposure.toFixed(2)}`}
                  </div>
                )}
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
