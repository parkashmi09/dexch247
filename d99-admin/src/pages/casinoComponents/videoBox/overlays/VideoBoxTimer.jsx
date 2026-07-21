import React from "react";
import { FlipperTimer } from "../../flipper-timer/flipper-timer";
import styles from "../VideoBox.module.css";

/**
 * Timer overlay (bottom-right). Uses FlipperTimer with responsive size.
 */
export default function VideoBoxTimer({ timerValue, size = 50 }) {
  return (
    <div className={styles.timer}>
      <FlipperTimer size={size} initialTime={timerValue || 0} />
    </div>
  );
}
