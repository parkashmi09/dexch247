import { useState } from "react";
import { Link } from "react-router-dom";
import SportsTree, { RacingSportsTree } from "./SportsTree.jsx";
import SearchResults from "./SearchResults.jsx";
import { useSportsSearch } from "../../hooks/useSportsSearch.js";

function Accordion({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="accordion">
      <div className="accordion-item">
        <h2 className="sidebar-title accordion-header">
          <button
            type="button"
            aria-expanded={open}
            className={"accordion-button" + (open ? "" : " collapsed")}
            onClick={() => setOpen(!open)}
          >
            {title}
          </button>
        </h2>
        {open && (
          <div className="accordion-collapse collapse show">{children}</div>
        )}
      </div>
    </div>
  );
}

const OTHERS = [
  { href: "/casino-list/LC/4",  label: "Our Casino",         blink: true  },
  { href: "/casino-list/LC/45", label: "Our VIP Casino",     blink: true  },
  { href: "/casino-list/LC/52", label: "Our Premium Casino", blink: true  },
  { href: "/casino-list/LC/19", label: "Our Virtual",        blink: true  },
  { href: "/live-casino-list/CS/24", label: "Live Casino",   blink: false },
  { href: "/slot-list",         label: "Slot Game",          blink: false },
  { href: "/fantasy-list",      label: "Fantasy Game",       blink: false },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const [query, setQuery] = useState("");
  const { groups, searched } = useSportsSearch(query);

  const handleSelect = () => {
    setQuery("");
    setSidebarOpen(false);
  };

  const handleClose = () => {
    setQuery("");
    setSidebarOpen(false);
  };

  return (
    <>
      <div className={"sidebar left-sidebar" + (sidebarOpen ? " visible" : "")}>
        <div className="d-xl-none p-2 sidebar-search search-box-container">
          <div className="form-group">
            <input
              type="search"
              placeholder="Search here"
              className="form-control"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="search-box">
              {query && searched && (
                <SearchResults groups={groups} onSelect={handleSelect} />
              )}
            </div>
          </div>
          <div className="close-sidebar" onClick={handleClose}>
            <i className="far fa-times-circle"></i>
          </div>
        </div>

        <Accordion title="Racing Sports">
          <div className="racing-sport accordion-body">
            <RacingSportsTree />
          </div>
        </Accordion>

        <Accordion title="Others">
          <div className="other-casino-list accordion-body">
            <ul>
              {OTHERS.map((item) => (
                <li className="nav-item" key={item.href}>
                  <Link className="nav-link" to={item.href}>
                    <span className={item.blink ? "blink_me" : ""}>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Accordion>

        <Accordion title="All Sports">
          <div className="menu-box accordion-body">
            <SportsTree />
          </div>
        </Accordion>
      </div>
      <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>
    </>
  );
}
