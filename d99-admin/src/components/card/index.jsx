import styles from "./Card.module.css"

export default function Card({ imageUrl, title }) {
  return (
    <div className={styles.cardContainer} >
      <img src={imageUrl} alt={title || "Card"} className={styles.cardImage} loading="lazy" />
      {title && <div className={styles.cardFooter}>{title}</div>}
    </div>
  )
}

