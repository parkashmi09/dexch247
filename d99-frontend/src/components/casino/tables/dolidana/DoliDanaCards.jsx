const DICE_BASE = "/assets/img/dice";

export default function DoliDanaCards({ cardString = "" }) {
  // cardString format: "2,6" (two dice values)
  const tokens = cardString.split(",").map((t) => t.trim()).filter(Boolean);
  const diceA = tokens[0] || "";
  const diceB = tokens[1] || "";

  return (
    <div className="casino-video-cards d-flex justify-content-center gap-3 py-2">
      {diceA && <img src={`${DICE_BASE}/dice${diceA}.png`} alt={`Dice ${diceA}`} style={{ height: 50 }} />}
      {diceB && <img src={`${DICE_BASE}/dice${diceB}.png`} alt={`Dice ${diceB}`} style={{ height: 50 }} />}
    </div>
  );
}
