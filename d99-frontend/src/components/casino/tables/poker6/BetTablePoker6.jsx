import { useState } from "react";
import { Nav, Tab } from "react-bootstrap";

function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExpBook({ value }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  if (isNaN(n) || n === 0) return null;
  return <div className={`casino-nation-book ${n >= 0 ? "text-success" : "text-danger"}`}>{n}</div>;
}

// Unicode suits for card icons
const SUIT_INFO = { SS: { sym: "♠", cls: "card-black" }, CC: { sym: "♣", cls: "card-black" }, HH: { sym: "♥", cls: "card-red" }, DD: { sym: "♦", cls: "card-red" } };

function parseCardToken(token) {
  if (!token || token === "1" || token === "0") return null;
  const t = token.trim();
  for (const [suffix, info] of Object.entries(SUIT_INFO)) {
    if (t.endsWith(suffix)) return { value: t.slice(0, -2), sym: info.sym, cls: info.cls };
  }
  return null;
}

function CardIcon({ token }) {
  const parsed = parseCardToken(token);
  if (!parsed) return null;
  return (
    <span className="card-icon ms-2">
      {parsed.value}<span className={`${parsed.cls} ms-1`}>{parsed.sym}</span>
    </span>
  );
}

const PATTERNS = ["High Card", "Pair", "Two Pair", "Three of a Kind", "Straight", "Flush", "Full House", "Four of a Kind", "Straight Flush"];

export default function BetTablePoker6({ tableData = [], onBetClick, exposures = {}, cardString = "" }) {
  const isSus = (item) => !item || item.gstatus !== "OPEN";
  const tokens = cardString.split(",").map((t) => t.trim());

  // Player cards: each player gets 2 cards, indices 0-11
  const getPlayerCards = (playerIndex) => {
    const cards = [];
    const idx1 = playerIndex * 2;
    const idx2 = playerIndex * 2 + 1;
    if (tokens[idx1] && tokens[idx1] !== "1" && tokens[idx1] !== "0") cards.push(tokens[idx1]);
    if (tokens[idx2] && tokens[idx2] !== "1" && tokens[idx2] !== "0") cards.push(tokens[idx2]);
    return cards;
  };

  const findItem = (nat) => tableData.find((d) => d.nat === nat) || tableData.find((d) => d.nat?.toLowerCase() === nat.toLowerCase());

  return (
    <div className="casino-table">
      <Tab.Container defaultActiveKey="hands">
        <Nav variant="pills" className="mb-1">
          <Nav.Item><Nav.Link eventKey="hands">Hands</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="pattern">Pattern</Nav.Link></Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="hands" className="hands">
            <div className="row row5">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const item = findItem(`Player ${num}`);
                const sus = isSus(item);
                const openCards = getPlayerCards(num - 1);
                return (
                  <div key={num} className="col-md-6">
                    <div className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
                      onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}>
                      <div className="casino-nation-name">
                        Player {num}
                        {openCards.length > 0 && (
                          <div className="patern-name ms-3">
                            {openCards.map((token, ci) => <CardIcon key={ci} token={token} />)}
                          </div>
                        )}
                      </div>
                      <div><span className="casino-odds">{item?.b || 0}</span></div>
                      <ExpBook value={getExp(exposures, item?.nat)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Tab.Pane>
          <Tab.Pane eventKey="pattern" className="pattern">
            <div className="row row5">
              {PATTERNS.map((name) => {
                const item = findItem(name);
                const sus = isSus(item);
                return (
                  <div key={name} className="col-md-4 col-6">
                    <div className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
                      onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}>
                      <div className="casino-nation-name">{name}</div>
                      <div><span className="casino-odds">{item?.b || 0}</span></div>
                      <ExpBook value={getExp(exposures, item?.nat)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
}
