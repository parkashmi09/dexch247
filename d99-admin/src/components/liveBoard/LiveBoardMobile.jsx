import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaCircle } from "react-icons/fa";

import styles from "./LiveBoardMobile.module.css";
import Tv from '../../assets/svg/tv';
import fancy from '../../assets/img/ic_fancy.png';

const LiveBoardMobile = ({ data, sid }) => {
  if (!data || data.length === 0) {
    return <div className={styles.mobileContainer}>No records found</div>;
  }

  return (
    <div className={styles.mobileContainer}>

      {/* Static Super Over Section */}
      <div className={styles.gameItem}>
        <div className={styles.gameHeader}>
          <NavLink
            to={`/casino/superover2`}  // Change this to your desired route
            style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
          >
            <div className={styles.gameName} style={{ marginBottom: "-3px" }}>

              Superover2
            </div>
          </NavLink>
          <div className={styles.icons}>
            <FaCircle color="#28a745" size={10} /> {/* Red dot to indicate special */}
            <Tv style={{ height: "18px" }} />
            <img src={fancy} alt="fancy" className={styles.iconImg} style={{height:"18px",width:"18px"}}/>
            <span style={{ fontSize: "13px", fontWeight: "800", marginTop: "2px" }}> BM</span>
          </div>
        </div>

        <div className={styles.oddsRow}>
          {/* Yes */}
          <div className={styles.oddsPair}>
            <div className={styles.backBox}>-</div>
            <div className={styles.layBox}>-</div>
          </div>
          {/* No */}
          <div className={styles.oddsPair}>
            <div className={styles.backBox}>-</div>
            <div className={styles.layBox}>-</div>
          </div>
          {/* Placeholder */}
          <div className={styles.oddsPair}>
            <div className={styles.backBox}>-</div>
            <div className={styles.layBox}>-</div>
          </div>
        </div>
      </div>

      {/* Dynamic Live Matches */}
      {data.map((game, index) => {
        const odds1 = game?.section?.find(s => s.nat === "NK Radomlje" || s.sno === 1)?.odds || [];
        const oddsX = game?.section?.find(s => s.nat === "The Draw" || s.sno === 2)?.odds || [];
        const odds2 = game?.section?.find(s => s.nat === "Dinamo Zagreb" || s.sno === 3)?.odds || [];

        return (
          <div key={index} className={styles.gameItem}>
            <div className={styles.gameHeader}>
              <NavLink to={`/cricket/${sid}/${game.gmid}`} state={{ game }} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                <div className={styles.gameName}>{game.ename}</div>
              </NavLink>
              <div className={styles.icons}>
                {game.iplay && <FaCircle color="#28a745" size={10} />}
                {/* {game.tv && <img src={Tv} alt="tv" className={styles.iconImg} />} */}
                {game.tv && <Tv style={{ height: "18px" }} />}
                {game.f && <img src={fancy} alt="fancy" className={styles.iconImg}  style={{height:"18px",width:"18px"}}/>}
                {/* {game.bm && <img src={bm} alt="bm" className={styles.iconImg} />} */}
                <span style={{ fontSize: "13px", fontWeight: "800", marginTop: "2px" }}> BM</span>
              </div>
            </div>

            <div className={styles.gameTime}>{game.stime}</div>

            <div className={styles.marketHeaders}>
              <div>1</div>
              <div>X</div>
              <div>2</div>
            </div>

            <div className={styles.oddsRow}>
              {/* 1 */}
              <div className={styles.oddsPair}>
                <div className={styles.backBox}>{odds1[0]?.odds ?? "-"}</div>
                <div className={styles.layBox}>{odds1[1]?.odds ?? "-"}</div>
              </div>
              {/* X */}
              <div className={styles.oddsPair}>
                <div className={styles.backBox}>{oddsX[0]?.odds ?? "-"}</div>
                <div className={styles.layBox}>{oddsX[1]?.odds ?? "-"}</div>
              </div>
              {/* 2 */}
              <div className={styles.oddsPair}>
                <div className={styles.backBox}>{odds2[0]?.odds ?? "-"}</div>
                <div className={styles.layBox}>{odds2[1]?.odds ?? "-"}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LiveBoardMobile;