import styles from "./BetTableTeenPatti62.module.css";

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

const BetTableTeenPatti62 = ({ data = [], onBetClick, exposures = {}, myBets = [] }) => {
  // Get exposure value
  const getExposure = (betName) => {
    if (!betName) return 0;

    const exposureKeys = [
      betName,
      betName?.toLowerCase(),
      betName?.toLowerCase().trim(),
      betName?.trim(),
      normalizeString(betName),
    ];

    for (const key of exposureKeys) {
      if (key && exposures[key] !== undefined && exposures[key] !== null) {
        const expValue = parseFloat(exposures[key]);
        if (!isNaN(expValue)) {
          return expValue;
        }
      }
    }

    // Try normalized match against all exposure keys
    const normalizedKey = normalizeString(betName);
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
  
  // Debug: Log exposures to help troubleshoot
  // console.log('Exposures map:', exposures);
  // Helper to safely get data
  // Mocks based on screenshot structure

  // Section 1: Player A and B
  // Correctly mapping based on 'nat' and 'subtype' from the API response
  const playerA_Main = data.find(i => i.nat === "Player A" && i.subtype === "teen") || {};
  const playerA_Consec = data.find(i => i.nat === "Player A" && i.subtype === "con") || {};

  const playerB_Main = data.find(i => i.nat === "Player B" && i.subtype === "teen") || {};
  const playerB_Consec = data.find(i => i.nat === "Player B" && i.subtype === "con") || {};

  const renderTopRow = (label, item, playerLabel) => {
    const isBackLocked = item.b === 0 || item.b === undefined || item.gstatus?.toUpperCase() === "SUSPENDED";
    const isLayLocked = item.l === 0 || item.l === undefined || item.gstatus?.toUpperCase() === "SUSPENDED";




    // Create specific selection patterns for this player and label
    const playerMainBack = normalizeString(`${playerLabel} ${label} Back`);
    const playerMainLay = normalizeString(`${playerLabel} ${label} Lay`);
    const mainBack = normalizeString(`${label} Back`);
    const mainLay = normalizeString(`${label} Lay`);

    // Find bets for this specific selection - must match player context
    const normalizedPlayerLabel = normalizeString(playerLabel);
    const itemNat = normalizeString(item?.nat || "");
    const isPlayerA = itemNat.includes("player a") || normalizedPlayerLabel.includes("player a");
    const isPlayerB = itemNat.includes("player b") || normalizedPlayerLabel.includes("player b");

    const backBet = myBets.find(bet => {
      const betSelection = normalizeString(bet.selection || bet.matchedBet || bet.player_name || "");
      const betType = bet.type || bet.betType;

      if (betType !== "back") return false;

      // If bet selection is just the player name (e.g., "Player A"), match to this player's rows
      if (betSelection === normalizedPlayerLabel) {
        // Match if this item's nat matches the player context
        if (isPlayerA) {
          return itemNat.includes("player a") && !itemNat.includes("player b");
        }
        if (isPlayerB) {
          return itemNat.includes("player b") && !itemNat.includes("player a");
        }
        return false;
      }

      // If bet selection is just "Main Back", match based on item's nat to determine player
      if (betSelection === mainBack) {
        // Only match if this item's nat matches the player context
        // For Player A: itemNat must contain "player a" and not "player b"
        // For Player B: itemNat must contain "player b" and not "player a"
        if (isPlayerA) {
          return itemNat.includes("player a") && !itemNat.includes("player b");
        }
        if (isPlayerB) {
          return itemNat.includes("player b") && !itemNat.includes("player a");
        }
        return false;
      }

      // If bet selection includes full player name, match exactly
      if (betSelection === playerMainBack || betSelection.includes(normalizedPlayerLabel)) {
        return betSelection.includes(mainBack);
      }

      return false;
    });

    const layBet = myBets.find(bet => {
      const betSelection = normalizeString(bet.selection || bet.matchedBet || bet.player_name || "");
      const betType = bet.type || bet.betType;

      if (betType !== "lay") return false;

      // If bet selection is just the player name (e.g., "Player B"), match to this player's rows
      if (betSelection === normalizedPlayerLabel) {
        // Match if this item's nat matches the player context
        if (isPlayerA) {
          return itemNat.includes("player a") && !itemNat.includes("player b");
        }
        if (isPlayerB) {
          return itemNat.includes("player b") && !itemNat.includes("player a");
        }
        return false;
      }

      // If bet selection is just "Main Lay", match based on item's nat to determine player
      if (betSelection === mainLay) {
        // Only match if this item's nat matches the player context
        // For Player A: itemNat must contain "player a" and not "player b"
        // For Player B: itemNat must contain "player b" and not "player a"
        if (isPlayerA) {
          return itemNat.includes("player a") && !itemNat.includes("player b");
        }
        if (isPlayerB) {
          return itemNat.includes("player b") && !itemNat.includes("player a");
        }
        return false;
      }

      // If bet selection includes full player name, match exactly
      if (betSelection === playerMainLay || betSelection.includes(normalizedPlayerLabel)) {
        return betSelection.includes(mainLay);
      }

      return false;
    });

    // Get exposure from myBets (exposer field) or from exposures map
    let backExposure = 0;
    let layExposure = 0;

    if (backBet) {
      // First, try to get exposure from the bet's exposer field (most accurate)
      if (backBet.exposer !== undefined && backBet.exposer !== null && backBet.exposer !== 0) {
        backExposure = backBet.exposer;
      } else {
        // Try multiple selection name formats to find exposure
        const backSelectionNames = [
          backBet.selection || backBet.matchedBet || backBet.player_name,
          `${playerLabel} ${label} Back`,
          `${item?.nat || ""} Back`,
          item?.nat || `${playerLabel} ${label} Back`,
          // Also try just the player name (e.g., "Player B")
          playerLabel,
          normalizeString(playerLabel),
          normalizeString(backBet.selection || backBet.matchedBet || backBet.player_name || "")
        ].filter(Boolean);

        for (const selName of backSelectionNames) {
          const exp = getExposure(selName);
          if (exp !== undefined && exp !== null && exp !== 0) {
            backExposure = exp;
            break;
          }
        }
      }
    }

    if (layBet) {
      // First, try to get exposure from the bet's exposer field (most accurate)
      if (layBet.exposer !== undefined && layBet.exposer !== null && layBet.exposer !== 0) {
        layExposure = layBet.exposer;
      } else {
        // Try multiple selection name formats to find exposure
        const laySelectionNames = [
          layBet.selection || layBet.matchedBet || layBet.player_name,
          `${playerLabel} ${label} Lay`,
          `${item?.nat || ""} Lay`,
          item?.nat || `${playerLabel} ${label} Lay`,
          // Also try just the player name (e.g., "Player B")
          playerLabel,
          normalizeString(playerLabel),
          normalizeString(layBet.selection || layBet.matchedBet || layBet.player_name || "")
        ].filter(Boolean);

        for (const selName of laySelectionNames) {
          const exp = getExposure(selName);
          if (exp !== undefined && exp !== null && exp !== 0) {
            layExposure = exp;
            break;
          }
        }
      }
    }

    return (
      <div className={styles.tableRow}>
        <div className={styles.rowName}>{label}</div>
        <div
          className={`${styles.rowCell} ${styles.backCell} ${isBackLocked ? styles.suspendedBox : ""}`}
          onClick={() => !isBackLocked && onBetClick(item.b, item?.nat || `${playerLabel} ${label} Back`, item, "back")}
          style={{ position: 'relative' }}
        >
          <span style={{ position: 'relative', zIndex: 0, opacity: isBackLocked ? 0.6 : 1 }}>{item.b || 0}</span>
          {backBet && backExposure !== 0 && (
            <div className={styles.exposure} style={{
              color: backExposure < 0 ? '#ff0000' : '#00ff00',
              position: 'relative',
              zIndex: 4,
            }}>
              {backExposure < 0 ? backExposure.toFixed(2) : `+${backExposure.toFixed(2)}`}
            </div>
          )}
        </div>
        <div
          className={`${styles.rowCell} ${styles.layCell} ${isLayLocked ? styles.suspendedBox : ""}`}
          onClick={() => !isLayLocked && onBetClick(item.l, item?.nat || `${playerLabel} ${label} Lay`, item, "lay")}
          style={{ position: 'relative' }}
        >
          <span style={{ position: 'relative', zIndex: 0, opacity: isLayLocked ? 0.6 : 1 }}>{item.l || 0}</span>
          {layBet && layExposure !== 0 && (
            <div className={styles.exposure} style={{
              color: layExposure < 0 ? '#ff0000' : '#00ff00',
              position: 'relative',
              zIndex: 4,
            }}>
              {layExposure < 0 ? layExposure.toFixed(2) : `+${layExposure.toFixed(2)}`}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderValues = (cells) => {
    return cells.map((cell, idx) => {
      // Parse key to get Card Name (e.g. "Card 1") and Type ("Odd" or "Even")
      const keyParts = cell.key.split(" ");
      const cardType = keyParts.pop(); // "Odd" or "Even"
      const cardName = keyParts.join(" "); // "Card 1"

      // 1. Find the main item (e.g., with nat="Card 1")
      const mainItem = data.find(d => d.nat === cardName);

      // 2. Find the specific odd/even data inside the odds array
      let item = { b: 0, gstatus: "0" };

      if (mainItem && Array.isArray(mainItem.odds)) {
        const subItem = mainItem.odds.find(o => o.nat === cardType);
        if (subItem) {
          // Merge properties: usage of subItem odds, but allow mainItem context if needed
          item = { ...subItem, gstatus: mainItem.gstatus };
        }
      } else if (mainItem && mainItem.nat === cell.key) {
        // Fallback for old/flat structure if any
        item = mainItem;
      }

      const isLocked = item.gstatus === "0" || item.b === 0 || item.gstatus?.toUpperCase() === "SUSPENDED" || mainItem?.gstatus?.toUpperCase() === "SUSPENDED";

      const selectionName = `${cardName} ${cardType}`; // e.g., "Card 1 Odd"
      const normalizedSelection = normalizeString(selectionName);

      // Find bet for this selection (no type filter - accept both back and lay)
      const bet = myBets.find(bet => {
        const betSelection = normalizeString(bet.selection || bet.matchedBet || bet.player_name || "");
        // Match exact selection or if bet selection contains card type (Odd/Even)
        return (betSelection === normalizedSelection ||
          betSelection.includes(normalizedSelection) ||
          (betSelection.includes(normalizeString(cardType)) && betSelection.includes(normalizeString(cardName))));
      });

      // Get exposure from myBets (exposer field) or from exposures map
      let exposure = 0;
      
      if (bet) {
        // First, try to get exposure from the bet's exposer field (most accurate)
        if (bet.exposer !== undefined && bet.exposer !== null && bet.exposer !== 0) {
          exposure = bet.exposer;
        } else {
          // Try multiple selection name formats to find exposure
          const selectionNames = [
            bet.selection || bet.matchedBet || bet.player_name,
            selectionName,
            `${cardName} ${cardType}`,
            normalizeString(bet.selection || bet.matchedBet || bet.player_name || ""),
            normalizeString(selectionName),
            normalizeString(`${cardName} ${cardType}`)
          ].filter(Boolean);

          // Try to find exposure using selection names
          for (const selName of selectionNames) {
            const exp = getExposure(selName);
            if (exp !== undefined && exp !== null && exp !== 0) {
              exposure = exp;
              break;
            }
          }
        }
      }
      
      // If still no exposure found, try matching just the card type (Odd/Even)
      // This handles cases where API returns "Even" but bet is "Card 1 Even" or vice versa
      if ((exposure === 0 || exposure === undefined || exposure === null) && bet) {
        const cardTypeExposure = getExposure(cardType);
        if (cardTypeExposure !== undefined && cardTypeExposure !== null && cardTypeExposure !== 0) {
          exposure = cardTypeExposure;
        }
      }

      // Construct betData object to pass to onBetClick
      // We pass the subItem usually, but we might need mainItem IDs. 
      // Based on context, standard 'item' passing should work if it has 'sid', etc.
      // Usually placeBet uses item.sid etc. The subItem from JSON has 'sid', 'nat', etc.

      return (
        <div
          key={idx}
          className={`${styles.gridCell} ${!isLocked ? styles.gridCellActive : styles.suspendedBox}`}
          // Pass formatted selection name and the specific item with odds (no type parameter)
          onClick={() => !isLocked && onBetClick(item.b, selectionName, item)}
          style={{ position: 'relative' }}
        >
          <span style={{ position: 'relative', zIndex: 0, opacity: isLocked ? 0.6 : 1 }}>{item.b || 0}</span>
          {bet && exposure !== 0 && exposure !== undefined && exposure !== null && !isNaN(exposure) && (
            <div className={styles.exposure} style={{
              color: exposure < 0 ? '#ff0000' : '#00ff00',
              position: 'relative',
              zIndex: 4,
            }}>
              {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
            </div>
          )}
        </div>
      )
    })
  }

  // Mock data for grid rows. We'd map 6 cards.
  const oddRow = Array.from({ length: 6 }).map((_, i) => ({ label: `Card ${i + 1} Odd`, key: `Card ${i + 1} Odd` }));
  const evenRow = Array.from({ length: 6 }).map((_, i) => ({ label: `Card ${i + 1} Even`, key: `Card ${i + 1} Even` }));


  return (
    <div className={styles.betTable}>
      <div className={styles.topSection}>
        {/* Player A Table */}
        <div className={styles.playerTable}>
          <div className={styles.tableHeader}>
            <div className={`${styles.headerCell} ${styles.headerName}`}>Player A</div>
            <div className={`${styles.headerCell} ${styles.headerBack}`}>Back</div>
            <div className={`${styles.headerCell} ${styles.headerLay}`}>Lay</div>
          </div>
          {renderTopRow("Main", playerA_Main, "Player A")}
          {renderTopRow("Consecutive", playerA_Consec, "Player A")}
        </div>

        {/* Player B Table */}
        <div className={styles.playerTable}>
          <div className={styles.tableHeader}>
            <div className={`${styles.headerCell} ${styles.headerName}`}>Player B</div>
            <div className={`${styles.headerCell} ${styles.headerBack}`}>Back</div>
            <div className={`${styles.headerCell} ${styles.headerLay}`}>Lay</div>
          </div>
          {renderTopRow("Main", playerB_Main, "Player B")}
          {renderTopRow("Consecutive", playerB_Consec, "Player B")}
        </div>
      </div>

      {/* Bottom Card Grid */}
      <div className={styles.bottomSection}>
        <div className={styles.cardGrid}>
          {/* Header Row */}
          <div className={styles.gridHeaderFirst}></div>
          {[1, 2, 3, 4, 5, 6].map(num => <div key={num} className={styles.gridHeader}>Card {num}</div>)}

          {/* Odd Row */}
          <div className={styles.gridRowLabel}>Odd</div>
          {renderValues(oddRow)}

          {/* Even Row */}
          <div className={styles.gridRowLabel}>Even</div>
          {renderValues(evenRow)}
        </div>
      </div>
    </div>
  );
};

export default BetTableTeenPatti62;
