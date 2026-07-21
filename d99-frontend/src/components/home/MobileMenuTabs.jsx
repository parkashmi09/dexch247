import { NavLink } from "react-router-dom";
import homeData from "../../constants/homeData.json";
import AviatorIcon from "./AviatorIcon.jsx";

// Mobile-only bottom menu tabs: Aviator / Lottery / Sports / Our Casino /
// Live Casino / Slots / Fantasy. The Aviator item carries an inline SVG;
// everything else is plain text.
export default function MobileMenuTabs() {
  return (
    <ul className="nav nav-tabs d-xl-none menu-tabs">
      {homeData.mobile_menu_tabs.map((tab) => (
        <li className="nav-item" key={tab.href + tab.label}>
          <NavLink
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
            to={tab.href}
          >
            {tab.icon === "aviator" ? <AviatorIcon /> : null}
            {tab.icon === "aviator" ? (
              <span className="ms-1">{tab.label}</span>
            ) : (
              tab.label
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
