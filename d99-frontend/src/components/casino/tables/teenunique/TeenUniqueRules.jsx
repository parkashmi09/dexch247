export default function TeenUniqueRules() {
  return (
    <div>
      <style>{`
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section ul li, .rules-section p { margin-bottom: 5px; }
        .rules-section .rules-highlight { color: #FDCF13; font-size: 16px; }
        .rules-section .rules-sub-highlight { color: #FDCF13; font-size: 14px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
        .rules-section img { max-width: 100%; }
      `}</style>
      <div className="rules-section">
        <p>Welcome to Unique Teenpatti, a new variation of Teenpatti.</p>
        <p>
          We are excited to introduce you to a new variation of Teenpatti game{" "}
          <b>Unique Teenpatti.</b> The game follows the same standard rules of Teenpatti but at the
          beginning of the round the player has a chance to select their own three cards from six
          cards on the table. Once a player selects their three cards from six cards on the table,
          the other three cards belong to the opponent player. After card selection is done, the
          dealer will deal six cards on the table to decide the winner. Good Luck and wind BIG!!!.
        </p>
        <h4>Standard Rules:</h4>
        <div>
          <img src="/assets/img/casino-rules/teen6.jpg" className="img-fluid" alt="Unique Teenpatti Rules" />
        </div>
      </div>
    </div>
  );
}
