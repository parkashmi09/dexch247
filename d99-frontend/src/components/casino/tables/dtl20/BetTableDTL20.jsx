import { useState } from "react";
import { Tab, Nav } from "react-bootstrap";

function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExposureSpan({ exposures, nat }) {
  const raw = getExp(exposures, nat);
  if (raw === null || raw === undefined) return null;
  const n = parseFloat(raw);
  if (isNaN(n) || n === 0) return null;
  return (
    <div style={{ color: n < 0 ? "#ff0000" : "#00ff00", fontSize: 10, marginTop: 2 }}>
      {n < 0 ? n.toFixed(2) : `+${n.toFixed(2)}`}
    </div>
  );
}

function isSus(item) {
  return !item || item.gstatus !== "OPEN";
}

// API nat format: "Winner D", "Black D", "Dragon A", "Dragon 2", etc.
const PLAYERS = ["Dragon", "Tiger", "Lion"];
const PLAYER_CODES = { Dragon: "D", Tiger: "T", Lion: "L" };

const ROWS = [
  { label: "Winner", natPrefix: "Winner" },
  { label: "Black", natPrefix: "Black", isBlack: true },
  { label: "Red", natPrefix: "Red", isRed: true },
  { label: "Odd", natPrefix: "Odd" },
  { label: "Even", natPrefix: "Even" },
  { cardLabel: "A", natCardLabel: "A" },
  { cardLabel: "2", natCardLabel: "2" },
  { cardLabel: "3", natCardLabel: "3" },
  { cardLabel: "4", natCardLabel: "4" },
];

const ROWS_RIGHT = [
  { cardLabel: "5", natCardLabel: "5" },
  { cardLabel: "6", natCardLabel: "6" },
  { cardLabel: "7", natCardLabel: "7" },
  { cardLabel: "8", natCardLabel: "8" },
  { cardLabel: "9", natCardLabel: "9" },
  { cardLabel: "10", natCardLabel: "10" },
  { cardLabel: "J", natCardLabel: "J" },
  { cardLabel: "Q", natCardLabel: "Q" },
  { cardLabel: "K", natCardLabel: "K" },
];

function getNat(player, row) {
  // Card rows: "Dragon A", "Tiger 2", "Lion K"
  if (row.natCardLabel) return `${player} ${row.natCardLabel}`;
  // Other rows: "Winner D", "Black T", "Odd L"
  return `${row.natPrefix} ${PLAYER_CODES[player]}`;
}

function RowLabel({ row }) {
  if (row.cardLabel) {
    return (
      <div className="casino-nation-name">
        <img src={`/assets/img/cards/${row.cardLabel}.png`} alt={row.cardLabel} />
      </div>
    );
  }
  if (row.isBlack) {
    return (
      <div className="casino-nation-name">
        Black
        <span className="card-icon ms-1"><span className="card-black">{"}"}</span></span>
        <span className="card-icon ms-1"><span className="card-black">{"]"}</span></span>
      </div>
    );
  }
  if (row.isRed) {
    return (
      <div className="casino-nation-name">
        Red
        <span className="card-icon ms-1"><span className="card-red">{"{"}</span></span>
        <span className="card-icon ms-1"><span className="card-red">{"["}</span></span>
      </div>
    );
  }
  return <div className="casino-nation-name">{row.label}</div>;
}

function OddsBox({ item, nat, onBetClick, exposures }) {
  const sus = isSus(item);
  const odds = sus ? 0 : (item?.b || 0);
  return (
    <div
      className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
      onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")}
    >
      <span className="casino-odds">{odds}</span>
      <ExposureSpan exposures={exposures} nat={nat} />
    </div>
  );
}

// Desktop: 3-column row (Dragon | Tiger | Lion)
function DesktopRow({ row, find, onBetClick, exposures }) {
  return (
    <div className="casino-table-row">
      <div className="casino-nation-detail">
        <RowLabel row={row} />
      </div>
      {PLAYERS.map((player) => {
        const nat = getNat(player, row);
        const item = find(nat);
        return (
          <OddsBox key={player} item={item} nat={nat} onBetClick={onBetClick} exposures={exposures} />
        );
      })}
    </div>
  );
}

// Mobile: single-column row for one player
function MobileRow({ row, player, find, onBetClick, exposures }) {
  const nat = getNat(player, row);
  const item = find(nat);
  return (
    <div className="casino-table-row">
      <div className="casino-nation-detail">
        <RowLabel row={row} />
      </div>
      <OddsBox item={item} nat={nat} onBetClick={onBetClick} exposures={exposures} />
    </div>
  );
}

export default function BetTableDTL20({ tableData = [], onBetClick, exposures = {} }) {
  const [activeTab, setActiveTab] = useState("0");
  const find = (nat) => tableData.find((d) => d.nat === nat);

  return (
    <div className="casino-table dtl20">
      {/* Desktop view: d-none d-md-flex */}
      <div className="casino-table-box d-none d-md-flex">
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail"></div>
            <div className="casino-odds-box back">Dragon</div>
            <div className="casino-odds-box back">Tiger</div>
            <div className="casino-odds-box back">Lion</div>
          </div>
          <div className="casino-table-body">
            {ROWS.map((row, i) => (
              <DesktopRow key={i} row={row} find={find} onBetClick={onBetClick} exposures={exposures} />
            ))}
          </div>
        </div>
        <div className="casino-table-right-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail"></div>
            <div className="casino-odds-box back">Dragon</div>
            <div className="casino-odds-box back">Tiger</div>
            <div className="casino-odds-box back">Lion</div>
          </div>
          <div className="casino-table-body">
            {ROWS_RIGHT.map((row, i) => (
              <DesktopRow key={i} row={row} find={find} onBetClick={onBetClick} exposures={exposures} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile view: d-xl-none tabs */}
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="pills" className="d-xl-none casino-tab-pills mb-2">
          <Nav.Item>
            <Nav.Link eventKey="0">Dragon</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="1">Tiger</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="2">Lion</Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>
          {PLAYERS.map((player, pi) => (
            <Tab.Pane key={pi} eventKey={String(pi)} className="d-xl-none">
              <div className="casino-table-box">
                <div className="casino-table-left-box">
                  <div className="casino-table-body">
                    {ROWS.map((row, i) => (
                      <MobileRow key={i} row={row} player={player} find={find} onBetClick={onBetClick} exposures={exposures} />
                    ))}
                  </div>
                </div>
                <div className="casino-table-right-box">
                  <div className="casino-table-body">
                    {ROWS_RIGHT.map((row, i) => (
                      <MobileRow key={i} row={row} player={player} find={find} onBetClick={onBetClick} exposures={exposures} />
                    ))}
                  </div>
                </div>
              </div>
            </Tab.Pane>
          ))}
        </Tab.Content>
      </Tab.Container>

      <div className="casino-remark mt-1">
        <marquee scrollamount="3"> </marquee>
      </div>
    </div>
  );
}
