"use client";
import styles from "./RoulleteTable.module.css";
import { MdLock } from "react-icons/md";

// Helper to normalize keys
const normalize = (str) => str?.toString().toLowerCase().replace(/\s+/g, "");

const Cell = ({ number, locked, type, label, onClick }) => {
  return (
    <div
      className={`${styles.cell} ${styles[type]} ${locked ? styles.locked : ""}`}
      onClick={locked ? null : () => onClick(label || number)}
    >
      {locked ? <span className={styles.lockIcon}><MdLock color="white" size={15} /></span> : label || number}
    </div>
  );
};

const RouletteTable = ({ gameData, onBetClick }) => {
  const numbers = [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
  ];

  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  // Normalize and create a lookup from gameData
  const subMap = {};
  gameData.forEach(item => {
    const key = normalize(item.n);
    if (key) subMap[key] = item;
  });

  // Helper to determine lock status
  const isLocked = (label) => {
    const normalized = normalize(label);
    const data = subMap[normalized];
    return !data || data.s === 0;
  };

  return (
    <div className={styles.rouletteTable}>
      <div className={styles.tableWrapper}>
        <div className={styles.zeroContainer}>
          <Cell
            type="zero"
            number={0}
            locked={isLocked(0)}
            onClick={onBetClick}
          />
        </div>
        <div className={styles.numbersGrid}>
          {numbers.map((row, rowIndex) => (
            <div className={styles.row} key={rowIndex}>
              {row.map((number) => (
                <Cell
                  key={number}
                  number={number}
                  locked={isLocked(number)}
                  type={redNumbers.includes(number) ? "red" : "black"}
                  onClick={onBetClick}
                />
              ))}
              <Cell
                type="special"
                label="2 to 1"
                locked={isLocked("2 to 1")}
                onClick={onBetClick}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottomBets}>
        <div className={styles.dozens}>
          <Cell type="special" label="1st 12" locked={isLocked("1st 12")} onClick={onBetClick} />
          <Cell type="special" label="2nd 12" locked={isLocked("2nd 12")} onClick={onBetClick} />
          <Cell type="special" label="3rd 12" locked={isLocked("3rd 12")} onClick={onBetClick} />
        </div>

        <div className={styles.otherBets}>
          <Cell type="special" label="1 - 18" locked={isLocked("1 - 18")} onClick={onBetClick} />
          <Cell type="special" label="Even" locked={isLocked("Even")} onClick={onBetClick} />
          <Cell type="special" label="Red" locked={isLocked("Red")} onClick={onBetClick} />
          <Cell type="special" label="Black" locked={isLocked("Black")} onClick={onBetClick} />
          <Cell type="special" label="Odd" locked={isLocked("Odd")} onClick={onBetClick} />
          <Cell type="special" label="19 - 36" locked={isLocked("19 - 36")} onClick={onBetClick} />
        </div>
      </div>
    </div>
  );
};

export default RouletteTable;
