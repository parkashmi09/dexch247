import { MdLock } from "react-icons/md";
import styles from "./BetTableTeenPatti8.module.css";

export default function BetTableTeenPatti8({ data = [], onBetClick, exposures = {} }) {
  const columns = ["Odds", "Pair Plus", "Total"];

  const rows = Array.isArray(data) && data.length > 0 ? data : [];

  // Get exposure value - try different key formats to match API team_name
  const getExposure = (baseKey) => {
    const exposureKeys = [
      baseKey, // "Player 1", "Pair Plus 1", "Total 1"
      baseKey.replace(" ", " "), // same
    ];
    
    for (const key of exposureKeys) {
      if (exposures[key] !== undefined) {
        return exposures[key];
      }
    }
    return 0;
  };

  return (
    <div className={styles.casinoDetail}>
      <div className={styles.casinoTable}>
        <div className={styles.casinoTableFullBox}>
          <div className={styles.casinoTableHeader}>
            <div className={styles.casinoNationDetail}></div>
            {columns.map((column, index) => (
              <div key={index} className={`${styles.casinoOddsBox} ${styles.back}`}>
                {column}
              </div>
            ))}
          </div>
          <div className={styles.casinoTableBody}>
          {rows.map((row, index) => {
            const playerName = row?.nat || `Player ${index + 1}`;
              const baseLocked = row?.gstatus?.toUpperCase() === "SUSPENDED";

              // Define the three columns with their values and data
              const columnsData = [
                {
                  value: row?.odds,
                  data: row?.oddsData,
                  nat: playerName,
                  locked: baseLocked || !row?.odds || row?.odds === 0,
                },
                {
                  value: row?.pairPlus,
                  data: row?.pairPlusData,
                  nat: row?.pairPlusData?.nat || `Pair Plus ${index + 1}`,
                  locked: baseLocked || !row?.pairPlus || row?.pairPlus === 0,
                },
                {
                  value: row?.total,
                  data: row?.totalData,
                  nat: row?.totalData?.nat || `Total ${index + 1}`,
                  locked: baseLocked || !row?.total || row?.total === 0,
                },
              ];

            return (
                <div key={index} className={styles.casinoTableRow}>
                  <div className={styles.casinoNationDetail}>
                    <div className={styles.casinoNationName}>{playerName}</div>
                  </div>
                  {columnsData.map((colData, valueIndex) => {
                    const exposure = getExposure(colData.nat);
                    const showExposure = exposure !== 0;

                  return (
                      <div
                      key={valueIndex}
                        className={`${styles.casinoOddsBox} ${styles.back} ${colData.locked ? styles.suspendedBox : ""}`}
                      onClick={() => {
                          if (!colData.locked) {
                            onBetClick?.(colData.value, colData.nat, colData.data);
                          }
                        }}
                        style={{ position: 'relative' }}
                    >
                        {colData.locked ? (
                          <MdLock color="white" />
                        ) : (
                          <>
                            <span className={styles.casinoOdds}>{colData.value ?? "-"}</span>
                            {showExposure && (
                              <div style={{ 
                                fontSize: '10px', 
                                color: exposure < 0 ? '#ff0000' : '#00ff00',
                                marginTop: '2px',
                                fontWeight: 'bold',
                              }}>
                                {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                  );
                })}
                </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
