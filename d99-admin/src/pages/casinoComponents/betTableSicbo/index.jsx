import styles from "./BetTableSicbo.module.css";
import { MdLock } from "react-icons/md";
// Import dice images
import dice1 from '../../../assets/img/dolidana/dice1.png';
import dice2 from '../../../assets/img/dolidana/dice2.png';
import dice3 from '../../../assets/img/dolidana/dice3.png';
import dice4 from '../../../assets/img/dolidana/dice4.png';
import dice5 from '../../../assets/img/dolidana/dice5.png';
import dice6 from '../../../assets/img/dolidana/dice6.png';

// Dice images map
const diceImages = {
  1: dice1,
  2: dice2,
  3: dice3,
  4: dice4,
  5: dice5,
  6: dice6
};

const BetTableSicbo = ({ data = [], onBetClick }) => {
  const getData = (label) => {
    return data.find((d) => d.nat?.toLowerCase() === label.toLowerCase());
  };

  // Format odds from API
  const formatOdds = (odds) => {
    if (!odds || odds === 0) return "";
    // If odds is already a string with ":", return as is
    if (typeof odds === 'string' && odds.includes(':')) return odds;
    // Otherwise format as "X:1"
    return `${odds}:1`;
  };

  const renderCell = (label, displayNode, extraClass = "", style = {}) => {
    const item = getData(label);
    const isLocked = !item || item.gstatus === "SUSPENDED" || (item.b === 0 && item.gstatus !== "ACTIVE");

    return (
      <div
        className={`${styles.gridCell} ${styles.squareBox} ${extraClass} ${isLocked ? styles.suspendedBox : ""}`}
        style={{ ...style, cursor: isLocked ? "not-allowed" : "pointer" }}
        onClick={() => !isLocked && onBetClick && onBetClick(item)}
      >
        <div style={{ fontSize: '11px', fontWeight: 'thin' }}>{displayNode}</div>
        {item && item.b && <div className={styles.boxValue}>{formatOdds(item.b)}</div>}
        {isLocked && <div className={styles.lockOverlay}><MdLock size={18} color="white" /></div>}
      </div>
    );
  };

  const renderDiceCell = (label, pips, extraClass = "") => {
    const item = getData(label);
    const isLocked = !item || item.gstatus === "SUSPENDED" || (item.b === 0 && item.gstatus !== "ACTIVE");
    const isArr = Array.isArray(pips);
    const values = isArr ? pips : [pips];

    return (
        <div
            className={`${styles.cubeBox} ${styles.squareBox} ${extraClass} ${isLocked ? styles.suspendedBox : ""}`}
            style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
            onClick={() => !isLocked && onBetClick && onBetClick(item)}
        >
            {values.map((val, i) => (
                <img 
                    key={i}
                    src={diceImages[val]} 
                    alt={`Dice ${val}`}
                />
            ))}
            {isLocked && <div className={styles.lockOverlay}><MdLock size={18} color="white" /></div>}
        </div>
    )
  }

  return (
    <div className={styles.betTableContainer}>
      {/* Desktop View (xl and above) */}
      <div className={styles.desktopView}>
        {/* Top Warnings Row */}
        <div className={styles.topWarningRow}>
            <div className={styles.warningBox}>1:1 Lose if Any Triple</div>
            <div className={`${styles.warningBox} ${styles.centerWarning}`}>30:1</div>
            <div className={styles.warningBox}>1:1 Lose if Any Triple</div>
        </div>

        {/* Main Container: Small - Center - Big */}
        <div className={styles.mainContainer}>
           
           {/* LEFT: Small */}
           {(() => {
               const item = getData("Small");
               const isLocked = !item || item.gstatus === "SUSPENDED";
               return (
                   <div
                      className={`${styles.sideBox} ${styles.smallBox} ${styles.squareBox} ${isLocked ? styles.suspendedBox : ""}`}
                      onClick={() => !isLocked && onBetClick && onBetClick(item)}
                      style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
                   >
                      <div className={styles.sideLabel}>Small</div>
                      <div className={styles.boxValue}>4-10</div>
                      {isLocked && <div className={styles.lockOverlay}><MdLock size={18} color="white" /></div>}
                   </div>
               )
           })()}

           {/* CENTER: 18-Column Grids */}
           <div className={styles.centerSection}>
               
               {/* Row 1: Outcomes (18 Cols) */}
               <div className={styles.row18}>
                   {/* Col 1: ODD */}
                   {renderCell("ODD", <div className={styles.cellLabel}>ODD</div>, styles.grayCell)}

                   {/* Col 2-8: 4-10 */}
                   {[4, 5, 6, 7, 8, 9, 10].map(num => (
                       <div key={num} style={{display:'contents'}}>
                          {renderCell(`Total ${num}`, <div className={styles.number}>{num}</div>, styles.grayCell)}
                       </div>
                   ))}

                   {/* Col 9-10: Any Triple (Span 2) */}
                   {(() => {
                       const item = getData("Any Triple");
                       const isLocked = !item || item.gstatus === "SUSPENDED" || (item.b === 0 && item.gstatus !== "ACTIVE");
                       return (
                           <div
                               key="any-triple"
                               className={`${styles.gridCell} ${styles.squareBox} ${styles.anyTripleCell} ${isLocked ? styles.suspendedBox : ""}`}
                               style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
                               onClick={() => !isLocked && onBetClick && onBetClick(item)}
                           >
                               <div className={styles.anyTripleText}>ANY TRIPLE</div>
                               {isLocked && <div className={styles.lockOverlay}><MdLock size={18} color="white" /></div>}
                           </div>
                       );
                   })()}

                   {/* Col 11-17: 11-17 */}
                   {[11, 12, 13, 14, 15, 16, 17].map(num => (
                       <div key={num} style={{display:'contents'}}>
                          {renderCell(`Total ${num}`, <div className={styles.number}>{num}</div>, styles.grayCell)}
                       </div>
                   ))}

                   {/* Col 18: Even */}
                   {renderCell("Even", <div className={styles.cellLabel}>Even</div>, styles.grayCell)}
               </div>

               {/* Row 2-3: Info Headers with Dice Groups */}
               <div className={styles.middleMiddleRow}>
                   {/* Singles Container - For Sicbo, show only "2:1 on Double" (second title) */}
                   <div className={styles.cubeBoxContainer}>
                      <div className={styles.titleBox}>
                          <span>2:1 on Double</span>
                      </div>
                      <div className={styles.cubeBoxGroup}>
                          {[1, 2, 3, 4, 5, 6].map(num => (
                              <div key={`s-${num}`} style={{display:'contents'}}>
                                  {renderDiceCell(`Single ${num}`, num, styles.cubeSingle)}
                              </div>
                          ))}
                      </div>
                   </div>

                   {/* Doubles Container */}
                   <div className={styles.cubeBoxContainer}>
                      <div className={styles.titleBox}>8:1 Double</div>
                      <div className={styles.cubeBoxGroup}>
                          {[1, 2, 3, 4, 5, 6].map(num => (
                              <div key={`d-${num}`} style={{display:'contents'}}>
                                  {renderDiceCell(`Double ${num}`, [num, num], styles.cubeDouble)}
                              </div>
                          ))}
                      </div>
                   </div>

                   {/* Triples Container */}
                   <div className={styles.cubeBoxContainer}>
                      <div className={styles.titleBox}>150:1 Each Triple</div>
                      <div className={styles.cubeBoxGroup}>
                          {[1, 2, 3, 4, 5, 6].map(num => (
                              <div key={`t-${num}`} style={{display:'contents'}}>
                                  {renderDiceCell(`Triple ${num}`, [num, num, num], styles.cubeTriple)}
                              </div>
                          ))}
                      </div>
                   </div>
               </div>

           </div>

           {/* RIGHT: Big */}
           {(() => {
               const item = getData("BIG");
               const isLocked = !item || item.gstatus === "SUSPENDED";
               return (
                   <div
                      className={`${styles.sideBox} ${styles.bigBox} ${styles.squareBox} ${isLocked ? styles.suspendedBox : ""}`}
                      onClick={() => !isLocked && onBetClick && onBetClick(item)}
                      style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
                   >
                      <div className={styles.sideLabel}>BIG</div>
                      <div className={styles.boxValue}>11-17</div>
                      {isLocked && <div className={styles.lockOverlay}><MdLock size={18} color="white" /></div>}
                   </div>
               )
           })()}

        </div>

        {/* Bottom Section - Two Dice (15 items) */}
        <div className={styles.bottomSection}>
          <div className={styles.cubeBoxContainer}>
            <div className={styles.titleBox}>
              5:1 Two Dice
            </div>
            <div className={styles.cubeBoxGroup}>
              {[
                [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
                [2, 3], [2, 4], [2, 5], [2, 6],
                [3, 4], [3, 5], [3, 6],
                [4, 5], [4, 6], [5, 6],
              ].map((pair, index) => (
                 <div key={index} style={{display:'contents'}}>
                     {renderDiceCell(`Combination ${pair[0]} and ${pair[1]}`, pair, styles.cubeCombination)}
                 </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View (below xl) */}
      <div className={styles.mobileView}>
        {/* Top Section - Small, ODD, Any Triple, Even, Big */}
        <div className={styles.topWarningRow}>
          <div className={styles.cubeBoxContainer}>
            <div className={styles.titleBox}>1:1 Lose to Any Triple</div>
            <div className={styles.cubeBoxGroup}>
              {(() => {
                const item = getData("Small");
                const isLocked = !item || item.gstatus === "SUSPENDED";
                return (
                  <div
                    className={`${styles.gridCell} ${styles.squareBox} ${styles.grayCell} ${isLocked ? styles.suspendedBox : ""}`}
                    style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
                    onClick={() => !isLocked && onBetClick && onBetClick(item)}
                  >
                    <div className={styles.cellLabel}>Small</div>
                    <div className={styles.boxValue}>4-10</div>
                    {isLocked && <div className={styles.lockOverlay}><MdLock size={18} color="white" /></div>}
                  </div>
                );
              })()}
              {renderCell("ODD", <div className={styles.cellLabel}>ODD</div>, styles.grayCell)}
            </div>
          </div>

          <div className={styles.cubeBoxContainer}>
            <div className={styles.titleBox}>30:1</div>
            <div className={styles.cubeBoxGroup}>
              {(() => {
                const item = getData("Any Triple");
                const isLocked = !item || item.gstatus === "SUSPENDED" || (item.b === 0 && item.gstatus !== "ACTIVE");
                return (
                  <div
                    key="any-triple-mobile"
                    className={`${styles.gridCell} ${styles.squareBox} ${styles.anyTripleCell} ${isLocked ? styles.suspendedBox : ""}`}
                    style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
                    onClick={() => !isLocked && onBetClick && onBetClick(item)}
                  >
                    <div className={styles.anyTripleText}>Any Triple</div>
                    {isLocked && <div className={styles.lockOverlay}><MdLock size={18} color="white" /></div>}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className={styles.cubeBoxContainer}>
            <div className={styles.titleBox}>1:1 Lose to Any Triple</div>
            <div className={styles.cubeBoxGroup}>
              {renderCell("Even", <div className={styles.cellLabel}>Even</div>, styles.grayCell)}
              {(() => {
                const item = getData("BIG");
                const isLocked = !item || item.gstatus === "SUSPENDED";
                return (
                  <div
                    className={`${styles.gridCell} ${styles.squareBox} ${styles.grayCell} ${isLocked ? styles.suspendedBox : ""}`}
                    style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
                    onClick={() => !isLocked && onBetClick && onBetClick(item)}
                  >
                    <div className={styles.cellLabel}>Big</div>
                    <div className={styles.boxValue}>11-17</div>
                    {isLocked && <div className={styles.lockOverlay}><MdLock size={18} color="white" /></div>}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Middle Section - Left (Doubles/Triples), Right (Numbers), Middle Row (Singles) */}
        <div className={styles.mobileMiddle}>
          {/* Left Side - Doubles and Triples */}
          <div className={styles.mobileMiddleLeft}>
            <div className={styles.cubeBoxContainer}>
              <div className={styles.titleBox}>8:1 Each Double</div>
              <div className={styles.cubeBoxGroup}>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <div key={`d-m-${num}`} style={{display:'contents'}}>
                    {renderDiceCell(`Double ${num}`, [num, num], styles.cubeDouble)}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.cubeBoxContainer}>
              <div className={styles.titleBox}>150:1 Each Triple</div>
              <div className={styles.cubeBoxGroup}>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <div key={`t-m-${num}`} style={{display:'contents'}}>
                    {renderDiceCell(`Triple ${num}`, [num, num, num], styles.cubeTriple)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Numbers 4-17 and Two Dice */}
          <div className={styles.mobileMiddleRight}>
            <div className={styles.row18}>
              {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(num => (
                <div key={num} style={{display:'contents'}}>
                  {renderCell(`Total ${num}`, <div className={styles.number}>{num}</div>, styles.grayCell)}
                </div>
              ))}
            </div>

            {/* Bottom Section - Two Dice */}
            <div className={styles.bottomSection}>
              <div className={styles.cubeBoxContainer}>
                <div className={styles.titleBox}>5:1 Two Dice</div>
                <div className={styles.cubeBoxGroup}>
                  {[
                    [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
                    [2, 3], [2, 4], [2, 5], [2, 6],
                    [3, 4], [3, 5], [3, 6],
                    [4, 5], [4, 6], [5, 6],
                  ].map((pair, index) => (
                    <div key={index} style={{display:'contents'}}>
                      {renderDiceCell(`Combination ${pair[0]} and ${pair[1]}`, pair, styles.cubeCombination)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row - Singles - For Sicbo, show only "2:1 on Double" (second title) */}
          <div className={styles.middleMiddleRow}>
            <div className={styles.cubeBoxContainer}>
              <div className={styles.titleBox}>
                <span>2:1 on Double</span>
              </div>
              <div className={styles.cubeBoxGroup}>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <div key={`s-m-${num}`} style={{display:'contents'}}>
                    {renderDiceCell(`Single ${num}`, num, styles.cubeSingle)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetTableSicbo;
