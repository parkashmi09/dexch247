import { Link } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import styles from "./TeenPatti6.module.css";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import BetTableTeenPatti6 from "../../casinoComponents/betTableTeenPatti6";
import MyBet from "../../casinoComponents/myBet";
import VideoBox from "../../casinoComponents/videoBox";
import card1 from '../../../assets/img/card/10.jpg';
import card2 from '../../../assets/img/card/11.jpg';
import card3 from '../../../assets/img/card/12.jpg';
import cardPattiBack from '../../../assets/img/card/patti_back.jpg';
import ResultTeen6 from "../resultui/resultTeen6/ResultTeen6";
import Card from "../../casinoComponents/betTableTeenPatti6/Cards";
import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function TeenPatti6() {
  const [gameData, setGameData] = useState({});
  const [activeTab, setActiveTab] = useState("game");
  const [betValue, setBetValue] = useState("");
  const [selectedPlayerName, setSelectedPlayerName] = useState("");
  const [selectedPlayerNameForApi, setSelectedPlayerNameForApi] = useState("Player A");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [selectedBetType, setSelectedBetType] = useState("back");
  const [iframeSrc, setIframeSrc] = useState("");
  const { pathname } = useLocation();
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);

  const [showPlaceBet, setShowPlaceBet] = useState(false);

  useEffect(() => {
    const name = extractCasinoGame(pathname);
    setIframeSrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails(name);
        setGameData(response);
      } catch (err) {
        console.error("Error fetching game data:", err);
      }
    };

    fetchGameData();
    const interval = setInterval(fetchGameData, 1500);
    return () => clearInterval(interval);
  }, [pathname]);



  const fetchExposure = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.data?.data?.mid?.toString();

      if (userId && matchId) {
        const response = await getMatchExposure(userId, matchId);
        if (response.success && response.data) {
          // Convert array to object keyed by team_name
          const exposureMap = {};
          response.data.forEach((item) => {
            const teamName = item.team_name;
            const exposureAmount = parseFloat(item.exposure_amount) || 0;

            // Add the team name as-is
            exposureMap[teamName] = exposureAmount;
            exposureMap[teamName?.trim()] = exposureAmount;
            exposureMap[teamName?.toLowerCase()] = exposureAmount;
            exposureMap[teamName?.toLowerCase().trim()] = exposureAmount;

            // For Player A/B, also create Back/Lay keys (we'll distribute the exposure)
            if (teamName && (teamName.includes("Player A") || teamName.includes("Player B"))) {
              // Split exposure between Back and Lay if we have both types
              // For now, assign to both keys (will be overridden by myBets if more specific)
              exposureMap[`${teamName} Back`] = exposureAmount;
              exposureMap[`${teamName} Lay`] = exposureAmount;
            }
          });
          setExposures(prev => ({ ...prev, ...exposureMap }));
        }
      }
    } catch (error) {
      console.error('Error fetching exposure:', error);
    }
  }, [gameData?.data?.data?.mid]);

  const handleBetClick = (value, selection, betType, betData = null, tablePlayerName = null) => {
    if (!value) return;
    setBetValue(value);
    setSelectedPlayerName(selection || "");
    setSelectedSelection(selection || "");
    setSelectedBetType(betType || "back");
    setSelectedBetData(betData || { nat: selection, subtype: betData?.subtype || "", gtype: "teen6" });
    // Set player_name based on which table was clicked (A or B) or default to Player A
    if (tablePlayerName) {
      setSelectedPlayerNameForApi(`Player ${tablePlayerName}`);
    } else if (betData?.nat?.includes("Player A")) {
      setSelectedPlayerNameForApi("Player A");
    } else if (betData?.nat?.includes("Player B")) {
      setSelectedPlayerNameForApi("Player B");
    } else {
      setSelectedPlayerNameForApi("Player A");
    }
    setShowPlaceBet(true);
  };

  const handleBetPlaced = () => {
    // Clear all bet-related state to hide PlaceBet UI
    setShowPlaceBet(false);
    setBetValue("");
    setSelectedPlayerName("");
    setSelectedSelection("");
    setSelectedBetData(null);
    setSelectedBetType("back");
    setSelectedPlayerNameForApi("Player A");
    // Fetch exposure and my bets after bet placement
    fetchExposure();
    fetchMyBetsData();
  };

  const fetchMyBetsData = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.data?.data?.mid?.toString();

      if (userId && matchId) {
        const response = await getMyBets(userId, matchId);
        if (response.success && response.bets) {
          // Map bets data to format needed for MyBet component
          const formattedBets = response.bets.map((bet) => ({
            matchedBet: bet.player_name || bet.selection || "",
            odds: bet.odds || "0",
            stake: bet.stake || "0",
            type: bet.type || null, // Include type field for background color
            selection: bet.selection || bet.player_name || "",
            exposer: parseFloat(bet.exposer || bet.exposure_amount || "0") || 0
          }));
          setMyBets(formattedBets);

          // Map exposure from myBets to exposures object (like in lucky7)
          const exposureMap = {};
          response.bets.forEach((bet) => {
            const selection = bet.selection || bet.player_name || "";
            const betType = bet.type || "back"; // "back" or "lay"
            const exposureAmount = parseFloat(bet.exposer || bet.exposure_amount || "0") || 0;

            if (selection && exposureAmount !== 0) {
              // Add the selection as-is (e.g., "Player A", "Heart")
              exposureMap[selection] = exposureAmount;
              exposureMap[selection.trim()] = exposureAmount;
              exposureMap[selection.toLowerCase().trim()] = exposureAmount;
              exposureMap[selection.toLowerCase()] = exposureAmount;

              // For Player A/B bets, also create keys with Back/Lay suffix
              if (selection.includes("Player A") || selection.includes("Player B")) {
                const backKey = `${selection} Back`;
                const layKey = `${selection} Lay`;
                if (betType === "back") {
                  exposureMap[backKey] = exposureAmount;
                  exposureMap[backKey.toLowerCase()] = exposureAmount;
                } else if (betType === "lay") {
                  exposureMap[layKey] = exposureAmount;
                  exposureMap[layKey.toLowerCase()] = exposureAmount;
                }
              }
            }
          });
          // Merge with existing exposures from getMatchExposure
          setExposures(prev => ({ ...prev, ...exposureMap }));
        }
      }
    } catch (error) {
      console.error('Error fetching my bets:', error);
    }
  }, [gameData?.data?.data?.mid]);

  // Fetch exposure on mount and periodically with debounce
  useEffect(() => {
    const matchId = gameData?.data?.data?.mid?.toString();
    if (!matchId) return;

    // Initial fetch after 2 seconds
    const timeoutId = setTimeout(() => {
      fetchExposure();
      fetchMyBetsData();
    }, 2000);

    // Periodic fetch every 2 seconds
    const intervalId = setInterval(() => {
      fetchExposure();
      fetchMyBetsData();
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [gameData?.data?.data?.mid, fetchExposure, fetchMyBetsData]);

  const playerA = { cards: [card1, card2, card3] };
  const playerB = { cards: [cardPattiBack, cardPattiBack, cardPattiBack] };
  const resultdata = ['A', 'A', 'B', 'A', 'A', 'A', 'B', 'B'];
  const subData = gameData?.data?.data?.sub || [];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Wrapper function for BetTableTeenPatti6 to match expected signature
  const handleTableBetClick = (value, label, type) => {
    // Extract player name from label (e.g., "Player A Back" -> "A")
    let tablePlayerName = null;
    if (label?.includes("Player A")) {
      tablePlayerName = "A";
    } else if (label?.includes("Player B")) {
      tablePlayerName = "B";
    }

    // Find the bet data from subData
    const playerSid = tablePlayerName === "A" ? 1 : tablePlayerName === "B" ? 2 : null;
    const betData = subData.find(bet => bet.sid === playerSid) || {
      nat: label.replace(" Back", "").replace(" Lay", ""),
      subtype: "teen6",
      gtype: "teen6",
      sid: playerSid
    };

    handleBetClick(value, label, type, betData, tablePlayerName);
  };

  // Wrapper function for Card component to match expected signature
  const handleCardBetClick = (value, selection, type) => {
    // Find bet data from subData based on selection
    let betData = null;
    if (selection === "Spade" || selection === "Heart" || selection === "Club" || selection === "Diamond") {
      const suitCard = subData.find(item => item.subtype === "suit" && item.visible === 1);
      if (suitCard) {
        const odd = suitCard.odds?.find(o => o.nat === selection);
        betData = { ...suitCard, nat: selection, odds: odd };
      }
    } else if (selection === "Odd" || selection === "Even") {
      const oddEvenCard = subData.find(item => item.subtype === "oddeven" && item.visible === 1);
      if (oddEvenCard) {
        const odd = oddEvenCard.odds?.find(o => o.nat === selection);
        betData = { ...oddEvenCard, nat: selection, odds: odd };
      }
    } else if (selection?.startsWith("Card ")) {
      const cardsCard = subData.find(item => item.subtype === "cards" && item.visible === 1);
      if (cardsCard) {
        const cardOdd = cardsCard.odds?.find(o => o.nat === selection);
        betData = { ...cardsCard, nat: selection, odds: cardOdd };
      }
    }

    if (!betData) {
      betData = { nat: selection, subtype: "suit", gtype: "teen6" };
    }

    handleBetClick(value, selection, type, betData, null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionA}>
        <CasinoHeading
          name="INSTANT TEENPATTI 3.0"
          roundId={gameData?.data?.data?.mid || "157250124095658"}
          placedBetCount={myBets.length}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {activeTab === "game" && (
          <>
            <VideoBox
              playerA={playerA}
              playerB={playerB}
              iframeSrc={iframeSrc}
              style={{ height: "35%" }}
              timerValue={gameData?.data?.data?.lt}
            />

            <div className={styles.tableContainer}>
              {/* Player A Table */}
              <div className={styles.table}>
                <BetTableTeenPatti6
                  data={subData.filter((bet) => bet.sid === 1)}
                  onBetClick={handleTableBetClick}
                  playerLabel="Player A"
                  exposures={exposures}
                />
              </div>
              {/* Player B Table */}
              <div className={styles.table}>
                <BetTableTeenPatti6
                  data={subData.filter((bet) => bet.sid === 2)}
                  onBetClick={handleTableBetClick}
                  playerLabel="Player B"
                  exposures={exposures}
                />
              </div>
            </div>

            <Card data={subData} onBetClick={handleCardBetClick} exposures={exposures} />

            <div className={styles.heading}>
              <div>Last Result</div>
              <Link to="/casino/results">
                <div className={styles.viewAll}>View All</div>
              </Link>
            </div>
            <ResultTeen6
              data={resultdata}
              gameData={gameData}
              playerA={playerA}
              playerB={playerB}
            />
          </>
        )}
        {activeTab === "placedBet" && (
          <div className={styles.myBetMobileContainer}>
            <MyBet bets={myBets} />
          </div>
        )}
      </div>

      <div className={`${styles.placeBet} ${showPlaceBet ? styles.visible : ''}`}>
        {betValue && selectedBetData && (
          <PlaceBet
            betValue={betValue}
            playerName={selectedPlayerName}
            playerNameForApi={selectedPlayerNameForApi}
            setShowPlaceBet={setShowPlaceBet}
            gameId={gameData?.data?.data?.mid?.toString() || "98765"}
            gameName="teen6"
            roundId={gameData?.data?.data?.mid || 0}
            selection={selectedSelection}
            betData={selectedBetData}
            betType={selectedBetType}
            onBetPlaced={handleBetPlaced}
          />
        )}
        <div className={styles.myBetContainer}>
          <MyBet bets={myBets} />

        </div>
      </div>

    </div>
  );
}
