import styles from "./BetTableBaccarat.module.css";

export function BetTableBaccarat({ data = [], onBetClick, exposures = {}, myBets = [] }) {
  // Separate data by subtype
  const scoreItems = data.filter((item) => item.subtype === "score");
  const baccaratItems = data.filter((item) => item.subtype === "baccarat2" || item.subtype === "baccarat");
  const pairItems = data.filter((item) => item.subtype === "pair");

  // Build bottom row in order: Player Pair, Player, Tie, Banker, Banker Pair
  const playerPair = pairItems.find((i) => i.nat === "Player Pair");
  const player = baccaratItems.find((i) => i.nat === "Player");
  const tie = baccaratItems.find((i) => i.nat === "Tie");
  const banker = baccaratItems.find((i) => i.nat === "Banker");
  const bankerPair = pairItems.find((i) => i.nat === "Banker Pair");

  const bottomRow = [
    { data: playerPair, className: styles.playerPair, label: "Player Pair" },
    { data: player, className: styles.player, label: "Player" },
    { data: tie, className: styles.tie, label: "Tie" },
    { data: banker, className: styles.banker, label: "Banker" },
    { data: bankerPair, className: styles.bankerPair, label: "Banker Pair" },
  ];

  const getExposure = (betName) => {
    if (!betName) return 0;
    return exposures[betName] ?? exposures[betName.toLowerCase()] ?? 0;
  };

  const getOddsLabel = (item) => {
    if (!item || !item.b || item.b === 0) return "";
    return `${item.b}:1`;
  };

  const isSuspended = (item) => {
    return !item || item.gstatus === "SUSPENDED" || item.b === 0 || item.b === undefined;
  };

  const handleClick = (item) => {
    if (!item || isSuspended(item)) return;
    onBetClick?.(item.nat, item.b, item);
  };

  return (
    <div className={`${styles.baccaratBetsOdds} pt-3`}>
      {/* Score Odds Section (Top) */}
      <div className={styles.baccaratOdds}>
        {scoreItems.map((item) => {
          const suspended = isSuspended(item);
          const placedBet = myBets.find((b) => {
            const sel = (b.matchedBet || b.selection || b.player_name || "").toLowerCase().trim();
            return sel === item.nat?.toLowerCase().trim();
          });
          const exposure = placedBet ? getExposure(placedBet.matchedBet || placedBet.selection || placedBet.player_name || item.nat) : 0;
          const showExposure = placedBet !== undefined;

          return (
            <div className={styles.baccaratOddBlock} key={item.sid}>
              <div
                className={`${styles.baccaratOddName} ${suspended ? "suspended" : ""}`}
                onClick={() => handleClick(item)}
              >
                {item.nat} {getOddsLabel(item)}
              </div>
              <div className={`${styles.baccaratOddVal} ${showExposure && exposure < 0 ? "book-red" : showExposure && exposure > 0 ? "book-green" : "book-red"}`}>
                {showExposure ? exposure.toFixed(2) : "0"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bets Section (Bottom) */}
      <div className={styles.baccaratBets}>
        {bottomRow.map(({ data: item, className, label }) => {
          const suspended = isSuspended(item);
          const isPlayerOrBanker = label === "Player" || label === "Banker";
          const placedBet = myBets.find((b) => {
            const sel = (b.matchedBet || b.selection || b.player_name || "").toLowerCase().trim();
            return sel === label.toLowerCase().trim();
          });
          const exposure = placedBet ? getExposure(placedBet.matchedBet || placedBet.selection || placedBet.player_name || label) : 0;
          const showExposure = placedBet !== undefined;

          return (
            <div className={className} key={label}>
              <div
                className={`${styles.baccaratBetsName} ${suspended ? "suspended" : ""}`}
                onClick={() => handleClick(item)}
              >
                <div>{label}{isPlayerOrBanker ? ` ${getOddsLabel(item)}` : ""}</div>
                <div className="mb-0">
                  {!isPlayerOrBanker && getOddsLabel(item)}
                  {isPlayerOrBanker && (
                    <>
                      <span><img src="https://versionobj.ecoassetsservice.com/v93/static/admin/img/cards/1.png" alt="" /></span>
                      <span><img src="https://versionobj.ecoassetsservice.com/v93/static/admin/img/cards/1.png" alt="" /></span>
                    </>
                  )}
                </div>
              </div>
              <div className={`${styles.baccaratBetsVal} ${showExposure && exposure < 0 ? "book-red" : showExposure && exposure > 0 ? "book-green" : "book-red"}`}>
                {showExposure ? exposure.toFixed(2) : "0"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
