"use client"

import { useState } from "react"
import { MdLock } from "react-icons/md"
import styles from "./BetTableLott.module.css"

const BetTableLott = ({ data = [], onBetClick }) => {
  const [activeTab, setActiveTab] = useState("single")
  const [singleCount] = useState(0)
  const [doubleCount] = useState(0)
  const [tripleCount] = useState(0)

  const betAmounts = [5, 10, 15, 20, 25, 50, 75]
  const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10"]

  const handleTabClick = (tab) => {
    setActiveTab(tab)
  }

  // Get gstatus for active tab
  const getStatus = (tab) => {
    const found = data.find(item => item.nat?.toLowerCase() === tab)
    return found?.gstatus || "SUSPENDED"
  }

  const isLocked = getStatus(activeTab) === "SUSPENDED"

  return (
    <div className={styles.container}>
      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "single" ? styles.activeTab : ""}`}
          onClick={() => handleTabClick("single")}
        >
          Single ({singleCount})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "double" ? styles.activeTab : ""}`}
          onClick={() => handleTabClick("double")}
        >
          Double ({doubleCount})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "triple" ? styles.activeTab : ""}`}
          onClick={() => handleTabClick("triple")}
        >
          Triple ({tripleCount})
        </button>
      </div>

      {/* Content Section */}
      <div className={`${styles.tabContent} ${isLocked ? styles.locked : ""}`}>
        {isLocked ? (
          <div className={styles.lockOverlay}>
            <MdLock color="white" size={48} />
          </div>
        ) : (
          <>
            {/* Cards */}
            <div className={styles.cardsContainer}>
              {cards.map((card) => (
                <div key={card} className={styles.card}>
                  <div className={styles.cardValue}>{card}</div>
                  <div className={styles.suits}>
                    <span className={styles.blackSuit}>♠</span>
                    <span className={styles.redSuit}>♦</span>
                  </div>
                  <div className={styles.suits}>
                    <span className={styles.blackSuit}>♣</span>
                    <span className={styles.redSuit}>♥</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Random Bets - Show only for Double and Triple */}
            {(activeTab === "double" || activeTab === "triple") && (
              <div className={styles.randomBetsContainer}>
                <div className={styles.randomBetsHeader}>Random Bets</div>
                <div className={styles.betButtons}>
                  {betAmounts.map((amount) => (
                    <button
                      key={amount}
                      className={styles.betButton}
                      onClick={() => onBetClick(amount)}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default BetTableLott
