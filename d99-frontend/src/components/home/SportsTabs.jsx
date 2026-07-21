import homeData from "../../constants/homeData.json";

// `iconId` from the reference dump matches the real backend `sid`
// (Cricket=4, Politics=40, Football=1, Tennis=2, …). So we track the
// active tab by sid instead of by index.
export default function SportsTabs({ activeSid, onChange }) {
  return (
    <ul className="nav nav-pills sports-tab">
      {homeData.sports_tabs.map((tab) => (
        <li className="nav-item" key={tab.name}>
          <a
            className={"nav-link" + (tab.iconId === activeSid ? " active" : "")}
            onClick={(e) => {
              e.preventDefault();
              // Auto-scroll the clicked tab fully into view (edge tabs like
              // Snooker/Darts are only half visible until scrolled).
              e.currentTarget.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
              });
              onChange?.(tab.iconId);
            }}
            href="#"
          >
            <div className="d-xl-none">
              <i className={`icon icon-${tab.iconId}`}></i>
            </div>
            <span>{tab.name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
