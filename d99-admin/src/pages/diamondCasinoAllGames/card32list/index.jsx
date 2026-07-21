import React from "react";
import styles from "./card32list.module.css";
import { useNavigate } from "react-router-dom";
import Card32A from '../../../assets/images/thumbs/card32.jpg'
import Card32B from '../../../assets/images/thumbs/card32eu.jpg'



// import TeenImage from '../../../assets/images/thumbs/pteen.jpg'
export const Card32List = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 1,
      title: "TEENPATTI 1DAY",
      thumb: Card32A,
      path: "/admin/casino/card32",
    },
    {
      id: 2,
      title: "TEENPATTI 20-20",
      thumb: Card32B,
      path: "/admin/casino/card32eu",
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
