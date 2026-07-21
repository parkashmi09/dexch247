import React from "react";
import styles from "./tembo.module.css";
import { useNavigate } from "react-router-dom";
import Teen from '../../../assets/images/thumbs/tteen.jpg'
import Teen20 from '../../../assets/images/thumbs/tteen20.jpg'
import DT20 from '../../../assets/images/thumbs/tdt20.jpg'
import DT6 from '../../../assets/images/thumbs/tdt6.jpg'
import Lucky7 from '../../../assets/images/thumbs/tlucky7.jpg'
import Card32 from '../../../assets/images/thumbs/tcard32.jpg'
import Baccarat from '../../../assets/images/thumbs/tbaccarat.jpg'

// import TeenImage from '../../../assets/images/thumbs/pteen.jpg'
export const TemboCasino = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 1,
      title: "TEENPATTI 1DAY",
      thumb: Teen,
      path: "/admin/vcasino/teen",
    },
    {
      id: 2,
      title: "TEENPATTI 20-20",
      thumb: Teen20,
      path: "/admin/vcasino/teen20",
    },
    {
      id: 3,
      title: "DRAGON TIGER 20-20",
      thumb: DT20,
      path: "/admin/casino/dt20",
    },
    {
      id: 4,
      title: "DRAGON TIGER 1DAY",
      thumb: DT6,
      path: "/admin/vcasino/dt6",
    },
    {
      id: 5,
      title: "LUCKY 7",
      thumb: Lucky7,
      path: "/admin/vcasino/lucky7",
    },
    {
      id: 6,
      title: "32 CARDS",
      thumb: Card32,
      path: "/admin/casino/card32",
    },
    {
      id: 7,
      title: "BACCARAT",
      thumb: Baccarat,
      path: "/admin/casino/baccarat",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {games.map((game) => (
          <div
            key={game.id}
            className={styles.card}
            onClick={() => navigate(game.path)}
          >
            <img
              src={game.thumb}
              alt={game.title}
              className={styles.image}
            />
            <div className={styles.overlay} />
            {/* <div className={styles.title}>{game.title}</div> */}
          </div>
        ))}
      </div>/
    </div>
  );
};
