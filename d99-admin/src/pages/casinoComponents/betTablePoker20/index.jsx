import { MdLock } from "react-icons/md";
import styles from "./BetTablePoker20.module.css";

export function BetTablePoker20({ data = [], onBetClick, exposures = {} }) {
  const dummyData = [
    { nat: "Winner", b: "0" },
    { nat: "One Pair", b: "0" }, 
    { nat: "Two Pair", b: "0" },
    { nat: "Three of a Kind", b: "0" }, 
    { nat: "Straight", b: "0" },
    { nat: "Flush", b: "0" }, 
    { nat: "Full House", b: "0" }, 
    { nat: "Four of a Kind", b: "0" },
    { nat: "Straight Flush", b: "0" }, 
  ];

  const visibleData = data.length > 0 ? data : dummyData;

  return (
    <div className={styles.pokerTable}>
      <div className={styles.pokerGrid}>
        {visibleData.map((bet, index) => {
          const isLocked = !bet?.b || bet.b === "0" || bet.b === 0;
          const selection = bet?.nat || `Player ${index + 1}`;
          const exposure = exposures[selection] || 0;
          const showExposure = exposure !== 0;

          return (
            <div key={index} className={styles.betCell}>
              <div className={styles.betType}>{selection}</div>

              {isLocked ? (
                <div
                  className={styles.lockedBet}
                  style={{ backgroundColor: "#3a4a5d" }}
                >
                  <MdLock className={styles.lockIcon} />
                </div>
              ) : (
                <div
                  className={styles.betValue}
                  onClick={() => onBetClick(bet.b, selection, bet)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onBetClick(bet.b, selection, bet);
                    }
                  }}
                  style={{ position: 'relative' }}
                >
                  <div>{bet.b}</div>
                  {showExposure && (
                    <div style={{ 
                      fontSize: '10px', 
                      color: exposure < 0 ? '#ff0000' : '#00ff00',
                      marginTop: '-8px',
                      fontWeight: 'bold',
                    }}>
                      {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
