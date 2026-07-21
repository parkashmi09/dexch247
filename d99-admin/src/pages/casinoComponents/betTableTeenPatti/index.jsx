import { MdLock } from "react-icons/md";
import styles from "./BetTableTeenPatti.module.css";

export default function BetTable({ data, onBetClick }) {
  return (
    <div className={styles.betTable}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHeaderRow}>
            <th className={styles.playerName}>{"Player"}</th>
            <th className={styles.backHeader}>Back</th>
            <th className={styles.layHeader}>Lay</th>
          </tr>
        </thead>
        <tbody>
          {/* Row 1 */}
          <tr className={styles.tableRow}>
            <td className={styles.mainCell}>Main</td>
            {/* Back Column */}
            {Object.keys(data || {}).length === 0 || data.back === 0 ? (
              <td className={styles.lockedCell}>
                <MdLock color="white" />
              </td>
            ) : (
              <td className={styles.backCell} onClick={() => onBetClick(data.back)}>
                <span>{data.back}</span>
              </td>
            )}
            {/* Lay Column */}
            {Object.keys(data || {}).length === 0 || data.lay === 0 ? (
              <td className={styles.lockedCell}>
                <MdLock color="white" />
              </td>
            ) : (
              <td className={styles.layCell} onClick={() => onBetClick(data.lay)}>
                <span>{data.lay}</span>
              </td>
            )}
          </tr>

          {/* Row 2 */}
          <tr className={styles.tableRow}>
            <td className={styles.mainCell}>Main</td>
            {/* Back Column */}
            {Object.keys(data || {}).length === 0 || data.back === 0 ? (
              <td className={styles.lockedCell}>
                <MdLock color="white" />
              </td>
            ) : (
              <td className={styles.backCell} onClick={() => onBetClick(data.back)}>
                <span>{data.back}</span>
              </td>
            )}
            {/* Lay Column */}
            {Object.keys(data || {}).length === 0 || data.lay === 0 ? (
              <td className={styles.lockedCell}>
                <MdLock color="white" />
              </td>
            ) : (
              <td className={styles.layCell} onClick={() => onBetClick(data.lay)}>
                <span>{data.lay}</span>
              </td>
            )}
          </tr>

          {/* Row 3 */}
          <tr className={styles.tableRow}>
            <td className={styles.mainCell}>Main</td>
            {/* Back Column */}
            {Object.keys(data || {}).length === 0 || data.back === 0 ? (
              <td className={styles.lockedCell}>
                <MdLock color="white" />
              </td>
            ) : (
              <td className={styles.backCell} onClick={() => onBetClick(data.back)}>
                <span>{data.back}</span>
              </td>
            )}
            {/* Lay Column */}
            {Object.keys(data || {}).length === 0 || data.lay === 0 ? (
              <td className={styles.lockedCell}>
                <MdLock color="white" />
              </td>
            ) : (
              <td className={styles.layCell} onClick={() => onBetClick(data.lay)}>
                <span>{data.lay}</span>
              </td>
            )}
          </tr>

          {/* Row 4 */}
          <tr className={styles.tableRow}>
            <td className={styles.mainCell}>Main</td>
            {/* Back Column */}
            {Object.keys(data || {}).length === 0 || data.back === 0 ? (
              <td className={styles.lockedCell}>
                <MdLock color="white" />
              </td>
            ) : (
              <td className={styles.backCell} onClick={() => onBetClick(data.back)}>
                <span>{data.back}</span>
              </td>
            )}
            {/* Lay Column */}
            {Object.keys(data || {}).length === 0 || data.lay === 0 ? (
              <td className={styles.lockedCell}>
                <MdLock color="white" />
              </td>
            ) : (
              <td className={styles.layCell} onClick={() => onBetClick(data.lay)}>
                <span>{data.lay}</span>
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}