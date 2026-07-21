import React from "react";
import styles from "./CasinoTableLayout.module.css";

/**
 * Common layout for casino table pages.
 * Left: CasinoHeader, VideoBox, BetTable, Result (passed as children).
 * Right: My Bets (passed as rightSide), always rendered first.
 * No Place Bet panel — betting via bet table only.
 */
export default function CasinoTableLayout({ children, rightSide }) {
  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>{children}</div>
      {rightSide != null && (
        <div className={styles.rightSection}>
          <div className="right-sidebar">{rightSide}</div>
        </div>
      )}
    </div>
  );
}
