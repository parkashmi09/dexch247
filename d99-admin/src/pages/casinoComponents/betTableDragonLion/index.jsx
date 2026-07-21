import { MdLock } from "react-icons/md";
import styles from "./BetTableDragonLion.module.css";

export default function BetTableDragonLion({ data = [], onBetClick }) {
  const columns = ["Dragon", "Tiger", "Lion"];
  const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  const leftCards = cards.slice(0, 4);  // A,2,3,4
  const rightCards = cards.slice(4);    // 5 to K

  const renderCard = (card) => (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        {card}
        <div className={styles.cardSuits}>
          <span className={styles.black}>♠</span>
          <span className={styles.red}>♥</span>
        </div>
      </div>
    </div>
  );

  // Render special bets rows (only for left table)
  const renderSpecialBets = () => (
    ["Winner", "Black", "Red", "Odd", "Even"].map((label, index) => (
      <tr key={`special-${index}`} className={styles.tableRow}>
        <td className={styles.betType}>{label}</td>
        {columns.map((col) => {
          const bet = data.find(
            (item) =>
              item.nat.toLowerCase().includes(label.toLowerCase()) &&
              item.nat.toLowerCase().includes(col.toLowerCase())
          );

          const isLocked = !bet || bet.b <= 0;

          return (
            <td
              key={`${col}-${label}`}
              className={`${styles.oddsCell} ${isLocked ? styles.grayBackground : ""}`}
              onClick={() => !isLocked && onBetClick(bet)}
            >
              {isLocked ? <MdLock color="white" /> : bet.b}
            </td>
          );
        })}
      </tr>
    ))
  );

  // Render rows for cards
  const renderCardRows = (cardsToRender) =>
    cardsToRender.map((card) => (
      <tr key={card} className={styles.tableRow}>
        <td className={styles.cardCell}>{renderCard(card)}</td>
        {columns.map((col) => {
          const label = `${col} ${card}`;
          const bet = data.find(
            (item) => item.nat.toLowerCase() === label.toLowerCase()
          );

          const isLocked = !bet || bet.b <= 0;

          return (
            <td
              key={`${col}-${card}`}
              className={`${styles.oddsCell} ${isLocked ? styles.grayBackground : ""}`}
              onClick={() => !isLocked && onBetClick(bet)}
            >
              {isLocked ? <MdLock color="white" /> : bet.b}
            </td>
          );
        })}
      </tr>
    ));

  return (
    <div className={styles.dragonLionTable}>
      <div className={styles.tableGrid} style={{ display: "flex", gap: "20px" }}>
        {/* Left Table: special bets + cards A to 4 */}
        <table className={styles.table} style={{ width: "100%" }}>
          <thead>
            <tr className={styles.tableHeaderRow}>
              <th className={styles.emptyHeader}></th>
              {columns.map((col, index) => (
                <th key={index} className={styles.columnHeader}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {renderSpecialBets()}
            {renderCardRows(leftCards)}
          </tbody>
        </table>

        {/* Right Table: cards 5 to K (no special bets) */}
        <table className={styles.table} style={{ width: "100%" }}>
          <thead>
            <tr className={styles.tableHeaderRow}>
              <th className={styles.emptyHeader}></th>
              {columns.map((col, index) => (
                <th key={index} className={styles.columnHeader}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {renderCardRows(rightCards)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
