import styles from "./BetTableTrap.module.css";
import { MdLock } from "react-icons/md";
import TrapSeven from '../../../assets/img/trape-seven.png';

export default function BetTableTrap({ data = [], onBetClick, exposures = {}, myBets = [] }) {
  // Data structure: data[0] = playerA, data[1] = playerB, and data has properties dd, du, db, dl
  const playerA = data[0] || {};
  const playerB = data[1] || {};
  // For seven (Low/High) and cards, use direct properties from data object
  const sevenData = { dd: data.dd, du: data.du };
  const cardsData = { b: data.db, l: data.dl };

  // Helper to normalize string for matching
  const normalizeString = (str) => {
    if (!str) return "";
    return str.replace(/\s+/g, ' ').trim().toLowerCase();
  };

  // Helper to get exposure value from myBets or exposures map
  const getExposureForSelection = (selection, betType = "back") => {
    if (!selection) return 0;

    // First, try to find matching bet in myBets
    const normalizedSelection = normalizeString(selection);
    const bet = myBets.find(b => {
      const betSelection = normalizeString(b.selection || b.matchedBet || b.player_name || "");
      const bType = (b.type || "").toLowerCase();
      
      return (betSelection === normalizedSelection || 
              betSelection.includes(normalizedSelection) ||
              normalizedSelection.includes(betSelection)) &&
             (bType === betType || bType === "");
    });

    if (bet) {
      if (bet.exposer !== undefined && bet.exposer !== null && bet.exposer !== 0) {
        return parseFloat(bet.exposer) || 0;
      }
    }

    // Second, try exposures map with multiple key variations
    const keys = [
      selection,
      `${selection} ${betType}`,
      normalizeString(selection),
      normalizeString(`${selection} ${betType}`),
    ];

    for (const key of keys) {
      if (key && exposures[key] !== undefined && exposures[key] !== null) {
        const expValue = parseFloat(exposures[key]);
        if (!isNaN(expValue) && expValue !== 0) {
          return expValue;
        }
      }
    }

    // Try normalized match against all exposure keys
    for (const expKey in exposures) {
      if (normalizeString(expKey) === normalizedSelection) {
        const expValue = parseFloat(exposures[expKey]);
        if (!isNaN(expValue) && expValue !== 0) {
          return expValue;
        }
      }
    }

    return 0;
  };

  // Helper to render odds box or lock with exposure
  const renderOddsCell = (value, label, type, colorClass, item = {}) => {
    const isLocked = value === 0 || value === undefined || value === null || item?.gstatus?.toUpperCase() === "SUSPENDED";
    const exposure = getExposureForSelection(label, type);
    
    return isLocked ? (
      <div className={styles.lockBox}>
        <MdLock color="white" />
      </div>
    ) : (
      <div
        className={`${styles.betBox} ${colorClass}`}
        onClick={() => onBetClick(value, label, item, type)}
      >
        {exposure !== 0 && (
          <div style={{
            fontSize: '10px',
            color: exposure < 0 ? '#ff0000' : '#00ff00',
            marginBottom: '2px'
          }}>
            {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
          </div>
        )}
        {value}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Top Row: Player A & Player B */}
      <div className={styles.topRow}>
        {/* Player A (Left) */}
        <div className={styles.playerBlock}>
          <div className={styles.playerLabel}>{playerA.nat || "Player A"}</div>
          <div className={styles.oddsContainer}>
            {renderOddsCell(playerA.b, playerA.nat || "Player A", "back", styles.blueValue, playerA)}
            {renderOddsCell(playerA.l, playerA.nat || "Player A", "lay", styles.pinkValue, playerA)}
          </div>
        </div>

        {/* Player B (Right) */}
        <div className={`${styles.playerBlock} ${styles.playerBlockRight}`}>
          <div className={styles.playerLabel}>{playerB.nat || "Player B"}</div>
          <div className={styles.oddsContainer}>
            {renderOddsCell(playerB.b, playerB.nat || "Player B", "back", styles.blueValue, playerB)}
            {renderOddsCell(playerB.l, playerB.nat || "Player B", "lay", styles.pinkValue, playerB)}
          </div>
        </div>
      </div>

      {/* Bottom Row: 7/High/Low & Cards/Odds */}
      <div className={styles.bottomRow}>
        {/* Left: 7 Icon & Low/High */}
        <div className={styles.sevenSection}>
          <div className={styles.sevenUpDownBox}>
            {/* Low Box */}
            <div className={`${styles.upBox} ${(sevenData.dd === 0 || sevenData.dd === undefined || sevenData?.gstatus?.toUpperCase() === "SUSPENDED") ? styles.suspendedBox : ''}`}>
              <div className={styles.upDownBook}></div>
              <div className={styles.textEnd}>
                {(() => {
                  const exposure = getExposureForSelection("Low", "back");
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {exposure !== 0 && (
                          <div className={styles.exposureLeft} style={{ 
                            color: exposure < 0 ? '#ff0000' : '#00ff00',
                          }}>
                            {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
                          </div>
                        )}
                        <div className={styles.upDownOdds} onClick={() => (sevenData.dd && sevenData.dd !== 0) && onBetClick(sevenData.dd, "Low", sevenData, "back")}>
                          {sevenData.dd || 0}
                        </div>
                      </div>
                      <span>LOW</span>
                    </div>
                  );
                })()}
              </div>
            </div>
            {/* High Box */}
            <div className={`${styles.downBox} ${(sevenData.du === 0 || sevenData.du === undefined || sevenData?.gstatus?.toUpperCase() === "SUSPENDED") ? styles.suspendedBox : ''}`}>
              <div className={styles.upDownBook}></div>
              <div className={styles.textStart}>
                {(() => {
                  const exposure = getExposureForSelection("High", "back");
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div className={styles.upDownOdds} onClick={() => (sevenData.du && sevenData.du !== 0) && onBetClick(sevenData.du, "High", sevenData, "back")}>
                          {sevenData.du || 0}
                        </div>
                        {exposure !== 0 && (
                          <div className={styles.exposureRight} style={{ 
                            color: exposure < 0 ? '#ff0000' : '#00ff00',
                          }}>
                            {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
                          </div>
                        )}
                      </div>
                      <span>HIGH</span>
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className={styles.sevenBox}>
              <img
                src={TrapSeven}
                alt="Seven"
              />
            </div>
          </div>
        </div>

        {/* Right: Cards & Odds */}
        <div className={styles.cardsSection}>
          <div className={styles.cardsDisplay}>
            <img src="/assets/img/card/11.jpg" alt="J" className={styles.cardImg} onError={(e) => e.target.style.display = 'none'} />
            <img src="/assets/img/card/12.jpg" alt="Q" className={styles.cardImg} onError={(e) => e.target.style.display = 'none'} />
            <img src="/assets/img/card/13.jpg" alt="K" className={styles.cardImg} onError={(e) => e.target.style.display = 'none'} />
          </div>

          {/* Card Odds (using db/dl as mapped from dealer/tie) */}
          <div className={styles.oddsContainer}>
            {renderOddsCell(cardsData.b || cardsData.db, "Cards", "back", styles.blueValue, cardsData)}
            {renderOddsCell(cardsData.l || cardsData.dl, "Cards", "lay", styles.pinkValue, cardsData)}
          </div>
        </div>
      </div>

      <div className={styles.infoBar}>
        IT'S EITHER PLAYER A OR B, WHO SCORES A TOTAL OF 13,14,15 WILL FALL INTO THE TRAP & LOSE THE GAME.
      </div>
    </div>
  );
}
