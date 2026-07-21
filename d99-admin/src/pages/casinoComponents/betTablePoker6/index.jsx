import { useState } from "react";
import styles from "./BetTablePoker6.module.css";
import lockIcon from "../../../assets/img/lock.svg";

export default function BetTablePoker6({ hands = [], patterns = [], onBetClick, exposures = {}, myBets = [] }) {
  const [active, setActive] = useState(true); 

  const renderCells = (items, labelType) => {
    return items.map((item, index) => {
      // Check if locked based on gstatus or b value
      const isSuspended = item?.gstatus?.toUpperCase() === "SUSPENDED";
      const isLocked = isSuspended || String(item?.b) === "0" || item?.b === 0;
      const value = item?.b || 0;
      const nat = item?.nat || `${labelType} ${index + 1}`;
      
      // Get exposure for this selection
      const getExposure = () => {
        const lowerNat = nat?.toLowerCase() || "";
        
        // Try exact match first
        if (exposures[nat] !== undefined) return exposures[nat];
        
        // Try case-insensitive match
        for (const key in exposures) {
          if (key.toLowerCase() === lowerNat || 
              key.toLowerCase().includes(lowerNat) ||
              lowerNat.includes(key.toLowerCase())) {
            return exposures[key];
          }
        }
        
        return 0;
      };

      // Check if there's a bet placed for this selection
      const hasBet = myBets.some(bet => {
        const betSelection = (bet.matchedBet || bet.selection || "").toLowerCase();
        const selectionNat = nat?.toLowerCase() || "";
        return betSelection === selectionNat || 
               betSelection.includes(selectionNat) || 
               selectionNat.includes(betSelection);
      });

      // Get exposure value - show if there's a bet or if exposure exists
      const exposure = hasBet ? getExposure() : 0;
      const showExposure = exposure !== 0;

      return (
        <div
          key={item?.sid || index}
          className={`${styles.playerCell} ${isLocked ? styles.locked : styles.activeCard}`}
          onClick={() => {
            if (!isLocked) onBetClick(value, nat, item);
          }}
        >
          <span className={styles.playerName}>{nat}</span>
          {isLocked ? (
            <div 
              className={styles.lockIcon}
              style={{
                backgroundImage: `url(${lockIcon})`,
              }}
            ></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
              <span className={styles.playerValue}>{value}</span>
              {showExposure && (
                <div style={{ 
                  fontSize: '10px', 
                  color: exposure < 0 ? '#ff0000' : '#00ff00',
                  fontWeight: 'bold',
                  marginTop: '-8px',
                }}>
                  {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
                </div>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div>
      {/* Toggle Buttons */}
      <div className={styles.toggleContainer}>
        <div
          className={`${styles.toggleButton} ${active ? styles.active : ""}`}
          onClick={() => setActive(true)}
        >
          Hands
        </div>
        <div
          className={`${styles.toggleButton} ${!active ? styles.active : ""}`}
          onClick={() => setActive(false)}
        >
          Pattern
        </div>
      </div>

      {/* Grid */}
      <div className={active ? styles.handsGrid : styles.patternGrid}>
        {renderCells(active ? hands : patterns, active ? "Player" : "Pattern")}
      </div>
    </div>
  );
}
