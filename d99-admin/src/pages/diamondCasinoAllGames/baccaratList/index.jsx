import React from "react";
import styles from "./baccaratList.module.css";
import { useNavigate } from "react-router-dom";
import Baccarat2 from '../../../assets/images/thumbs/baccarat2.jpg'
import Baccarat from '../../../assets/images/thumbs/baccarat.jpg'
import Teensin from '../../../assets/images/thumbs/teensin.jpg'


// import TeenImage from '../../../assets/images/thumbs/pteen.jpg'
export const BaccaratList = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 1,
      title: "TEENPATTI 1DAY",
      thumb: Baccarat2,
      path: "/admin/casino/baccarat2",
    },
    {
      id: 2,
      title: "TEENPATTI 20-20",
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
      </div>
    </div>
  );
};
