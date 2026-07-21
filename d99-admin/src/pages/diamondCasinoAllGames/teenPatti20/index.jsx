import React from "react";
import styles from "./teenpatti20.module.css";
import { useNavigate } from "react-router-dom";
import Teen from '../../../assets/images/thumbs/teen6.jpg'




export const TeenPatti20List = () => {
  const navigate = useNavigate();

  const games = [
    { id: 1, thumb: Teen, path: "/admin/vcasino/teen" },

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
