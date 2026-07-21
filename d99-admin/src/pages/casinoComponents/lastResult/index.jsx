import styles from './LastResult.module.css';

export default function LastResult({player}) {
  return (
    <div className={styles.lastResult}>{player}</div>
)
}
