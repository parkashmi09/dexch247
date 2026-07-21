import { Link } from "react-router-dom";
import { useLatestEvents } from "../../hooks/useLatestEvents.js";

// Hot-events strip. Rendered twice like the reference: a mobile variant
// (d-xl-none, icon without me-1) and a desktop variant (d-none d-xl-flex).
export default function LatestEvents({ variant = "desktop" }) {
  const events = useLatestEvents();

  if (events.length === 0) return null;

  const isMobile = variant === "mobile";

  return (
    <div className={`latest-event ${isMobile ? "d-xl-none" : "d-none d-xl-flex"}`}>
      {events.map((ev) => (
        <div className={`latest-event-item${isMobile ? "" : " "}`} key={ev.gmid}>
          <Link className="blink_me" to={`/game-details/${ev.etid}/${ev.gmid}`} state={{ racing: ev.etid === 10 || ev.etid === 65 }}>
            <i className={`d-icon ${isMobile ? "" : "me-1 "}icon-${ev.etid}`}></i>
            <span>{ev.ename}</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
