import styles from "./BetTableTrio.module.css";

const BetTableTrio = ({ data, onBetClick, exposures = {}, myBets = [] }) => {
  const getLabel = (index, side) => {
    const map = {
      0: "Session",
      1: "3 Card Judgement (1 2 4)",
      2: "3 Card Judgement (J Q K)",
      3: "Two Red Only",
      4: "Two Black Only",
      5: "Two Odd Only",
      6: "Two Even Only",
      7: "Pair",
      8: "Flush",
      9: "Straight",
      10: "Trio",
      11: "Straight Flush",
    };
    return `${map[index]} - ${side}`;
  };

  // Normalize string for matching (handles spaces around parentheses)
  const normalizeString = (str) => {
    if (!str) return "";
    // Remove spaces around parentheses and normalize whitespace
    return str
      .replace(/\s*\(\s*/g, '(')
      .replace(/\s*\)\s*/g, ')')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  };

  // Get exposure value for a bet - try multiple key variations
  const getExposure = (betName, displayLabel) => {
    if (!betName && !displayLabel) return 0;
    
    // Extract base name from label (e.g., "Session - Back" -> "Session")
    const getBaseName = (str) => {
      if (!str) return "";
      const parts = str.split(" - ");
      return parts[0] || str;
    };
    
    const baseBetName = getBaseName(betName);
    const baseDisplayLabel = getBaseName(displayLabel);
    
    // Build all possible keys
    const allKeys = [
      betName,
      betName?.toLowerCase(),
      betName?.toLowerCase().trim(),
      betName?.trim(),
      baseBetName,
      baseBetName?.toLowerCase(),
      baseBetName?.toLowerCase().trim(),
      baseBetName?.trim(),
      displayLabel,
      displayLabel?.toLowerCase(),
      displayLabel?.toLowerCase().trim(),
      displayLabel?.trim(),
      baseDisplayLabel,
      baseDisplayLabel?.toLowerCase(),
      baseDisplayLabel?.toLowerCase().trim(),
      baseDisplayLabel?.trim(),
      betName?.replace(/\s+/g, ' ').trim(),
      betName?.replace(/\s+/g, '').toLowerCase(),
      displayLabel?.replace(/\s+/g, ' ').trim(),
      displayLabel?.replace(/\s+/g, '').toLowerCase(),
      // Normalized versions (handles spaces around parentheses)
      normalizeString(betName),
      normalizeString(baseBetName),
      normalizeString(displayLabel),
      normalizeString(baseDisplayLabel),
    ];
    
    // Also try matching against all exposure keys with normalization
    for (const key of allKeys) {
      if (!key) continue;
      
      // Direct match
      if (exposures[key] !== undefined && exposures[key] !== null) {
        const expValue = parseFloat(exposures[key]);
        if (!isNaN(expValue)) {
          return expValue;
        }
      }
      
      // Try normalized match against all exposure keys
      const normalizedKey = normalizeString(key);
      for (const expKey in exposures) {
        const normalizedExpKey = normalizeString(expKey);
        if (normalizedKey === normalizedExpKey) {
          const expValue = parseFloat(exposures[expKey]);
          if (!isNaN(expValue)) {
            return expValue;
          }
        }
      }
    }
    
    return 0;
  };

  const renderCell = (value, label, onClick, className, type, betData, index) => {
    const isLocked = !value || value <= 0 || betData?.gstatus?.toUpperCase() === "SUSPENDED";
    
    // Normalize string for matching
    const normalizeString = (str) => {
      if (!str) return "";
      return str
        .replace(/\s*\(\s*/g, '(')
        .replace(/\s*\)\s*/g, ')')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    };

    // Extract base name from label (e.g., "Session - Back" -> "Session")
    const getBaseName = (str) => {
      if (!str) return "";
      const parts = str.split(" - ");
      return parts[0] || str;
    };
    
    const baseLabel = getBaseName(label);
    const normalizedLabel = normalizeString(label);
    const normalizedBaseLabel = normalizeString(baseLabel);
    
    // Check if there's a bet placed for this selection and bet type (back/lay)
    const hasBackBet = myBets.some(bet => {
      const betSelection = bet.selection || bet.matchedBet || bet.player_name || "";
      const betSelectionNormalized = normalizeString(betSelection);
      const labelNormalized = normalizedLabel;
      const baseLabelNormalized = normalizedBaseLabel;
      
      const matchesSelection = (
        betSelectionNormalized === labelNormalized ||
        betSelectionNormalized === baseLabelNormalized ||
        normalizeString(bet.label || "") === labelNormalized ||
        normalizeString(bet.label || "") === baseLabelNormalized
      );
      
      return matchesSelection && (bet.type === "back" || bet.betType === "back");
    });

    const hasLayBet = myBets.some(bet => {
      const betSelection = bet.selection || bet.matchedBet || bet.player_name || "";
      const betSelectionNormalized = normalizeString(betSelection);
      const labelNormalized = normalizedLabel;
      const baseLabelNormalized = normalizedBaseLabel;
      
      const matchesSelection = (
        betSelectionNormalized === labelNormalized ||
        betSelectionNormalized === baseLabelNormalized ||
        normalizeString(bet.label || "") === labelNormalized ||
        normalizeString(bet.label || "") === baseLabelNormalized
      );
      
      return matchesSelection && (bet.type === "lay" || bet.betType === "lay");
    });

    // Get total exposure for this selection
    let totalExposure = getExposure(baseLabel, baseLabel);
    if (totalExposure === 0) {
      totalExposure = getExposure(label, label);
    }

    // Only show exposure in the cell that matches the bet type
    let exposure = 0;
    let showExposure = false;
    
    if (type === "back" || type === null) {
      // For back cells or single odds cells
      exposure = hasBackBet ? totalExposure : 0;
      showExposure = exposure !== 0 && hasBackBet;
    } else if (type === "lay") {
      // For lay cells
      exposure = hasLayBet ? totalExposure : 0;
      showExposure = exposure !== 0 && hasLayBet;
    }
    
    return (
      <div
        className={`${className} ${isLocked ? styles.lockedCell : ""}`}
        onClick={() => !isLocked && onClick(value, label, type, betData)}
      >
        {!isLocked && (
          <>
            <span className={styles.oddsValue}>{value}</span>
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
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.sessionSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Session</span>
            <span className={styles.infoIcon}>ⓘ</span>
          </div>
          <div className={styles.oddsRow}>
            {renderCell(
              data?.[0]?.b,
              getLabel(0, "Back"),
              onBetClick,
              styles.blueOdds,
              "back",
              data?.[0],
              0
            )}
            {renderCell(
              data?.[0]?.l,
              getLabel(0, "Lay"),
              onBetClick,
              styles.pinkOdds,
              "lay",
              data?.[0],
              0
            )}
          </div>
        </div>

        {[1, 2].map((i) => (
          <div key={i} className={styles.judgementSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>{getLabel(i, "").split(" - ")[0]}</span>
            </div>
            <div className={styles.oddsRow}>
              {renderCell(
                data?.[i]?.b,
                getLabel(i, "Back"),
                onBetClick,
                styles.blueOdds,
                "back",
                data?.[i],
                i
              )}
              {renderCell(
                data?.[i]?.l,
                getLabel(i, "Lay"),
                onBetClick,
                styles.pinkOdds,
                "lay",
                data?.[i],
                i
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.row}>
        {[3, 4, 5, 6].map((i) => (
          <div key={i} className={styles.colorSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>{getLabel(i, "").split(" - ")[0]}</span>
            </div>
            <div className={styles.oddsRow}>
              {renderCell(
                data?.[i]?.b,
                getLabel(i, "Back"),
                onBetClick,
                styles.blueOdds,
                "back",
                data?.[i],
                i
              )}
              {renderCell(
                data?.[i]?.l,
                getLabel(i, "Lay"),
                onBetClick,
                styles.pinkOdds,
                "lay",
                data?.[i],
                i
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.row}>
        {[7, 8, 9, 10, 11].map((i) => (
          <div key={i} className={styles.handSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>{getLabel(i, "").split(" - ")[0]}</span>
            </div>
            {renderCell(
              data?.[i]?.b,
              getLabel(i, "Back"),
              onBetClick,
              styles.singleOdds,
              null,
              data?.[i],
              i
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BetTableTrio;
