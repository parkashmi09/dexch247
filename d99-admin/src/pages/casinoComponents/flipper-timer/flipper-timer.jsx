"use client"

import { useEffect, useState } from "react"
import { FlipperDigit } from "./flipper-digit"
import styles from "./flipper.module.css"

export function FlipperTimer({ size = 100, initialTime = 0 }) {
  const [timeLeft, setTimeLeft] = useState(initialTime)

  useEffect(() => {
    // If initialTime is 0, we might want to default to clock mode or just stay 0.
    // Assuming countdown mode if initialTime > 0.
    if (initialTime <= 0) return;

    setTimeLeft(initialTime);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [initialTime])

  // Calculate HH, MM, SS
  const hours = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60

  const hoursStr = hours.toString().padStart(2, "0")
  const minutesStr = minutes.toString().padStart(2, "0")
  const secondsStr = seconds.toString().padStart(2, "0")

  // Conditional Rendering Logic
  // If total seconds < 60, hide minutes and hours
  // If total seconds < 3600, hide hours
  const showHours = timeLeft >= 3600
  const showMinutes = timeLeft >= 60

  return (
    <div className={styles.flipperTimer} style={{ "--flipper-size": `${size}px` }}>
      {showHours && (
        <>
          <div className={styles.digitGroup}>
            <FlipperDigit digit={hoursStr[0]} />
            <FlipperDigit digit={hoursStr[1]} />
          </div>
          <div className={styles.separator}>:</div>
        </>
      )}
      
      {showMinutes && (
        <>
          <div className={styles.digitGroup}>
            <FlipperDigit digit={minutesStr[0]} />
            <FlipperDigit digit={minutesStr[1]} />
          </div>
          <div className={styles.separator}>:</div>
        </>
      )}

      <div className={styles.digitGroup}>
        <FlipperDigit digit={secondsStr[0]} />
        <FlipperDigit digit={secondsStr[1]} />
      </div>
    </div>
  )
}
