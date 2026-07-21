import { useState, useEffect } from "react";

// Each market has a scheduled hour:minute (24h) on the current or next day
const MATKA_MARKETS = [
  { id: "lords-close", name: "Lords Close", hour: 12, minute: 0 },
  { id: "riga-open", name: "Riga Open", hour: 13, minute: 0 },
  { id: "riga-close", name: "Riga Close", hour: 14, minute: 0 },
  { id: "asia-open", name: "Asia Open", hour: 15, minute: 0 },
  { id: "asia-close", name: "Asia Close", hour: 16, minute: 0 },
  { id: "taj-open", name: "Taj Open", hour: 17, minute: 0 },
  { id: "taj-close", name: "Taj Close", hour: 18, minute: 0 },
  { id: "gulf-open", name: "Gulf Open", hour: 19, minute: 0 },
  { id: "gulf-close", name: "Gulf Close", hour: 20, minute: 0 },
  { id: "diamond-open", name: "Diamond Open", hour: 21, minute: 0 },
  { id: "diamond-close", name: "Diamond Close", hour: 22, minute: 0 },
  { id: "world-open", name: "World Open", hour: 23, minute: 0 },
  { id: "world-close", name: "World Close", hour: 23, minute: 55 },
  { id: "lords-open", name: "Lords Open", hour: 11, minute: 0, nextDay: true },
];

const CLOCK_IMG = "https://versionobj.ecoassetsservice.com/v103/static/front/img/clock.png";

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatGameTime(date) {
  const day = pad(date.getDate());
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mon = months[date.getMonth()];
  const yr = String(date.getFullYear()).slice(2);
  let hours = date.getHours();
  const mins = pad(date.getMinutes());
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day} ${mon} ${yr} ${pad(hours)}:${mins} ${ampm}`;
}

function getScheduledDate(market) {
  const now = new Date();
  const target = new Date(now);
  target.setHours(market.hour, market.minute, 0, 0);
  if (market.nextDay || target <= now) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

function getRemainingTime(target) {
  const diff = target - Date.now();
  if (diff <= 0) return "00:00:00";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function MatkaTabsList({ activeTab, onTabChange, markets }) {
  const items = markets?.length ? markets : MATKA_MARKETS;
  const [, setTick] = useState(0);

  // Re-render every second for countdown
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="matka-tabs">
      <ul className="nav nav-pills">
        {items.map((market) => {
          const target = getScheduledDate(market);
          const remaining = getRemainingTime(target);
          const gameTime = formatGameTime(target);

          return (
            <li key={market.id} className="nav-item">
              <a
                className={`nav-link${activeTab === market.id ? " active" : ""}`}
                href="#"
                onClick={(e) => { e.preventDefault(); onTabChange(market.id); }}
              >
                <span>{market.name}</span>
                <div className="remaining-time">
                  <img src={CLOCK_IMG} alt="Clock Icon" />
                  <span>{market.remaining || remaining}</span>
                </div>
                <div className="game-time">
                  <span>{market.time || gameTime}</span>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
