import React from "react";
import styles from "./pokerlist.module.css";
import { useNavigate } from "react-router-dom";
import Poker20 from '../../../assets/images/thumbs/poker20.jpg'
import Poker from '../../../assets/images/thumbs/poker.jpg'
import Poker6 from '../../../assets/images/thumbs/poker6.jpg'





export const PokerList = () => {
  const navigate = useNavigate();

  const games = [
    { id: 1, thumb: Poker20, path: "/admin/vcasino/poker20" },
    { id: 2, thumb: Poker, path: "/admin/vcasino/poker" },
    { id: 3, thumb: Poker6, path: "/admin/vcasino/poker6" },


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
              alt=""
              className={styles.image}
            />
            <div className={styles.overlay} />
          </div>
        ))}
      </div>
    </div>
  );
};
