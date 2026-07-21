import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from 'react-router';
import VideoBox from "../../casinoComponents/videoBox";
import MyBet from "../../casinoComponents/myBet";
import styles from "./Teensin.module.css";
import BetTableTeensin from "../../casinoComponents/betTableTeensin";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import ResultTeensin from "../resultui/resultTeensin/ResultTeensin";
import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";

function extractCasinoGame(url) {
    const match = url.match(/\/casino\/([^/?#]+)/);
    return match ? match[1] : null;
}

export default function Teensin() {
    const [gameData, setGameData] = useState([]);
    const [betValue, setBetValue] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [betType, setBetType] = useState("");
    const [showPlaceBet, setShowPlaceBet] = useState(false);
    const [iframeSrc, setiframesrc] = useState("");
    const [exposures, setExposures] = useState({});
    const [myBets, setMyBets] = useState([]);
    const [selectedBetData, setSelectedBetData] = useState(null);

    const { pathname } = useLocation();

    useEffect(() => {
        const name = extractCasinoGame(pathname);
        setiframesrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

        const fetchGameData = async () => {
            try {
                const response = await getCasinoGameDetails("teensin");
                setGameData(response);
            } catch (err) {
                console.error("Error fetching game data:", err);
            }
        };

        fetchGameData();
        const gameDataInterval = setInterval(fetchGameData, 1500);
        return () => clearInterval(gameDataInterval);
    }, [pathname]);


    const handleBetClick = (value, selection, item, type) => {
        if (!value || value === 0) return;
        setBetValue(value);
        setPlayerName(selection);
        setBetType(type);
        setSelectedBetData(item || { value, selection, type });
        setShowPlaceBet(true);
    };

    const handleBetPlaced = () => {
        setShowPlaceBet(false);
        setBetValue("");
        setPlayerName("");
        setBetType("");
        setSelectedBetData(null);
        fetchExposure();
        fetchMyBetsData();
    };

    const fetchExposure = useCallback(async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = user?.user_id || user?.id;
            const matchId = gameData?.data?.data?.mid?.toString();

            if (userId && matchId) {
                const response = await getMatchExposure(userId, matchId);
                if (response.success && response.data) {
                    const exposureMap = {};
                    response.data.forEach((item) => {
                        exposureMap[item.team_name] = parseFloat(item.exposure_amount) || 0;
                    });
                    setExposures(exposureMap);
                }
            }
        } catch (error) {
            console.error('Error fetching exposure:', error);
        }
    }, [gameData?.data?.data?.mid]);

    const fetchMyBetsData = useCallback(async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = user?.user_id || user?.id;
            const matchId = gameData?.data?.data?.mid?.toString();

            if (userId && matchId) {
                const response = await getMyBets(userId, matchId);
                if (response.success && response.bets) {
                    const formattedBets = response.bets.map((bet) => ({
                        matchedBet: bet.player_name || bet.selection || "",
                        odds: bet.odds || "0",
                        stake: bet.stake || "0",
                        type: bet.type || null,
                        selection: bet.selection || bet.player_name || "",
                        exposer: parseFloat(bet.exposer || bet.exposure_amount || "0") || 0
                    }));
                    setMyBets(formattedBets);
                }
            }
        } catch (error) {
            console.error('Error fetching my bets:', error);
        }
    }, [gameData?.data?.data?.mid]);

    useEffect(() => {
        const matchId = gameData?.data?.data?.mid?.toString();
        if (!matchId) return;

        const timeoutId = setTimeout(() => {
            fetchExposure();
            fetchMyBetsData();
        }, 2000);

        const intervalId = setInterval(() => {
            fetchExposure();
            fetchMyBetsData();
        }, 2000);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, [gameData?.data?.data?.mid, fetchExposure, fetchMyBetsData]);

    const gameName = "TEENSIN";
    const roundId = gameData?.data?.data?.mid || 0;
    const subData = gameData?.data?.data?.sub || [];

    return (
        <div className={styles.container}>
            <div className={styles.sectionA}>
                <CasinoHeading name={gameName} roundId={roundId} />
                <VideoBox iframeSrc={iframeSrc} timerValue={gameData?.data?.data?.lt} />
                <div className={styles.tableContainer}>
                    <div style={{ width: "100%" }}>
                        <BetTableTeensin 
                            data={subData} 
                            onBetClick={handleBetClick} 
                            exposures={exposures}
                            myBets={myBets}
                        />
                    </div>
                </div>
                <div className={styles.heading}>
                    <div>Last Result</div>
                    <Link to="/casino/results">
                        <div style={{ cursor: "pointer" }}>View All</div>
                    </Link>
                </div>
                <ResultTeensin data={[]} gameData={gameData} />
            </div>
            <div className={`${styles.placeBet} ${showPlaceBet ? styles.visible : ''}`}>
                {betValue && selectedBetData && (
                    <PlaceBet
                        betValue={betValue}
                        playerName={playerName}
                        playerNameForApi={selectedBetData?.nat || playerName}
                        setShowPlaceBet={setShowPlaceBet}
                        gameId={gameData?.data?.data?.mid?.toString() || "98765"}
                        gameName="teensin"
                        roundId={gameData?.data?.data?.mid || 0}
                        selection={selectedBetData?.nat || playerName}
                        betData={selectedBetData}
                        betType={betType}
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
