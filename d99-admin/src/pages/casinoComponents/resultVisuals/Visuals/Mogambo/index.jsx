import React from 'react';
import styles from './Mogambo.module.css';
import { getCardImage } from '../../cardAssets';

const MogamboVisual = ({ data }) => {
    // Data: "C1,C2,C3" — Daga/Teja = first 2, Mogambo = 3rd. Cards from cardAssets.
    const cardString = data || "";
    const cardTokens = cardString.split(",").map(t => t.trim());

    const dagaTejaCards = [0, 1].map(i => {
         const token = cardTokens[i];
         return getCardImage(token);
    });

    const mogamboCard = getCardImage(cardTokens[2]);

    // Calculate total if needed, or parse if passed in data
    // For now assuming just visuals of cards, Total might be overlay logic or calculated
    // The user screenshot showed a "TOTAL: 11" box. 
    // If the API doesn't give total explicitly, we might need to calc basics or ignore.
    // I'll add a placeholder or simple calc if tokens are value-based.

    return (
        <div className={`casino-video-cards ${styles.mogamboContainer}`}>
            {/* Total Box Overlay - Optional if data has it */}
             {/* <div className={styles.totalBox}>TOTAL: 11</div> */}

            <div className={styles.leftSection}>
                <div className={styles.headerTitle}>DAGA / TEJA</div>
                <div className={styles.cardRow}>
                    {dagaTejaCards.map((card, index) => (
                        <img 
                            key={`dt-${index}`} 
                            src={card} 
                            alt={`Daga Teja Card ${index + 1}`} 
                            className={styles.cardImage}
                             onError={(e) => {
                                e.target.style.display = 'none';
                             }}
                        />
                    ))}
                </div>
            </div>

            <div className={styles.rightSection}>
                 <div className={styles.headerTitle}>MOGAMBO</div>
                 <div className={styles.cardRow}>
                     <img 
                        src={mogamboCard} 
                        alt="Mogambo Card" 
                        className={styles.cardImage}
                         onError={(e) => {
                            e.target.style.display = 'none';
                         }}
                     />
                 </div>
            </div>
        </div>
    );
};

export default MogamboVisual;
