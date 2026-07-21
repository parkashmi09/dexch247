import React from "react";
import styles from "./liveTeenPatti.module.css";
import { useNavigate } from "react-router-dom";
import Teen from '../../../assets/images/thumbs/teen.jpg'
import Teen20 from '../../../assets/images/thumbs/teen20.jpg'
import Teen9 from '../../../assets/images/thumbs/teen9.jpg'
import Teen8 from '../../../assets/images/thumbs/teen8.jpg'
import Teen33 from '../../../assets/images/thumbs/teen33.jpg'
import Teen3 from '../../../assets/images/thumbs/teen3.jpg'
import Teen32 from '../../../assets/images/thumbs/teen32.jpg'
import Teen20B from '../../../assets/images/thumbs/teen20b.jpg'
import TeenMuf from '../../../assets/images/thumbs/teenmuf.jpg'
import Patti2 from '../../../assets/images/thumbs/patti2.jpg'
import Teen41 from '../../../assets/images/thumbs/teen41.jpg'
import Teen42 from '../../../assets/images/thumbs/teen42.jpg'
import Teen20C from '../../../assets/images/thumbs/teen20c.jpg'
import TeenJoker from '../../../assets/images/thumbs/teenjoker.jpg'
import Joker1 from '../../../assets/images/thumbs/joker1.jpg'
import Joker20 from '../../../assets/images/thumbs/joker20.jpg'
import Joker120 from '../../../assets/images/thumbs/joker120.jpg'
import Poison20 from '../../../assets/images/thumbs/poison20.jpg'
import Poison from '../../../assets/images/thumbs/poison.jpg'
import Teen62 from '../../../assets/images/thumbs/teen62.jpg'




export const LiveTeenPatti = () => {
  const navigate = useNavigate();

  const games = [
    { id: 1, thumb: Teen, path: "/admin/casino/teen" },
    { id: 2, thumb: Teen20, path: "/admin/casino/teen20" },
    { id: 3, thumb: Teen9, path: "/admin/casino/teen9" },
    // { id: 4, thumb: Teen8, path: "/admin/casino/teen8" },
    { id: 5, thumb: Teen33, path: "/admin/casino/teen33" },
    { id: 6, thumb: Teen3, path: "/admin/casino/teen3" },
    { id: 7, thumb: Teen32, path: "/admin/casino/teen32" },
    { id: 8, thumb: Teen20B, path: "/admin/casino/teen20b" },
    { id: 9, thumb: TeenMuf, path: "/admin/casino/teenmuf" },
    // { id: 10, thumb: Patti2, path: "/admin/vcasino/patti2" },
    // { id: 11, thumb: Teen41, path: "/admin/vcasino/teen41" },
    // { id: 12, thumb: Teen42, path: "/admin/vcasino/teen42" },
    { id: 13, thumb: Teen20C, path: "/admin/casino/teen20c" },
    // { id: 14, thumb: TeenJoker, path: "/admin/casino/teenjoker" },
    // { id: 15, thumb: Joker1, path: "/admin/vcasino/joker1" },
    { id: 16, thumb: Joker20, path: "/admin/vcasino/joker20" },
    // { id: 17, thumb: Joker120, path: "/admin/vcasino/joker120" },
    { id: 18, thumb: Poison20, path: "/admin/vcasino/poison20" },
    { id: 19, thumb: Poison, path: "/admin/vcasino/poison" },
    { id: 20, thumb: Teen62, path: "/admin/vcasino/teen62" },
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
