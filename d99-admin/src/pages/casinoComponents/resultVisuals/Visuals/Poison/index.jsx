import React from 'react';
import styles from './Poison.module.css';
import { getCardImage } from '../../cardAssets';

const PoisonVisual = ({ data, poisonCard, playerA, playerB }) => {
    // Data: "7SS,7HH,1,..." — Poison index 0; Player A 1,2,3; Player B 4,5,6. Cards from cardAssets.
    const cardString = data || "";
    const cardTokens = cardString.split(",").map(t => t.trim());

    // Poison Logic:
    // Poison: Index 0
    // Player A: Indices 1, 2, 3
    // Player B: Indices 4, 5, 6
    
    const poisonCardImage = poisonCard || (cardTokens[0] && cardTokens[0] !== "1" && cardTokens[0] !== "0" 
        ? getCardImage(cardTokens[0])
        : null);

    const playerACards = playerA?.cards || [1, 2, 3].map(i => {
        const token = cardTokens[i];
        return getCardImage(token);
    });

    const playerBCards = playerB?.cards || [4, 5, 6].map(i => {
        const token = cardTokens[i];
        return getCardImage(token);
    });

    return (
        <div className={`casino-video-cards ${styles.poisonContainer}`}>
            {/* Poison Card */}
            {poisonCardImage && (
                <div className={styles.poisonSection}>
                    <span className={styles.poisonName}>POISON</span>
                    <div className={styles.poisonCard}>
                        <img 
                            src={poisonCardImage} 
                            alt="Poison Card"
                            className={styles.cardImage}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                </div>
            )}
            
            {/* Player A */}
            <div className={styles.playerSection}>
                <span className={styles.playerName}>Player A</span>
                <div className={styles.playerCards}>
                    {playerACards.map((card, index) => (
                        <img 
                            key={`${index}-${card}`} 
                            src={card} 
                            alt={`Player A card ${index + 1}`}
                            className={styles.cardImage}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    ))}
                </div>
            </div>
            
            {/* Player B */}
            <div className={styles.playerSection}>
                <span className={styles.playerName}>Player B</span>
                <div className={styles.playerCards}>
                    {playerBCards.map((card, index) => (
                        <img 
                            key={`${index}-${card}`} 
                            src={card} 
                            alt={`Player B card ${index + 1}`}
                            className={styles.cardImage}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PoisonVisual;
