// BetTableTeenPatti2.jsx
import { MdLock } from "react-icons/md";
import styles from "./BetTableTeenPatti2.module.css";

export default function BetTableTeenPatti2({ data, onBetClick, Player, exposures = {}, myBets = [] }) {
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

    // Second, try exposures map with multiple key variations
    const keys = [
      selection,
      `${selection} ${betType}`,
      `${selection} ${betType.toUpperCase()}`,
      `${selection} ${betType.toLowerCase()}`,
      normalizeString(selection),
      normalizeString(`${selection} ${betType}`),
    ];

    for (const key of keys) {
      if (key && exposures[key] !== undefined && exposures[key] !== null) {
        const expValue = parseFloat(exposures[key]);
        if (!isNaN(expValue) && expValue !== 0) {
          return expValue;
        }
      }
    }

    // Try normalized match against all exposure keys
    for (const expKey in exposures) {
      if (normalizeString(expKey) === normalizedSelection) {
        const expValue = parseFloat(exposures[expKey]);
        if (!isNaN(expValue) && expValue !== 0) {
          return expValue;
        }
      }
    }

    return 0;
  };

  // Helper to render bet cell with exposure
  const renderBetCell = (value, selection, type, item, cellClass, colSpan = 1, largeValue = null) => {
    const isLocked = value === 0 || value === undefined || item?.gstatus?.toUpperCase() === "SUSPENDED";
    const exposure = getExposureForSelection(selection, type);
    
    if (isLocked) {
      return (
        <td className={styles.lockedCell} colSpan={colSpan}>
          <MdLock color="white" />
        </td>
      );
    }

    return (
      <td 
        className={cellClass} 
        colSpan={colSpan}
        onClick={() => onBetClick(value, selection, item, type)}
      >
        {exposure !== 0 && (
          <div style={{
            fontSize: '10px',
            color: exposure < 0 ? '#ff0000' : '#00ff00',
            marginBottom: '2px'
          }}>
            {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
          </div>
        )}
        {colSpan === 2 ? (
          <div>{value}</div>
        ) : largeValue !== null ? (
          <div className={styles.stacked}>
            <span className={styles.small}>{value}</span>
            <span className={styles.large}>{largeValue}</span>
          </div>
        ) : (
          <div>{value}</div>
        )}
      </td>
    );
  };
  const playerItem = Player === "A" ? data?.playerAItem : data?.playerBItem;
  const totalItem = Player === "A" ? data?.totalAItem : data?.totalBItem;
  const miniBaccaratItem = Player === "A" ? data?.miniBaccaratAItem : data?.miniBaccaratBItem;

  return (
    <div className={styles.pattiTable}>
      <table className={styles.table}>
        <tbody>
          <tr className={styles.tableRow}>
            <td className={styles.label}>Player {Player}</td>
            {renderBetCell(
              data?.ab,
              `Player ${Player}`,
              "back",
              playerItem,
              styles.valueBlue
            )}
            {renderBetCell(
              data?.al,
              `Player ${Player}`,
              "lay",
              playerItem,
              styles.valuePink
            )}
          </tr>

          <tr className={styles.tableRow}>
            <td className={styles.label}>Mini Baccarat {Player}</td>
            {renderBetCell(
              data?.c,
              `Mini Baccarat ${Player}`,
              "combined",
              miniBaccaratItem,
              styles.valueBlue,
              2
            )}
          </tr>

          <tr className={styles.tableRow}>
            <td className={styles.label}>Total {Player}</td>
            {renderBetCell(
              data?.tl,
              `Total ${Player}`,
              "lay",
              totalItem,
              styles.valuePink,
              1,
              data?.tlb
            )}
            {renderBetCell(
              data?.tb,
              `Total ${Player}`,
              "back",
              totalItem,
              styles.valueBlue,
              1,
              data?.tbb
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
