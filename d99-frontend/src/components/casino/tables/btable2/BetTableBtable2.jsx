function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

const MAIN_ITEMS = [
  { nat: "Don", label: "A.Don" },
  { nat: "Amar Akbar Anthony", label: "B.Amar Akbar Anthony" },
  { nat: "Sahib Bibi Aur Ghulam", label: "C.Sahib Bibi Aur Ghulam" },
  { nat: "Dharam Veer", label: "D.Dharam Veer" },
  { nat: "Kis Kis ko Pyaar Karoon", label: "E.Kis Kis ko Pyaar Karoon" },
  { nat: "Ghulam", label: "F.Ghulam" },
];

const CARD_ITEMS = [
  { nat: "Card J", img: "/assets/img/cards/icons/J.png" },
  { nat: "Card Q", img: "/assets/img/cards/icons/Q.png" },
  { nat: "card K", img: "/assets/img/cards/icons/K.png" },
  { nat: "card A", img: "/assets/img/cards/icons/A.png" },
];

export default function BetTableBtable2({ tableData = [], onBetClick, exposures = {} }) {
  const find = (name) => tableData.find((d) => d.nat === name) || tableData.find((d) => d.nat?.toLowerCase() === name.toLowerCase());
  const isSus = (item) => !item || item.gstatus !== "OPEN";

  const odd = find("Odd");
  const red = find("Red");
  const black = find("Black");
  const dulha = find("Dulha Dulhan K-Q");
  const barati = find("Barati J-A");

  function renderMainRow(item, label) {
    const sus = isSus(item);
    const exp = getExp(exposures, item?.nat);
    const expN = exp !== null && exp !== undefined ? parseFloat(exp) : NaN;
    const showExp = !isNaN(expN) && expN !== 0;
    return (
      <div className="casino-odd-box-container" key={label}>
        <div className="casino-nation-name">{label}
          {showExp && <div className={`casino-nation-book d-md-none ${expN >= 0 ? "text-success" : "text-danger"}`}>{expN}</div>}
        </div>
        <div className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}>
          <span className="casino-odds">{item?.b || 0}</span>
        </div>
        <div className={`casino-odds-box lay${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && item?.l > 0 && onBetClick?.(item.l, item.nat, item, "lay")}>
          <span className="casino-odds">{item?.l || 0}</span>
        </div>
        <div className="casino-nation-book text-center d-none d-md-block w-100">
          {showExp && <span className={expN >= 0 ? "text-success" : "text-danger"}>{expN}</span>}
        </div>
      </div>
    );
  }

  function renderThemeBox(item, label) {
    const sus = isSus(item);
    return (
      <div className="aaa-odd-box">
        <div className="casino-odds text-center">{item?.b || 0}</div>
        <div className={`casino-odds-box back casino-odds-box-theme${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}>
          <span className="casino-odds">{label}</span>
        </div>
        <div className="casino-nation-book text-center"></div>
      </div>
    );
  }

  const anyCard = CARD_ITEMS.map((c) => find(c.nat)).find((i) => i && !isSus(i));
  const cardOdds = anyCard ? anyCard.b : 0;

  return (
    <div className="casino-table">
      {/* Main 6 players */}
      <div className="casino-table-box">
        {MAIN_ITEMS.map((m) => renderMainRow(find(m.nat), m.label))}
      </div>

      {/* Odd + Dulha/Barati */}
      <div className="casino-table-box mt-3">
        <div className="casino-table-left-box left-odd-box">
          {renderMainRow(odd, "Odd")}
        </div>
        <div className="casino-table-right-box right-odd-box">
          {renderThemeBox(dulha, "Dulha Dulhan K-Q")}
          {renderThemeBox(barati, "Barati J-A")}
        </div>
      </div>

      {/* Red/Black + Card icons */}
      <div className="casino-table-box mt-3">
        <div className="casino-table-left-box ">
          <div className="aaa-odd-box">
            <div className="casino-odds text-center">{red?.b || 0}</div>
            <div className={`casino-odds-box back casino-odds-box-theme${isSus(red) ? " suspended-box" : ""}`}
              onClick={() => !isSus(red) && red?.b > 0 && onBetClick?.(red.b, red.nat, red, "back")}>
              <div className="casino-odds">
                <span className="card-icon ms-1"><span className="card-red ">{"{"}</span></span>
                <span className="card-icon ms-1"><span className="card-red ">{"["}</span></span>
              </div>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>
          <div className="aaa-odd-box">
            <div className="casino-odds text-center">{black?.b || 0}</div>
            <div className={`casino-odds-box back casino-odds-box-theme${isSus(black) ? " suspended-box" : ""}`}
              onClick={() => !isSus(black) && black?.b > 0 && onBetClick?.(black.b, black.nat, black, "back")}>
              <div className="casino-odds">
                <span className="card-icon ms-1"><span className="card-black ">{"}"}</span></span>
                <span className="card-icon ms-1"><span className="card-black ">{"]"}</span></span>
              </div>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>
        </div>
        <div className="casino-table-right-box right-cards">
          <h4 className="w-100 text-center mb-2"><b>{cardOdds || 0}</b></h4>
          {CARD_ITEMS.map((c) => {
            const item = find(c.nat);
            const sus = isSus(item);
            return (
              <div className="card-odd-box" key={c.nat}
                onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}>
                <div className={sus ? "suspended-box" : ""}><img src={c.img} alt="" /></div>
                <div className="casino-nation-book"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
