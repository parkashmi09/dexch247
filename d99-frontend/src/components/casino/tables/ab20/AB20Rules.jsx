export default function AB20Rules() {
  return (
    <div className="rules-section">
      <img
        src="/assets/casino-rules/ab20.jpg"
        alt="Andar Bahar Rules"
        className="img-fluid"
        onError={(e) => { e.target.style.display = "none"; }}
      />
      <ul className="pl-4 pr-4 list-style mt-2">
        <li>Andar Bahar is an Indian origin card game.</li>
        <li>A single "Jo" card is drawn first; Andar and Bahar sides take turns receiving cards.</li>
        <li>The side that gets a card matching the Jo card wins the round.</li>
        <li>Bahar 1st card pays 25%; all other positions pay 100%.</li>
        <li>Bet on the card position (Andar or Bahar) where you think the matching card will land.</li>
      </ul>
    </div>
  );
}
