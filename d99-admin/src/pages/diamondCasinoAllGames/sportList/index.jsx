import React from "react";
import styles from "./sportList.module.css";
import { useNavigate } from "react-router-dom";
import SuperOver2 from '../../../assets/casinoimages2/superover2.jpg'
import SuperOver from '../../../assets/casinoimages2/superover.jpg'


// import TeenImage from '../../../assets/images/thumbs/pteen.jpg'
export const SportList = () => {
    const navigate = useNavigate();

    const games = [
        {
            id: 1,
            title: "TEENPATTI 1DAY",
            thumb: SuperOver2,
            path: "/admin/casino/superover2",
        },
        {
            id: 2,
            title: "TEENPATTI 20-20",
            thumb: SuperOver,
            path: "/admin/casino/superover",
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
