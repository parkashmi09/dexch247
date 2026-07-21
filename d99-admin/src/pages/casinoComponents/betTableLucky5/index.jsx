
import styles from "./BetTableLucky5.module.css";
// Import all card images
import card1 from '../../../assets/img/card/1.jpg';
import card2 from '../../../assets/img/card/2.jpg';
import card3 from '../../../assets/img/card/3.jpg';
import card4 from '../../../assets/img/card/4.jpg';
import card5 from '../../../assets/img/card/5.jpg';
import card6 from '../../../assets/img/card/6.jpg';
import card7 from '../../../assets/img/card/7.jpg';
import card8 from '../../../assets/img/card/8.jpg';
import card9 from '../../../assets/img/card/9.jpg';
import card10 from '../../../assets/img/card/10.jpg';
import card11 from '../../../assets/img/card/11.jpg';
import card12 from '../../../assets/img/card/12.jpg';
import card13 from '../../../assets/img/card/13.jpg';

// Helper function to map card name to imported image
const getCardImage = (cardName) => {
  const cardMap = {
    '1': card1,
    '2': card2,
    '3': card3,
    '4': card4,
    '5': card5,
    '6': card6,
    '7': card7,
    '8': card8,
    '9': card9,
    '10': card10,
    'J': card11,
    'A': card1, // Keep A as fallback
    'Q': card12, // Keep for backward compatibility
    'K': card13 // Keep for backward compatibility
  };
  return cardMap[cardName] || card1;
};

export default function BetTableLucky5({ data = {}, sub = [], onBetClick, exposures = {}, myBets = [] }) {

  const {
    lowCardData = { b: 0, nat: "Low Card" },
    highCardData = { b: 0, nat: "High Card" },
    evenData = { b: 0, nat: "Even" },
    oddData = { b: 0, nat: "Odd" },
    redData = { b: 0, nat: "Red" },
    blackData = { b: 0, nat: "Black" },
    centerCard = "6", // Default center card
  } = data;

  // Only show Card 1 through Card J (11 cards) as per API
  const bottomCards = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J"];

  // Helper to check if an item is locked
  const isItemLocked = (item) => {
    if (!item) return true;
    return item.b === 0 || item.gstatus === "SUSPENDED" || item.gstatus === "0";
  };

  // Helper to display odds value
  const displayOdds = (value, item = null) => {
    if (value === undefined || value === null) return "0";
    if (item && isItemLocked(item)) return "0";
    return value === 0 ? "0" : value;
  };

  // Get exposure value for a bet
  const getExposure = (betName) => {
    if (!exposures || Object.keys(exposures).length === 0) {
      return null;
    }

    const exposureKeys = [
      betName,
      betName?.toLowerCase(),
      betName?.trim(),
      betName?.toLowerCase().trim(),
    ];

    for (const key of exposureKeys) {
      if (key && exposures[key] !== undefined && exposures[key] !== null) {
        return exposures[key];
      }
    }
    return null;
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

  // Find data from sub array
  const lowCardDataFromSub = sub.find(item => item?.nat === "Low Card") || { b: 0, nat: "Low Card" };
  const highCardDataFromSub = sub.find(item => item?.nat === "High Card") || { b: 0, nat: "High Card" };
  const evenDataFromSub = sub.find(item => item?.nat === "Even") || { b: 0, nat: "Even" };
  const oddDataFromSub = sub.find(item => item?.nat === "Odd") || { b: 0, nat: "Odd" };
  const redDataFromSub = sub.find(item => item?.nat === "Red") || { b: 0, nat: "Red" };
  const blackDataFromSub = sub.find(item => item?.nat === "Black") || { b: 0, nat: "Black" };

  const lowCardFinal = { ...lowCardData, ...lowCardDataFromSub };
  const highCardFinal = { ...highCardData, ...highCardDataFromSub };
  const evenFinal = { ...evenData, ...evenDataFromSub };
  const oddFinal = { ...oddData, ...oddDataFromSub };
  const redFinal = { ...redData, ...redDataFromSub };
  const blackFinal = { ...blackData, ...blackDataFromSub };

  return (
    <div className={styles.lucky7Container}>
      {/* Top Section */}
      <div className={styles.casinoTableFullBox}>
        <div className={styles.lucky7low}>
          <div className={`${styles.casinoOdds} ${styles.textCenter}`}>{displayOdds(lowCardFinal?.b, lowCardFinal)}</div>
          <div
            className={`${styles.casinoOddsBox} ${styles.back} ${styles.casinoOddsBoxTheme} ${isItemLocked(lowCardFinal) ? styles.suspendedBox : ''}`}
            onClick={() => !isItemLocked(lowCardFinal) && onBetClick(lowCardFinal.b, lowCardFinal?.nat || "Low Card", null, lowCardFinal)}
          >
            <span className={styles.casinoOdds}>{lowCardFinal?.nat || "Low Card"}</span>
          </div>
          <div className={`${styles.casinoNationBook} ${styles.textCenter}`}></div>
        </div>

        <div className={styles.lucky7}>
          <img src={getCardImage(centerCard)} alt={centerCard} className={styles.centerCardImage} />
        </div>

        <div className={styles.lucky7high}>
          <div className={`${styles.casinoOdds} ${styles.textCenter}`}>{displayOdds(highCardFinal?.b, highCardFinal)}</div>
          <div
            className={`${styles.casinoOddsBox} ${styles.back} ${styles.casinoOddsBoxTheme} ${isItemLocked(highCardFinal) ? styles.suspendedBox : ''}`}
            onClick={() => !isItemLocked(highCardFinal) && onBetClick(highCardFinal.b, highCardFinal?.nat || "High Card", null, highCardFinal)}
          >
            <span className={styles.casinoOdds}>{highCardFinal?.nat || "High Card"}</span>
          </div>
          <div className={`${styles.casinoNationBook} ${styles.textCenter}`}></div>
        </div>
      </div>

      {/* Middle Section */}
      <div className={`${styles.casinoTableBox} ${styles.mt3}`}>
        <div className={styles.casinoTableLeftBox}>
          <div className={styles.lucky7odds}>
            <div className={`${styles.casinoOdds} ${styles.textCenter}`}>{displayOdds(evenFinal?.b, evenFinal)}</div>
            <div
              className={`${styles.casinoOddsBox} ${styles.back} ${styles.casinoOddsBoxTheme} ${isItemLocked(evenFinal) ? styles.suspendedBox : ''}`}
              onClick={() => !isItemLocked(evenFinal) && onBetClick(evenFinal.b, evenFinal?.nat || "Even", null, evenFinal)}
            >
              <span className={styles.casinoOdds}>{evenFinal?.nat || "Even"}</span>
            </div>
            <div className={`${styles.casinoNationBook} ${styles.textCenter}`}></div>
          </div>
          <div className={styles.lucky7odds}>
            <div className={`${styles.casinoOdds} ${styles.textCenter}`}>{displayOdds(oddFinal?.b, oddFinal)}</div>
            <div
              className={`${styles.casinoOddsBox} ${styles.back} ${styles.casinoOddsBoxTheme} ${isItemLocked(oddFinal) ? styles.suspendedBox : ''}`}
              onClick={() => !isItemLocked(oddFinal) && onBetClick(oddFinal.b, oddFinal?.nat || "Odd", null, oddFinal)}
            >
              <span className={styles.casinoOdds}>{oddFinal?.nat || "Odd"}</span>
            </div>
            <div className={`${styles.casinoNationBook} ${styles.textCenter}`}></div>
          </div>
        </div>
        <div className={styles.casinoTableRightBox}>
          <div className={styles.lucky7odds}>
            <div className={`${styles.casinoOdds} ${styles.textCenter}`}>{displayOdds(redFinal?.b, redFinal)}</div>
            <div
              className={`${styles.casinoOddsBox} ${styles.back} ${styles.casinoOddsBoxTheme} ${isItemLocked(redFinal) ? styles.suspendedBox : ''}`}
              onClick={() => !isItemLocked(redFinal) && onBetClick(redFinal.b, redFinal?.nat || "Red", null, redFinal)}
            >
              <span className={styles.casinoOdds}>
                <span className={`${styles.cardIcon} ${styles.ms1}`}>
                  <span className={styles.cardRed}>♥</span>
                </span>
                <span className={`${styles.cardIcon} ${styles.ms1}`}>
                  <span className={styles.cardRed}>♦</span>
                </span>
              </span>
            </div>
            <div className={`${styles.casinoNationBook} ${styles.textCenter}`}></div>
          </div>
          <div className={styles.lucky7odds}>
            <div className={`${styles.casinoOdds} ${styles.textCenter}`}>{displayOdds(blackFinal?.b, blackFinal)}</div>
            <div
              className={`${styles.casinoOddsBox} ${styles.back} ${styles.casinoOddsBoxTheme} ${isItemLocked(blackFinal) ? styles.suspendedBox : ''}`}
              onClick={() => !isItemLocked(blackFinal) && onBetClick(blackFinal.b, blackFinal?.nat || "Black", null, blackFinal)}
            >
              <span className={styles.casinoOdds}>
                <span className={`${styles.cardIcon} ${styles.ms1}`}>
                  <span className={styles.cardBlack}>♠</span>
                </span>
                <span className={`${styles.cardIcon} ${styles.ms1}`}>
                  <span className={styles.cardBlack}>♣</span>
                </span>
              </span>
            </div>
            <div className={`${styles.casinoNationBook} ${styles.textCenter}`}></div>
          </div>
        </div>
      </div>

      {/* Bottom Cards - Only Card 1 through Card J */}
      <div className={`${styles.casinoTableFullBox} ${styles.lucky7acards} ${styles.mt3}`}>
        <div className={`${styles.casinoOdds} ${styles.w100} ${styles.textCenter}`}>0</div>
        {bottomCards.map((card) => {
          // Map card value to API card name: "1" -> "Card 1", "2" -> "Card 2", ..., "J" -> "Card J"
          const cardName = card === "J" ? "Card J" : `Card ${card}`;
          const cardData = sub.find(item => item?.nat === cardName) || { b: 0 };
          const cardIsLocked = isItemLocked(cardData);
          const cardExposure = getExposure(cardName);
          const showCardExposure = cardExposure !== null && cardExposure !== undefined && cardExposure !== 0;

          return (
            <div
              key={card}
              className={styles.cardOddBox}
              onClick={() => !cardIsLocked && onBetClick(cardData?.b || 0, cardData?.nat || cardName, null, cardData)}
            >
              <div className={cardIsLocked ? styles.suspendedBox : ''}>
                <img src={getCardImage(card)} alt={card} className={styles.cardImage} />
                {showCardExposure && (
                  <div className={styles.exposure} style={{ color: getExposureColor(cardExposure) }}>
                    {formatExposure(cardExposure)}
                  </div>
                )}
              </div>
              <div className={styles.casinoNationBook}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
