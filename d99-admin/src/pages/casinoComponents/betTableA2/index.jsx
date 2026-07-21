
import styles from "./BetTableA2.module.css";
import cardA from '../../../assets/img/aa2/A.png';
import card2 from '../../../assets/img/aa2/2.png';
import card3 from '../../../assets/img/aa2/3.png';
import card4 from '../../../assets/img/aa2/4.png';
import card5 from '../../../assets/img/aa2/5.png';
import card6 from '../../../assets/img/aa2/6.png';
import card7 from '../../../assets/img/aa2/7.png';
import card8 from '../../../assets/img/aa2/8.png';
import card9 from '../../../assets/img/aa2/9.png';
import card10 from '../../../assets/img/aa2/10.png';
import cardJ from '../../../assets/img/aa2/J.png';
import cardQ from '../../../assets/img/aa2/Q.png';
import cardK from '../../../assets/img/aa2/K.png';

const BetTableA2 = ({ data, onBetClick, exposures = {}, myBets = [] }) => {
  const cardImages = {
    'A': cardA,
    '2': card2,
    '3': card3,
    '4': card4,
    '5': card5,
    '6': card6,
    '7': card7,
    '8': card8,
    '9': card9,
    '10': card10,
    'J': cardJ,
    'Q': cardQ,
    'K': cardK,
  };

  const cardData = [
    { nat: 'A', data: data?.[7], index: 7 },
    { nat: '2', data: data?.[8], index: 8 },
    { nat: '3', data: data?.[9], index: 9 },
    { nat: '4', data: data?.[10], index: 10 },
    { nat: '5', data: data?.[11], index: 11 },
    { nat: '6', data: data?.[12], index: 12 },
    { nat: '7', data: data?.[13], index: 13 },
    { nat: '8', data: data?.[14], index: 14 },
    { nat: '9', data: data?.[15], index: 15 },
    { nat: '10', data: data?.[16], index: 16 },
    { nat: 'J', data: data?.[17], index: 17 },
    { nat: 'Q', data: data?.[18], index: 18 },
    { nat: 'K', data: data?.[19], index: 19 },
  ];

  // helper to check locked state: value missing or 0 means locked
  const isLocked = (val, gstatus) => {
    return val === undefined || val === null || Number(val) === 0 || gstatus?.toUpperCase() === "SUSPENDED";
  };

  return (
    <div className={styles.betTableContainer}>
      <div className={styles.casinoTableBox}>
        <PlayerOdds name="A. Amar" data={data[0]} onBetClick={onBetClick} isLocked={isLocked} exposures={exposures} myBets={myBets} />
        <PlayerOdds name="B. Akbar" data={data[1]} onBetClick={onBetClick} isLocked={isLocked} exposures={exposures} myBets={myBets} />
        <PlayerOdds name="C. Anthony" data={data[2]} onBetClick={onBetClick} isLocked={isLocked} exposures={exposures} myBets={myBets} />
      </div>
      <div className={`${styles.casinoTableBox} ${styles.mt3}`}>
        <div className={styles.casinoTableLeftBox}>
          <OptionColumn
            options={[
              { label: "Even", value: data?.[3]?.b, betType: "back", data: data?.[3] },
              { label: "Odd", value: data?.[4]?.b, betType: "back", data: data?.[4] },
            ]}
            onBetClick={onBetClick}
            exposures={exposures}
            myBets={myBets}
          />
        </div>
        <div className={styles.casinoTableCenterBox}>
          <OptionColumn
            options={[
              { label: "Red Suits", value: data?.[5]?.b, betType: "back", data: data?.[5], isRed: true },
              { label: "Black Suits", value: data?.[6]?.b, betType: "back", data: data?.[6], isBlack: true },
            ]}
            onBetClick={onBetClick}
            exposures={exposures}
            myBets={myBets}
          />
        </div>
        <div className={styles.casinoTableRightBox}>
          <OptionColumn
            options={[
              { label: "Under 7", value: data?.[20]?.b, betType: "back", data: data?.[20] },
              { label: "Over 7", value: data?.[21]?.b, betType: "back", data: data?.[21] },
            ]}
            onBetClick={onBetClick}
            exposures={exposures}
            myBets={myBets}
          />
        </div>
      </div>
      <div className={`${styles.casinoTableFullBox} ${styles.aaacards} ${styles.mt3}`}>
        <h4 className={`${styles.w100} ${styles.textCenter} ${styles.mb2}`}>
          <b>{data?.[7]?.b || 0}</b>
        </h4>
        <div className={styles.cardsContainer}>
          {cardData.map((card) => {
            const locked = isLocked(card.data?.b, card.data?.gstatus);
            const cardImage = cardImages[card.nat];
            const cardNat = card.data?.nat || `Card ${card.nat}`;

            // Get exposure for this card
            const getCardExposure = () => {
              const exposureKeys = [
                cardNat,
                cardNat?.toLowerCase(),
                `Card ${card.nat}`,
                `Card ${card.nat}`.toLowerCase(),
                card.data?.nat,
              ];

              for (const key of exposureKeys) {
                if (exposures[key] !== undefined) {
                  return exposures[key];
                }
              }
              return 0;
            };

            // Get exposure value
            const cardExposure = getCardExposure();

            return (
              <div key={card.nat} className={styles.cardOddBox}>
                <div
                  className={locked ? styles.suspendedBox : ""}
                  onClick={() => !locked && onBetClick(card.data?.b, card.data?.nat || `Card ${card.nat}`, null, card.data)}
                >
                  {cardImage && <img src={cardImage} alt={`Card ${card.nat}`} />}
                </div>
                {cardExposure !== 0 && (
                  <div className={styles.cardExposure} style={{
                    color: cardExposure < 0 ? '#ff0000' : '#00ff00',
                  }}>
                    {cardExposure < 0 ? cardExposure.toFixed(2) : `+${cardExposure.toFixed(2)}`}
                  </div>
                )}
                <div className={styles.casinoNationBook}></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PlayerOdds = ({ name, data, onBetClick, isLocked, exposures = {}, myBets = [] }) => {
  const backValue = data?.b || 0;
  const layValue = data?.l || 0;
  const gstatus = data?.gstatus;
  const nat = data?.nat || name;

  const backLocked = isLocked(backValue) || gstatus?.toUpperCase() === "SUSPENDED";
  const layLocked = isLocked(layValue) || gstatus?.toUpperCase() === "SUSPENDED";

  // Get exposure value for a player (exposure API returns team_name as key)
  const getExposure = (playerName) => {
    const exposureKeys = [
      playerName,
      nat,
      playerName?.toLowerCase(),
      nat?.toLowerCase(),
    ];

    for (const key of exposureKeys) {
      if (exposures[key] !== undefined) {
        return exposures[key];
      }
    }
    return 0;
  };

  // Check if there's a bet placed for this player and get the bet type
  const hasBackBet = myBets.some(bet => {
    const betSelection = (bet.matchedBet || bet.selection || bet.player_name || "").toLowerCase();
    const playerName = (nat || name || "").toLowerCase();
    return betSelection.includes(playerName) && bet.type === "back";
  });

  const hasLayBet = myBets.some(bet => {
    const betSelection = (bet.matchedBet || bet.selection || bet.player_name || "").toLowerCase();
    const playerName = (nat || name || "").toLowerCase();
    return betSelection.includes(playerName) && bet.type === "lay";
  });

  // Only show exposure in the cell where the bet was placed
  const totalExposure = getExposure(nat || name);
  const backExposure = hasBackBet ? totalExposure : 0;
  const layExposure = hasLayBet ? totalExposure : 0;

  return (
    <div className={styles.casinoOddBoxContainer}>
      <div className={styles.casinoNationName}>
        {name}
        <div className={styles.casinoNationBookMobile}></div>
      </div>
      <div
        className={`${styles.casinoOddsBox} ${styles.back} ${backLocked ? styles.suspendedBox : ""}`}
        onClick={() => !backLocked && onBetClick(backValue, `${name} Back`, "back", data)}
      >
        <div className={styles.cellContent}>
          <span className={styles.casinoOdds}>{backValue || 0}</span>
          {backExposure !== 0 && (
            <div className={styles.exposure} style={{
              color: backExposure < 0 ? '#ff0000' : '#00ff00',
            }}>
              {backExposure < 0 ? backExposure.toFixed(2) : `+${backExposure.toFixed(2)}`}
            </div>
          )}
        </div>
      </div>
      <div
        className={`${styles.casinoOddsBox} ${styles.lay} ${layLocked ? styles.suspendedBox : ""}`}
        onClick={() => !layLocked && onBetClick(layValue, `${name} Lay`, "lay", data)}
      >
        <div className={styles.cellContent}>
          <span className={styles.casinoOdds}>{layValue || 0}</span>
          {layExposure !== 0 && (
            <div className={styles.exposure} style={{
              color: layExposure < 0 ? '#ff0000' : '#00ff00',
            }}>
              {layExposure < 0 ? layExposure.toFixed(2) : `+${layExposure.toFixed(2)}`}
            </div>
          )}
        </div>
      </div>
      <div className={styles.casinoNationBookDesktop}></div>
    </div>
  );
};

const OptionColumn = ({ options, onBetClick, exposures = {}, myBets = [] }) => {
  const isLocked = (val, gstatus) => {
    return val === undefined || val === null || Number(val) === 0 || gstatus?.toUpperCase() === "SUSPENDED";
  };

  // Get exposure value
  const getExposure = (nat) => {
    const exposureKeys = [
      nat,
      nat?.toLowerCase(),
    ];

    for (const key of exposureKeys) {
      if (exposures[key] !== undefined) {
        return exposures[key];
      }
    }
    return 0;
  };

  return (
    <>
      {options.map((opt, idx) => {
        const locked = isLocked(opt.value, opt.data?.gstatus);

        const nat = opt.data?.nat || opt.label;
        // Get exposure value - show if it exists in exposures object
        const optionExposure = getExposure(nat);

        return (
          <div key={idx} className={styles.aaaOddBox}>
            <div className={`${styles.casinoOdds} ${styles.textCenter}`}>
              {opt.value || 0}
            </div>
            <div
              className={`${styles.casinoOddsBox} ${styles.back} ${styles.casinoOddsBoxTheme} ${locked ? styles.suspendedBox : ""}`}
              onClick={() => !locked && onBetClick(opt.value, opt.label, null, opt.data)}
            >
              <div className={styles.cellContent}>
                {opt.isRed ? (
                  <div className={styles.casinoOdds}>
                    <span className={styles.cardIcon}>
                      <span className={styles.cardRed}>♥</span>
                    </span>
                    <span className={styles.cardIcon}>
                      <span className={styles.cardRed}>♦</span>
                    </span>
                  </div>
                ) : opt.isBlack ? (
                  <div className={styles.casinoOdds}>
                    <span className={styles.cardIcon}>
                      <span className={styles.cardBlack}>♠</span>
                    </span>
                    <span className={styles.cardIcon}>
                      <span className={styles.cardBlack}>♣</span>
                    </span>
                  </div>
                ) : (
                  <span className={styles.casinoOdds}>{opt.label}</span>
                )}
                {optionExposure !== 0 && (
                  <div className={styles.exposure} style={{
                    color: optionExposure < 0 ? '#ff0000' : '#00ff00',
                  }}>
                    {optionExposure < 0 ? optionExposure.toFixed(2) : `+${optionExposure.toFixed(2)}`}
                  </div>
                )}
              </div>
            </div>
            <div className={`${styles.casinoNationBook} ${styles.textCenter}`}></div>
          </div>
        );
      })}
    </>
  );
};

export default BetTableA2;
