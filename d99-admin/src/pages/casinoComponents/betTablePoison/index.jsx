import styles from "./BetTablePoison.module.css";
import spadeIcon from '../../../assets/img/cardsIcons/spade.png';
import heartIcon from '../../../assets/img/cardsIcons/heart.png';
import diamondIcon from '../../../assets/img/cardsIcons/diamond.png';
import clubIcon from '../../../assets/img/cardsIcons/club.png';

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

const BetTablePoison = ({ data = [], onBetClick, exposures = {}, myBets = [] }) => {
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

  // Find data from sub array
  const playerA = data.find(i => i.nat === "Player A" && i.subtype === "poison") || {};
  const playerB = data.find(i => i.nat === "Player B" && i.subtype === "poison") || {};
  const poisonEven = data.find(i => i.nat === "Poison Even") || {};
  const poisonOdd = data.find(i => i.nat === "Poison Odd") || {};
  const poisonRed = data.find(i => i.nat === "Poison Red") || {};
  const poisonBlack = data.find(i => i.nat === "Poison Black") || {};
  const poisonSpade = data.find(i => i.nat === "Poison Spade") || {};
  const poisonHeart = data.find(i => i.nat === "Poison Heart") || {};
  const poisonDiamond = data.find(i => i.nat === "Poison Diamond") || {};
  const poisonClub = data.find(i => i.nat === "Poison Club") || {};

  const renderPlayerRow = (item, playerLabel) => {
    const isBackLocked = item.b === 0 || item.b === undefined || item.gstatus?.toUpperCase() === "SUSPENDED";
    const isLayLocked = item.gstatus?.toUpperCase() === "SUSPENDED";

    return (
      <div className={styles.casinoTableRow}>
        <div className={styles.casinoNationDetail}>
          <div className={styles.casinoNationName}>{playerLabel}</div>
        </div>
        <div
          className={`${styles.casinoOddsBox} ${styles.back} ${isBackLocked ? styles.suspendedBox : ""}`}
          onClick={() => !isBackLocked && onBetClick(item.b, item?.nat || playerLabel, item, "back")}
        >
          <span className={styles.casinoOdds} style={{ opacity: isBackLocked ? 0.6 : 1 }}>{item.b || 0}</span>
        </div>
        <div
          className={`${styles.casinoOddsBox} ${styles.lay} ${isLayLocked ? styles.suspendedBox : ""}`}
          onClick={() => !isLayLocked && onBetClick(item.l, item?.nat || playerLabel, item, "lay")}
        >
          <span className={styles.casinoOdds} style={{ opacity: isLayLocked ? 0.6 : 1 }}>{item.l || 0}</span>
        </div>
      </div>
    );
  };



  // Poison Even/Odd/Red/Black cells - filter out empty items and duplicates
  const poisonGeneralCells = [
    { item: poisonEven, label: "Even" },
    { item: poisonOdd, label: "Odd" },
    {
      item: poisonRed,
      label: "Red",
      icons: [heartIcon, diamondIcon]
    },
    {
      item: poisonBlack,
      label: "Black",
      icons: [spadeIcon, clubIcon]
    },
  ]
    .filter(cell => cell.item && cell.item.nat && Object.keys(cell.item).length > 0) // Only include cells with valid data
    .filter((cell, index, self) =>
      index === self.findIndex(c => c.item && c.item.nat === cell.item.nat)
    ); // Remove duplicates based on nat property

  // Poison Suit cells - filter out empty items and duplicates
  const poisonSuitCells = [
    { item: poisonSpade, icon: spadeIcon },
    { item: poisonHeart, icon: heartIcon },
    { item: poisonDiamond, icon: diamondIcon },
    { item: poisonClub, icon: clubIcon },
  ]
    .filter(cell => cell.item && cell.item.nat && Object.keys(cell.item).length > 0) // Only include cells with valid data
    .filter((cell, index, self) =>
      index === self.findIndex(c => c.item && c.item.nat === cell.item.nat)
    ); // Remove duplicates based on nat property

  return (
    <div className={styles.casinoDetail}>
      <div className={`${styles.casinoTable}`}>
        <div className={styles.casinoTableBox}>
          {/* Left Box - Player A and Player B */}
          <div className={styles.casinoTableLeftBox}>
            <div className={styles.casinoTableHeader}>
              <div className={styles.casinoNationDetail}></div>
              <div className={`${styles.casinoOddsBox} ${styles.back}`}>Back</div>
              <div className={`${styles.casinoOddsBox} ${styles.lay}`}>Lay</div>
            </div>
            <div className={styles.casinoTableBody}>
              {renderPlayerRow(playerA, "Player A")}
              {renderPlayerRow(playerB, "Player B")}
            </div>
          </div>

          {/* Right Box - Poison Bets */}
          <div className={styles.casinoTableRightBox}>
            {/* First Section: Even, Odd, Red, Black */}
            <div className={styles.jokerOtherOdds}>
              <div className={styles.casinoTableHeader}>
                <div className={styles.casinoNationDetail}></div>
                <div className={styles.casinoOddsBox}>Even</div>
                <div className={styles.casinoOddsBox}>Odd</div>
                <div className={styles.casinoOddsBox}>
                  <span>Red</span>
                  <span className={`${styles.cardIcon} ${styles.ms1}`}>
                    <span className={styles.cardRed}>
                      <img src={heartIcon} alt="Heart" className={styles.cardIconImg} />
                    </span>
                    <span className={styles.cardRed}>
                      <img src={diamondIcon} alt="Diamond" className={styles.cardIconImg} />
                    </span>
                  </span>
                </div>
                <div className={styles.casinoOddsBox}>
                  <span>Black</span>
                  <span className={`${styles.cardIcon} ${styles.ms1}`}>
                    <span className={styles.cardBlack}>
                      <img src={spadeIcon} alt="Spade" className={styles.cardIconImg} />
                    </span>
                    <span className={styles.cardBlack}>
                      <img src={clubIcon} alt="Club" className={styles.cardIconImg} />
                    </span>
                  </span>
                </div>
              </div>
              <div className={styles.casinoTableBody}>
                <div className={styles.casinoTableRow}>
                  <div className={styles.casinoNationDetail}>
                    <div className={styles.casinoNationName}>Poison</div>
                  </div>
                  {poisonGeneralCells
                    .filter(cell => cell.item && cell.item.nat && Object.keys(cell.item).length > 0)
                    .map((cell, index) => {
                      const item = cell.item;
                      if (!item || !item.nat || Object.keys(item).length === 0) return null;

                      const isLocked = item.gstatus === "SUSPENDED" || item.b === 0 || item.b === undefined;
                      const selectionName = item?.nat || "";
                      const normalizedSelection = normalizeString(selectionName);
                      const uniqueKey = `general-${item.sid || item.nat || index}`;

                      const bet = myBets.find(bet => {
                        const betSelection = normalizeString(bet.selection || bet.matchedBet || bet.player_name || "");
                        return betSelection === normalizedSelection || betSelection.includes(normalizedSelection);
                      });

                      let exposure = 0;
                      if (bet) {
                        if (bet.exposer !== undefined && bet.exposer !== null && bet.exposer !== 0) {
                          exposure = bet.exposer;
                        } else {
                          const exp = getExposure(selectionName);
                          if (exp !== undefined && exp !== null && exp !== 0) {
                            exposure = exp;
                          }
                        }
                      }

                      const boxClass = `${styles.casinoOddsBox} ${styles.back}`;

                      return (
                        <div
                          key={uniqueKey}
                          className={`${boxClass} ${isLocked ? styles.poisonSuspendedBox : ""}`}
                          onClick={() => !isLocked && onBetClick(item.b, selectionName, item)}
                          style={{ position: 'relative' }}
                        >
                          <span className={styles.casinoOdds} style={{ opacity: isLocked ? 0.6 : 1 }}>{item.b || 0}</span>
                          {bet && exposure !== 0 && (
                            <div className={styles.exposure} style={{
                              color: exposure < 0 ? '#ff0000' : '#00ff00',
                              position: 'absolute',
                              bottom: '2px',
                              right: '2px',
                              fontSize: '10px'
                            }}>
                              {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Second Section: Spade, Heart, Diamond, Club */}
            <div className={`${styles.jokerOtherOdds} ${styles.dtredblack}`} style={{ marginTop: '5px' }}>
              <div className={styles.casinoTableHeader}>
                <div className={styles.casinoNationDetail}></div>
                <div className={styles.casinoOddsBox}>
                  <span className={`${styles.cardIcon} ${styles.ms1}`}>
                    <span className={styles.cardBlack}>
                      <img src={spadeIcon} alt="Spade" className={styles.cardIconImg} />
                    </span>
                  </span>
                </div>
                <div className={styles.casinoOddsBox}>
                  <span className={`${styles.cardIcon} ${styles.ms1}`}>
                    <span className={styles.cardRed}>
                      <img src={heartIcon} alt="Heart" className={styles.cardIconImg} />
                    </span>
                  </span>
                </div>
                <div className={styles.casinoOddsBox}>
                  <span className={`${styles.cardIcon} ${styles.ms1}`}>
                    <span className={styles.cardRed}>
                      <img src={diamondIcon} alt="Diamond" className={styles.cardIconImg} />
                    </span>
                  </span>
                </div>
                <div className={styles.casinoOddsBox}>
                  <span className={`${styles.cardIcon} ${styles.ms1}`}>
                    <span className={styles.cardBlack}>
                      <img src={clubIcon} alt="Club" className={styles.cardIconImg} />
                    </span>
                  </span>
                </div>
              </div>
              <div className={styles.casinoTableBody}>
                <div className={styles.casinoTableRow}>
                  <div className={`${styles.casinoNationDetail} ${styles.poisonLabelCell}`}>
                    <div className={styles.casinoNationName}>Poison</div>
                  </div>
                  {poisonSuitCells
                    .filter(cell => cell.item && cell.item.nat && Object.keys(cell.item).length > 0)
                    .map((cell, index) => {
                      const item = cell.item;
                      if (!item || !item.nat || Object.keys(item).length === 0) return null;

                      const isLocked = item.gstatus === "SUSPENDED" || item.b === 0 || item.b === undefined;
                      const selectionName = item?.nat || "";
                      const normalizedSelection = normalizeString(selectionName);
                      const uniqueKey = `suit-${item.sid || item.nat || index}`;

                      const bet = myBets.find(bet => {
                        const betSelection = normalizeString(bet.selection || bet.matchedBet || bet.player_name || "");
                        return betSelection === normalizedSelection || betSelection.includes(normalizedSelection);
                      });

                      let exposure = 0;
                      if (bet) {
                        if (bet.exposer !== undefined && bet.exposer !== null && bet.exposer !== 0) {
                          exposure = bet.exposer;
                        } else {
                          const exp = getExposure(selectionName);
                          if (exp !== undefined && exp !== null && exp !== 0) {
                            exposure = exp;
                          }
                        }
                      }

                      const boxClass = `${styles.casinoOddsBox} ${styles.back}`;

                      return (
                        <div
                          key={uniqueKey}
                          className={`${boxClass} ${isLocked ? styles.poisonSuspendedBox : ""}`}
                          onClick={() => !isLocked && onBetClick(item.b, selectionName, item)}
                          style={{ position: 'relative' }}
                        >
                          <span className={styles.casinoOdds} style={{ opacity: isLocked ? 0.6 : 1 }}>{item.b || 0}</span>
                          {bet && exposure !== 0 && (
                            <div className={styles.exposure} style={{
                              color: exposure < 0 ? '#ff0000' : '#00ff00',
                              position: 'absolute',
                              bottom: '2px',
                              right: '2px',
                              fontSize: '10px'
                            }}>
                              {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetTablePoison;
