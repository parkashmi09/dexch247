import styles from "./BetTableNotEnum.module.css";
import { MdLock } from "react-icons/md";

// Import suit icons
import spadeIcon from '../../../assets/img/cardsIcons/spade.png';
import clubIcon from '../../../assets/img/cardsIcons/club.png';
import heartIcon from '../../../assets/img/cardsIcons/heart.png';
import diamondIcon from '../../../assets/img/cardsIcons/diamond.png';

// Import card images for labels (single cards) - using upper-card-pack directory
import cardA from '../../../assets/img/upper-card-pack/A.jpg';
import card2Img from '../../../assets/img/upper-card-pack/2.jpg';
import card3Img from '../../../assets/img/upper-card-pack/3.jpg';
import card4Img from '../../../assets/img/upper-card-pack/4.jpg';
import card5Img from '../../../assets/img/upper-card-pack/5.jpg';
import card6Img from '../../../assets/img/upper-card-pack/6.jpg';
import card7Img from '../../../assets/img/upper-card-pack/7.jpg';
import card8Img from '../../../assets/img/upper-card-pack/8.jpg';
import card9Img from '../../../assets/img/upper-card-pack/9.jpg';
import card10Img from '../../../assets/img/upper-card-pack/10.jpg';

// Import card images for individual card bets
import cardImgA from '../../../assets/img/aa2/A.png';
import cardImg2 from '../../../assets/img/aa2/2.png';
import cardImg3 from '../../../assets/img/aa2/3.png';
import cardImg4 from '../../../assets/img/aa2/4.png';
import cardImg5 from '../../../assets/img/aa2/5.png';
import cardImg6 from '../../../assets/img/aa2/6.png';
import cardImg7 from '../../../assets/img/aa2/7.png';
import cardImg8 from '../../../assets/img/aa2/8.png';
import cardImg9 from '../../../assets/img/aa2/9.png';
import cardImg10 from '../../../assets/img/aa2/10.png';

const cardImageMap = {
  'A': cardA,
  '2': card2Img,
  '3': card3Img,
  '4': card4Img,
  '5': card5Img,
  '6': card6Img,
  '7': card7Img,
  '8': card8Img,
  '9': card9Img,
  '10': card10Img,
};

const cardBetImageMap = {
  'A': cardImgA,
  '2': cardImg2,
  '3': cardImg3,
  '4': cardImg4,
  '5': cardImg5,
  '6': cardImg6,
  '7': cardImg7,
  '8': cardImg8,
  '9': cardImg9,
  '10': cardImg10,
};

export default function BetTableNotEnum({ data, onBetClick, exposures = {}, myBets = [] }) {
  const subData = data?.sub || [];

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

      return (betSelection === normalizedSelection ||
        betSelection.includes(normalizedSelection) ||
        normalizedSelection.includes(betSelection)) &&
        (bType === betType || bType === "");
    });

    if (bet) {
      if (bet.exposer !== undefined && bet.exposer !== null && bet.exposer !== 0) {
        return parseFloat(bet.exposer) || 0;
      }
    }

    // Second, try exposures map
    const keys = [
      selection,
      `${selection} ${betType}`,
      `${selection} ${betType.toUpperCase()}`,
      normalizeString(selection),
    ];

    for (const key of keys) {
      if (key && exposures[key] !== undefined && exposures[key] !== null) {
        const expValue = parseFloat(exposures[key]);
        if (!isNaN(expValue) && expValue !== 0) {
          return expValue;
        }
      }
    }

    return 0;
  };

  const getCardBySubtype = (subtype) =>
    subData.find((item) => item.subtype === subtype) || {};

  // Get Baccarat data (sr 37 and 38)
  const getBaccaratData = (sr) => {
    return subData.find((item) => item.subtype === "bacc" && item.sr === sr) || {};
  };

  // Get card odds data
  const getCardOddsData = () => {
    return subData.find((item) => item.subtype === "card") || {};
  };

  const topRow = [
    { subtype: "odd", label: ["A", "3", "5", "7", "9"] },
    { subtype: "even", label: [] },
    { subtype: "black", label: [] },
  ];

  const bottomRow = [
    { subtype: "red", label: [] },
    { subtype: "low", label: ["A", "2", "3", "4", "5"] },
    { subtype: "high", label: ["6", "7", "8", "9", "10"] },
  ];

  const topSubtypes = topRow.map((item) => item.subtype);
  const bottomSubtypes = bottomRow.map((item) => item.subtype);

  const isTopLocked = subData.some(
    (item) => topSubtypes.includes(item.subtype) && item.gstatus === "SUSPENDED"
  );

  const isBottomLocked = subData.some(
    (item) => bottomSubtypes.includes(item.subtype) && item.gstatus === "SUSPENDED"
  );

  const renderOdds = (card, betTypeOverride = null) => {
    const isLocked = card.gstatus === "SUSPENDED";
    const selection = card.nat || card.subtype;
    const backExposure = getExposureForSelection(selection, "back");
    const layExposure = getExposureForSelection(selection, "lay");

    return (
      <>
        <div className={`${styles.casinoOddsBox} ${styles.back} ${isLocked ? styles.suspendedBox : ''}`}
          onClick={() => !isLocked && card.b && onBetClick(`${selection} Back`, card.b, "back", card)}
          style={{ cursor: isLocked || !card.b ? 'not-allowed' : 'pointer', position: 'relative' }}
        >
          {isLocked || !card.b ? (
            <MdLock color="white" size={25} />
          ) : (
            <>
              <span className={styles.casinoOdds}>{card.b}</span>
              {backExposure !== 0 && (
                <div style={{
                  color: backExposure < 0 ? '#ff0000' : '#00ff00',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  marginTop: '-8px',
                  position: 'relative',
                  zIndex: 3,
                }}>
                  {backExposure < 0 ? backExposure.toFixed(2) : `+${backExposure.toFixed(2)}`}
                </div>
              )}
            </>
          )}
        </div>
        <div className={`${styles.casinoOddsBox} ${styles.lay} ${isLocked ? styles.suspendedBox : ''}`}
          onClick={() => !isLocked && card.l && onBetClick(`${selection} Lay`, card.l, "lay", card)}
          style={{ cursor: isLocked || !card.l ? 'not-allowed' : 'pointer', position: 'relative' }}
        >
          {isLocked || !card.l ? (
            <MdLock color="white" size={25} />
          ) : (
            <>
              <span className={styles.casinoOdds}>{card.l}</span>
              {layExposure !== 0 && (
                <div style={{
                  color: layExposure < 0 ? '#ff0000' : '#00ff00',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  marginTop: '-8px',
                  position: 'relative',
                  zIndex: 3,
                }}>
                  {layExposure < 0 ? layExposure.toFixed(2) : `+${layExposure.toFixed(2)}`}
                </div>
              )}
            </>
          )}
        </div>
        <div className={`${styles.casinoNationBook} ${styles.textCenter} ${styles.w100}`}></div>
      </>
    );
  };

  return (
    <div className={styles.casinoTable}>
      <div className={styles.casinoTableBox}>
        {/* Top row - First box: Odd and Even */}
        <div className={styles.casinoOddBoxContainerBox}>
          {topRow.slice(0, 2).map(({ subtype, label }, index) => {
            const card = getCardBySubtype(subtype);
            return (
              <div className={styles.casinoOddBoxContainer} key={card.sid || index}>
                <div className={styles.casinoNationName}>
                  <span className={styles.me2}>{card.nat || subtype}</span>
                  {label.map((val) => (
                    <img
                      key={val}
                      src={cardImageMap[val]}
                      alt={val}
                      className={styles.cardIcon}
                    />
                  ))}
                </div>
                {renderOdds(card)}
              </div>
            );
          })}
        </div>

        {/* Top row - Second box: Black and Red suits */}
        <div className={styles.casinoOddBoxContainerBox}>
          {[topRow[2], bottomRow[0]].map(({ subtype, label }, index) => {
            const card = getCardBySubtype(subtype);
            return (
              <div className={styles.casinoOddBoxContainer} key={card.sid || index}>
                <div className={styles.casinoNationName}>
                  {index === 0 ? (
                    <>
                      <img src={spadeIcon} alt="spade" className={styles.suitIcon} />
                      <img src={clubIcon} alt="club" className={styles.suitIcon} />
                    </>
                  ) : (
                    <>
                      <img src={heartIcon} alt="heart" className={styles.suitIcon} />
                      <img src={diamondIcon} alt="diamond" className={styles.suitIcon} />
                    </>
                  )}
                </div>
                {renderOdds(card)}
              </div>
            );
          })}
        </div>

        {/* Top row - Third box: Low and High */}
        <div className={styles.casinoOddBoxContainerBox}>
          {bottomRow.slice(1, 3).map(({ subtype, label }, index) => {
            const card = getCardBySubtype(subtype);
            return (
              <div className={styles.casinoOddBoxContainer} key={card.sid || index}>
                <div className={styles.casinoNationName}>
                  <span className={styles.me2}>{card.nat || subtype}</span>
                  {label.map((val) => (
                    <img
                      key={val}
                      src={cardImageMap[val]}
                      alt={val}
                      className={styles.cardIcon}
                    />
                  ))}
                </div>
                {renderOdds(card)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Baccarat and Deck */}
      <div className={`${styles.casinoTableFullBox} ${styles.mt3} ${styles.notEnumBaccarat}`}>
        <div className={`${styles.casinoTableLeftBox} ${styles.notEnumBaccaratLeft}`}>
          <div className={`${styles.casinoOddBoxContainer} ${styles.notEnumBaccaratContainer}`}>
            <div className={`${styles.casinoNationName} ${styles.notEnumBaccaratName}`}>
              <b>Baccarat 1</b>
              <span>(1st, 2nd, 3rd card)</span>
            </div>
            {(() => {
              const bacc1 = getBaccaratData(37);
              const isLocked = bacc1.gstatus === "SUSPENDED";
              return (
                <div className={`${styles.casinoOddsBox} ${styles.back} ${isLocked ? styles.suspendedBox : ''} ${styles.notEnumBaccaratOdds}`}>
                  <span className={styles.casinoOdds}>{bacc1.b || 0}</span>
                  <div className={`${styles.casinoNationBook} ${styles.textCenter}`}></div>
                </div>
              );
            })()}
          </div>
          <div className={`${styles.casinoOddBoxContainer} ${styles.notEnumBaccaratContainer}`}>
            <div className={`${styles.casinoNationName} ${styles.notEnumBaccaratName}`}>
              <b>Baccarat 2</b>
              <span>(4th, 5th, 6th card)</span>
            </div>
            {(() => {
              const bacc2 = getBaccaratData(38);
              const isLocked = bacc2.gstatus === "SUSPENDED";
              return (
                <div className={`${styles.casinoOddsBox} ${styles.back} ${isLocked ? styles.suspendedBox : ''} ${styles.notEnumBaccaratOdds}`}>
                  <span className={styles.casinoOdds}>{bacc2.b || 0}</span>
                  <div className={`${styles.casinoNationBook} ${styles.textCenter}`}></div>
                </div>
              );
            })()}
          </div>
        </div>
        <div className={`${styles.casinoTableRightBox} ${styles.notEnumCardRightBox}`}>
          {(() => {
            const cardOddsData = getCardOddsData();
            const cardOdds = cardOddsData?.odds || [];
            const cardMap = {
              "A": "Card A",
              "2": "Card 2",
              "3": "Card 3",
              "4": "Card 4",
              "5": "Card 5",
              "6": "Card 6",
              "7": "Card 7",
              "8": "Card 8",
              "9": "Card 9",
              "10": "Card 10"
            };

            return ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((card) => {
              const cardOdd = cardOdds.find(odd => odd.nat === cardMap[card]);
              const cardValue = cardOdd?.b || 0;
              const isCardLocked = !cardValue || cardValue === 0 || isTopLocked || isBottomLocked;
              const cardSelection = cardOdd?.nat || cardMap[card];
              const cardExposure = getExposureForSelection(cardSelection, "back");

              return (
                <div
                  key={card}
                  className={`${styles.cardOddBox} ${styles.notEnumCardBox} ${isCardLocked ? styles.suspendedBox : ''}`}
                  onClick={() => {
                    if (!isCardLocked && cardValue && onBetClick) {
                      onBetClick(
                        `${cardSelection} Back`,
                        cardValue,
                        "back",
                        { ...cardOdd, subtype: "card", nat: cardSelection }
                      );
                    }
                  }}
                  style={{ cursor: isCardLocked ? 'not-allowed' : 'pointer', position: 'relative' }}
                >
                  <div className={`${styles.casinoOdds} ${styles.notEnumCardOdds}`}>{cardValue || "-"}</div>
                  <div>
                    <img
                      src={cardBetImageMap[card]}
                      alt={card}
                      className={styles.notEnumCardImage}
                    />
                  </div>
                  {!isCardLocked && cardExposure !== 0 && (
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      color: cardExposure < 0 ? '#ff0000' : '#00ff00',
                      fontSize: '8px',
                      fontWeight: 'bold',
                      zIndex: 3,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      padding: '1px 3px',
                      borderRadius: '2px',
                    }}>
                      {cardExposure < 0 ? cardExposure.toFixed(2) : `+${cardExposure.toFixed(2)}`}
                    </div>
                  )}
                  <div className={styles.casinoNationBook}></div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
