const CARD_BACK = "/assets/img/cards/1.jpg";

export default function FlipCard({ src }) {
  const imgSrc = src || CARD_BACK;
  const flipped = src && src !== CARD_BACK;

  return (
    <div className="flip-card">
      <div className={`flip-card-inner${flipped ? " flipped" : " "}`}>
        <div className="flip-card-front">
          <img src={imgSrc} alt="" />
        </div>
        <div className="flip-card-back">
          <img src={imgSrc} alt="" />
        </div>
      </div>
    </div>
  );
}

export { CARD_BACK };
