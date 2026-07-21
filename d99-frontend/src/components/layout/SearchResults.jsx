import { Link } from "react-router-dom";

// "6/4/2026 5:30:00 PM" → "04/06/2026 17:30:00" (reference format)
export function formatGameDate(stime) {
  if (!stime) return "";
  const d = new Date(stime);
  if (isNaN(d.getTime())) return stime;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Grouped search-results dropdown (`.search-list`). Shared by the header
 * SearchBox and the mobile sidebar search.
 */
export default function SearchResults({ groups, onSelect }) {
  return (
    <div className="search-list">
      {groups.length > 0 ? (
        groups.map((group) => (
          <div key={group.sportName} style={{ width: "100%" }}>
            <div className="search-game-name">
              <b>{group.sportName}</b>
            </div>
            {group.events.map((ev) => (
              <Link
                to={`/game-details/${ev.etid}/${ev.gmid}`}
                key={ev.gmid}
                onClick={onSelect}
              >
                <div className="search-list-item">
                  <div className="search-tournament-name">
                    <b>{ev.ename || ev.name}</b>
                  </div>
                  <div className="search-game-date">
                    {formatGameDate(ev.stime)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))
      ) : (
        <div className="search-list-item">No results found</div>
      )}
    </div>
  );
}
