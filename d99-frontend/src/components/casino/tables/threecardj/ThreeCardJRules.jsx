export default function ThreeCardJRules() {
  return (
    <div className="rules-section">
      <img
        src="/assets/casino-rules/3cardj.jpg"
        alt="3 Cards Judgement Rules"
        className="img-fluid"
        onError={(e) => { e.target.style.display = "none"; }}
      />
      <ul className="pl-4 pr-4 list-style mt-2">
        <li>Select any 3 cards before the round begins.</li>
        <li>Bet Yes: You win if at least 1 of your 3 selected cards appears in the result.</li>
        <li>Bet No: You win if none of your 3 selected cards appears in the result.</li>
        <li>3 cards are drawn each round to determine the result.</li>
      </ul>
    </div>
  );
}
