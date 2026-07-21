import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";
"use client";

import { Link } from "react-router";
import { useState, useEffect } from "react";
import styles from "./Poker.module.css";
import Timer from "../../casinoComponents/timer";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import BetTablePoker from "../../casinoComponents/betTablePoker";
import VideoBox from "../../casinoComponents/videoBox"; // Import the VideoBox component
import card1 from '../../../assets/img/card/10.jpg';
import card2 from '../../../assets/img/card/11.jpg';
import card3 from '../../../assets/img/card/12.jpg';
import cardPattiBack from '../../../assets/img/card/patti_back.jpg';
import Result from "../Result/Result";
import RulesCard from "../../casinoComponents/rulesCard";
import { fetchCasinoGameData } from "../../../apiservices/CasinoGameService";

export default function Poker() {
  const [gameData, setGameData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [betValue, setBetValue] = useState(""); // State to manage the bet value

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const data = await fetchCasinoGameData("hilo", "poker");
        setGameData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, []);

  const subData = gameData?.data?.sub || [];
  const data1 = subData[0] || {b:5};
  const data2 = subData[1] || {};

  // Callback function to handle click on data.l or data.b
  const handleBetClick = (value) => {
    setBetValue(value); // Update the bet value state
  };

  // Player data for VideoBox
  const playerA = {
    cards: [card1, card2, card3],
  };

  const playerB = {
    cards: [cardPattiBack, cardPattiBack, cardPattiBack],
  };

  const iframeSrc = "https://livestream-v3-iframe.akamaized.uk/casinoStream?id=poker&key=scoreswift.in";

 const resultdata=['A','A','B','A','A','A','B','B'];

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sectionA}>
          <CasinoHeading name="POKER" roundId={gameData?.mid || "157250124095658"} />
          
          {/* Use the VideoBox component */}
          <VideoBox playerA={playerA} playerB={playerB} iframeSrc={iframeSrc} />

         

          <div className={styles.tableContainer}>
            <div className={styles.table}>
              <BetTablePoker data={data1} onBetClick={handleBetClick} />
            </div>
            <div className={styles.table}>
              <BetTablePoker data={data2} onBetClick={handleBetClick} />
            </div>
          </div>

          <div className={styles.playAndWin}>
            <div>Play & Win</div>
          </div>

          <div className={styles.heading}>
            <div>Last Result</div>
            <Link to="/casino/results">
              <div className={styles.viewAll}>View All</div>
            </Link>
          </div>
          <Result data={resultdata} />
          <div className={styles.Result}>
            {gameData?.lrs?.map((result, index) => (
              <div key={index}>{result}</div>
            ))}
          </div>
        </div>
        <div className={styles.placeBet}>
          <PlaceBet betValue={betValue} /> {/* Pass the bet value to PlaceBet */}
            <RulesCard />
        </div>
      
      </div>
    </>
  );
}
