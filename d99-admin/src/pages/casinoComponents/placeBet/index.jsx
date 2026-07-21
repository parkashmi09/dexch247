import { useState, useEffect } from "react";
import { ImCross } from "react-icons/im";
import toast from "react-hot-toast";
import styles from "./PlaceBet.module.css";
import { getStakeButtonValues } from "../../../apiservices/stakeButtonValueService";
import { placeCasinoBet } from "../../../apiservices/CasionApi";

export default function PlaceBet({ betValue, setShowPlaceBet, playerName, betType, gameId, gameName, roundId, selection, betData, playerNameForApi, onBetPlaced }) {
  const [stakeValue, setStakeValue] = useState(""); // odds input
  const [oddsValue, setOddsValue] = useState("");   // stake input
  const [localBetType, setLocalBetType] = useState(betType || ""); // local state for color control (optional)
  const [casinoButtons, setCasinoButtons] = useState([]);

  useEffect(() => {
    setStakeValue(betValue?.toString() || "");
    setLocalBetType(betType || ""); // update localBetType on prop change (keep empty if not provided)
    console.log("PlaceBet - betType prop changed to:", betType);
  }, [betValue, betType]);

  useEffect(() => {
    const fetchButtons = async () => {
      const data = await getStakeButtonValues();
      if (data && data.casino_buttons) {
        setCasinoButtons(data.casino_buttons);
      }
    };
    fetchButtons();
  }, []);

  const handleOddsClick = (value) => {
    if (oddsValue === "") {
      setOddsValue(value.toString());
    } else {
      setOddsValue((prevValue) => (parseInt(prevValue) + value).toString());
    }
  };

  const handleClear = () => {
    setOddsValue("");
  };

  const handleReset = () => {
    setStakeValue("");
    setOddsValue("");
    setLocalBetType(betType || "");
  };

  const handleSubmit = async () => {
    try {
      // Get userId from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id || "1";

      // Validate required fields
      if (!oddsValue || !stakeValue || !selection || !gameId) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Check if this is a "3 Card Total" bet (special handling required)
      const is3CardTotal = betData?.nat === "3 Card Total" || betData?.subtype === "total";
      
      // Ensure selection uses nat value from betData if available (from API)
      let finalSelection = betData?.nat || selection || "";
      
      // For 3 Card Total, format selection as "nat+odds" (e.g., "3 Card Total 25")
      if (is3CardTotal) {
        const oddsStr = stakeValue.toString();
        finalSelection = `${finalSelection} ${oddsStr}`;
      } else {
        finalSelection = finalSelection.trim();
      }
      
      const betPayload = {
        userId: userId.toString(),
        player_name: playerNameForApi || "Player A",
        gameId: gameId.toString(),
        gameName: gameName || "",
        amount: parseFloat(oddsValue) || 0,
        odds: parseFloat(stakeValue) || 0,
        selection: finalSelection,
        roundId: roundId || 0,
      };

      // Include type if it has a value - check prop first (source of truth), then local state
      // betType should be "back" or "lay" for this game
      const finalBetType = (betType && typeof betType === 'string' && betType.trim() !== "") 
        ? betType.trim() 
        : (localBetType && typeof localBetType === 'string' && localBetType.trim() !== "" 
          ? localBetType.trim() 
          : "");
      
      if (finalBetType && (finalBetType === "back" || finalBetType === "lay")) {
        betPayload.type = finalBetType;
      }

      // For 3 Card Total bets, add mtype: "fancy"
      if (is3CardTotal) {
        betPayload.mtype = "fancy";
      }

      console.log("Placing bet with payload:", betPayload);
      console.log("betType prop:", betType, "localBetType:", localBetType, "finalBetType:", finalBetType);

      const response = await placeCasinoBet(betPayload);

      if (response.success) {
        toast.success("Bet placed successfully!");
        handleReset();
        // Clear bet and hide PlaceBet UI
        if (onBetPlaced) {
          onBetPlaced();
        }
        if (setShowPlaceBet && typeof setShowPlaceBet === 'function') {
          setShowPlaceBet(false);
        }
      } else {
        toast.error(response.error || "Failed to place bet");
      }
    } catch (error) {
      console.error("Error placing bet:", error);
      toast.error(error.message || "Failed to place bet. Please try again.");
    }
  };

  const handleClose = () => {
    setStakeValue("");
    setOddsValue("");
    if (setShowPlaceBet && typeof setShowPlaceBet === 'function') {
      setShowPlaceBet(false);
    }
  };

  // Default to back color if type is not provided
  const backgroundColorStyle = {
    backgroundColor: localBetType === "lay" ? "#faa9ba" : "#72bbef",
  };

  // Check if Place Bet button should be disabled
  const isPlaceBetDisabled = !oddsValue || !stakeValue || !selection || !gameId;

  // Get bet name for display (betData?.nat or selection)
  const betName = betData?.nat || selection || playerName || "Bet";

  return (
    <div className={styles.sectionB}>
      <div className={styles.section1}>
        <div>PlaceBet</div>
        <div className={styles.smallText}>Range 100 to 2L</div>
        <div className={styles.close} onClick={handleClose}>X</div>
      </div>

      <div className={styles.section2}>
        <div>({"Betfor"})</div>
        <div className={styles.oddsText}>Odds</div>
        <div className={styles.stakeText}>Stake</div>
        <div>Profit</div>
      </div>

      <div className={`${styles.wrapper} ${styles.placeBetModal} ${localBetType === "lay" ? styles.lay : ""}`} style={backgroundColorStyle}>
        {/* Mobile: Top row with bet name and Profit */}
        <div className={styles.mobileTopRow}>
          <div className={styles.mobileBetName}><b>{betName}</b></div>
          <div className={styles.mobileProfit}>Profit: </div>
        </div>

        {/* Desktop: Original section3 layout */}
        <div className={styles.section3}>
          <div className={styles.playerText}>
            <ImCross color="#bd1828" size={9} style={{ marginRight: "4px" }} />
            {playerName}
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              value={stakeValue}
              className={styles.oddsInput}
              readOnly
              disabled
            />
            <input
              type="text"
              value={oddsValue}
              className={styles.stakeInput}
              onChange={(e) => setOddsValue(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile: Reorganized inputs with labels */}
        <div className={styles.oddStakeBox}>
          <div className={styles.inputLabelsRow}>
            <div className={styles.inputLabel}>Odds</div>
            <div className={styles.inputLabel}>Amount</div>
          </div>
          <div className={styles.inputsRow}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                value={stakeValue}
                className={`${styles.stakeInput} ${styles.stakeInputFull}`}
                readOnly
                disabled
              />
            </div>
            <div className={styles.inputWrapper}>
              <div className={styles.floatEnd}>
                <input
                  type="number"
                  value={oddsValue}
                  className={`${styles.stakeInput} ${styles.stakeInputFull}`}
                  onChange={(e) => setOddsValue(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.placeBetButtons} style={backgroundColorStyle}>
          {casinoButtons.length > 0 ? (
            casinoButtons.map((btn, index) => (
              btn.value > 0 && (
                <button
                  key={`casino-btn-${index}`}
                  className={`${styles.btn} ${styles.btnPlaceBet}`}
                  onClick={() => handleOddsClick(btn.value)}
                >
                  {btn.label.startsWith('+') ? btn.label : `+${btn.label}`}
                </button>
              )
            ))
          ) : (
            <>
              <button className={`${styles.btn} ${styles.btnPlaceBet}`} onClick={() => handleOddsClick(25)}>+25</button>
              <button className={`${styles.btn} ${styles.btnPlaceBet}`} onClick={() => handleOddsClick(50)}>+50</button>
              <button className={`${styles.btn} ${styles.btnPlaceBet}`} onClick={() => handleOddsClick(100)}>+100</button>
              <button className={`${styles.btn} ${styles.btnPlaceBet}`} onClick={() => handleOddsClick(200)}>+200</button>
              <button className={`${styles.btn} ${styles.btnPlaceBet}`} onClick={() => handleOddsClick(500)}>+500</button>
              <button className={`${styles.btn} ${styles.btnPlaceBet}`} onClick={() => handleOddsClick(1000)}>+1000</button>
            </>
          )}
        </div>

        <div className={styles.section5}>
          <div className={styles.editButton}>Edit</div>
          <div className={styles.actionButtons}>
            <div className={styles.resetButton} onClick={handleReset}>Reset</div>
            <div className={styles.submitButton} onClick={handleSubmit}>Submit</div>
          </div>
        </div>

        {/* Mobile: Action buttons box with Clear, Edit, Reset, Place Bet */}
        <div className={styles.placeBetBtnBox}>
          <button
            className={`${styles.btn} ${styles.btnLink}`}
            onClick={handleClear}
          >
            Clear
          </button>
          <button className={`${styles.btn} ${styles.btnInfo}`}>Edit</button>
          <button 
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={handleReset}
          >
            Reset
          </button>
          <button 
            className={`${styles.btn} ${styles.btnSuccess}`}
            onClick={handleSubmit}
            disabled={isPlaceBetDisabled}
          >
            Place Bet
          </button>
        </div>

        {/* Mobile: Range display at bottom */}
        <div className={styles.mobileRange}>
          <span>Range: 100 to 1L</span>
        </div>
      </div>
    </div>
  );
}
