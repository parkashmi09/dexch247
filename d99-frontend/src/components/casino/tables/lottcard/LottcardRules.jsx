import { useState } from "react";

const CARD_BASE = "/assets/img/cards";
const CARDS = [
  { img: "A", label: "1" },
  { img: "2", label: "2" },
  { img: "3", label: "3" },
  { img: "4", label: "4" },
  { img: "5", label: "5" },
  { img: "6", label: "6" },
  { img: "7", label: "7" },
  { img: "8", label: "8" },
  { img: "9", label: "9" },
  { img: "10", label: "0" },
];

const RULES_ROWS = [
  { title: "Single", desc: "Singles play can be placed between 0-9" },
  { title: "Double", desc: "Singles play can be placed between 00-99" },
  { title: "Tripple", desc: "Singles play can be placed between 000-999" },
];

function CardRow() {
  return (
    <div className="lottery-rules-cards">
      {CARDS.map((c) => (
        <div key={c.img} className="lottery-card">
          <img src={`${CARD_BASE}/${c.img}.png`} alt={c.label} />
          <div>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function LottcardRules() {
  const [activeTab, setActiveTab] = useState("rules");

  return (
    <>
      <div className="nav nav-pills" role="tablist">
        <div className="nav-item">
          <a
            role="tab"
            aria-selected={activeTab === "rules"}
            className={`nav-link ${activeTab === "rules" ? "active" : ""}`}
            onClick={(e) => { e.preventDefault(); setActiveTab("rules"); }}
            href="#"
          >
            Rules
          </a>
        </div>
        <div className="nav-item">
          <a
            role="tab"
            aria-selected={activeTab === "payout"}
            className={`nav-link ${activeTab === "payout" ? "active" : ""}`}
            onClick={(e) => { e.preventDefault(); setActiveTab("payout"); }}
            href="#"
          >
            Payout
          </a>
        </div>
      </div>

      <div className="mt-1 tab-content">
        <div
          role="tabpanel"
          className={`fade tab-pane ${activeTab === "rules" ? "active show" : ""}`}
        >
          <div className="lottery-rules-box">
            {RULES_ROWS.map((row) => (
              <div key={row.title} className="lottery-rules-row">
                <div className="lottery-rules-title-name">
                  <div>{row.title}</div>
                  <div>{row.desc}</div>
                </div>
                <CardRow />
              </div>
            ))}
          </div>
        </div>

        <div
          role="tabpanel"
          className={`fade tab-pane ${activeTab === "payout" ? "active show" : ""}`}
        >
          <div className="table-responsive">
            <h4>Game Play Payout</h4>
            <table className="table text-center">
              <thead>
                <tr>
                  <th>Point</th>
                  <th>Card</th>
                  <th>Payout</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Play Single</td><td>First Card</td><td>1 to 9.5</td></tr>
                <tr><td>Play Double</td><td>First Second Card</td><td>1 to 95</td></tr>
                <tr><td>Play Tripple</td><td>First Second Third Card</td><td>1 to 900</td></tr>
              </tbody>
            </table>
          </div>
          <div className="table-responsive mt-3">
            <h4>Play Limit</h4>
            <table className="table text-center">
              <thead>
                <tr>
                  <th>Play</th>
                  <th>Minimum Play</th>
                  <th>Maximum Play</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Singles Play</td><td>10</td><td>20K</td></tr>
                <tr><td>Doubles Play</td><td>10</td><td>5K</td></tr>
                <tr><td>Tripples Play</td><td>10</td><td>3K</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
