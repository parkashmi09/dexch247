import { useState } from "react";
import { Link } from "react-router-dom";
import { useRacingBoard } from "../../hooks/useRacingBoard.js";

/**
 * Formats a race stime string (e.g. "12/18/2025 5:30:00 AM") to "HH:mm" (24h).
 */
function formatRaceTime(stime) {
  if (!stime) return "";
  try {
    const d = new Date(stime);
    if (isNaN(d.getTime())) return stime;
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return stime;
  }
}

/**
 * A single venue row: TV icon + venue name + race time links.
 * The first race time gets the "active" span class (green corner indicator).
 */
function VenueRow({ venue, sid }) {
  const races = Array.isArray(venue.children) ? venue.children : [];
  if (races.length === 0) return null;

  return (
    <div className="bet-table-row">
      <div className="bet-nation-name">
        <div className="game-icon">
          <i className="fas fa-tv icon-tv"></i>
        </div>
        <div className="bet-nation-game-name">
          <span>{venue.ename}</span>
        </div>
      </div>
      <div className="horse-time-detail">
        {races.map((race, idx) => (
          <Link
            key={race.gmid || idx}
            to={`/game-details/${sid}/${race.gmid}`}
            state={{ racing: true }}
          >
            <span className={idx === 0 ? "active" : ""}>
              {formatRaceTime(race.stime)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Country tab content — all venues for a given country.
 */
function CountryContent({ country, sid }) {
  const venues = Array.isArray(country.children) ? country.children : [];
  if (venues.length === 0) {
    return (
      <div className="bet-table-row">
        <div className="bet-nation-name">No races available</div>
      </div>
    );
  }
  return venues.map((venue, idx) => (
    <VenueRow key={venue.gmid || venue.ename || idx} venue={venue} sid={sid} />
  ));
}

/**
 * HorseRacingTable — rendered instead of the regular BetTable when sid is 10
 * (Horse Racing) or 65 (Greyhound Racing).
 *
 * Layout matches the reference HTML exactly:
 *   - Country tabs at top (nav-pills inside tab-content)
 *   - horse-table class on the bet-table
 *   - venue rows with TV icon + venue name + race time links
 */
export default function HorseRacingTable({ sid }) {
  const { countries, loading, error } = useRacingBoard(sid);
  const [activeTab, setActiveTab] = useState(0);

  if (loading) {
    return (
      <div className="tab-content mt-1">
        <div className="tab-pane active">
          <div className="bet-table position-relative horse-table">
            <div className="bet-table-body">
              <div className="bet-table-row">
                <div className="bet-nation-name">Loading…</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || countries.length === 0) {
    return (
      <div className="tab-content mt-1">
        <div className="tab-pane active">
          <div className="bet-table position-relative horse-table">
            <div className="bet-table-body">
              <div className="bet-table-row">
                <div className="bet-nation-name">No Record Found</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const safeTab = activeTab < countries.length ? activeTab : 0;
  const activeCountry = countries[safeTab];

  return (
    <div className="tab-content mt-1">
      <div className="tab-pane active">
        {/* Country tabs */}
        <div className="nav nav-pills" role="tablist">
          {countries.map((country, idx) => (
            <div className="nav-item" key={country.cid || idx}>
              <a
                role="tab"
                className={"nav-link" + (safeTab === idx ? " active" : "")}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(idx);
                }}
              >
                {country.cname || "Unknown"}
              </a>
            </div>
          ))}
        </div>

        {/* Venue rows */}
        <div className="tab-content">
          <div className="fade tab-pane active show">
            <div className="bet-table position-relative horse-table">
              <div className="bet-table-body">
                {activeCountry && (
                  <CountryContent country={activeCountry} sid={sid} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
