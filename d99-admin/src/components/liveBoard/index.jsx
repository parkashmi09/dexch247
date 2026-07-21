import { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';   // fixed import
import { FaCircle } from "react-icons/fa";
import { IoGameControllerSharp } from "react-icons/io5";
import styles from "./LiveBoard.module.css";
import LiveBoardMobile from './LiveBoardMobile';
import Tv from '../../assets/svg/tv';
import fancy from '../../assets/img/ic_fancy.png';
import bm from '../../assets/img/ic_bm.png';


import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
const API_URL = API_BASE_URL;


const additionalstaticevents = [
  {
    ename: "Test X v Test Y",
    stime: "10/09/2025 00:00:00",
    gmid: "855507235",
    sid: 4,
    iplay: false,
    section: [] // Empty section for now
  },
  {
    ename: "Twenty20 Big Bash",
    stime: "14/12/2025 14:45:00",
    gmid: "913074777",
    sid: 4,
    iplay: false,
    section: [] // Empty section for now
  }
];

export default function LiveBoard({ sid, isMobile }) {
  const [gameData, setGameData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchGameData = async () => {
      try {
        const response = await axios.post(API_URL, { id: sid });
        const t1 = response?.data?.data?.data?.t1;

        if (response?.data?.data?.success && Array.isArray(t1)) {
          const filteredData = t1.filter(game => game.etid === sid);
          let finalData = filteredData.length > 0 ? filteredData : t1;

          // Merge static events if sid is 4 (Cricket)
          if (sid === 4) {
            finalData = [...finalData, ...additionalstaticevents];
          }

          setGameData(finalData);
        } else {
          throw new Error(response?.data?.data?.msg || 'No data found');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data.');
        setGameData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [sid]);

  // Loading state (simple spinner or nothing – you can remove this block completely if you want instant "No records")
  if (loading) {
    return <div className={styles.board}>
      <div className={styles.row}>
        <div className={styles.col1}>

          <div className={styles.gameName}>
            <span>  No Record Found</span>
          </div>

        </div>

      </div>
    </div>
  }

  // Error state
  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  // No data
  if (gameData.length === 0) {
    return <div className={styles.board}>No records found</div>;
  }

  // Sort: live games (iplay) first
  const sortedGameData = [...gameData].sort((a, b) => (b.iplay === true) - (a.iplay === true));

  if (isMobile) {
    return <LiveBoardMobile data={sortedGameData} sid={sid} />;
  }

  return (
    <div className={styles.board}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerItem} style={{ textAlign: "left" }}>Game</div>
        <div className={styles.headerItem}>1</div>
        <div className={styles.headerItem}>X</div>
        <div className={styles.headerItem}>2</div>
      </div>

      {/* Hard-coded Ball by Ball row (only when sid === 4) */}
      {sid === 4 && (
        <div className={styles.row}>
          <div className={styles.col1}>
            <NavLink to={`/casino/superover2`}>
              <div className={styles.gameName}>Superover2</div>
            </NavLink>
            <div className={styles.gameicons}>
              <FaCircle color="#28a745" size={12} />
              <Tv style={{ height: "18px" }} />
              <img src={fancy} alt="fancy" className={styles.iconImg} />
            </div>
          </div>
          <div className={styles.col2}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ display: "flex" }}>
                <div className={styles.blue}>-</div>
                <div className={styles.pink}>-</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actual games */}
      {sortedGameData.map((game, index) => {
        const odds1 = game?.section?.find(s => s.nat === "NK Radomlje" || s.sno === 1)?.odds || [];
        const oddsX = game?.section?.find(s => s.nat === "The Draw" || s.sno === 2)?.odds || [];
        const odds2 = game?.section?.find(s => s.nat === "Dinamo Zagreb" || s.sno === 3)?.odds || [];

        return (
          <div key={index} className={styles.row}>
            <div className={styles.col1}>
              <NavLink
                to={`/cricket/${sid}/${game.gmid}`}
                state={{ game }}
              >
                <div className={styles.gameName}>
                  {game.ename} / <span className={styles.gameTime}>{game.stime}</span>
                </div>
              </NavLink>

              <div className={styles.gameicons}>
                {game.iplay && <FaCircle color="#28a745" size={12} />}
                {game.tv && <Tv style={{ height: "18px" }} />}
                {game.f && <img src={fancy} alt="fancy" className={styles.iconImg} />}
                {game.bm && <img src={bm} alt="bm" className={styles.iconImg} />}
                {game.iplay && <IoGameControllerSharp size={15} />}
              </div>
            </div>

            <div className={styles.col2}>
              <div style={{ display: "flex" }}>
                <div className={styles.blue}>{odds1[0]?.odds ?? "-"}</div>
                <div className={styles.pink}>{odds1[1]?.odds ?? "-"}</div>
              </div>
              <div style={{ display: "flex" }}>
                <div className={styles.blue}>{oddsX[0]?.odds ?? "-"}</div>
                <div className={styles.pink}>{oddsX[1]?.odds ?? "-"}</div>
              </div>
              <div style={{ display: "flex" }}>
                <div className={styles.blue}>{odds2[0]?.odds ?? "-"}</div>
                <div className={styles.pink}>{odds2[1]?.odds ?? "-"}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}