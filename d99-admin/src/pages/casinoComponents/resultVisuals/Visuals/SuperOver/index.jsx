import React from 'react';
import styles from './SuperOver.module.css';

const SuperOverVisual = ({ data }) => {
    // Data expected: "4DD|KDD|1|1|1|1" or "0,4"
    
    let rawScores = [];
    if (typeof data === 'string') {
        // Handle both separators
        const delimiter = data.includes('|') ? '|' : ',';
        rawScores = data.split(delimiter).map(s => s.trim());
    } else if (Array.isArray(data)) {
        rawScores = data;
    }

    const getBallValue = (token) => {
        if (!token || token === '1') return null; // Closed/Empty
        
        // If it's a direct valid value (e.g. "4", "W", "NB", "WD")
        if (["0","1","2","3","4","5","6","7","8","9","10","W","WD","NB"].includes(token)) {
            return token;
        }

        // Parse Card Code (e.g. "4DD", "KDD", "10SS")
        // Extract rank (first 1 or 2 chars, ignore Suit)
        // Suits: D, H, S, C (usually last characters)
        // Regex: start with number/letter, end with [DHSChsc]
        
        // Simple heuristic: Remove last 2 chars if they are suits? 
        // Or just regex match `^([0-9JQKA]+)[DHSC]`
        const match = token.match(/^([0-9JQKA]+)/);
        if (match) {
            const rank = match[1];
            if (["J", "Q", "K"].includes(rank)) return "0"; // Face cards often 0
            if (rank === "A") return "1"; // Ace often 1
            return rank; // 2-10
        }
        
        // Fallback
        return null;
    };

    const scores = rawScores.map(getBallValue).filter(s => s !== null);

    if (scores.length === 0) return null;

    return (
        <div className={styles.superOverContainer}>
            {scores.map((score, index) => (
                <img 
                    key={`${index}-${score}`}
                    src={`/assets/img/table_cricket/${score}.png`}
                    alt={`Score ${score}`}
                    className={styles.ballImage}
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
            ))}
        </div>
    );
};

export default SuperOverVisual;
