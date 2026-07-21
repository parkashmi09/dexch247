import { Link } from "react-router-dom";

/**
 * Desktop left sidebar with vertical nav pills.
 * Hidden on mobile via d-none d-xl-flex (configurable).
 *
 * @param {Array} tabs - [{ id, label, to }]
 * @param {string} activeId - currently active tab id
 * @param {string} [listClassName] - class for <ul> (default: "nav nav-pills casino-sub-tab")
 * @param {boolean} [hideOnMobile] - add d-none d-xl-flex (default: true)
 */
export default function SidebarTabs({
  tabs,
  activeId,
  listClassName = "nav nav-pills casino-sub-tab",
  hideOnMobile = true,
}) {
  return (
    <div className={`col-xl-2${hideOnMobile ? " d-none d-xl-flex" : ""}`}>
      <ul className={listClassName}>
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
    </div>
  );
}
