
"use client";

import { NavLink, useLocation } from "react-router";
import { useState, useEffect } from "react";
import styles from "./DragonTigerLion.module.css";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import BetTableDragonLion from "../../casinoComponents/betTableDragonLion";
import VideoBox from "../../casinoComponents/videoBox";
import card1 from '../../../assets/img/card/10.jpg';
import card2 from '../../../assets/img/card/11.jpg';
import card3 from '../../../assets/img/card/12.jpg';
import cardPattiBack from '../../../assets/img/card/patti_back.jpg';
import Result from "../Result/Result";

import { getCasinoGameDetails } from '../../../apiservices/CasionApi';
import PlaceBet from "@/pages/casinoComponents/placeBet";

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function DragonTigerLion() {
  const [gameData, setGameData] = useState(null);
  const [subData, setSubData] = useState([]);
  const [betValue, setBetValue] = useState("");

  const { pathname } = useLocation();

  useEffect(() => {
    const name = extractCasinoGame(pathname);

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails(name);
        setGameData(response);
        setSubData(response?.data?.data?.sub || []);
      } catch (err) {
        console.error("Error fetching Lucky 7 game data: ", err);
      }
    };

    fetchGameData();
    const interval = setInterval(fetchGameData, 1500);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleBetClick = (value) => {
    setBetValue(value);
  };

  const playerA = {
    cards: [card1, card2, card3],
  };

  const playerB = {
    cards: [cardPattiBack, cardPattiBack, cardPattiBack],
  };

  const iframeStreamSrc = "https://livestream-v3-iframe.akamaized.uk/casinoStream?id=lucky7&key=scoreswift.in";
  const resultdata = ['A', 'A', 'B', 'A', 'A', 'A', 'B', 'B'];



  // Filter subData for right table (only cards, exclude special bets) - currently unused
  // const rightTableData = subData.filter(item => {
  //   const natLower = item.nat.toLowerCase();
  //   // if any special bet word is included, exclude it
  //   return !specialBetTypes.some(type => natLower.includes(type));
  // });

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sectionA}>
          <CasinoHeading name="DRAGON TIGER LION" roundId={gameData?.mid || "157250124095658"} />

          {/* Use the VideoBox component */}
          <VideoBox playerA={playerA} playerB={playerB} iframeSrc={iframeStreamSrc} timerValue={gameData?.data?.data?.lt} />

          {/* Render two BetTableDragonLion side by side without changing any styles */}
          <div className={styles.tableContainer} >
            {/* Left table: all data */}
            <BetTableDragonLion data={subData} onBetClick={handleBetClick} />


          </div>

          <div className={styles.heading}>
            <div>Last Result</div>
            <NavLink to="/casino/results">
              <div className={styles.viewAll}>View All</div>
            </NavLink>
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
          <div className={styles.sectionB}>
            <div className={styles.section1}>
              <div>My Bet</div>
              <div className={styles.smallText}>Range 100 to 2L</div>
            </div>
            <div className={styles.section2}>
              <div>Matched Bet</div>
              <div>Odds</div>
              <div>Stake</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
