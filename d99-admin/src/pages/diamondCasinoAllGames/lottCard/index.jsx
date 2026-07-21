import { useState, useEffect } from "react";
import { Link ,useLocation} from "react-router";
import VideoBox from "../../casinoComponents/videoBox";
import styles from "./LottCard.module.css";
import BetTableLott from "../../casinoComponents/betTableLott";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import card1 from '../../../assets/img/card/10.jpg';
import card2 from '../../../assets/img/card/11.jpg';
import card3 from '../../../assets/img/card/12.jpg';
import cardPattiBack from '../../../assets/img/card/patti_back.jpg';
import Result from "../Result/Result";
import { getCasinoGameDetails } from '../../../apiservices/CasionApi';


function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}
const playerA = {
  cards: [card1, card2, card3],
};

const playerB = {
  cards: [cardPattiBack, cardPattiBack, cardPattiBack],
};

 export default function LottCard() {
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
          <CasinoHeading name={gameName.toUpperCase()} roundId="157250124095658" />
          <VideoBox playerA={playerA} playerB={playerB} iframeSrc={iframeSrc} timerValue={gameData?.data?.data?.lt} />

          <div className={styles.tableContainer}>
            <div style={{width:"100%"}}>
              <BetTableLott data={subData}  onBetClick={handleBetClick} />
            </div>
            
          </div>
          
          <div className={styles.heading}>
            <div>Last Result</div>
            <Link to="/casino/results">
              <div style={{ cursor: "pointer" }}>View All</div>
            </Link>
          </div>
          <Result data={resultdata} />
        </div>
        <div className={styles.placeBet}>
          <PlaceBet betValue={betValue} /> {/* Pass the bet value to PlaceBet */}
        </div>
      </div>
    </>
  );
}
