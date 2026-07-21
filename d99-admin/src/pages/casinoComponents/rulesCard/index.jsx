import styles from "./RulesCard.module.css";

export default function RulesCard({ rules = [], subHeader = "Pair Plus" }) {
  // Default rules based on subHeader
  const getDefaultRules = () => {
    if (subHeader === "Top 9") {
      return [
        { type: "Card 9", range: "1 TO 3" },
        { type: "Card 8", range: "1 TO 4" },
        { type: "Card 7", range: "1 TO 5" },
        { type: "Card 6", range: "1 TO 8" },
        { type: "Card 5", range: "1 TO 30" },
      ];
    }
    // Default for "Pair Plus" or other headers
    return [
      { type: "Pair", range: "1 TO 1" },
      { type: "Flush", range: "1 TO 4" },
      { type: "Straight", range: "1 TO 6" },
      { type: "Trio", range: "1 TO 30" },
      { type: "Straight Flush", range: "1 TO 40" },
    ];
  };

  const defaultRules = getDefaultRules();

  // Use rules from props if provided and valid, otherwise use defaults
  const displayRules = Array.isArray(rules) && rules.length > 0 ? rules : defaultRules;

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
                <th colSpan="2" className={styles.textCenter}>{subHeader}</th>
              </tr>
            </thead>
            <tbody>
              {displayRules.map((rule, index) => (
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