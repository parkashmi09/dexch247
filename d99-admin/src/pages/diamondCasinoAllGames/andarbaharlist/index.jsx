import React from "react";
import styles from "./andarbaaharlist.module.css";
import { useNavigate } from "react-router-dom";
import AndarBahar2 from '../../../assets/images/thumbs/andar-bahar2.jpg'
import AndarBahar from '../../../assets/images/thumbs/andar-bahar.jpg'
import AndarBahar3 from '../../../assets/images/thumbs/ab3.jpg'
import AndarBahar4 from '../../../assets/images/thumbs/ab4.jpg'




export const AndarBaharList = () => {
  const navigate = useNavigate();

  const games = [
    { id: 1, thumb: AndarBahar2, path: "/admin/vcasino/teen" },
    { id: 2, thumb: AndarBahar, path: "/admin/vcasino/teen20" },
    { id: 3, thumb: AndarBahar3, path: "/admin/vcasino/teen9" },
    { id: 4, thumb: AndarBahar4, path: "/admin/vcasino/teen8" },

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
