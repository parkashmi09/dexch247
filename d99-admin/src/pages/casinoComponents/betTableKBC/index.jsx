import React from "react";
import styles from "./BetTableKBC.module.css";

const BetTableKBC = ({ data = [], onBetClick, exposures = {}, myBets = [] }) => {
  // Helper to find the section by subtype, case-insensitive
  const getSectionBySubtype = (subtype) =>
    data.find((item) => item.subtype?.toLowerCase() === subtype.toLowerCase());

  // Get exposure value - try different key formats
  const getExposure = (selectionName) => {
    const exposureKeys = [
      selectionName,
      selectionName?.toLowerCase(),
    ];
    
    for (const key of exposureKeys) {
      if (key && exposures[key] !== undefined) {
        return exposures[key];
      }
    }
    return 0;
  };

  // Check if there's a bet placed for this selection
  const hasBet = (selectionName) => {
    return myBets.some(bet => {
      const betSelection = (bet.matchedBet || bet.selection || bet.teamName || bet.player_name || "").toLowerCase();
      const selection = (selectionName || "").toLowerCase();
      return betSelection.includes(selection);
    });
  };

  // Render cells for each section (redblack, oddeven, updown, etc)
  // options is an array of expected labels to show in that section
  const renderCells = (subtype, options = []) => {
    const section = getSectionBySubtype(subtype);

    if (!section) {
      // If no data found for this subtype, render locked fallback cells
      return options.map((opt) => (
        <div
          key={`${subtype}_${opt}`}
          className={`${styles.cell} ${styles.suspendedBox}`}
        >
          <span>{opt}</span>
        </div>
      ));
    }

    const odds = section.odds || [];
    const isSuspended = section.gstatus?.toUpperCase() === "SUSPENDED";

    // For each expected option, find the matching odds object, or create default locked one
    const cellsData =
      options.length > 0
        ? options.map((opt) => {
            return (
              odds.find((o) => o.nat?.toLowerCase() === opt.toLowerCase()) || {
                nat: opt,
                b: 0,
              }
            );
          })
        : odds;

    return cellsData.map(({ nat, b, ssid, sno }) => {
      const isLocked = b === 0 || b === undefined || isSuspended;

      // Get image path for suit/card type
      const getImage = (name) => {
        const nameLower = name?.toLowerCase() || "";
        if (nameLower === "spade" || nameLower === "♠") return "/assets/img/kbc/spade.png";
        if (nameLower === "heart" || nameLower === "♥") return "/assets/img/kbc/heart.png";
        if (nameLower === "club" || nameLower === "♣") return "/assets/img/kbc/club.png";
        if (nameLower === "diamond" || nameLower === "♦") return "/assets/img/kbc/diamond.png";
        return null;
      };

      // For redblack, show both red and black images
      const getRedBlackImages = (color) => {
        if (color?.toLowerCase() === "red") {
          return ["/assets/img/kbc/heart.png", "/assets/img/kbc/diamond.png"];
        } else if (color?.toLowerCase() === "black") {
          return ["/assets/img/kbc/spade.png", "/assets/img/kbc/club.png"];
        }
        return null;
      };

      let displayLabel = nat;
      let displayImage = null;
      let displayImages = null;

      if (subtype.toLowerCase() === "redblack") {
        if (nat.toLowerCase() === "red" || nat.toLowerCase() === "black") {
          displayImages = getRedBlackImages(nat);
          displayLabel = nat;
        }
      } else if (subtype.toLowerCase() === "color") {
        // Map symbol to image
        displayImage = getImage(nat);
        displayLabel = nat === "♠" ? "Spade" : nat === "♥" ? "Heart" : nat === "♣" ? "Club" : nat === "♦" ? "Diamond" : nat;
      } else {
        // For other types, try to get image if it's a suit name
        displayImage = getImage(nat);
      }

      const selectionName = `${section.nat || subtype} ${nat}`;
      const betData = {
        nat: selectionName,
        sid: section.sid,
        ssid: ssid,
        sno: sno,
        subtype: subtype,
        gtype: section.gtype,
        etype: section.etype
      };

      // Get exposure for this selection
      const exposure = getExposure(selectionName) || getExposure(nat);
      const showExposure = exposure !== 0 && (hasBet(selectionName) || hasBet(nat));

      const betKey = `${subtype}_${nat}`;

      return (
        <div
          key={betKey}
          className={`${styles.cell} ${styles.kbcBtn} ${isLocked ? styles.suspendedBox : ""}`}
          onClick={() => !isLocked && onBetClick(betKey, displayLabel, "back", betData)}
        >
          {displayImages ? (
            <div className={styles.imageContainer}>
              {displayImages.map((img, idx) => (
                <img key={idx} src={img} alt={displayLabel} className={styles.btnImage} />
              ))}
            </div>
          ) : displayImage ? (
            <img src={displayImage} alt={displayLabel} className={styles.btnImage} />
          ) : (
            <span>{displayLabel}</span>
          )}
          <div>
            {!isLocked && (
              <>
                <span>{b}</span>
                {showExposure && (
                  <div className={styles.exposure} style={{
                    color: exposure < 0 ? '#ff0000' : '#00ff00',
                    fontSize: '10px',
                    marginTop: '2px'
                  }}>
                    {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      );
    });
  };
  // Render cells for each section (redblack, oddeven, updown, etc)
  // options is an array of expected labels to show in that section
  const renderCells2 = (subtype, options = []) => {
    const section = getSectionBySubtype(subtype);

    if (!section) {
      // If no data found for this subtype, render locked fallback cells
      return options.map((opt) => (
        <div
          key={`${subtype}_${opt}`}
          className={`${styles.cell1} ${styles.suspendedBox}`}
        >
          <span>{opt}</span>
        </div>
      ));
    }

    const odds = section.odds || [];
    const isSuspended = section.gstatus?.toUpperCase() === "SUSPENDED";

    // For each expected option, find the matching odds object, or create default locked one
    const cellsData =
      options.length > 0
        ? options.map((opt) => {
            return (
              odds.find((o) => o.nat?.toLowerCase() === opt.toLowerCase()) || {
                nat: opt,
                b: 0,
              }
            );
          })
        : odds;

    return cellsData.map(({ nat, b, ssid, sno }) => {
      const isLocked = b === 0 || b === undefined || isSuspended;

      // Get image path for suit/card type
      const getImage = (name) => {
        const nameLower = name?.toLowerCase() || "";
        if (nameLower === "spade" || nameLower === "♠") return "/assets/img/kbc/spade.png";
        if (nameLower === "heart" || nameLower === "♥") return "/assets/img/kbc/heart.png";
        if (nameLower === "club" || nameLower === "♣") return "/assets/img/kbc/club.png";
        if (nameLower === "diamond" || nameLower === "♦") return "/assets/img/kbc/diamond.png";
        return null;
      };

      // For redblack, show both red and black images
      const getRedBlackImages = (color) => {
        if (color?.toLowerCase() === "red") {
          return ["/assets/img/kbc/heart.png", "/assets/img/kbc/diamond.png"];
        } else if (color?.toLowerCase() === "black") {
          return ["/assets/img/kbc/spade.png", "/assets/img/kbc/club.png"];
        }
        return null;
      };

      let displayLabel = nat;
      let displayImage = null;
      let displayImages = null;

      if (subtype.toLowerCase() === "redblack") {
        if (nat.toLowerCase() === "red" || nat.toLowerCase() === "black") {
          displayImages = getRedBlackImages(nat);
          displayLabel = nat;
        }
      } else if (subtype.toLowerCase() === "color") {
        // Map symbol to image
        displayImage = getImage(nat);
        displayLabel = nat === "♠" ? "Spade" : nat === "♥" ? "Heart" : nat === "♣" ? "Club" : nat === "♦" ? "Diamond" : nat;
      } else {
        // For other types, try to get image if it's a suit name
        displayImage = getImage(nat);
      }

      const selectionName = `${section.nat || subtype} ${nat}`;
      const betData = {
        nat: selectionName,
        sid: section.sid,
        ssid: ssid,
        sno: sno,
        subtype: subtype,
        gtype: section.gtype,
        etype: section.etype
      };

      // Get exposure for this selection
      const exposure = getExposure(selectionName) || getExposure(nat);
      const showExposure = exposure !== 0 && (hasBet(selectionName) || hasBet(nat));

      const betKey = `${subtype}_${nat}`;

      return (
        <div
          key={betKey}
          className={`${styles.cell1} ${styles.kbcBtn} ${isLocked ? styles.suspendedBox : ""}`}
          onClick={() => !isLocked && onBetClick(betKey, displayLabel, "back", betData)}
        >
          {displayImages ? (
            <div className={styles.imageContainer}>
              {displayImages.map((img, idx) => (
                <img key={idx} src={img} alt={displayLabel} className={styles.btnImage} />
              ))}
            </div>
          ) : displayImage ? (
            <img src={displayImage} alt={displayLabel} className={styles.btnImage} />
          ) : (
            <span>{displayLabel}</span>
          )}
          <div>
            {!isLocked && (
              <>
                <span>{b}</span>
                {showExposure && (
                  <div className={styles.exposure} style={{
                    color: exposure < 0 ? '#ff0000' : '#00ff00',
                    fontSize: '10px',
                    marginTop: '2px'
                  }}>
                    {exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      );
    });
  };
  return (
    <div className={styles.betTableContainer}>
      <div className={styles.topRow}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>[Q1] Red Black</div>
          <div className={styles.sectionContent}>
            {renderCells("redblack", ["Red", "Black"])}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>[Q2] Odd Even</div>
          <div className={styles.sectionContent}>
            {renderCells("oddeven", ["Odd", "Even"])}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>[Q3] 7 Up-7 Down</div>
          <div className={styles.sectionContent}>
            {renderCells("updown", ["Up", "Down"])}
          </div>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>[Q4] 3 Card Judgement</div>
          <div className={styles.sectionContent}>
            <div className={styles.gridContainer}>
              {renderCells2("cardj", ["A23", "456", "8910", "JQK"])}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>[Q5] Suits</div>
          <div className={styles.sectionContent}>
            <div className={styles.gridContainer}>
              {renderCells2("color", ["Spade", "Heart", "Club", "Diamond"])}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetTableKBC;
