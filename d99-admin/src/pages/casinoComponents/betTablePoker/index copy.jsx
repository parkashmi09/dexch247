import { MdLock } from "react-icons/md";
import styles from "./BetTablePoker.module.css";

export default function BetTablePoker({ data, onBetClick }) {
  const {
    player = "Player",
    back = "7",
    lay = "5",
    caros2 = "0",
    caros7 = "1",
  } = data || {};

  return (
    <div className={styles.betTable}>
      <table className={styles.table}>
        <tbody>
          <tr className={styles.tableRow}>
            <td className={styles.playerName}>{player}</td>

            {back === "0" ? (
              <td className={styles.lockedCell}>
                <MdLock color="white" />
              </td>
            ) : (
              <td className={styles.backCell} onClick={() => onBetClick(back)}>
                {back}
              </td>
            )}

            {lay === "0" ? (
              <td className={styles.lockedCell}>
                <MdLock color="white" />
              </td>
            ) : (
              <td className={styles.layCell} onClick={() => onBetClick(lay)}>
                {lay}
              </td>
            )}
          </tr>
        </tbody>
      </table>

      <div className={styles.section2}>
        {/* 2 Caros Bonus */}
        {caros2 === "0" ? (
          <div className={`${styles.bonusBox} ${styles.bonusLock}`}>
            <MdLock className={styles.lockIcon} />
            <span className={styles.lockedText}>2 Caros Bonus</span>
          </div>
        ) : (
          <div
            className={styles.bonusBox}
            onClick={() => onBetClick("2 Caros Bonus")}
          >
             2 Caros Bonus
          </div>
        )}

        {/* 7 Caros Bonus */}
        {caros7 === "0" ? (
          <div className={`${styles.bonusBox} ${styles.bonusLock}`}>
            <MdLock className={styles.lockIcon} />
            <span className={styles.lockedText}>7 Caros bonus</span>
          </div>
        ) : (
          <div
            className={styles.bonusBox}
            onClick={() => onBetClick("7 Caros Bonus")}
          >
            7 Caros Bonus
          </div>
        )}
      </div>
    </div>
  );
}
