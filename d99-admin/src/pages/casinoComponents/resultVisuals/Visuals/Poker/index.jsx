import React from 'react';
import styles from './Poker.module.css';
import { getCardImage, CARD_BACK } from '../../cardAssets';

const PokerVisual = ({ data }) => {
    // Data: "7HH,4DD,..." — 0,1 Player A; 2,3 Player B; 4–8 Board. Cards from cardAssets.
    const cardString = data || "";
    const cardTokens = cardString.split(",").map(t => t.trim());

    const playerACards = cardTokens.slice(0, 2).map(getCardImage);
    const playerBCards = cardTokens.slice(2, 4).map(getCardImage);
    const boardCards = cardTokens.slice(4, 9).map(getCardImage);

    // If data isn't sufficient, we can return null or render empty slots
    if (cardTokens.length < 4) return null;

    return (
        <div className={`casino-video-cards ${styles.pokerContainer}`}>
            <div className={styles.topSection}>
                <div className={styles.playerSection}>
                    <span className={styles.playerName}>PLAYER A</span>
                    <div className={styles.playerCards}>
                        {playerACards.map((card, i) => (
                             <img key={`pA-${i}`} src={card} className={styles.cardImage} alt="Player A Card" onError={(e) => e.target.src = CARD_BACK} />
                        ))}
                    </div>
                </div>
                <div className={styles.playerSection}>
                    <span className={styles.playerName}>PLAYER B</span>
                    <div className={styles.playerCards}>
                         {playerBCards.map((card, i) => (
                             <img key={`pB-${i}`} src={card} className={styles.cardImage} alt="Player B Card" onError={(e) => e.target.src = CARD_BACK} />
                        ))}
                    </div>
                </div>
            </div>
            
            <div className={styles.boardSection}>
                <span className={styles.boardTitle}>BOARD</span>
                <div className={styles.boardCards}>
                     {boardCards.map((card, i) => (
                             <img key={`board-${i}`} src={card} className={styles.cardImage} alt="Board Card" onError={(e) => e.target.src = CARD_BACK} />
                     ))}
                </div>
            </div>
        </div>
    );
};

export default PokerVisual;
