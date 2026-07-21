"use client"

import { useEffect, useState, useRef } from "react"
import styles from "./flipper.module.css"

export function FlipperDigit({ digit }) {
  const [displayDigit, setDisplayDigit] = useState(digit)
  const [previousDigit, setPreviousDigit] = useState(digit)
  const [isFlipping, setIsFlipping] = useState(false)

  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (digit !== displayDigit) {
      setPreviousDigit(displayDigit)
      setIsFlipping(true)


      // After full animation (600ms), update the display digit
      const timeout = setTimeout(() => {
        setDisplayDigit(digit)
        setIsFlipping(false)

      }, 600)

      return () => {
        clearTimeout(timeout)
      }
    }
  }, [digit, displayDigit])

  return (
    <div className={styles.flipperDigit}>
      {/* Static bottom - shows OLD digit until animation completes */}
      <div className={styles.cardBottom}>
        <div className={styles.cardFace}>
          <span>{isFlipping ? previousDigit : displayDigit}</span>
        </div>
      </div>

      {/* Static top - shows NEW digit (visible after top flap flips away) */}
      <div className={styles.cardTop}>
        <div className={styles.cardFace}>
          <span>{isFlipping ? digit : displayDigit}</span>
        </div>
      </div>

      {/* Animated top flip - covers static top, shows OLD digit, flips down */}
      {isFlipping && (
        <div className={`${styles.flipTop} ${styles.flipTopAnimate}`}>
          <div className={styles.cardFace}>
            <span>{previousDigit}</span>
          </div>
        </div>
      )}

      {/* Animated bottom flip - shows NEW digit, flips up to cover static bottom */}
      {isFlipping && (
        <div className={`${styles.flipBottom} ${styles.flipBottomAnimate}`}>
          <div className={styles.cardFace}>
            <span>{digit}</span>
          </div>
        </div>
      )}

      {/* Center line */}
      <div className={styles.centerLine} />
    </div>
  )
}
