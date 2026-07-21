import React from "react";
import styles from "./rouletteList.module.css";
import { useNavigate } from "react-router-dom";
import Roulette from '../../../assets/images/thumbs/ourroullete.jpg'
import Roulette11 from '../../../assets/images/thumbs/roulette11.jpg'
import Roulette12 from '../../../assets/images/thumbs/roulette12.jpg'
import Roulette13 from '../../../assets/images/thumbs/roulette13.jpg'


// import TeenImage from '../../../assets/images/thumbs/pteen.jpg'
export const RouletteList = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 1,
      title: "TEENPATTI 1DAY",
      thumb: Roulette,
      path: "/admin/casino/ourroullete",
    },
    {
      id: 2,
      title: "TEENPATTI 20-20",
      thumb: Roulette11,
      path: "/admin/casino/roulette11",
    },
    {
      id: 3,
      title: "DRAGON TIGER 20-20",
      thumb: Roulette12,
      path: "/admin/casino/roulette12",
    },
    {
      id: 4,
      title: "DRAGON TIGER 1DAY",
      thumb: Roulette13,
      path: "/admin/casino/roulette13",
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
