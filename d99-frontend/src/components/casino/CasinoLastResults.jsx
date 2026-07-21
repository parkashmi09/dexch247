export default function CasinoLastResults({ results = [], gameId }) {
  return (
    <>
      <div className="casino-last-result-title">
        <span>Last Result</span>
        <span>
          {gameId && (
            <a href={`/casino-results/${gameId}`}>View All</a>
          )}
        </span>
      </div>
      <div className="casino-last-results matka-result">
        {results.map((result, idx) => (
          <span
            key={idx}
            className={`result ${result.type || "result-b"}`}
          >
            {result.label}
          </span>
        ))}
      </div>
    </>
  );
}
