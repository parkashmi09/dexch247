import React from "react";
import styles from "./vip.module.css";
import { useNavigate } from "react-router-dom";

export const VipCasino = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 1,
      title: "TEENPATTI 1DAY",
      thumb: "../../assets/images/thumbs/pteen.jpg",
      path: "/admin/vcasino/teen",
    },
    {
      id: 2,
      title: "TEENPATTI 20-20",
      thumb: "/images/teenpatti-2020.jpg",
      path: "/admin/vcasino/teen20",
    },
    {
      id: 3,
      title: "DRAGON TIGER 20-20",
      thumb: "/images/dragon-tiger-2020.jpg",
      path: "/admin/casino/dt20",
    },
    {
      id: 4,
      title: "DRAGON TIGER 1DAY",
      thumb: "/images/dragon-tiger-1day.jpg",
      path: "/admin/vcasino/dt6",
    },
    {
      id: 5,
      title: "LUCKY 7",
      thumb: "/images/lucky7.jpg",
      path: "/admin/vcasino/lucky7",
    },
    {
      id: 6,
      title: "32 CARDS",
      thumb: "/images/32cards.jpg",
      path: "/admin/casino/card32",
    },
    {
      id: 7,
      title: "BACCARAT",
      thumb: "/images/baccarat.jpg",
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
            <div className={styles.title}>{game.title}</div>
          </div>
        ))}
      </div>/
    </div>
  );
};
