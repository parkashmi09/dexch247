import { memo, useState } from "react";
import { Nav, Tab } from "react-bootstrap";
import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

const CARD_BASE = "/assets/img/cards/";
const ICON_BASE = "/assets/img/icons/";

function cardSrc(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `${CARD_BASE}${token.trim()}.jpg`;
}

function parseCards(str) {
  if (!str) return [];
  return str.split(",").map((c) => c.trim());
}

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
}

function isSusp(item) {
  return !item || item.gstatus === "SUSPENDED" || item.gstatus === "0" || item.gstatus !== "OPEN";
}

function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExposureSpan({ nat, exposures }) {
  const val = getExp(exposures, nat);
  if (val === null || val === undefined) return null;
  const n = parseFloat(val);
  if (isNaN(n) || n === 0) return null;
  return (
    <span
      className="d-block text-center"
      style={{ fontSize: "10px", fontWeight: "bold", color: n >= 0 ? "var(--text-success, #00aa00)" : "var(--text-danger, #ff0000)" }}
    >
      {n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2)}
    </span>
  );
}

function getPlayerItems(sub, n) {
  return {
    winner: findByNat(sub, `Winner ${n}`),
    black: findByNat(sub, `Black ${n}`),
    red: findByNat(sub, `Red ${n}`),
    odd: findByNat(sub, `Odd ${n}`),
    even: findByNat(sub, `Even ${n}`),
    spade: findByNat(sub, `Spade ${n}`),
    heart: findByNat(sub, `Heart ${n}`),
    club: findByNat(sub, `Club ${n}`),
    diamond: findByNat(sub, `Diamond ${n}`),
  };
}

const PLAYERS = [1, 2, 3, 4, 5, 6];

const OddsCell = memo(function OddsCell({ item, nat, onBet, exposures }) {
  const susp = isSusp(item);
  return (
    <div
      className={`casino-odds-box back${susp ? " suspended-box" : ""}`}
      onClick={susp ? undefined : () => onBet(item.b, item.nat, item, "back")}
      style={{ cursor: susp ? "default" : "pointer" }}
    >
      <span className="casino-odds">{item?.b ?? 0}</span>
      <ExposureSpan nat={nat || item?.nat} exposures={exposures} />
    </div>
  );
});

function MobilePlayerPanel({ p, n, onBet, exposures }) {
  const leftRows = [
    { key: "winner", label: "Winner" },
    {
      key: "black",
      label: (
        <>
          <span>Black</span>
          <span className="card-icon ms-1"><span className="card-black">{"}"}</span></span>
          <span className="card-icon ms-1"><span className="card-black">{"]"}</span></span>
        </>
      ),
    },
    {
      key: "red",
      label: (
        <>
          <span>Red</span>
          <span className="card-icon ms-1"><span className="card-red">{"{"}</span></span>
          <span className="card-icon ms-1"><span className="card-red">{"["}</span></span>
        </>
      ),
    },
    { key: "odd", label: "Odd" },
    { key: "even", label: "Even" },
  ];
  const rightRows = [
    { key: "spade", label: <img src={`${ICON_BASE}spade.png`} alt="spade" /> },
    { key: "club", label: <img src={`${ICON_BASE}club.png`} alt="club" /> },
    { key: "heart", label: <img src={`${ICON_BASE}heart.png`} alt="heart" /> },
    { key: "diamond", label: <img src={`${ICON_BASE}diamond.png`} alt="diamond" /> },
  ];

  return (
    <div className="casino-table-body">
      <div className="row row5">
        <div className="col-6">
          {leftRows.map(({ key, label }) => {
            const item = p[key];
            const susp = isSusp(item);
            return (
              <div key={key} className="casino-table-row">
                <div className="casino-nation-detail">
                  <div className="casino-nation-name">{label}</div>
                </div>
                <div
                  className={`casino-odds-box back${susp ? " suspended-box" : ""}`}
                  onClick={susp ? undefined : () => onBet(item.b, item.nat, item, "back")}
                  style={{ cursor: susp ? "default" : "pointer" }}
                >
                  <span className="casino-odds">{item?.b ?? 0}</span>
                  <ExposureSpan nat={item?.nat} exposures={exposures} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="col-6">
          {rightRows.map(({ key, label }) => {
            const item = p[key];
            const susp = isSusp(item);
            return (
              <div key={key} className="casino-table-row">
                <div className="casino-nation-detail">
                  <div className="casino-nation-name casino-card-img">{label}</div>
                </div>
                <div
                  className={`casino-odds-box back${susp ? " suspended-box" : ""}`}
                  onClick={susp ? undefined : () => onBet(item.b, item.nat, item, "back")}
                  style={{ cursor: susp ? "default" : "pointer" }}
                >
                  <span className="casino-odds">{item?.b ?? 0}</span>
                  <ExposureSpan nat={item?.nat} exposures={exposures} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const BetTableWar = memo(function BetTableWar({ gameData, onBet, exposures = {} }) {
  const raw = gameData?.data?.data || gameData?.data || gameData || {};
  const sub = raw.sub || [];
  const cardString = raw.card ?? "";
  const handleBet = onBet || (() => {});
  const [activeTab, setActiveTab] = useState("0");

  const codes = parseCards(cardString);
  const playerCards = PLAYERS.map((_, i) => codes[i] || "1");
  const players = PLAYERS.map((n) => getPlayerItems(sub, n));

  const desktopRows = [
    { key: "winner", label: <span>Winner</span> },
    {
      key: "black",
      label: (
        <>
          <span>Black</span>
          <span className="card-icon ms-1"><span className="card-black">{"}"}</span></span>
          <span className="card-icon ms-1"><span className="card-black">{"]"}</span></span>
        </>
      ),
    },
    {
      key: "red",
      label: (
        <>
          <span>Red</span>
          <span className="card-icon ms-1"><span className="card-red">{"{"}</span></span>
          <span className="card-icon ms-1"><span className="card-red">{"["}</span></span>
        </>
      ),
    },
    { key: "odd", label: <span>Odds</span> },
    { key: "even", label: <span>Even</span> },
    { key: "spade", label: <img src={`${ICON_BASE}spade.png`} alt="spade" /> },
    { key: "heart", label: <img src={`${ICON_BASE}heart.png`} alt="heart" /> },
    { key: "club", label: <img src={`${ICON_BASE}club.png`} alt="club" /> },
    { key: "diamond", label: <img src={`${ICON_BASE}diamond.png`} alt="diamond" /> },
  ];

  return (
    <div className="casino-table casino-war">
      {/* Card header — flip cards for 6 players */}
      <div className="casino-table-header w-100">
        <div className="casino-nation-detail" />
        {PLAYERS.map((n, i) => (
          <div key={n} className="casino-odds-box">
            <FlipCard src={cardSrc(playerCards[i])} />
          </div>
        ))}
      </div>

      {/* Desktop: 6-column grid */}
      <div className="casino-table-full-box d-none d-md-block">
        <div className="casino-table-header">
          <div className="casino-nation-detail" />
          {PLAYERS.map((n) => (
            <div key={n} className="casino-odds-box">
              <b>{n}</b>
            </div>
          ))}
        </div>
        <div className="casino-table-body">
          {desktopRows.map(({ key, label }) => (
            <div key={key} className="casino-table-row">
              <div className="casino-nation-detail">
                <div className="casino-nation-name">{label}</div>
              </div>
              {players.map((p, i) => (
                <OddsCell
                  key={PLAYERS[i]}
                  item={p[key]}
                  nat={p[key]?.nat}
                  onBet={handleBet}
                  exposures={exposures}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: tab-based */}
      <div className="casino-table-full-box d-md-none">
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Nav variant="tabs" className="menu-tabs d-xl-none">
            {PLAYERS.map((n) => (
              <Nav.Item key={n}>
                <Nav.Link eventKey={String(n - 1)}>{n}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
          <Tab.Content>
            {PLAYERS.map((n, i) => (
              <Tab.Pane key={n} eventKey={String(i)}>
                <MobilePlayerPanel
                  p={players[i]}
                  n={n}
                  onBet={handleBet}
                  exposures={exposures}
                />
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
});

export default BetTableWar;
