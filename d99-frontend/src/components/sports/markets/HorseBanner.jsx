import { useState, useEffect, useRef } from "react";

// Banner image base URL
const BANNER_IMG_BASE = "https://versionobj.ecoassetsservice.com/v104/static/front/img/";

// Sid → banner image mapping
function getBannerImg(sid) {
  const sidNum = Number(sid);
  if (sidNum === 65) return "4339.png";
  return "10.png"; // default for sid=10 and unknown
}

function formatRaceTime(timeStr) {
  if (!timeStr) return "";
  try {
    const d = new Date(timeStr);
    if (isNaN(d)) return timeStr;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;
  } catch {
    return timeStr;
  }
}

function useCountdown(targetTimeStr) {
  const [remaining, setRemaining] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!targetTimeStr) {
      setRemaining(null);
      return;
    }

    const update = () => {
      const target = new Date(targetTimeStr);
      if (isNaN(target)) {
        setRemaining(null);
        return;
      }
      const diff = target - Date.now();
      if (diff <= 0) {
        setRemaining({ minutes: 0, seconds: 0, past: true });
      } else {
        const totalSec = Math.floor(diff / 1000);
        setRemaining({
          minutes: Math.floor(totalSec / 60),
          seconds: totalSec % 60,
          past: false,
        });
      }
    };

    update();
    timerRef.current = setInterval(update, 1000);
    return () => clearInterval(timerRef.current);
  }, [targetTimeStr]);

  return remaining;
}

export default function HorseBanner({ matchInfo, sid, markets }) {
  const countdown = useCountdown(matchInfo?.time);

  // Get status from first market
  const status = markets?.[0]?.status || "OPEN";

  // Parse location and race details from matchInfo.name
  // matchInfo.name might be "Wagga R3 1740m Pace M" or just a gmid
  const matchName = matchInfo?.name || "";
  // Try to detect if it looks like a race name (not just a number)
  const isNumericName = /^\d+$/.test(matchName.trim());
  const raceName = isNumericName ? "" : matchName;

  return (
    <div className="horse-banner">
      <img
        src={`${BANNER_IMG_BASE}${getBannerImg(sid)}`}
        className="img-fluid"
        alt="Racing Banner"
      />
      <div className="horse-banner-detail">
        <div className={status === "SUSPENDED" ? "text-danger" : "text-success"}>
          {status}
        </div>

        <div className="horse-timer">
          {countdown && !countdown.past ? (
            <>
              <span>
                &nbsp;{countdown.minutes}&nbsp;
                <small>Minutes</small>
                &nbsp;{countdown.seconds}&nbsp;
                <small>Seconds</small>
              </span>
              <span>Remaining</span>
            </>
          ) : countdown?.past ? (
            <span>In Progress</span>
          ) : null}
        </div>

        {(matchInfo?.time || raceName) && (
          <div className="time-detail">
            {raceName && <p>{raceName}</p>}
            {matchInfo?.time && (
              <h5>
                <span>{formatRaceTime(matchInfo.time)}</span>
              </h5>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
