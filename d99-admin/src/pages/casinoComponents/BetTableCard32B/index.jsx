import { MdLock } from "react-icons/md";
import styles from "./BetTableCard32B.module.css";

export default function BetTableCard32B({ data = [], onBetClick, exposures = {}, myBets = [] }) {
  // Helper function to find bet data by nat (name)
  const findBetData = (nat) => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    for (const subArray of data) {
      if (Array.isArray(subArray) && subArray.length > 0) {
        const found = subArray.find(item => item?.nat === nat);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper function to get exposure value
  const getExposure = (betName) => {
    if (!exposures || Object.keys(exposures).length === 0) return null;
    return exposures[betName] !== undefined ? exposures[betName] : null;
  };

  // Helper function to check if suspended
  const isSuspended = (betData) => {
    return betData?.gstatus?.toUpperCase() === "SUSPENDED";
  };

  // Extract players (sid 1-4: Player 8, 9, 10, 11)
  const players = [8, 9, 10, 11].map(id => {
    const betData = findBetData(`Player ${id}`);
    return {
      id,
      betData,
      back: betData?.b || "0",
      lay: betData?.l || "0",
      isSuspended: isSuspended(betData),
    };
  });

  // Extract Odd/Even bets (sid 5-12)
  const oddEvenBets = [];
  for (let id = 8; id <= 11; id++) {
    const oddBet = findBetData(`Player ${id} Odd`);
    const evenBet = findBetData(`Player ${id} Even`);
    oddEvenBets.push({
      id,
      oddBet,
      evenBet,
      oddValue: oddBet?.b || "0",
      evenValue: evenBet?.b || "0",
      isOddSuspended: isSuspended(oddBet),
      isEvenSuspended: isSuspended(evenBet),
    });
  }

  // Extract combinations (sid 13-14, 27)
  const combinations = [
    { name: "Any Three Card Black", sid: 13 },
    { name: "Any Three Card Red", sid: 14 },
    { name: "Two Black Two Red", sid: 27 },
  ].map(combo => {
    const betData = findBetData(combo.name);
    return {
      ...combo,
      betData,
      back: betData?.b || "0",
      lay: betData?.l || "0",
      isSuspended: isSuspended(betData),
    };
  });

  // Extract totals (sid 25-26)
  const totals = [
    { name: "8 & 9 Total", sid: 25 },
    { name: "10 & 11 Total", sid: 26 },
  ].map(total => {
    const betData = findBetData(total.name);
    return {
      ...total,
      betData,
      odds: betData?.b || "0",
      isSuspended: isSuspended(betData),
    };
  });

  // Extract single bets (sid 15-24)
  const singleNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  const singleBets = singleNumbers.map(num => {
    const betData = findBetData(`Single ${num}`);
    return {
      number: num,
      betData,
      odds: betData?.b || "0",
      isSuspended: isSuspended(betData),
    };
  });

  // Organize numbers in grid format
  const numbers = [
    singleBets.slice(0, 5), // ["1", "2", "3", "4", "5"]
    singleBets.slice(5, 10), // ["6", "7", "8", "9", "0"]
  ];

  return (
    <div className={styles.betTableCard32b}>
      <div className={styles.tablesContainer}>
        <div className={styles.tableSection}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.emptyHeader}></th>
                <th className={styles.backHeader}>Back</th>
                <th className={styles.layHeader}>Lay</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => {
                const backExposure = getExposure(`Player ${player.id}`);
                const layExposure = getExposure(`Player ${player.id}`);
                const showBackExposure = backExposure !== null && backExposure !== undefined && backExposure !== 0;
                const showLayExposure = layExposure !== null && layExposure !== undefined && layExposure !== 0;
                const isBackLocked = player.isSuspended || !player.back || player.back === "0" || player.back === 0;
                const isLayLocked = player.isSuspended || !player.lay || player.lay === "0" || player.lay === 0;

                return (
                  <tr key={player.id} className={styles.tableRow}>
                    <td className={styles.playerName}>Player {player.id}</td>
                    {isBackLocked ? (
                      <td className={styles.lockedCell}><MdLock color="white" /></td>
                    ) : (
                      <td
                        className={styles.backCell}
                        onClick={() => onBetClick(player.back, `Player ${player.id}`, "back", player.betData)}
                      >
                        <div className={styles.cellContent}>
                          <span>{player.back}</span>
                          {showBackExposure && (
                            <div className={styles.exposure} style={{ 
                              color: backExposure < 0 ? '#ff0000' : '#00ff00',
                            }}>
                              {backExposure < 0 ? backExposure.toFixed(2) : `+${backExposure.toFixed(2)}`}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    {isLayLocked ? (
                      <td className={styles.lockedCell}><MdLock color="white" /></td>
                    ) : (
                      <td
                        className={styles.layCell}
                        onClick={() => onBetClick(player.lay, `Player ${player.id}`, "lay", player.betData)}
                      >
                        <div className={styles.cellContent}>
                          <span>{player.lay}</span>
                          {showLayExposure && (
                            <div className={styles.exposure} style={{ 
                              color: layExposure < 0 ? '#ff0000' : '#00ff00',
                            }}>
                              {layExposure < 0 ? layExposure.toFixed(2) : `+${layExposure.toFixed(2)}`}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.tableSection}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.emptyHeader}></th>
                <th className={styles.oddsHeader}>Odd</th>
                <th className={styles.evenHeader}>Even</th>
              </tr>
            </thead>
            <tbody>
              {oddEvenBets.map((bet) => {
                const oddExposure = getExposure(`Player ${bet.id} Odd`);
                const evenExposure = getExposure(`Player ${bet.id} Even`);
                const showOddExposure = oddExposure !== null && oddExposure !== undefined && oddExposure !== 0;
                const showEvenExposure = evenExposure !== null && evenExposure !== undefined && evenExposure !== 0;

                return (
                  <tr key={bet.id} className={styles.tableRow}>
                    <td className={styles.playerName}>Player {bet.id}</td>
                    {bet.isOddSuspended || !bet.oddValue || bet.oddValue === "0" || bet.oddValue === 0 ? (
                      <td className={styles.lockedCell}><MdLock color="white" /></td>
                    ) : (
                      <td
                        className={styles.oddsCell}
                        onClick={() => onBetClick(bet.oddValue, `Player ${bet.id} Odd`, "back", bet.oddBet)}
                      >
                        <div className={styles.cellContent}>
                          <span>{bet.oddValue}</span>
                          {showOddExposure && (
                            <div className={styles.exposure} style={{ 
                              color: oddExposure < 0 ? '#ff0000' : '#00ff00',
                            }}>
                              {oddExposure < 0 ? oddExposure.toFixed(2) : `+${oddExposure.toFixed(2)}`}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    {bet.isEvenSuspended || !bet.evenValue || bet.evenValue === "0" || bet.evenValue === 0 ? (
                      <td className={styles.lockedCell}><MdLock color="white" /></td>
                    ) : (
                      <td
                        className={styles.evenCell}
                        onClick={() => onBetClick(bet.evenValue, `Player ${bet.id} Even`, "back", bet.evenBet)}
                      >
                        <div className={styles.cellContent}>
                          <span>{bet.evenValue}</span>
                          {showEvenExposure && (
                            <div className={styles.exposure} style={{ 
                              color: evenExposure < 0 ? '#ff0000' : '#00ff00',
                            }}>
                              {evenExposure < 0 ? evenExposure.toFixed(2) : `+${evenExposure.toFixed(2)}`}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.tablesContainer}>
        <div className={styles.tableSection}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.emptyHeader}></th>
                <th className={styles.backHeader}>Back</th>
                <th className={styles.layHeader}>Lay</th>
              </tr>
            </thead>
            <tbody>
              {combinations.map((combo, index) => {
                const backExposure = getExposure(combo.name);
                const layExposure = getExposure(combo.name);
                const showBackExposure = backExposure !== null && backExposure !== undefined && backExposure !== 0;
                const showLayExposure = layExposure !== null && layExposure !== undefined && layExposure !== 0;
                const isBackLocked = combo.isSuspended || !combo.back || combo.back === "0" || combo.back === 0;
                const isLayLocked = combo.isSuspended || !combo.lay || combo.lay === "0" || combo.lay === 0;

                return (
                  <tr key={index} className={styles.tableRow}>
                    <td className={styles.comboName}>{combo.name}</td>
                    {isBackLocked ? (
                      <td className={styles.lockedCell}><MdLock color="white" /></td>
                    ) : (
                      <td
                        className={styles.backCell}
                        onClick={() => onBetClick(combo.back, combo.name, "back", combo.betData)}
                      >
                        <div className={styles.cellContent}>
                          <span>{combo.back}</span>
                          {showBackExposure && (
                            <div className={styles.exposure} style={{ 
                              color: backExposure < 0 ? '#ff0000' : '#00ff00',
                            }}>
                              {backExposure < 0 ? backExposure.toFixed(2) : `+${backExposure.toFixed(2)}`}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    {isLayLocked ? (
                      <td className={styles.lockedCell}><MdLock color="white" /></td>
                    ) : (
                      <td
                        className={styles.layCell}
                        onClick={() => onBetClick(combo.lay, combo.name, "lay", combo.betData)}
                      >
                        <div className={styles.cellContent}>
                          <span>{combo.lay}</span>
                          {showLayExposure && (
                            <div className={styles.exposure} style={{ 
                              color: layExposure < 0 ? '#ff0000' : '#00ff00',
                            }}>
                              {layExposure < 0 ? layExposure.toFixed(2) : `+${layExposure.toFixed(2)}`}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.tableSection}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.emptyHeader}></th>
                <th className={styles.oddsHeader}>Back</th>
              </tr>
            </thead>
            <tbody>
              {totals.map((total, index) => {
                const exposure = getExposure(total.name);
                const showExposure = exposure !== null && exposure !== undefined && exposure !== 0;
                const isLocked = total.isSuspended || !total.odds || total.odds === "0" || total.odds === 0;

                return (
                  <tr key={index} className={styles.tableRow}>
                    <td className={styles.totalName}>{total.name}</td>
                    {isLocked ? (
                      <td className={styles.lockedCell}><MdLock color="white" /></td>
                    ) : (
                      <td
                        className={styles.oddsCell}
                        onClick={() => onBetClick(total.odds, total.name, "back", total.betData)}
                      >
                        <div className={styles.cellContent}>
                          <span>{total.odds}</span>
                          {showExposure && (
                            <div className={styles.exposure} style={{ 
                              color: exposure < 0 ? '#ff0000' : '#00ff00',
                            }}>
                              {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.numbersSection}>
        <div className={styles.numbersHeader}>9.5</div>
        <div className={styles.numbersGrid}>
          {numbers.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.numbersRow}>
              {row.map((singleBet, colIndex) => {
                const exposure = getExposure(`Single ${singleBet.number}`);
                const showExposure = exposure !== null && exposure !== undefined && exposure !== 0;
                const isLocked = singleBet.isSuspended || !singleBet.odds || singleBet.odds === "0" || singleBet.odds === 0;

                return (
                  <div
                    key={colIndex}
                    className={isLocked ? styles.numberCellLocked : styles.numberCell}
                    onClick={() => !isLocked && onBetClick(singleBet.odds, `Single ${singleBet.number}`, "back", singleBet.betData)}
                    style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
                  >
                    {isLocked ? (
                      <MdLock color="white" />
                    ) : (
                      <>
                        <span>{singleBet.number}</span>
                        {showExposure && (
                          <div className={styles.exposure} style={{ 
                            color: exposure < 0 ? '#ff0000' : '#00ff00',
                            fontSize: '10px',
                          }}>
                            {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
