import React from "react";
import styles from "../VideoBox.module.css";

/**
 * Title + Round ID overlay (e.g. Mogambo at top-left).
 * Only rendered when show is true.
 */
export default function VideoBoxTitle({ show, title = "Mogambo", roundId }) {
  if (!show) return null;
  return (
    <div className={styles.casinoVideoTitle}>
      <span className={styles.casinoName}>{title}</span>
      <div className={styles.casinoVideoRid}>Round ID: {roundId ?? "—"}</div>
    </div>
  );
}
