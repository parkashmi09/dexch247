import { useState, useEffect, useRef } from "react";
import styles from "./BetTableBallByBall.module.css";

const RunOption = ({ label, odds, bhav, min, max, onClick, betData, exposures = {}, myBets = [] }) => {
  const displayLabel = label || "Unknown";
  const isLocked = !odds || odds === 0 || betData?.gstatus?.toUpperCase() === "SUSPENDED";
  const status = isLocked ? "SUSPENDED" : "OPEN";
  
  const [isAnimating, setIsAnimating] = useState(false);
  const previousOddsRef = useRef(odds);
  const isFirstRender = useRef(true);

  // Detect odds change and trigger animation
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousOddsRef.current = odds;
      return;
    }

    if (odds !== previousOddsRef.current && odds && !isLocked) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);

      previousOddsRef.current = odds;
      return () => clearTimeout(timeout);
    } else {
      previousOddsRef.current = odds;
    }
  }, [odds, isLocked]);

  // Find the exact bet placed for this selection
  const placedBet = myBets.find(b => {
    const betSelection = (b.matchedBet || b.selection || b.player_name || "").toLowerCase().trim();
    const selection = displayLabel?.toLowerCase().trim() || "";
    return betSelection === selection;
  });

  // Get exposure value for this bet - try multiple key variations
  const getExposure = (betName) => {
    if (!betName) return 0;
    
    const exposureKeys = [
      betName,
      betName?.toLowerCase(),
      betName?.toLowerCase().trim(),
      betName?.trim(),
      // Try with different variations
      betName?.replace(/\s+/g, ' ').trim(),
      betName?.replace(/\s+/g, '').toLowerCase(),
    ];
    
    // Also try matching with the displayLabel directly
    if (displayLabel) {
      exposureKeys.push(
        displayLabel,
        displayLabel.toLowerCase(),
        displayLabel.toLowerCase().trim(),
        displayLabel.trim(),
        displayLabel.replace(/\s+/g, ' ').trim(),
        displayLabel.replace(/\s+/g, '').toLowerCase(),
      );
    }
    
    for (const key of exposureKeys) {
      if (key && exposures[key] !== undefined && exposures[key] !== null) {
        const expValue = parseFloat(exposures[key]);
        if (!isNaN(expValue)) {
          return expValue;
        }
      }
    }
    return 0;
  };

  // Get exposure - try with placedBet first, then with displayLabel
  let exposure = 0;
  if (placedBet) {
    exposure = getExposure(placedBet.matchedBet || placedBet.selection || placedBet.player_name || displayLabel);
  }
  
  // If no exposure found from placedBet, try with displayLabel directly
  if (exposure === 0) {
    exposure = getExposure(displayLabel);
  }
  
  // Show exposure if it's not zero (even if no bet placed, exposure might exist)
  const showExposure = exposure !== 0 && !isNaN(exposure);

  // Format volume/stake value for display
  const formatVolume = (volume) => {
    if (!volume || volume === 0 || volume === "—") return "-";
    const numValue = typeof volume === 'string' ? parseFloat(volume) : volume;
    return numValue ? numValue.toLocaleString() : "-";
  };

  // Format max value (1L = 100000, 50K = 50000, 25K = 25000)
  const formatMax = (maxValue) => {
    if (typeof maxValue === 'string' && maxValue.includes('K')) return maxValue;
    const numValue = typeof maxValue === 'string' ? parseFloat(maxValue) : maxValue;
    if (numValue >= 100000) return "1L";
    if (numValue >= 50000) return "50K";
    if (numValue >= 25000) return "25K";
    if (numValue >= 20000) return "20K";
    return numValue || maxValue;
  };

  return (
    <div className={styles.fancyMarket} data-title={status}>
      <div className={styles.marketRow}>
        <div className={styles.marketNationDetail}>
          <span className={`${styles.marketNationName} ${styles.pointer}`}>{displayLabel}</span>
        </div>
        <div className={`${styles.blbBox} ${isLocked ? styles.suspendedBox : ""}`}>
          <div 
            className={`${styles.marketOddBox} ${styles.back} ${isAnimating ? styles.oddsChanged : ""}`}
            onClick={isLocked ? null : () => onClick(odds, displayLabel, betData)}
          >
            {!isLocked && (
            <>
                <span className={styles.marketOdd}>{odds || "-"}</span>
                <span className={styles.marketVolume}>{formatVolume(bhav)}</span>
                {showExposure && (
                  <div className={styles.exposure} style={{ 
                    color: exposure < 0 ? '#ff0000' : '#00ff00',
                  }}>
                    {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
                  </div>
                )}
            </>
          )}
          {isLocked && showExposure && (
            <div className={styles.exposureLocked} style={{ 
              color: exposure < 0 ? '#ff0000' : '#00ff00',
            }}>
              {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
            </div>
          )}
          </div>
        </div>
        <div className={styles.fancyMinMaxBox}>
          <div className={styles.fancyMinMax}>
            <span className={styles.w100}>Min: {min || 100}</span>
            <span className={styles.w100}>Max: {formatMax(max || 100000)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BetTableBallByBall({ data = [], onBetClick, exposures = {}, myBets = [] }) {
  const isDataAvailable = data && data.length > 0;

  const fallbackData = [
    { runs: "0 Runs", odds: 0, bs: 0, min: 50, max: 25000, gstatus: "SUSPENDED" },
    { runs: "1 Runs", odds: 0, bs: 0, min: 50, max: 25000, gstatus: "SUSPENDED" },
    { runs: "2 Runs", odds: 0, bs: 0, min: 50, max: 25000, gstatus: "SUSPENDED" },
    { runs: "3 Runs", odds: 0, bs: 0, min: 50, max: 25000, gstatus: "SUSPENDED" },
    { runs: "4 Runs", odds: 0, bs: 0, min: 50, max: 25000, gstatus: "SUSPENDED" },
    { runs: "6 Runs", odds: 0, bs: 0, min: 50, max: 20000, gstatus: "SUSPENDED" },
    { runs: "Boundary", odds: 0, bs: 0, min: 50, max: 25000, gstatus: "SUSPENDED" },
    { runs: "Wicket", odds: 0, bs: 0, min: 50, max: 25000, gstatus: "SUSPENDED" },
    { runs: "Extra Runs", odds: 0, bs: 0, min: 50, max: 25000, gstatus: "SUSPENDED" },
  ];

  const displayData = isDataAvailable ? data : fallbackData;

  return (
    <div className={styles.detailPageContainer}>
      <div className={styles.tableWrapper}>
        <div className={styles.gameMarket}>
          <div className={styles.marketTitle}>Runs</div>
          <div className={styles.marketHeader}>
            <div className={styles.marketRow}>
              <div className={styles.marketNationDetail}>
                <b>Runs</b>
              </div>
              <div className={`${styles.marketOddBox} ${styles.back}`}>
                <b>Back</b>
              </div>
              <div className={styles.fancyMinMaxBox}>
                <div className={styles.fancyMinMax}>
                  <span className={styles.w100}>Min</span>
                  <span className={styles.w100}>Max</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.marketBody}>
            {displayData.map((item, index) => (
              <RunOption
                key={index}
                label={item?.runs || "Unknown"}
                odds={item?.odds}
                bhav={item?.bs || item?.limit}
                min={item?.min}
                max={item?.max}
                onClick={onBetClick}
                betData={item}
                exposures={exposures}
                myBets={myBets}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span>Results are based on stream ONLY</span>
      </div>
    </div>
  );
}
