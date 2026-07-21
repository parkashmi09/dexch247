import styles from "./BetTableRace2.module.css";
import { MdLock } from "react-icons/md";

const PlayerOption = ({ player, back, lay, onClick, betData, exposures = {}, myBets = [] }) => {
  // Get exposure value for this player
  const getExposure = (playerName) => {
    const exposureKeys = [
      playerName,
      playerName?.toLowerCase(),
    ];
    
    for (const key of exposureKeys) {
      if (exposures[key] !== undefined) {
        return exposures[key];
      }
    }
    return 0;
  };

  // Check if there's a bet placed for this player and bet type
  const hasBackBet = myBets.some(bet => {
    const betSelection = (bet.matchedBet || bet.selection || bet.player_name || "").toLowerCase();
    const playerName = player?.toLowerCase() || "";
    return betSelection.includes(playerName) && bet.type === "back";
  });

  const hasLayBet = myBets.some(bet => {
    const betSelection = (bet.matchedBet || bet.selection || bet.player_name || "").toLowerCase();
    const playerName = player?.toLowerCase() || "";
    return betSelection.includes(playerName) && bet.type === "lay";
  });

  // Only show exposure in the cell where the bet was placed
  const totalExposure = getExposure(player);
  const backExposure = hasBackBet ? totalExposure : 0;
  const layExposure = hasLayBet ? totalExposure : 0;

  const renderBetBox = (value, type) => {
    const gstatus = betData?.gstatus;
    const isSuspended = gstatus?.toUpperCase() === "SUSPENDED";
    const isLocked = value === 0 || value === undefined || isSuspended;
    const exposure = type === "back" ? backExposure : layExposure;
    const showExposure = exposure !== 0 && (type === "back" ? hasBackBet : hasLayBet);
    
    return (
      <div
        className={`${styles.betBox} ${styles[type]} ${isLocked ? styles.locked : ""}`}
        onClick={() => !isLocked && onClick(value, player, type, betData)}
      >
        {isLocked ? (
          <MdLock color="white" />
        ) : (
          <div className={styles.cellContent}>
            <span className={styles.odds}>{value}</span>
            {showExposure && (
              <div className={styles.exposure} style={{ 
                color: exposure < 0 ? '#ff0000' : '#00ff00',
              }}>
                {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.playerOption}>
      <span className={styles.label}>{player}</span>
      <div className={styles.betOptions}>
        {renderBetBox(back, "back")}
        {renderBetBox(lay, "lay")}
      </div>
    </div>
  );
};

const BetTableRace2 = ({ onBetClick, data, playersData = [], exposures = {}, myBets = [] }) => {
  const players = [
    { player: "Player A", back: data.ab, lay: data.al, betData: playersData[0] || null },
    { player: "Player B", back: data.bb, lay: data.bl, betData: playersData[1] || null },
    { player: "Player C", back: data.cb, lay: data.cl, betData: playersData[2] || null },
    { player: "Player D", back: data.db, lay: data.dl, betData: playersData[3] || null },
  ];

  return (
    <div className={styles.betTable}>
      {players.map((playerData, index) => (
        <PlayerOption
          key={index}
          player={playerData.player}
          back={playerData.back}
          lay={playerData.lay}
          onClick={onBetClick}
          betData={playerData.betData}
          exposures={exposures}
          myBets={myBets}
        />
      ))}
    </div>
  );
};

export default BetTableRace2;
