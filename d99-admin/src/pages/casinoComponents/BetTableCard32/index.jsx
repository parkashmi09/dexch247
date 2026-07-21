import { MdLock } from "react-icons/md";
import styles from "./BetTableCard32.module.css";

export default function BetTableCard32({ data, onBetClick, exposures = {}, myBets = [] }) {
  // Get exposure value - try different key formats
  const getExposure = (playerName, betType) => {
    const exposureKeys = [
      `${playerName} ${betType}`, // "Player 8 back", "Player 8 lay"
      `${playerName}`, // "Player 8"
      betType, // "back", "lay"
    ];
    
    for (const key of exposureKeys) {
      if (exposures[key] !== undefined) {
        return exposures[key];
      }
    }
    return 0;
  };

  // Check if there's a bet placed for this player and type
  const hasBackBet = (playerName) => {
    return myBets.some(bet => {
      const betSelection = (bet.matchedBet || bet.selection || "").toLowerCase();
      const name = playerName.toLowerCase();
      return betSelection.includes(name) && bet.type === "back";
    });
  };

  const hasLayBet = (playerName) => {
    return myBets.some(bet => {
      const betSelection = (bet.matchedBet || bet.selection || "").toLowerCase();
      const name = playerName.toLowerCase();
      return betSelection.includes(name) && bet.type === "lay";
    });
  };

  return (
    <div className={styles.betTable4}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHeaderRow}>
            <th className={styles.playerName}></th>
            <th className={styles.backHeader}>Back</th>
            <th className={styles.layHeader}>Lay</th>
          </tr>
        </thead>
        <tbody>
          {data.map((player, index) => {
            const playerData = player?.[0] || {};
            const backVal = playerData?.b;
            const layVal = playerData?.l;
            const nat = playerData?.nat;
            const gstatus = playerData?.gstatus;
            const playerName = nat?.trim() ? nat : `Player ${index + 8}`;
            const isSuspended = gstatus?.toUpperCase() === "SUSPENDED";
            const isBackLocked = isSuspended || backVal === 0 || backVal === undefined || backVal === null;
            const isLayLocked = isSuspended || layVal === 0 || layVal === undefined || layVal === null;

            // Get exposure values
            const backExposure = hasBackBet(playerName) ? getExposure(playerName, "back") : 0;
            const layExposure = hasLayBet(playerName) ? getExposure(playerName, "lay") : 0;

            return (
              <tr key={playerName + index} className={styles.tableRow}>
                <td className={styles.mainCell}>{playerName}</td>

                {/* Back */}
                {isBackLocked ? (
                  <td className={styles.lockedCell}>
                    <MdLock color="white" />
                  </td>
                ) : (
                  <td
                    className={styles.backCell}
                    onClick={() => onBetClick(backVal, playerName, "back", playerData)}
                >
                    <div className={styles.cellContent}>
                      <span>{backVal}</span>
                      {backExposure !== 0 && (
                        <div className={styles.exposure} style={{ 
                          color: backExposure < 0 ? '#ff0000' : '#00ff00',
                        }}>
                          {backExposure < 0 ? backExposure.toFixed(2) : `+${backExposure.toFixed(2)}`}
                        </div>
                      )}
                    </div>
                </td>
                )}

                {/* Lay */}
                {isLayLocked ? (
                  <td className={styles.lockedCell}>
                    <MdLock color="white" />
                  </td>
                ) : (
                  <td
                    className={styles.layCell}
                    onClick={() => onBetClick(layVal, playerName, "lay", playerData)}
                >
                    <div className={styles.cellContent}>
                      <span>{layVal}</span>
                      {layExposure !== 0 && (
                        <div className={styles.exposure} style={{ 
                          color: layExposure < 0 ? '#ff0000' : '#00ff00',
                        }}>
                          {layExposure < 0 ? layExposure.toFixed(2) : `+${layExposure.toFixed(2)}`}
                        </div>
                      )}
                    </div>
                </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
