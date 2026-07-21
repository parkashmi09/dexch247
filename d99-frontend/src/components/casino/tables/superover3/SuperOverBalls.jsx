export function parseBalls(cardString, maxBalls) {
  const raw = cardString ? cardString.split("|") : [];
  const count = maxBalls || raw.length || 4;
  const balls = [];
  for (let i = 0; i < count; i++) {
    const code = raw[i] || null;
    balls.push(code === "1" || !code ? null : code);
  }
  return balls;
}

export function rankFromCode(code) {
  if (!code) return null;
  const match = code.match(/^(\d+|[AJQK])/);
  return match ? match[1] : null;
}

function ballImage(rank) {
  if (!rank) return null;
  return `/assets/front/img/superover/balls/${rank}.png`;
}

export default function SuperOverBalls({ cardString }) {
  const balls = parseBalls(cardString);

  return (
    <>
      {balls.map((code, i) => {
        const rank = rankFromCode(code);
        const src = ballImage(rank);
        return (
          <div key={i} className="mt-1">
            <div>{src && <img src={src} alt={rank || ""} />}</div>
          </div>
        );
      })}
    </>
  );
}
