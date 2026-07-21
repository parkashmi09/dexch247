
"use client"

import { useState, useEffect } from "react"
import { Link , useLocation} from "react-router"
import styles from "./OurRoullete.module.css"
import CasinoHeading from "../../casinoComponents/casinoHeading"
import RouletteTable from "../../casinoComponents/roulleteTable"
import Result from "../Result/Result"
import { getCasinoGameDetails } from '../../../apiservices/CasionApi';
import PlaceBet from "@/pages/casinoComponents/placeBet"

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}


export default function OurRoullete() {
   const [gameData, setGameData] = useState(null);
  const [subData, setSubData] = useState([]);
  const [betValue, setBetValue] = useState("");
  const [iframeSrc, setIframeSrc] = useState("");
  const { pathname } = useLocation();

  useEffect(() => {
    const name = extractCasinoGame(pathname);
    setIframeSrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);
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

  const gameName="LottCard"

  const handleBetClick = (value) => {
    setBetValue(value);
  };




  const resultdata = ['A', 'A', 'B', 'A', 'A', 'A', 'B', 'B'];

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sectionA}>
          <CasinoHeading name={gameName.toUpperCase()} roundId={gameData?.mid || "157250124095658"} />
          <div className={styles.videoBox}>
            <iframe
              src={iframeSrc}
              className={styles.videoframe}
              title="Roulette Live Stream"
              allowFullScreen
            />
          </div>
          <div className={styles.tableContainer}>
            <RouletteTable gameData={subData
            } onBetClick={handleBetClick} />
          </div>
          <div className={styles.heading}>
            <div>Last Result</div>
            <Link to="/casino/results">
              <div style={{ cursor: "pointer" }}>View All</div>
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
          <PlaceBet betValue={betValue} />
        </div>
      </div>
    </>
  )
}
