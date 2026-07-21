import React from 'react';
import styles from './Sicbo.module.css';

const SicboVisual = ({ data }) => {
    // Data expected: "1,2,3" or "4,4,6"
    
    let diceValues = [];
    if (typeof data === 'string') {
        diceValues = data.split(',').map(v => parseInt(v.trim())).filter(n => !isNaN(n) && n > 0);
    } else if (Array.isArray(data)) {
        diceValues = data;
    }

    if (diceValues.length === 0) return null;

    return (
        <div className={styles.sicboContainer}>
            {diceValues.map((val, index) => (
                <img 
                    key={index}
                    src={`/assets/img/tabledice/dice${val}.png`} 
                    alt={`Dice ${val}`}
                    className={styles.diceImage}
                    onError={(e) => e.target.style.display = 'none'}
                />
            ))}
        </div>
    );
};

export default SicboVisual;
