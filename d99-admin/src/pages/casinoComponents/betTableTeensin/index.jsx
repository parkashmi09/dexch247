import styles from "./BetTableTeensin.module.css";
import Lucky9 from '../../../assets/img/lucky9.png';

const BetTableTeensin = ({ data = [], onBetClick, exposures = {}, myBets = [] }) => {
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

  // Get data items for Player A and Player B
  const getPlayerData = (player, subtype) => {
    return data.find(item => 
      item.nat === player && item.subtype === subtype
    ) || {};
  };

  // Get Lucky 9 data
  const getLucky9Data = () => {
    return data.find(item => item.subtype === "lucky9") || {};
  };

  // Render odds box
  const renderOddsBox = (item, isHeader = false) => {
    if (isHeader) {
      return (
        <div className={styles.casinoOddsBox}>
          {item}
        </div>
      );
    }

    const value = item?.b || 0;
    const isSuspended = value === 0 || value === undefined || item?.gstatus?.toUpperCase() === "SUSPENDED";
    const selection = item?.nat || "";
    const exposure = getExposureForSelection(selection, "back");

    const boxClasses = `${styles.casinoOddsBox} ${styles.back} ${isSuspended ? styles.suspendedBox : ''}`;

    return (
      <div 
        className={boxClasses}
        onClick={() => !isSuspended && onBetClick && onBetClick(value, selection, item, "back")}
        style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
      >
        <span className={styles.casinoOdds}>{value || 0}</span>
        {!isSuspended && exposure !== 0 && (
          <div style={{
            color: exposure < 0 ? '#ff0000' : '#00ff00',
            fontSize: '10px',
            fontWeight: 'bold',
            marginTop: '-8px',
            position: 'relative',
            zIndex: 3,
          }}>
            {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
          </div>
        )}
        <span className={styles.casinoNationBook}></span>
      </div>
    );
  };

  // Get Player A data
  const playerAWinner = getPlayerData("Player A", "teensin");
  const playerAHighCard = getPlayerData("High Card A", "highcard");
  const playerAPair = getPlayerData("Pair A", "pair");
  const playerAColorPlus = getPlayerData("Color Plus A", "colorplus");

  // Get Player B data
  const playerBWinner = getPlayerData("Player B", "teensin");
  const playerBHighCard = getPlayerData("High Card B", "highcard");
  const playerBPair = getPlayerData("Pair B", "pair");
  const playerBColorPlus = getPlayerData("Color Plus B", "colorplus");

  // Get Lucky 9 data
  const lucky9Data = getLucky9Data();
  const lucky9Back = lucky9Data?.b || 0;
  const lucky9Lay = lucky9Data?.l || 0;
  const isLucky9Suspended = (lucky9Back === 0 && lucky9Lay === 0) || lucky9Data?.gstatus?.toUpperCase() === "SUSPENDED";
  
  // Debug console logs
  console.log('Lucky 9 Data:', lucky9Data);
  console.log('Lucky 9 Back:', lucky9Back);
  console.log('Lucky 9 Lay:', lucky9Lay);
  console.log('Is Lucky 9 Suspended:', isLucky9Suspended);
  console.log('Data array:', data);

  // Render Lucky 9 odds box
  const renderLucky9Box = (value, type) => {
    const isSuspended = value === 0 || value === undefined || isLucky9Suspended;
    const boxClasses = `${styles.casinoOddsBoxLucky} ${type === "back" ? styles.back : styles.lay} ${isSuspended ? styles.suspendedBox : ''}`;
    const selection = lucky9Data?.nat || "Lucky 9";
    const exposure = getExposureForSelection(selection, type);

    // Create payload with both back and lay data
    const payload = {
      ...lucky9Data,
      type: type, // "back" or "lay"
      value: value,
      selection: selection,
      back: lucky9Back,
      lay: lucky9Lay
    };

    return (
      <div 
        className={boxClasses}
        onClick={() => !isSuspended && onBetClick && onBetClick(value, selection, payload, type)}
        style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
      >
        <span className={styles.casinoOdds}>{value || 0}</span>
        {!isSuspended && exposure !== 0 && (
          <div style={{
            color: exposure < 0 ? '#ff0000' : '#00ff00',
            fontSize: '10px',
            fontWeight: 'bold',
            marginTop: '-8px',
            position: 'relative',
            zIndex: 3,
          }}>
            {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.casinoTable}>
      <div className={styles.casinoTableBox}>
        {/* Player A Section */}
        <div className={styles.casinoTableLeftBox}>
          <div className={styles.casinoTableHeader}>
            <div className={styles.casinoNationDetail}>Player A</div>
          </div>
          <div className={styles.casinoTableBody}>
            <div className={styles.casinoTableRow}>
              {renderOddsBox("Winner", true)}
              {renderOddsBox("High Card", true)}
              {renderOddsBox("Pair", true)}
              {renderOddsBox("Color Plus", true)}
            </div>
            <div className={styles.casinoTableRow}>
              {renderOddsBox(playerAWinner)}
              {renderOddsBox(playerAHighCard)}
              {renderOddsBox(playerAPair)}
              {renderOddsBox(playerAColorPlus)}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.casinoTableBoxDivider}></div>

        {/* Player B Section */}
        <div className={styles.casinoTableRightBox}>
          <div className={styles.casinoTableHeader}>
            <div className={styles.casinoNationDetail}>Player B</div>
          </div>
          <div className={styles.casinoTableBody}>
            <div className={styles.casinoTableRow}>
              {renderOddsBox("Winner", true)}
              {renderOddsBox("High Card", true)}
              {renderOddsBox("Pair", true)}
              {renderOddsBox("Color Plus", true)}
            </div>
            <div className={styles.casinoTableRow}>
              {renderOddsBox(playerBWinner)}
              {renderOddsBox(playerBHighCard)}
              {renderOddsBox(playerBPair)}
              {renderOddsBox(playerBColorPlus)}
            </div>
          </div>
        </div>
      </div>

      {/* Lucky 9 Section */}
      <div className={`${styles.casinoTableFullBox} ${styles.mt3}`}>
     <div className={styles.outerBoxContainer}>
     <img 
          src={Lucky9} 
          alt="Lucky 9"
          className={styles.lucky9Image}
        />
        <div className={styles.casinoOddBoxContainer}>
          {renderLucky9Box(lucky9Back, "back")}
          {renderLucky9Box(lucky9Lay, "lay")}
          {/* <div className={`${styles.casinoNationBook} ${styles.textCenter} ${styles.w100}`}></div> */}
        </div>
     </div>
      </div>
    </div>
  );
};

export default BetTableTeensin;
