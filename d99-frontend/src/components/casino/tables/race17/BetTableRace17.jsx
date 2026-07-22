function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function NationBook({ value }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  const show = !isNaN(n) && n !== 0;
  return (
    <div className="casino-nation-book text-center w-100">
      {show && (
        <span className={n >= 0 ? "text-success" : "text-danger"}>{n}</span>
      )}
    </div>
  );
}

const isSus = (item) => !item || item.gstatus !== "OPEN";

// Rows configuration: find item by predicate, display nat label
const ROWS = [
  {
    key: "race17",
    label: "Race to 17",
    find: (data) => data.find((d) => d.nat === "Race to 17"),
    expNat: "Race to 17",
  },
  {
    key: "bigcard",
    label: null, // use item.nat (changes with card count)
    find: (data) => data.find((d) => d.nat && d.nat.includes("Big Card")),
    expNat: null,
  },
  {
    key: "zerocard",
    label: null, // use item.nat (changes with card count)
    find: (data) => data.find((d) => d.nat && d.nat.includes("Zero Card")),
    expNat: null,
  },
  {
    key: "anyzero",
    label: "Any Zero",
    find: (data) => data.find((d) => d.nat === "Any Zero"),
    expNat: "Any Zero",
  },
];

export default function BetTableRace17({ tableData = [], onBetClick, exposures = {} }) {
  return (
    <div className="casino-table">
      <div className="casino-table-box">
        {ROWS.map(({ key, label, find, expNat }) => {
          const item = find(tableData);
          const sus = isSus(item);
          const nat = item?.nat || label || "";
          const displayLabel = label || nat;
          const expKey = expNat || nat;
          const exp = getExp(exposures, expKey);

          return (
            <div key={key} className="casino-odd-box-container">
              <div className="casino-nation-name">{displayLabel}</div>
              <div
                className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
                onClick={() =>
                  !sus && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")
                }
              >
                <span className="casino-odds">{item?.b || 0}</span>
              </div>
              <div
                className={`casino-odds-box lay${sus ? " suspended-box" : ""}`}
                onClick={() =>
                  !sus && item?.l > 0 && onBetClick?.(item.l, nat, item, "lay")
                }
              >
                <span className="casino-odds">{item?.l || 0}</span>
              </div>
              <NationBook value={exp} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
