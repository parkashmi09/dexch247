import React from 'react';
import styles from './DoliDana.module.css';

const DoliDanaVisual = ({ data }) => {
    // Dolidana data format: "4,5" (string) or array
    let diceValues = [];
    
    if (typeof data === 'string') {
        diceValues = data.split(',').map(v => parseInt(v.trim()));
    } else if (Array.isArray(data)) {
        diceValues = data;
    }

    if (diceValues.length < 2) return null;

    return (
        <div className={styles.doliDanaContainer}>
            <div className={styles.diceWrapper}>
                <img 
                    src={`/assets/img/tabledice/dice${diceValues[0]}.png`} 
                    alt={`Dice ${diceValues[0]}`}
                    style={{ width: '60px', height: '60px' }}
                />
            </div>
            <div className={styles.diceWrapper}>
                <img 
                    src={`/assets/img/tabledice/dice${diceValues[1]}.png`} 
                    alt={`Dice ${diceValues[1]}`}
                    style={{ width: '60px', height: '60px' }}
                />
            </div>
        </div>
    );
};

export default DoliDanaVisual;
