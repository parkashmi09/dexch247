import { useRef, useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ScrollableTabs({
  tabs,
  activeId,
  className = "casino-sub-tab-list",
  listId,
  listClassName = "nav nav-pills casino-sub-tab",
  hideArrows = false,
}) {
  const ref = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = ref.current;
    if (el) setHasOverflow(el.scrollWidth > el.clientWidth + 1);
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [checkOverflow, tabs]);

  const scrollLeft = useCallback(() => {
    ref.current?.scrollBy({ left: -120, behavior: "smooth" });
  }, []);

  const scrollRight = useCallback(() => {
    ref.current?.scrollBy({ left: 120, behavior: "smooth" });
  }, []);

  if (tabs.length === 0) return null;

  const showArrows = !hideArrows && hasOverflow;

  return (
    <div className={className}>
      {showArrows && (
        <a className="tabs-arow tabs-arow-left" onClick={scrollLeft} role="button">
          <i className="fas fa-angle-left" />
        </a>
      )}
      <ul className={listClassName} id={listId} ref={ref}>
        {tabs.map((tab) => (
          <li className="nav-item" key={tab.id}>
            <Link
              className={`nav-link${String(activeId) === String(tab.id) ? " active" : ""}`}
              to={tab.to}
            >
              <span>{tab.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      {showArrows && (
        <a className="tabs-arow tabs-arow-right" onClick={scrollRight} role="button">
          <i className="fas fa-angle-right" />
        </a>
      )}
    </div>
  );
}
