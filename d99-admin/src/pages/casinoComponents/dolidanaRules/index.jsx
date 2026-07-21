import styles from "./DoliDanaRules.module.css";

// Import dice images
import dice1 from '../../../assets/img/dolidana/dice1.png';
import dice2 from '../../../assets/img/dolidana/dice2.png';
import dice3 from '../../../assets/img/dolidana/dice3.png';
import dice4 from '../../../assets/img/dolidana/dice4.png';
import dice5 from '../../../assets/img/dolidana/dice5.png';
import dice6 from '../../../assets/img/dolidana/dice6.png';

const diceImages = {
    1: dice1,
    2: dice2,
    3: dice3,
    4: dice4,
    5: dice5,
    6: dice6,
};

// Dice component for displaying dice
const Dice = ({ val }) => {
    const diceImage = diceImages[val];
    
    if (!diceImage) return null;

    return (
        <img
            src={diceImage}
            alt={`Dice ${val}`}
            style={{
                width: '30px',
                height: '30px',
                objectFit: 'contain'
            }}
            onError={(e) => {
                e.target.style.display = 'none';
            }}
        />
    );
}

const DoliDanaRules = () => {
    return (
        <div className={styles.rulesTable}>
            <div className={styles.rulesHeader}>Rules</div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.tableHeader}>Win</th>
                        <th className={styles.tableHeader}>Loss</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className={styles.tableCell}>
                            <div className={styles.ruleItem}>
                                <Dice val={3} /> <Dice val={3} />
                            </div>
                        </td>
                        <td className={styles.tableCell}>
                            <div className={styles.ruleItem}>
                                <Dice val={1} /> <Dice val={1} />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td className={styles.tableCell}>
                            <div className={styles.ruleItem}>
                                <Dice val={4} /> <Dice val={4} />
                            </div>
                        </td>
                        <td className={styles.tableCell}>
                            <div className={styles.ruleItem}>
                                <Dice val={2} /> <Dice val={2} />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td className={styles.tableCell}>
                            <div className={styles.ruleItem}>
                                <Dice val={5} /> <Dice val={5} />
                            </div>
                        </td>
                        <td className={styles.tableCell}>
                            <div className={styles.ruleItem}>
                                <Dice val={1} /> <Dice val={2} />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td className={styles.tableCell}>
                            <div className={styles.ruleItem}>
                                <Dice val={6} /> <Dice val={6} />
                            </div>
                        </td>
                        <td className={styles.tableCell}>
                            <div className={styles.ruleItem}>
                                <Dice val={1} /> <Dice val={3} />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default DoliDanaRules;
