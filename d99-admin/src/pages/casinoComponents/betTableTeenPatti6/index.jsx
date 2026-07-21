import { MdLock } from "react-icons/md";
import styles from "./BetTableTeenPatti6.module.css";

export default function BetTableTeenPatti6({ data, onBetClick, playerLabel = "Player", exposures = {} }) {
  // Dummy fallback data if no real data is passed
  const dummyData = [
    { sid: "p1", nat: "Player ", b: 0, l: 0 },
   
  ];

  // Use real data if available; else fallback
  const displayData = data && data.length > 0 ? data : dummyData;

  // Get exposure value for a bet
  const getExposure = (betName, betType = null) => {
    if (!exposures || Object.keys(exposures).length === 0) {
      return null;
    }

    // Try multiple key variations
    const exposureKeys = [
      betName, // e.g., "Player A Back"
      betName?.toLowerCase(),
      betName?.trim(),
      betName?.toLowerCase().trim(),
    ];

    // If betType is provided, also try without the type suffix
    if (betType) {
      const baseName = betName?.replace(` ${betType}`, "").trim();
      exposureKeys.push(
        baseName,
        baseName?.toLowerCase(),
        baseName?.trim(),
        baseName?.toLowerCase().trim()
      );
    }

    // Also try with just the player name (e.g., "Player A" instead of "Player A Back")
    const playerNameMatch = betName?.match(/^(Player [AB])/i);
    if (playerNameMatch) {
      const playerName = playerNameMatch[1];
      exposureKeys.push(
        playerName,
        playerName?.toLowerCase(),
        playerName?.trim()
      );
    }

    for (const key of exposureKeys) {
      if (key && exposures[key] !== undefined && exposures[key] !== null) {
        return exposures[key];
      }
    }
    return null;
  };

  // Format exposure value
  const formatExposure = (value) => {
    if (!value || value === 0) return null;
    return value < 0 ? value.toFixed(2) : `+${value.toFixed(2)}`;
  };

  // Get exposure color
  const getExposureColor = (value) => {
    if (!value || value === 0) return '#00ff00';
    return value < 0 ? '#ff0000' : '#00ff00';
  };

  return (
    <div>
      <div className={styles.betTable4}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                {displayData.map((bet) => (
                  <th className={styles.playerName} key={bet.sid}>
                    {bet.nat}
                  </th>
                ))}
                <th className={styles.backHeader}>Back</th>
                <th className={styles.layHeader}>Lay</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((bet) => (
                <tr className={styles.tableRow} key={bet.sid}>
                  <td className={styles.mainCell}>Main</td>

                  {/* Back */}
                  {bet.b > 0 ? (
                    <td
                      className={styles.backCell}
                      onClick={() => onBetClick(bet.b, `${bet.nat} Back`, "back")}
                      style={{ cursor: "pointer", textAlign: "center", position: "relative" }}
                    >
                      <span>{bet.b}</span>
                      {(() => {
                        const backExposure = getExposure(`${bet.nat} Back`, "Back");
                        const showBackExposure = backExposure !== null && backExposure !== undefined && backExposure !== 0;
                        return showBackExposure && (
                          <div className={styles.exposure} style={{ color: getExposureColor(backExposure) }}>
                            {formatExposure(backExposure)}
                          </div>
                        );
                      })()}
                    </td>
                  ) : (
                    <td className={`${styles.lockedCell} ${styles.grayBackground}`} style={{ backgroundColor: "#3a4a5d" }}>
                      <MdLock color="white" />
                    </td>
                  )}

                  {/* Lay */}
                  {bet.l > 0 ? (
                    <td
                      className={styles.layCell}
                      onClick={() => onBetClick(bet.l, `${bet.nat} Lay`, "lay")}
                      style={{ cursor: "pointer", textAlign: "center", position: "relative" }}
                    >
                      <span>{bet.l}</span>
                      {(() => {
                        const layExposure = getExposure(`${bet.nat} Lay`, "Lay");
                        const showLayExposure = layExposure !== null && layExposure !== undefined && layExposure !== 0;
                        return showLayExposure && (
                          <div className={styles.exposure} style={{ color: getExposureColor(layExposure) }}>
                            {formatExposure(layExposure)}
                          </div>
                        );
                      })()}
                    </td>
                  ) : (
                    <td className={`${styles.lockedCell} ${styles.grayBackground}`} style={{ backgroundColor: "#3a4a5d" }}>
                      <MdLock color="white" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Static Fancy Bets (locked for now) */}
          <div style={{ display: "flex", gap: "2rem", border: "1.5px solid #ddd" }}>
            <div
              className={styles.section2}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3.2rem",
                marginTop: "7px",
                border: "1.2px solid #ddd",
              }}
            >
              <div style={{ marginLeft: "5px", fontSize: "14px" }}>Under 21</div>
              <div className={`${styles.lockedCell} ${styles.grayBackground}`} style={{ backgroundColor: "#3a4a5d" }}>
                <MdLock color="white" />
              </div>
            </div>
            <div
              className={styles.section2}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3rem",
                marginTop: "9px",
                border: "1.2px solid #ddd",
              }}
            >
              <div style={{ marginLeft: "3px" }}>Over 22</div>
              <div className={`${styles.lockedCell} ${styles.grayBackground}`} style={{ backgroundColor: "#3a4a5d" }}>
                <MdLock color="white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
