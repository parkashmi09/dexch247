import styles from "./BetTableTeen1.module.css";
import { MdLock } from "react-icons/md";
import TrapSeven from '../../../assets/img/trape-seven.png';

const BetTableTeen1 = ({ data, onBetClick, exposures = {}, myBets = [] }) => {
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
      
      // Match if selection matches and type matches
      return (betSelection === normalizedSelection || 
              betSelection.includes(normalizedSelection) ||
              normalizedSelection.includes(betSelection)) &&
             (bType === betType || bType === "");
    });

    if (bet) {
      // First priority: use exposer from bet
      if (bet.exposer !== undefined && bet.exposer !== null && bet.exposer !== 0) {
        return parseFloat(bet.exposer) || 0;
      }
    }

    // Second, try exposures map with multiple key variations
    const keys = [
      selection,
      `${selection} ${betType}`,
      `${selection} ${betType.toUpperCase()}`,
      `${selection} ${betType.toLowerCase()}`,
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

  // Helper to render Back/Lay cell with lock logic and exposure
  const renderBetCell = (item, label, type) => {
    const value = type === "back" ? item?.b : item?.l;
    const isLocked = value === 0 || value === undefined || item?.gstatus?.toUpperCase() === "SUSPENDED";
    const selection = item?.nat || `${label} ${type === "back" ? "Back" : "Lay"}`;
    
    // Find matching bet for exposure
    const bet = myBets.find(b => {
      const betSelection = (b.selection || b.matchedBet || b.player_name || "").toLowerCase();
      const betType = (b.type || "").toLowerCase();
      return betType === type && (
        betSelection === selection.toLowerCase() ||
        betSelection === label.toLowerCase() ||
        betSelection.includes(label.toLowerCase())
      );
    });

    // Get exposure from bet or exposures map
    let exposure = 0;
    if (bet) {
      if (bet.exposer !== undefined && bet.exposer !== null && bet.exposer !== 0) {
        exposure = bet.exposer;
      } else {
        exposure = getExposureForSelection(selection, type);
      }
    }

    const cellClass = type === "back" ? styles.backOdds : styles.layOdds;
    
    return isLocked ? (
      <div className={`${cellClass} ${styles.lockedCell}`} style={{ backgroundColor: "#3a4a5d" }}>
        <MdLock color="white" />
      </div>
    ) : (
      <div 
        className={cellClass} 
        onClick={() => onBetClick(value, selection, item, type)}
        style={{ position: 'relative' }}
      >
        <span style={{ position: 'relative', zIndex: 0 }}>{value || 0}</span>
        {bet && exposure !== 0 && (
          <div className={styles.exposure} style={{
            color: exposure < 0 ? '#ff0000' : '#00ff00',
            position: 'relative',
            zIndex: 4,
            fontSize: '10px',
            fontWeight: 'bold',
            marginTop: '-8px',
          }}>
            {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.betTableContainer}>
      <div className={styles.topSection}>
        <div className={styles.playerColumn}>
          <div className={styles.playerLabel}>Player</div>
          <div className={styles.oddsContainer}>
            {renderBetCell(data.playerItem, "Player", "back")}
            {renderBetCell(data.playerItem, "Player", "lay")}
          </div>
        </div>

        <div className={styles.playerColumn}>
          <div className={styles.playerLabel}>Dealer</div>
          <div className={styles.oddsContainer}>
            {renderBetCell(data.dealerItem, "Dealer", "back")}
            {renderBetCell(data.dealerItem, "Dealer", "lay")}
          </div>
        </div>
      </div>

      <div className={styles.casinoTableBox}>
        <div className={styles.casinoTableLeftBox}>
          <h4 className={styles.mobileTitle}>Player</h4>
          <div className={styles.sevenUpDownBox}>
            <div className={`${styles.upBox} ${(data.pd === 0 || data.pd === undefined || data.playerDownItem?.gstatus?.toUpperCase() === "SUSPENDED") ? styles.suspendedBox : ''}`}>
              <div className={styles.upDownBook}></div>
              <div className={styles.textEnd}>
                {(() => {
                  const exposure = getExposureForSelection(data.playerDownItem?.nat || "Player DOWN", "back");
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
                        <div className={styles.upDownOdds} onClick={() => (data.pd && data.pd !== 0) && onBetClick(data.pd, data.playerDownItem?.nat || "Player DOWN", data.playerDownItem || {}, "back")}>
                          {data.pd || 0}
                        </div>
                      </div>
                      <span>DOWN</span>
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className={`${styles.downBox} ${(data.pu === 0 || data.pu === undefined || data.playerUpItem?.gstatus?.toUpperCase() === "SUSPENDED") ? styles.suspendedBox : ''}`}>
              <div className={styles.upDownBook}></div>
              <div className={styles.textStart}>
                {(() => {
                  const exposure = getExposureForSelection(data.playerUpItem?.nat || "Player UP", "back");
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div className={styles.upDownOdds} onClick={() => (data.pu && data.pu !== 0) && onBetClick(data.pu, data.playerUpItem?.nat || "Player UP", data.playerUpItem || {}, "back")}>
                          {data.pu || 0}
                        </div>
                        {exposure !== 0 && (
                          <div className={styles.exposureRight} style={{ 
                            color: exposure < 0 ? '#ff0000' : '#00ff00',
                          }}>
                            {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
                          </div>
                        )}
                      </div>
                      <span>UP</span>
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
        <div className={styles.casinoTableBoxDivider}></div>
        <div className={styles.casinoTableRightBox}>
          <h4 className={styles.mobileTitle}>Dealer</h4>
          <div className={styles.sevenUpDownBox}>
            <div className={`${styles.upBox} ${(data.dd === 0 || data.dd === undefined || data.dealerDownItem?.gstatus?.toUpperCase() === "SUSPENDED") ? styles.suspendedBox : ''}`}>
              <div className={styles.upDownBook}></div>
              <div className={styles.textEnd}>
                {(() => {
                  const exposure = getExposureForSelection(data.dealerDownItem?.nat || "Dealer DOWN", "back");
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
                        <div className={styles.upDownOdds} onClick={() => (data.dd && data.dd !== 0) && onBetClick(data.dd, data.dealerDownItem?.nat || "Dealer DOWN", data.dealerDownItem || {}, "back")}>
                          {data.dd || 0}
                        </div>
                      </div>
                      <span>DOWN</span>
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className={`${styles.downBox} ${(data.du === 0 || data.du === undefined || data.dealerUpItem?.gstatus?.toUpperCase() === "SUSPENDED") ? styles.suspendedBox : ''}`}>
              <div className={styles.upDownBook}></div>
              <div className={styles.textStart}>
                {(() => {
                  const exposure = getExposureForSelection(data.dealerUpItem?.nat || "Dealer UP", "back");
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div className={styles.upDownOdds} onClick={() => (data.du && data.du !== 0) && onBetClick(data.du, data.dealerUpItem?.nat || "Dealer UP", data.dealerUpItem || {}, "back")}>
                          {data.du || 0}
                        </div>
                        {exposure !== 0 && (
                          <div className={styles.exposureRight} style={{ 
                            color: exposure < 0 ? '#ff0000' : '#00ff00',
                          }}>
                            {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
                          </div>
                        )}
                      </div>
                      <span>UP</span>
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
      </div>
    </div>
  );
};

export default BetTableTeen1;
