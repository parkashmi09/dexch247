import styles from "./PokerRulesCard.module.css";

export default function PokerRulesCard({ rules = [], subHeader = "Pair Plus" }) {
  // Default rules based on subHeader
  const getDefaultFirstRules = () => {

    return [
      { type: "Pair (2-10)", range: "1 TO 3" },
      { type: "A/Q or A/J Off Suited", range: "1 TO 5" },
      { type: "Pair (JQK)", range: "1 TO 10" },
      { type: "A/K Off Suited", range: "1 TO 15" },
      { type: "A/Q or A/J Suited", range: "1 TO 20" },
      { type: "A/K Suited", range: "1 TO 25" },
      { type: "A/A", range: "1 TO 30" },
    ];



  }

  const getDefaultSecondRules = () => {
    return [
      { type: "Three of a Kind", range: "1 TO 3" },
      { type: "Straight", range: "1 TO 4" },
      { type: "Flush", range: "1 TO 6" },
      { type: "Full House", range: "1 TO 8" },
      { type: "Four of a Kind", range: "1 TO 30" },
      { type: "Straight Flush", range: "1 TO 50" },
      { type: "Royal Flush", range: "1 TO 100" },
    ];
  }



  // Use rules from props if provided and valid, otherwise use defaults


  return (
    <div className={styles.sidebarBox}>
      <div className={styles.sidebarTitle}>
        <h4>Rules</h4>
      </div>
      <div className={styles.myBets}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th colSpan="2" className={styles.textCenter}>Bonus 1 (2 Cards Bonus)</th>
              </tr>
            </thead>
            <tbody>
              {getDefaultFirstRules().map((rule, index) => (
                <tr key={index}>
                  <td>{rule.type}</td>
                  <td className={styles.textEnd}>{rule.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.myBets}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th colSpan="2" className={styles.textCenter}>Bonus 2 (7 Cards Bonus)</th>
              </tr>
            </thead>
            <tbody>
              {getDefaultSecondRules().map((rule, index) => (
                <tr key={index}>
                  <td>{rule.type}</td>
                  <td className={styles.textEnd}>{rule.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}