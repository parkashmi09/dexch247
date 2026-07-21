import styles from "./BetTableDoliDana.module.css";
// Import dice images
import dice1 from '../../../assets/img/dolidana/dice1.png';
import dice2 from '../../../assets/img/dolidana/dice2.png';
import dice3 from '../../../assets/img/dolidana/dice3.png';
import dice4 from '../../../assets/img/dolidana/dice4.png';
import dice5 from '../../../assets/img/dolidana/dice5.png';
import dice6 from '../../../assets/img/dolidana/dice6.png';

// Normalize string for matching
const normalizeString = (str) => {
    if (!str) return "";
    return str
        .replace(/\s*\(\s*/g, '(')
        .replace(/\s*\)\s*/g, ')')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
};

const diceImages = {
    1: dice1,
    2: dice2,
    3: dice3,
    4: dice4,
    5: dice5,
    6: dice6,
};

const Dice = ({ val }) => {
    const diceImage = diceImages[val];
    
    if (!diceImage) return null;

    return (
        <img
            src={diceImage}
            alt={`Dice ${val}`}
            style={{
                width: '30px',
                height: '30px',
                objectFit: 'contain'
            }}
            onError={(e) => {
                e.target.style.display = 'none';
            }}
        />
    );
}

const BetTableDoliDana = ({ data = [], onBetClick, exposures = {}, myBets = [] }) => {
    const getRate = (nat) => {
        const item = data.find(i => i.nat === nat) || { b: 0, gstatus: "0" };
        return item;
    };

    // Get exposure value
    const getExposure = (betName) => {
        if (!betName) return 0;

        const exposureKeys = [
            betName,
            betName?.toLowerCase(),
            betName?.toLowerCase().trim(),
            betName?.trim(),
            normalizeString(betName),
        ];

        for (const key of exposureKeys) {
            if (key && exposures[key] !== undefined && exposures[key] !== null) {
                const expValue = parseFloat(exposures[key]);
                if (!isNaN(expValue)) {
                    return expValue;
                }
            }
        }

        // Try normalized match against all exposure keys
        const normalizedKey = normalizeString(betName);
        for (const expKey in exposures) {
            const normalizedExpKey = normalizeString(expKey);
            if (normalizedKey === normalizedExpKey) {
                const expValue = parseFloat(exposures[expKey]);
                if (!isNaN(expValue)) {
                    return expValue;
                }
            }
        }

        return 0;
    };

    const renderButton = (label, nat, className = styles.blueBtn, showLabel = false, customContent = null) => {
        const item = getRate(nat);
        const isLocked = item.gstatus === "0" || item.b === 0 || item.gstatus?.toUpperCase() === "SUSPENDED";

        const selectionName = item?.nat || nat || label;
        const normalizedSelection = normalizeString(selectionName);

        // Find bet for this selection
        const bet = myBets.find(bet => {
            const betSelection = normalizeString(bet.selection || bet.matchedBet || bet.player_name || "");
            return (betSelection === normalizedSelection ||
                betSelection.includes(normalizedSelection)) &&
                (bet.type === "back" || bet.betType === "back" || !bet.type);
        });

        // Get exposure from myBets (exposer field) or from exposures map
        const exposure = bet?.exposer || (bet ? getExposure(bet.selection || bet.matchedBet || selectionName) : 0);

        return (
            <div
                className={`${className} ${isLocked ? styles.suspendedBox : ''}`}
                onClick={() => !isLocked && onBetClick(item.b, label, item, "back")}
                style={{ position: 'relative' }}
            >
                <div className={styles.btnContent}>
                    {showLabel && <div className={styles.itemLabel}>{label}</div>}
                    {customContent && !isLocked && customContent}
                    <div className={styles.btnValue} style={{ opacity: isLocked ? 0.6 : 1, position: 'relative', zIndex: 0 }}>
                        {item.b || 0}
                    </div>
                    {exposure !== 0 && bet && (
                        <div className={styles.exposure} style={{
                            color: exposure < 0 ? '#ff0000' : '#00ff00',
                            position: 'relative',
                            zIndex: 4,
                        }}>
                            {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderPlayerRow = (name, nat) => {
        const item = getRate(nat);
        const isLocked = item.gstatus === "0" || item.b === 0 || item.gstatus?.toUpperCase() === "SUSPENDED";

        const selectionName = item?.nat || nat || name;
        const normalizedSelection = normalizeString(selectionName);

        // Find bet for this selection
        const bet = myBets.find(bet => {
            const betSelection = normalizeString(bet.selection || bet.matchedBet || bet.player_name || "");
            return (betSelection === normalizedSelection ||
                betSelection.includes(normalizedSelection)) &&
                (bet.type === "back" || bet.betType === "back" || !bet.type);
        });

        // Get exposure from myBets (exposer field) or from exposures map
        const exposure = bet?.exposer || (bet ? getExposure(bet.selection || bet.matchedBet || selectionName) : 0);

        return (
            <div className={styles.playerRow}>
                <div className={styles.playerName}>{name}</div>
                <div
                    className={`${styles.playerOdds} ${isLocked ? styles.suspendedBox : ''}`}
                    onClick={() => !isLocked && onBetClick(item.b, name, item, "back")}
                    style={{ position: 'relative' }}
                >
                    <div style={{ opacity: isLocked ? 0.6 : 1, position: 'relative', zIndex: 0 }}>
                        <div className={styles.value}>{item.b || 0}</div>
                        <div className={styles.sub}>{item.bs || 500000}</div>
                    </div>
                    {exposure !== 0 && bet && (
                        <div className={styles.exposure} style={{
                            color: exposure < 0 ? '#ff0000' : '#00ff00',
                            position: 'relative',
                            zIndex: 4,
                        }}>
                            {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
                        </div>
                    )}
                </div>
            </div>
        )
    };

    return (
        <div className={styles.betTable}>

            {/* Top Main Container: Players on Left, Markets on Right (Desktop) */}
            <div className={styles.topMainContainer}>

                {/* Players Section */}
                <div className={styles.playersSection}>
                    {renderPlayerRow("Player A", "Player A")}
                    {renderPlayerRow("Player B", "Player B")}
                </div>

                {/* Markets Section (Middle Section moved here) */}
                <div className={styles.middleSection}>
                    <div className={styles.middleBox} style={{ flex: 1.2 }}>
                        <div className={styles.headerTitle} style={{ background: 'transparent', border: 0, padding: '2px', }}>Any Pair</div>
                        {renderButton("Any Pair", "Any Pair", styles.bigBlueBtn, false)}
                    </div>

                    <div className={styles.middleBox} style={{ flex: 2 }}>
                        <div className={styles.flexRow} style={{ justifyContent: 'space-around', marginBottom: '2px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Odd</span>
                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Even</span>
                        </div>
                        <div className={styles.flexRow} style={{ gap: '10px' }}>
                            {renderButton("Odd", "Total Odd", styles.midBlueBtn)}
                            {renderButton("Even", "Total Even", styles.midBlueBtn)}
                        </div>
                    </div>

                    <div className={styles.middleBox} style={{ flex: 3, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px' }}>
                        <div style={{ textAlign: 'center', width: '30%' }}>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>&lt; 7</div>
                            {renderButton("< 7", "Total Under 7", styles.smallBlueBtn)}
                        </div>
                        <div className={styles.luckySevenIcon} title="Lucky 7">
                            <span className={styles.sevenText}>7</span>
                        </div>
                        <div style={{ textAlign: 'center', width: '30%' }}>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>&gt; 7</div>
                            {renderButton("> 7", "Total Over 7", styles.smallBlueBtn)}
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Grids */}
            <div className={styles.bottomSection}>
                <div className={styles.gridContainer} style={{ flex: 4 }}>
                    <div className={styles.headerTitle}>Particular Pair</div>
                    <div className={styles.grid3}>
                        {[1, 2, 3, 4, 5, 6].map(num => {
                            const label = `${num}-${num} Pair`;
                            const content = (
                                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '2px' }}>
                                    <Dice val={num} />
                                    <Dice val={num} />
                                </div>
                            );
                            return renderButton(label, label, styles.gridItem, false, content);
                        })}
                    </div>
                </div>

                <div className={styles.gridContainer} style={{ flex: 7 }}>
                    <div className={styles.headerTitle}>Odds of Sum Total</div>

                    {/* Sum Total Grid Split */}
                    <div className={styles.sumTotalContainer}>
                        {/* Top Row: 2,3,4,5,6,7 */}
                        <div className={styles.grid6}>
                            {[2, 3, 4, 5, 6, 7].map(num => (
                                renderButton(`Sum Total ${num}`, `Total ${num}`, styles.gridItem, true)
                            ))}
                        </div>
                        {/* Bottom Row: 8,9,10,11,12 */}
                        <div className={styles.grid5}>
                            {[8, 9, 10, 11, 12].map(num => (
                                renderButton(`Sum Total ${num}`, `Total ${num}`, styles.gridItem, true)
                            ))}
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default BetTableDoliDana;
