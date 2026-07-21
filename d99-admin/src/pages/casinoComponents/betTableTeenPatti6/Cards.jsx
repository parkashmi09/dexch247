import styles from "./BetTableTeenPatti6.module.css";
import imageSpade from "../../../assets/img/spade.png";
import imageClub from "../../../assets/img/club.png";
import imageHeart from "../../../assets/img/heart.png";
import imageDiamond from "../../../assets/img/diamond.png";

// Import all card images
import cardA from '../../../assets/img/card/1.jpg';
import card2 from '../../../assets/img/card/2.jpg';
import card3 from '../../../assets/img/card/3.jpg';
import card4 from '../../../assets/img/card/4.jpg';
import card5 from '../../../assets/img/card/5.jpg';
import card6 from '../../../assets/img/card/6.jpg';
import card7 from '../../../assets/img/card/7.jpg';
import card8 from '../../../assets/img/card/8.jpg';
import card9 from '../../../assets/img/card/9.jpg';
import card10 from '../../../assets/img/card/10.jpg';
import cardJ from '../../../assets/img/card/11.jpg';
import cardQ from '../../../assets/img/card/12.jpg';
import cardK from '../../../assets/img/card/13.jpg';

export default function Card({ data = [], onBetClick, playerLabel = "Player A", exposures = {} }) {
  // Card mapping: A=1, 2=2, ..., 10=10, J=11, Q=12, K=13
  const cardImages = {
    "A": cardA,
    "2": card2,
    "3": card3,
    "4": card4,
    "5": card5,
    "6": card6,
    "7": card7,
    "8": card8,
    "9": card9,
    "10": card10,
    "J": cardJ,
    "Q": cardQ,
    "K": cardK,
  };

  const cardNames = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  // Get all suit data (subtype: "suit")
  const getAllSuitData = () => {
    const suitCards = data.filter(item => item.subtype === "suit" && item.visible === 1);
    if (suitCards.length === 0) return null;

    const suitCard = suitCards[0];
    if (!suitCard || !suitCard.odds || suitCard.odds.length === 0) return null;

    const odds = suitCard.odds;
    const spade = odds.find(o => o.nat === "Spade");
    const heart = odds.find(o => o.nat === "Heart");
    const club = odds.find(o => o.nat === "Club");
    const diamond = odds.find(o => o.nat === "Diamond");

    return {
      spade: { value: spade?.b || 0, suspended: suitCard.gstatus === "SUSPENDED" || !spade },
      heart: { value: heart?.b || 0, suspended: suitCard.gstatus === "SUSPENDED" || !heart },
      club: { value: club?.b || 0, suspended: suitCard.gstatus === "SUSPENDED" || !club },
      diamond: { value: diamond?.b || 0, suspended: suitCard.gstatus === "SUSPENDED" || !diamond },
    };
  };

  // Get Odd/Even data (subtype: "oddeven")
  const getOddEvenData = () => {
    const oddEvenCards = data.filter(item => item.subtype === "oddeven" && item.visible === 1);
    if (oddEvenCards.length === 0) return null;

    const oddEvenCard = oddEvenCards[0];
    if (!oddEvenCard || !oddEvenCard.odds || oddEvenCard.odds.length === 0) return null;

    const odds = oddEvenCard.odds;
    const odd = odds.find(o => o.nat === "Odd");
    const even = odds.find(o => o.nat === "Even");
    return {
      odd: odd?.b || 0,
      even: even?.b || 0,
      suspended: oddEvenCard.gstatus === "SUSPENDED" || !odd || !even
    };
  };

  // Get cards data (subtype: "cards")
  const getCardsData = () => {
    const cardsData = data.filter(item => item.subtype === "cards" && item.visible === 1);
    if (cardsData.length === 0) return {};

    const cardsCard = cardsData[0];
    if (!cardsCard || !cardsCard.odds || cardsCard.odds.length === 0) return {};

    const cardOddsMap = {};
    cardsCard.odds.forEach(odd => {
      // Map "Card A", "Card 2", etc. to just "A", "2", etc.
      const cardName = odd.nat.replace("Card ", "").trim();
      cardOddsMap[cardName] = {
        b: odd.b || 0,
        l: odd.l || 0,
        suspended: cardsCard.gstatus === "SUSPENDED" || !odd.b
      };
    });

    return cardOddsMap;
  };

  const allSuits = getAllSuitData();
  const oddEven = getOddEvenData();
  const cardsData = getCardsData();

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

  // Render individual suit box
  const renderSingleSuitBox = (img, value, isSuspended, label, onClick) => {
    const isLocked = isSuspended || value === 0;
    const suitExposure = getExposure(label);
    const showSuitExposure = suitExposure !== null && suitExposure !== undefined && suitExposure !== 0;
    
    return (
      <div
        className={`${styles.casinoOddsBox} ${styles.back} ${isLocked ? styles.suspendedBox : ""}`}
        onClick={() => !isLocked && value > 0 && onClick()}
        style={{ position: 'relative', cursor: isLocked ? 'not-allowed' : 'pointer' }}
      >
        <div style={{ display: "flex", gap: '2px', alignItems: 'center' }}>
          <div>
            <img src={img} alt={label} style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <span className={styles.casinoOdds}>{value || "0"}</span>
          </div>
        </div>
        {showSuitExposure && (
          <div className={styles.exposure} style={{ color: getExposureColor(suitExposure) }}>
            {formatExposure(suitExposure)}
          </div>
        )}
      </div>
    );
  };

  // Render Odd/Even box
  const renderOddEvenBox = (label, value, isSuspended, onClick) => {
    const isLocked = isSuspended || value === 0;
    const oddEvenExposure = getExposure(label);
    const showOddEvenExposure = oddEvenExposure !== null && oddEvenExposure !== undefined && oddEvenExposure !== 0;
    
    return (
      <div
        className={`${styles.casinoOddsBox} ${styles.back} ${isLocked ? styles.suspendedBox : ""}`}
        onClick={() => !isLocked && value > 0 && onClick()}
        style={{ position: 'relative', cursor: isLocked ? 'not-allowed' : 'pointer' }}
      >
        <div style={{ display: "flex", gap: '2px', alignItems: 'center' }}>
          <div>
            <b>{label}</b>
          </div>
          <div>
            <span className={styles.casinoOdds}>{value || "0"}</span>
          </div>
        </div>
        {showOddEvenExposure && (
          <div className={styles.exposure} style={{ color: getExposureColor(oddEvenExposure) }}>
            {formatExposure(oddEvenExposure)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.casinoTable}>
      {/* Suits and Odd/Even Section */}
      <div className={`${styles.casinoTableFullBox} teen2other ${styles.mt3}`}>
        {/* Spade */}
        {allSuits && renderSingleSuitBox(
          imageSpade,
          allSuits.spade.value,
          allSuits.spade.suspended,
          "Spade",
          () => onBetClick(allSuits.spade.value, "Spade", "back")
        )}

        {/* Heart */}
        {allSuits && renderSingleSuitBox(
          imageHeart,
          allSuits.heart.value,
          allSuits.heart.suspended,
          "Heart",
          () => onBetClick(allSuits.heart.value, "Heart", "back")
        )}

        {/* Club */}
        {allSuits && renderSingleSuitBox(
          imageClub,
          allSuits.club.value,
          allSuits.club.suspended,
          "Club",
          () => onBetClick(allSuits.club.value, "Club", "back")
        )}

        {/* Diamond */}
        {allSuits && renderSingleSuitBox(
          imageDiamond,
          allSuits.diamond.value,
          allSuits.diamond.suspended,
          "Diamond",
          () => onBetClick(allSuits.diamond.value, "Diamond", "back")
        )}

        {/* Odd */}
        {oddEven && renderOddEvenBox(
          "Odd",
          oddEven.odd,
          oddEven.suspended || oddEven.odd === 0,
          () => onBetClick(oddEven.odd, "Odd", "back")
        )}

        {/* Even */}
        {oddEven && renderOddEvenBox(
          "Even",
          oddEven.even,
          oddEven.suspended || oddEven.even === 0,
          () => onBetClick(oddEven.even, "Even", "back")
        )}
      </div>
      {/* Cards Row */}
      <div className={styles.cardsRow}>
        {cardNames.map((cardName) => {
          const cardData = cardsData[cardName] || { b: 0, suspended: true };
          const isLocked = cardData.suspended || cardData.b === 0;
          const cardLabel = `Card ${cardName}`;
          const cardExposure = getExposure(cardLabel);
          const showCardExposure = cardExposure !== null && cardExposure !== undefined && cardExposure !== 0;

          return (
            <div
              key={cardName}
              className={`${styles.card} ${isLocked ? styles.suspendedBox : ""}`}
              onClick={() => !isLocked && cardData.b > 0 && onBetClick(cardData.b, cardLabel, "back")}
              style={{ position: 'relative', cursor: isLocked ? 'not-allowed' : 'pointer' }}
            >
              <div className={styles.cardContent}>
                {!isLocked && cardData.b > 0 && (
                  <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '2px' }}>
                    {cardData.b}
                  </div>
                )}
                <img
                  src={cardImages[cardName]}
                  alt={`Card ${cardName}`}
                  style={{ width: '100%', height: 'auto', maxHeight: '60px' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                {showCardExposure && (
                  <div className={styles.exposure} style={{ color: getExposureColor(cardExposure) }}>
                    {formatExposure(cardExposure)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
