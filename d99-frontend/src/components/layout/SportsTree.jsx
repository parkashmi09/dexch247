import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSportsTree } from "../../hooks/useSportsTree.js";

function matchHref(match) {
  const name = match.name || "";
  const etid = match.etid;
  const gmid = match.gmid;
  if (/\(e\)/.test(name)) return `/tp-virtual-cricket/${etid}/${gmid}`;
  if (/\bT10\b/.test(name)) return `/virtual-cricket/${etid}/${gmid}`;
  if (/\bXI\b/.test(name)) return `/cricketv/${etid}/${gmid}`;
  if (match.iscc === 1) return `/virtual-cricket/${etid}/${gmid}`;
  return `/game-details/${etid}/${gmid}`;
}

function TreeNode({ label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <li className="nav-item dropdown">
      <a
        className="dropdown-toggle nav-link"
        onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        href="#"
      >
        <i className={`far ${open ? "fa-minus-square" : "fa-plus-square"} me-1`}></i>
        <span>{label}</span>
      </a>
      {open && <ul className="dropdown-menu show">{children}</ul>}
    </li>
  );
}

function MatchLeaf({ match }) {
  return (
    <li className="nav-item">
      <Link className=" dropdown-toggle nav-link" to={matchHref(match)}>
        <span>{match.name}</span>
      </Link>
    </li>
  );
}

export default function SportsTree() {
  const { sports, loading, error } = useSportsTree();

  if (loading) return <p className="text-muted p-2">Loading sports tree...</p>;
  if (error) return <p className="text-danger p-2">Error: {error}</p>;
  if (sports.length === 0) return <p className="text-muted p-2">No sports available</p>;

  return (
    <>
      {sports.map((sport) => (
        <ul className="navbar-nav" key={sport.etid + sport.name}>
          <TreeNode label={sport.name}>
            {(sport.children || []).map((comp) => (
              <TreeNode label={comp.name} key={comp.cid || comp.name}>
                {(comp.children || []).map((match) => (
                  <MatchLeaf key={match.gmid} match={match} />
                ))}
              </TreeNode>
            ))}
          </TreeNode>
        </ul>
      ))}
    </>
  );
}

// Format sdatetime "05/25/2026 02:46:00 AM" → "02:46"
function formatRaceTime(sdatetime) {
  if (!sdatetime) return "";
  try {
    const d = new Date(sdatetime);
    if (isNaN(d)) return "";
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "";
  }
}

function RacingDropdown({ sport, isOpen, onToggle }) {
  const races = sport.children || [];
  const label = sport.name || (sport.etid === 10 ? "Horse Racing" : "Greyhound Racing");

  return (
    <ul>
      <div className={`nav-item${isOpen ? " show" : ""} dropdown`}>
        <a
          id="horse-dropdown"
          aria-expanded={isOpen}
          role="button"
          className={`dropdown-toggle${isOpen ? " show" : ""} nav-link`}
          tabIndex="0"
          href="#"
          onClick={(e) => { e.preventDefault(); onToggle(); }}
        >
          {label}
        </a>
        {isOpen && (
          <div className="dropdown-menu show">
            <h5>All {label}</h5>
            <div className="horse-list-box">
              {races.map((race) => (
                <Link
                  key={race.gmid}
                  className="dropdown-item"
                  to={`/game-details/${race.etid}/${race.gmid}`}
                  state={{ racing: true }}
                >
                  <p className="dropdown-item">
                    {formatRaceTime(race.sdatetime)}&nbsp;{race.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </ul>
  );
}

export function RacingSportsTree() {
  const { racing, loading } = useSportsTree();
  const [openEtid, setOpenEtid] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!openEtid) return;
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenEtid(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openEtid]);

  if (loading || racing.length === 0) {
    return (
      <>
        <ul>
          <div className="nav-item dropdown">
            <a className="dropdown-toggle nav-link" role="button" href="#">Horse Racing</a>
          </div>
        </ul>
        <ul>
          <div className="nav-item dropdown">
            <a className="dropdown-toggle nav-link" role="button" href="#">Greyhound Racing</a>
          </div>
        </ul>
      </>
    );
  }

  return (
    <div ref={containerRef}>
      {racing.map((sport) => (
        <RacingDropdown
          key={sport.etid}
          sport={sport}
          isOpen={openEtid === sport.etid}
          onToggle={() => setOpenEtid(openEtid === sport.etid ? null : sport.etid)}
        />
      ))}
    </div>
  );
}
