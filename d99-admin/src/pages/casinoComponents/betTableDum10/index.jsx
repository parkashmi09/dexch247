import styles from "./BetTableDum10.module.css";

const BetTableDum10 = ({ data, onBetClick, exposures = {}, myBets = [] }) => {
  const isLocked = (value, betData) => {
    return value === 0 || value === undefined || betData?.gstatus?.toUpperCase() === "SUSPENDED";
  };

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

  // Get exposure value for a bet
  const getExposure = (betName, displayLabel) => {
    if (!betName && !displayLabel) return 0;

    const exposureKeys = [
      betName,
      betName?.toLowerCase(),
      betName?.toLowerCase().trim(),
      betName?.trim(),
      displayLabel,
      displayLabel?.toLowerCase(),
      displayLabel?.toLowerCase().trim(),
      displayLabel?.trim(),
      normalizeString(betName),
      normalizeString(displayLabel),
    ];

    // Try direct match
    for (const key of exposureKeys) {
      if (key && exposures[key] !== undefined && exposures[key] !== null) {
        const expValue = parseFloat(exposures[key]);
        if (!isNaN(expValue)) {
          return expValue;
        }
      }
    }

    // Try normalized match against all exposure keys
    const normalizedKey = normalizeString(betName || displayLabel);
    for (const expKey in exposures) {
      const normalizedExpKey = normalizeString(expKey);
      if (normalizedKey === normalizedExpKey) {
        const expValue = parseFloat(exposures[expKey]);
        if (!isNaN(expValue)) {
          return expValue;
        }
      }
    }

    return 0;
  };

  const renderOddsBox = (value, label, type, betData) => {
    const locked = isLocked(value, betData);

    // Use nat from betData as the selection name
    const selectionName = betData?.nat || label;
    const normalizedSelection = normalizeString(selectionName);

    // Check if there's a bet placed for this selection and bet type
    const hasBackBet = type === "back" && myBets.some(bet => {
      const betSelection = bet.selection || bet.matchedBet || bet.player_name || "";
      const betSelectionNormalized = normalizeString(betSelection);
      return (
        betSelectionNormalized === normalizedSelection ||
        normalizeString(bet.label || "") === normalizedSelection
      ) && (bet.type === "back" || bet.betType === "back");
    });

    const hasLayBet = type === "lay" && myBets.some(bet => {
      const betSelection = bet.selection || bet.matchedBet || bet.player_name || "";
      const betSelectionNormalized = normalizeString(betSelection);
      return (
        betSelectionNormalized === normalizedSelection ||
        normalizeString(bet.label || "") === normalizedSelection
      ) && (bet.type === "lay" || bet.betType === "lay");
    });

    // Get exposure - try with nat first (matches API team_name)
    let totalExposure = getExposure(selectionName, selectionName);
    if (totalExposure === 0) {
      totalExposure = getExposure(label, label);
    }

    let exposure = 0;
    let showExposure = false;

    if (type === "back") {
      // Only show exposure if there's a back bet placed
      exposure = hasBackBet ? totalExposure : 0;
      showExposure = exposure !== 0 && hasBackBet;
    } else if (type === "lay") {
      // Only show exposure if there's a lay bet placed
      exposure = hasLayBet ? totalExposure : 0;
      showExposure = exposure !== 0 && hasLayBet;
    }

    return (
      <div
        className={`${styles.casinoOddsBox} ${type === "back" ? styles.back : styles.lay} ${locked ? styles.suspendedBox : ""}`}
        onClick={() => !locked && onBetClick(value, betData?.nat || label, type, betData)}
        style={{ position: 'relative' }}
      >
        <span className={styles.casinoOdds} style={{ position: 'relative', zIndex: locked ? 0 : 'auto', opacity: locked ? 0.6 : 1 }}>{value || 0}</span>
        {showExposure && (
          <div
            className={styles.exposure}
            style={{
              color: exposure < 0 ? '#ff0000' : '#00ff00',
              position: 'relative',
              zIndex: 4,
            }}>
            {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
          </div>
        )}
      </div>
    );
  };

  const renderBottomOdds = (value, label, type, betData) => {
    // const locked = isLocked(value, betData);

    // Use nat from betData as the selection name
    const selectionName = betData?.nat || label;




    // Get exposure - try with nat first (matches API team_name)
    let totalExposure = getExposure(selectionName, selectionName);
    if (totalExposure === 0) {
      totalExposure = getExposure(label, label);
    }

    // Show exposure if it exists, even without a bet placed
    const exposure = totalExposure;
    const showExposure = exposure !== 0 && !isNaN(exposure);

    return (
      <div
        className={styles.oddsValue}
        // className={`${styles.oddsValue} ${locked ? styles.suspendedBox : ""}`}
        onClick={() => onBetClick(value, betData?.nat || label, type, betData)}
        // onClick={() => !locked && onBetClick(value, betData?.nat || label, type, betData)}
        style={{ position: 'relative' }}
      >
        <span style={{ position: 'relative', zIndex: 0 }}>{value || 0}</span>
        {/* <span className={locked ? styles.lockedOdds : ""} style={{ position: 'relative', zIndex: 0 }}>{value || 0}</span> */}
        {showExposure && (
          <div
            className={styles.exposure}
            style={{
              color: exposure < 0 ? '#ff0000' : '#00ff00',
              position: 'relative',
              zIndex: 4,
            }}>
            {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
          </div>
        )}
      </div>
    );
  };

  const renderBetButton = (value, label, type, suitClass, betData) => {
    const locked = isLocked(value, betData);

    return (
      <div
        className={`${styles.betButton} ${locked ? styles.suspendedBox : ""}`}
        onClick={() => !locked && onBetClick(value, betData?.nat || label, type, betData)}
        style={{ position: 'relative' }}
      >
        <span className={suitClass} style={{ position: 'relative', zIndex: locked ? 0 : 'auto', opacity: locked ? 0.6 : 1 }}>{label}</span>
      </div>
    );
  };

  return (
    <div className={styles.casinoTableBox}>
      <div className={styles.boxWrapper}>
        <div className={styles.casinoTable}>
          <div className={styles.casinoTableHeader}>
            <div className={styles.casinoNationDetail}></div>
            <div className={`${styles.casinoOddsBox} ${styles.back}`}>Back</div>
            <div className={`${styles.casinoOddsBox} ${styles.lay}`}>Lay</div>
          </div>
          <div className={styles.casinoTableBody}>
            <div className={styles.casinoTableRow}>
              <div className={styles.casinoNationDetail}>
                <div className={styles.casinoNationName}>
                  {data?.[0]?.nat || "Next Total 230 or More"}
                </div>
                <div></div>
              </div>
              {renderOddsBox(data?.[0]?.b, data?.[0]?.nat || "Next Total 230 or More", "back", data?.[0])}
              {renderOddsBox(data?.[0]?.l, data?.[0]?.nat || "Next Total 230 or More", "lay", data?.[0])}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.divider}></div>

      <div className={styles.bottomGrid}>
        <div className={styles.column}>
          <div className={styles.betOption}>
            {renderBottomOdds(data?.[4]?.b, data?.[4]?.nat || "Even", "even", data?.[4])}
            {renderBetButton(data?.[4]?.b, "Even", "even", null, data?.[4])}
          </div>

          <div className={styles.betOption}>
            {renderBottomOdds(data?.[5]?.b, data?.[5]?.nat || "Odd", "odd", data?.[5])}
            {renderBetButton(data?.[5]?.b, "Odd", "odd", null, data?.[5])}
          </div>
        </div>

        <div className={styles.column}>
          <div className={styles.betOption}>
            {renderBottomOdds(data?.[3]?.b, data?.[3]?.nat || "Red", "red", data?.[3])}
            {renderBetButton(data?.[3]?.b, "♥ ♦", "red", styles.redSuits, data?.[3])}
          </div>

          <div className={styles.betOption}>
            {renderBottomOdds(data?.[2]?.b, data?.[2]?.nat || "Black", "black", data?.[2])}
            {renderBetButton(data?.[2]?.b, "♠ ♣", "black", styles.blackSuits, data?.[2])}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetTableDum10;
