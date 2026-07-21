import styles from "./BetTableDragon6.module.css";

export default function BetTableDragon6({ data = [], onBetClick, exposures = {}, myBets = [] }) {
  // Helper function to find bet data by name
  const findBetData = (name) => {
    return data.find((item) => item.nat === name) || null;
  };

  // Check if bet is suspended
  const isSuspended = (betData) => {
    return betData?.gstatus === "SUSPENDED" || !betData || betData.b === 0 || betData.b === null || betData.b === undefined;
  };

  // Get exposure value for a bet from API exposures
  const getExposure = (betName) => {
    if (!exposures || Object.keys(exposures).length === 0) {
      return null; // No exposure data from API yet
    }
    
    const exposureKeys = [
      betName,
      betName?.toLowerCase(),
    ];

    for (const key of exposureKeys) {
      if (exposures[key] !== undefined && exposures[key] !== null) {
        return exposures[key];
      }
    }
    return null; // Exposure not found in API response
  };

  // Format exposure value
  const formatExposure = (value) => {
    if (!value || value === 0) return null;
    return value < 0 ? value.toFixed(2) : `+${value.toFixed(2)}`;
  };

  // Get exposure color
  const getExposureColor = (value) => {
    if (!value || value === 0) return '#00ff00';
    return value < 0 ? '#ff0000' : '#00ff00';
  };

  // Get bet data
  const dragonBet = findBetData("Dragon");
  const tigerBet = findBetData("Tiger");
  const pairBet = findBetData("Pair");
  const dragonEven = findBetData("Dragon Even");
  const dragonOdd = findBetData("Dragon Odd");
  const dragonRed = findBetData("Dragon Red");
  const dragonBlack = findBetData("Dragon Black");
  const tigerEven = findBetData("Tiger Even");
  const tigerOdd = findBetData("Tiger Odd");
  const tigerRed = findBetData("Tiger Red");
  const tigerBlack = findBetData("Tiger Black");
  const dragonSpade = findBetData("Dragon Spade");
  const dragonHeart = findBetData("Dragon Heart");
  const dragonClub = findBetData("Dragon Club");
  const dragonDiamond = findBetData("Dragon Diamond");
  const tigerSpade = findBetData("Tiger Spade");
  const tigerHeart = findBetData("Tiger Heart");
  const tigerClub = findBetData("Tiger Club");
  const tigerDiamond = findBetData("Tiger Diamond");

  return (
    <div className={styles.casinoDetail}>
      <div className={styles.casinoTable}>
        {/* Back/Lay and Pair Section */}
        <div className={styles.casinoTableBox}>
          <div className={styles.casinoTableLeftBox}>
            <div className={styles.casinoTableHeader}>
              <div className={styles.casinoNationDetail}></div>
              <div className={`${styles.casinoOddsBox} ${styles.back}`}>Back</div>
              <div className={`${styles.casinoOddsBox} ${styles.lay}`}>Lay</div>
            </div>
            <div className={styles.casinoTableBody}>
              <div className={`${styles.casinoTableRow} ${isSuspended(dragonBet) ? styles.suspendedRow : ""}`}>
                <div className={styles.casinoNationDetail}>
                  <div className={styles.casinoNationName}>Dragon</div>
                </div>
                <div
                  className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(dragonBet) ? styles.suspendedBox : ""}`}
                  onClick={() => !isSuspended(dragonBet) && onBetClick("Dragon", dragonBet?.b || 0, "back", dragonBet)}
                >
                  <span className={styles.casinoOdds}>{isSuspended(dragonBet) ? "0" : (dragonBet?.b || "0")}</span>
                  {(() => {
                    // Check exposure directly from API using bet name
                    const dragonExposure = getExposure("Dragon");
                    const showDragonExposure = dragonExposure !== null && dragonExposure !== undefined && dragonExposure !== 0;
                    return showDragonExposure && (
                      <div className={styles.exposure} style={{ color: getExposureColor(dragonExposure) }}>
                        {formatExposure(dragonExposure)}
                      </div>
                    );
                  })()}
                </div>
                <div
                  className={`${styles.casinoOddsBox} ${styles.lay} ${isSuspended(dragonBet) ? styles.suspendedBox : ""}`}
                  onClick={() => !isSuspended(dragonBet) && dragonBet?.l && onBetClick("Dragon", dragonBet.l, "lay", dragonBet)}
                >
                  <span className={styles.casinoOdds}>{isSuspended(dragonBet) || !dragonBet?.l ? "0" : dragonBet.l}</span>
                  {(() => {
                    // Check exposure directly from API using bet name
                    const dragonLayExposure = getExposure("Dragon");
                    const showDragonLayExposure = dragonLayExposure !== null && dragonLayExposure !== undefined && dragonLayExposure !== 0;
                    return showDragonLayExposure && (
                      <div className={styles.exposure} style={{ color: getExposureColor(dragonLayExposure) }}>
                        {formatExposure(dragonLayExposure)}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className={`${styles.casinoTableRow} ${isSuspended(tigerBet) ? styles.suspendedRow : ""}`}>
                <div className={styles.casinoNationDetail}>
                  <div className={styles.casinoNationName}>Tiger</div>
                </div>
                <div
                  className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(tigerBet) ? styles.suspendedBox : ""}`}
                  onClick={() => !isSuspended(tigerBet) && onBetClick("Tiger", tigerBet?.b || 0, "back", tigerBet)}
                >
                  <span className={styles.casinoOdds}>{isSuspended(tigerBet) ? "0" : (tigerBet?.b || "0")}</span>
                  {(() => {
                    // Check exposure directly from API using bet name
                    const tigerExposure = getExposure("Tiger");
                    const showTigerExposure = tigerExposure !== null && tigerExposure !== undefined && tigerExposure !== 0;
                    return showTigerExposure && (
                      <div className={styles.exposure} style={{ color: getExposureColor(tigerExposure) }}>
                        {formatExposure(tigerExposure)}
                      </div>
                    );
                  })()}
                </div>
                <div
                  className={`${styles.casinoOddsBox} ${styles.lay} ${isSuspended(tigerBet) ? styles.suspendedBox : ""}`}
                  onClick={() => !isSuspended(tigerBet) && tigerBet?.l && onBetClick("Tiger", tigerBet.l, "lay", tigerBet)}
                >
                  <span className={styles.casinoOdds}>{isSuspended(tigerBet) || !tigerBet?.l ? "0" : tigerBet.l}</span>
                  {(() => {
                    // Check exposure directly from API using bet name
                    const tigerLayExposure = getExposure("Tiger");
                    const showTigerLayExposure = tigerLayExposure !== null && tigerLayExposure !== undefined && tigerLayExposure !== 0;
                    return showTigerLayExposure && (
                      <div className={styles.exposure} style={{ color: getExposureColor(tigerLayExposure) }}>
                        {formatExposure(tigerLayExposure)}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
          <div className={`${styles.casinoTableRightBox} ${styles.dtpair}`}>
            <div className={`${styles.casinoOdds} ${styles.textCenter}`}>{pairBet?.b || "0"}</div>
            <div
              className={`${styles.casinoOddsBoxDt20} ${styles.back} ${styles.casinoOddsBoxTheme} ${isSuspended(pairBet) ? styles.suspendedBox : ""}`}
              onClick={() => !isSuspended(pairBet) && onBetClick("Pair", pairBet?.b || 0, "special", pairBet)}
            >
              <span className={styles.casinoOdds}>Pair</span>
              {(() => {
                // Check exposure directly from API using bet name
                const pairExposure = getExposure("Pair");
                const showPairExposure = pairExposure !== null && pairExposure !== undefined && pairExposure !== 0;
                return showPairExposure && (
                  <div className={styles.exposure} style={{ color: getExposureColor(pairExposure) }}>
                    {formatExposure(pairExposure)}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Even/Odd and Red/Black Section */}
        <div className={`${styles.casinoTableBox} ${styles.mt3}`}>
          <div className={styles.casinoTableLeftBox}>
            <div className={styles.casinoTableHeader}>
              <div className={styles.casinoNationDetail}></div>
              <div className={`${styles.casinoOddsBox} ${styles.back}`}>Even</div>
              <div className={`${styles.casinoOddsBox} ${styles.back}`}>Odd</div>
            </div>
            <div className={styles.casinoTableBody}>
              <div className={`${styles.casinoTableRow} ${isSuspended(dragonEven) && isSuspended(dragonOdd) ? styles.suspendedRow : ""}`}>
                <div className={styles.casinoNationDetail}>
                  <div className={styles.casinoNationName}>Dragon</div>
                </div>
                <div
                  className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(dragonEven) ? styles.suspendedBox : ""}`}
                  onClick={() => !isSuspended(dragonEven) && onBetClick("Dragon Even", dragonEven?.b || 0, "special", dragonEven)}
                >
                  <span className={styles.casinoOdds}>{isSuspended(dragonEven) ? "0" : (dragonEven?.b || "0")}</span>
                  {(() => {
                    // Check exposure directly from API using bet name
                    const dragonEvenExposure = getExposure("Dragon Even");
                    const showDragonEvenExposure = dragonEvenExposure !== null && dragonEvenExposure !== undefined && dragonEvenExposure !== 0;
                    return showDragonEvenExposure && (
                      <div className={styles.exposure} style={{ color: getExposureColor(dragonEvenExposure) }}>
                        {formatExposure(dragonEvenExposure)}
                      </div>
                    );
                  })()}
                </div>
                <div
                  className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(dragonOdd) ? styles.suspendedBox : ""}`}
                  onClick={() => !isSuspended(dragonOdd) && onBetClick("Dragon Odd", dragonOdd?.b || 0, "special", dragonOdd)}
                >
                  <span className={styles.casinoOdds}>{isSuspended(dragonOdd) ? "0" : (dragonOdd?.b || "0")}</span>
                  {(() => {
                    // Check exposure directly from API using bet name
                    const dragonOddExposure = getExposure("Dragon Odd");
                    const showDragonOddExposure = dragonOddExposure !== null && dragonOddExposure !== undefined && dragonOddExposure !== 0;
                    return showDragonOddExposure && (
                      <div className={styles.exposure} style={{ color: getExposureColor(dragonOddExposure) }}>
                        {formatExposure(dragonOddExposure)}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className={`${styles.casinoTableRow} ${isSuspended(tigerEven) && isSuspended(tigerOdd) ? styles.suspendedRow : ""}`}>
                <div className={styles.casinoNationDetail}>
                  <div className={styles.casinoNationName}>Tiger</div>
                </div>
                <div
                  className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(tigerEven) ? styles.suspendedBox : ""}`}
                  onClick={() => !isSuspended(tigerEven) && onBetClick("Tiger Even", tigerEven?.b || 0, "special", tigerEven)}
                >
                  <span className={styles.casinoOdds}>{isSuspended(tigerEven) ? "0" : (tigerEven?.b || "0")}</span>
                  {(() => {
                    // Check exposure directly from API using bet name
                    const tigerEvenExposure = getExposure("Tiger Even");
                    const showTigerEvenExposure = tigerEvenExposure !== null && tigerEvenExposure !== undefined && tigerEvenExposure !== 0;
                    return showTigerEvenExposure && (
                      <div className={styles.exposure} style={{ color: getExposureColor(tigerEvenExposure) }}>
                        {formatExposure(tigerEvenExposure)}
                      </div>
                    );
                  })()}
                </div>
                <div
                  className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(tigerOdd) ? styles.suspendedBox : ""}`}
                  onClick={() => !isSuspended(tigerOdd) && onBetClick("Tiger Odd", tigerOdd?.b || 0, "special", tigerOdd)}
                >
                  <span className={styles.casinoOdds}>{isSuspended(tigerOdd) ? "0" : (tigerOdd?.b || "0")}</span>
                  {(() => {
                    // Check exposure directly from API using bet name
                    const tigerOddExposure = getExposure("Tiger Odd");
                    const showTigerOddExposure = tigerOddExposure !== null && tigerOddExposure !== undefined && tigerOddExposure !== 0;
                    return showTigerOddExposure && (
                      <div className={styles.exposure} style={{ color: getExposureColor(tigerOddExposure) }}>
                        {formatExposure(tigerOddExposure)}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
          <div className={`${styles.casinoTableRightBox} ${styles.dtredblack}`}>
            <div className={styles.casinoTableHeader}>
              <div className={styles.casinoNationDetail}></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={`${styles.casinoOddsBox} ${styles.back}`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>Red</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className={`${styles.cardIcon} ${styles.ms1}`}>
                  <span className={styles.cardRed}>♥</span>
                </span>
                <span className={`${styles.cardIcon} ${styles.ms1}`}>
                  <span className={styles.cardRed}>♦</span>
                </span>
                </div>
              </div>
              </div>
              <div className={`${styles.casinoOddsBox} ${styles.back}`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div>Black  </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className={`${styles.cardIcon} ${styles.ms1}`}>
                  <span className={styles.cardBlack}>♠</span>
                </span>
                <span className={`${styles.cardIcon} ${styles.ms1}`}>
                    <span className={styles.cardBlack}>♣</span>
                  </span>
                </div>
                </div>
            
              </div>
            </div>
            </div>
            <div className={styles.casinoTableBody}>
              <div className={`${styles.casinoTableRow} ${isSuspended(dragonRed) && isSuspended(dragonBlack) ? styles.suspendedRow : ""}`}>
                <div className={styles.casinoNationDetail}>
                  <div className={styles.casinoNationName}>Dragon</div>
                </div>
                <div
                  className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(dragonRed) ? styles.suspendedBox : ""}`}
                  onClick={() => !isSuspended(dragonRed) && onBetClick("Dragon Red", dragonRed?.b || 0, "special", dragonRed)}
                >
                  <span className={styles.casinoOdds}>{isSuspended(dragonRed) ? "0" : (dragonRed?.b || "0")}</span>
                  {(() => {
                    // Check exposure directly from API using bet name
                    const dragonRedExposure = getExposure("Dragon Red");
                    const showDragonRedExposure = dragonRedExposure !== null && dragonRedExposure !== undefined && dragonRedExposure !== 0;
                    return showDragonRedExposure && (
                      <div className={styles.exposure} style={{ color: getExposureColor(dragonRedExposure) }}>
                        {formatExposure(dragonRedExposure)}
                      </div>
                    );
                  })()}
                </div>
                <div
                  className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(dragonBlack) ? styles.suspendedBox : ""}`}
                  onClick={() => !isSuspended(dragonBlack) && onBetClick("Dragon Black", dragonBlack?.b || 0, "special", dragonBlack)}
                >
                  <span className={styles.casinoOdds}>{isSuspended(dragonBlack) ? "0" : (dragonBlack?.b || "0")}</span>
                  {(() => {
                    // Check exposure directly from API using bet name
                    const dragonBlackExposure = getExposure("Dragon Black");
                    const showDragonBlackExposure = dragonBlackExposure !== null && dragonBlackExposure !== undefined && dragonBlackExposure !== 0;
                    return showDragonBlackExposure && (
                      <div className={styles.exposure} style={{ color: getExposureColor(dragonBlackExposure) }}>
                        {formatExposure(dragonBlackExposure)}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className={`${styles.casinoTableRow} ${isSuspended(tigerRed) && isSuspended(tigerBlack) ? styles.suspendedRow : ""}`}>
                <div className={styles.casinoNationDetail}>
                  <div className={styles.casinoNationName}>Tiger</div>
                </div>
                <div
                  className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(tigerRed) ? styles.suspendedBox : ""}`}
                  onClick={() => !isSuspended(tigerRed) && onBetClick("Tiger Red", tigerRed?.b || 0, "special", tigerRed)}
                >
                  <span className={styles.casinoOdds}>{isSuspended(tigerRed) ? "0" : (tigerRed?.b || "0")}</span>
                  {(() => {
                    // Check exposure directly from API using bet name
                    const tigerRedExposure = getExposure("Tiger Red");
                    const showTigerRedExposure = tigerRedExposure !== null && tigerRedExposure !== undefined && tigerRedExposure !== 0;
                    return showTigerRedExposure && (
                      <div className={styles.exposure} style={{ color: getExposureColor(tigerRedExposure) }}>
                        {formatExposure(tigerRedExposure)}
                      </div>
                    );
                  })()}
                </div>
                <div
                  className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(tigerBlack) ? styles.suspendedBox : ""}`}
                  onClick={() => !isSuspended(tigerBlack) && onBetClick("Tiger Black", tigerBlack?.b || 0, "special", tigerBlack)}
                >
                  <span className={styles.casinoOdds}>{isSuspended(tigerBlack) ? "0" : (tigerBlack?.b || "0")}</span>
                  {(() => {
                    // Check exposure directly from API using bet name
                    const tigerBlackExposure = getExposure("Tiger Black");
                    const showTigerBlackExposure = tigerBlackExposure !== null && tigerBlackExposure !== undefined && tigerBlackExposure !== 0;
                    return showTigerBlackExposure && (
                      <div className={styles.exposure} style={{ color: getExposureColor(tigerBlackExposure) }}>
                        {formatExposure(tigerBlackExposure)}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suit Bets Section */}
        <div className={`${styles.casinoTableFullBox} ${styles.dt1dayOtherOdds} ${styles.mt3}`}>
          <div className={styles.casinoTableHeader}>
            <div className={styles.casinoNationDetail}></div>
            <div className={styles.casinoOddsBox}>
              <span className={`${styles.cardIcon} ${styles.ms1}`}>
                <span className={styles.cardBlack}>♠</span>
              </span>
            </div>
            <div className={styles.casinoOddsBox}>
              <span className={`${styles.cardIcon} ${styles.ms1}`}>
                <span className={styles.cardRed}>♥</span>
              </span>
            </div>
            <div className={styles.casinoOddsBox}>
              <span className={`${styles.cardIcon} ${styles.ms1}`}>
                <span className={styles.cardBlack}>♣</span>
              </span>
            </div>
            <div className={styles.casinoOddsBox}>
              <span className={`${styles.cardIcon} ${styles.ms1}`}>
                <span className={styles.cardRed}>♦</span>
              </span>
            </div>
          </div>
          <div className={styles.casinoTableBody}>
            <div className={styles.casinoTableRow}>
              <div className={styles.casinoNationDetail}>
                <div className={styles.casinoNationName}>Dragon</div>
              </div>
              <div
                className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(dragonSpade) ? styles.suspendedBox : ""}`}
                onClick={() => !isSuspended(dragonSpade) && onBetClick("Dragon Spade", dragonSpade?.b || 0, "special", dragonSpade)}
              >
                <span className={styles.casinoOdds}>{isSuspended(dragonSpade) ? "0" : (dragonSpade?.b || "0")}</span>
                {(() => {
                  // Check exposure directly from API using bet name
                  const dragonSpadeExposure = getExposure("Dragon Spade");
                  const showDragonSpadeExposure = dragonSpadeExposure !== null && dragonSpadeExposure !== undefined && dragonSpadeExposure !== 0;
                  return showDragonSpadeExposure && (
                    <div className={styles.exposure} style={{ color: getExposureColor(dragonSpadeExposure) }}>
                      {formatExposure(dragonSpadeExposure)}
                    </div>
                  );
                })()}
              </div>
              <div
                className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(dragonHeart) ? styles.suspendedBox : ""}`}
                onClick={() => !isSuspended(dragonHeart) && onBetClick("Dragon Heart", dragonHeart?.b || 0, "special", dragonHeart)}
              >
                <span className={styles.casinoOdds}>{isSuspended(dragonHeart) ? "0" : (dragonHeart?.b || "0")}</span>
                {(() => {
                  // Check exposure directly from API using bet name
                  const dragonHeartExposure = getExposure("Dragon Heart");
                  const showDragonHeartExposure = dragonHeartExposure !== null && dragonHeartExposure !== undefined && dragonHeartExposure !== 0;
                  return showDragonHeartExposure && (
                    <div className={styles.exposure} style={{ color: getExposureColor(dragonHeartExposure) }}>
                      {formatExposure(dragonHeartExposure)}
                    </div>
                  );
                })()}
              </div>
              <div
                className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(dragonClub) ? styles.suspendedBox : ""}`}
                onClick={() => !isSuspended(dragonClub) && onBetClick("Dragon Club", dragonClub?.b || 0, "special", dragonClub)}
              >
                <span className={styles.casinoOdds}>{isSuspended(dragonClub) ? "0" : (dragonClub?.b || "0")}</span>
                {(() => {
                  // Check exposure directly from API using bet name
                  const dragonClubExposure = getExposure("Dragon Club");
                  const showDragonClubExposure = dragonClubExposure !== null && dragonClubExposure !== undefined && dragonClubExposure !== 0;
                  return showDragonClubExposure && (
                    <div className={styles.exposure} style={{ color: getExposureColor(dragonClubExposure) }}>
                      {formatExposure(dragonClubExposure)}
                    </div>
                  );
                })()}
              </div>
              <div
                className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(dragonDiamond) ? styles.suspendedBox : ""}`}
                onClick={() => !isSuspended(dragonDiamond) && onBetClick("Dragon Diamond", dragonDiamond?.b || 0, "special", dragonDiamond)}
              >
                <span className={styles.casinoOdds}>{isSuspended(dragonDiamond) ? "0" : (dragonDiamond?.b || "0")}</span>
                {(() => {
                  // Check exposure directly from API using bet name
                  const dragonDiamondExposure = getExposure("Dragon Diamond");
                  const showDragonDiamondExposure = dragonDiamondExposure !== null && dragonDiamondExposure !== undefined && dragonDiamondExposure !== 0;
                  return showDragonDiamondExposure && (
                    <div className={styles.exposure} style={{ color: getExposureColor(dragonDiamondExposure) }}>
                      {formatExposure(dragonDiamondExposure)}
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className={styles.casinoTableRow}>
              <div className={styles.casinoNationDetail}>
                <div className={styles.casinoNationName}>Tiger</div>
              </div>
              <div
                className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(tigerSpade) ? styles.suspendedBox : ""}`}
                onClick={() => !isSuspended(tigerSpade) && onBetClick("Tiger Spade", tigerSpade?.b || 0, "special", tigerSpade)}
              >
                <span className={styles.casinoOdds}>{isSuspended(tigerSpade) ? "0" : (tigerSpade?.b || "0")}</span>
                {(() => {
                  // Check exposure directly from API using bet name
                  const tigerSpadeExposure = getExposure("Tiger Spade");
                  const showTigerSpadeExposure = tigerSpadeExposure !== null && tigerSpadeExposure !== undefined && tigerSpadeExposure !== 0;
                  return showTigerSpadeExposure && (
                    <div className={styles.exposure} style={{ color: getExposureColor(tigerSpadeExposure) }}>
                      {formatExposure(tigerSpadeExposure)}
                    </div>
                  );
                })()}
              </div>
              <div
                className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(tigerHeart) ? styles.suspendedBox : ""}`}
                onClick={() => !isSuspended(tigerHeart) && onBetClick("Tiger Heart", tigerHeart?.b || 0, "special", tigerHeart)}
              >
                <span className={styles.casinoOdds}>{isSuspended(tigerHeart) ? "0" : (tigerHeart?.b || "0")}</span>
                {(() => {
                  // Check exposure directly from API using bet name
                  const tigerHeartExposure = getExposure("Tiger Heart");
                  const showTigerHeartExposure = tigerHeartExposure !== null && tigerHeartExposure !== undefined && tigerHeartExposure !== 0;
                  return showTigerHeartExposure && (
                    <div className={styles.exposure} style={{ color: getExposureColor(tigerHeartExposure) }}>
                      {formatExposure(tigerHeartExposure)}
                    </div>
                  );
                })()}
              </div>
              <div
                className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(tigerClub) ? styles.suspendedBox : ""}`}
                onClick={() => !isSuspended(tigerClub) && onBetClick("Tiger Club", tigerClub?.b || 0, "special", tigerClub)}
              >
                <span className={styles.casinoOdds}>{isSuspended(tigerClub) ? "0" : (tigerClub?.b || "0")}</span>
                {(() => {
                  // Check exposure directly from API using bet name
                  const tigerClubExposure = getExposure("Tiger Club");
                  const showTigerClubExposure = tigerClubExposure !== null && tigerClubExposure !== undefined && tigerClubExposure !== 0;
                  return showTigerClubExposure && (
                    <div className={styles.exposure} style={{ color: getExposureColor(tigerClubExposure) }}>
                      {formatExposure(tigerClubExposure)}
                    </div>
                  );
                })()}
              </div>
              <div
                className={`${styles.casinoOddsBox} ${styles.back} ${isSuspended(tigerDiamond) ? styles.suspendedBox : ""}`}
                onClick={() => !isSuspended(tigerDiamond) && onBetClick("Tiger Diamond", tigerDiamond?.b || 0, "special", tigerDiamond)}
              >
                <span className={styles.casinoOdds}>{isSuspended(tigerDiamond) ? "0" : (tigerDiamond?.b || "0")}</span>
                {(() => {
                  // Check exposure directly from API using bet name
                  const tigerDiamondExposure = getExposure("Tiger Diamond");
                  const showTigerDiamondExposure = tigerDiamondExposure !== null && tigerDiamondExposure !== undefined && tigerDiamondExposure !== 0;
                  return showTigerDiamondExposure && (
                    <div className={styles.exposure} style={{ color: getExposureColor(tigerDiamondExposure) }}>
                      {formatExposure(tigerDiamondExposure)}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
