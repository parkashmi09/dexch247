import React from "react";
import styles from "./worli.module.css";
import { useNavigate } from "react-router-dom";
import Worli from '../../../assets/images/thumbs/worli.jpg'
import Worli2 from '../../../assets/images/thumbs/worli2.jpg'
import Worli3 from '../../../assets/images/thumbs/worli3.gif'



// import TeenImage from '../../../assets/images/thumbs/pteen.jpg'
export const WorliList = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 1,
      title: "TEENPATTI 1DAY",
      thumb: Worli,
      path: "/admin/casino/ourroullete",
    },
    {
      id: 2,
      title: "TEENPATTI 20-20",
      thumb: Worli2,
      path: "/admin/casino/roulette11",
    },
    {
      id: 3,
      title: "DRAGON TIGER 20-20",
      thumb: Worli3,
      path: "/admin/casino/roulette12",
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
