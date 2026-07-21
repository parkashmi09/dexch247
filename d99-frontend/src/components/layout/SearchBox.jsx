import { useEffect, useRef, useState } from "react";
import { useSportsSearch } from "../../hooks/useSportsSearch.js";
import SearchResults from "./SearchResults.jsx";

// Expandable header search box with a grouped results dropdown. Collapsed
// by default; the search-plus icon toggles the input open (desktop + mobile).
export default function SearchBox() {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const { groups, searched } = useSportsSearch(query);
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown + collapse on outside click
  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setExpanded(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleToggle = () => {
    setExpanded((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => inputRef.current?.focus(), 50);
      } else {
        setQuery("");
      }
      return next;
    });
  };

  const handleSelect = () => {
    setExpanded(false);
    setQuery("");
  };

  return (
    <div className="search-box" ref={boxRef}>
      <input
        ref={inputRef}
        type="search"
        placeholder="Search here"
        className={`form-control${expanded ? " search-input-show" : ""}`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <a onClick={handleToggle}>
        <i className="fas fa-search-plus"></i>
      </a>
      {expanded && query && searched && (
        <SearchResults groups={groups} onSelect={handleSelect} />
      )}
    </div>
  );
}
