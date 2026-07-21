import styles from "./CasinoHeading.module.css";

export default function CasinoHeading({ name, rules, roundId, placedBetCount = 0, activeTab = "game", onTabChange, onRulesClick }) {
  const handleRulesClick = () => {
    if (onRulesClick) onRulesClick();
  };

  return (
    <div className={styles.gameHeader}>
      <span className={styles.gameHeaderName}>
        {name}
        {onRulesClick && (
          <span className={styles.smallText} onClick={handleRulesClick} style={{ cursor: "pointer" }}>
            {" "}Rules
          </span>
        )}
      </span>
      <span className={styles.gameHeaderDate}>Round ID: {roundId}</span>
    </div>
  );
}
