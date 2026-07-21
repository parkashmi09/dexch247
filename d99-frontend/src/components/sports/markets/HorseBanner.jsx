import { useState, useEffect, useRef } from "react";
import { parseFeedIstTime, formatFeedIstTime } from "../../../utils/gameDetailsUtils.js";

// Banner image base URL
const BANNER_IMG_BASE = "https://versionobj.ecoassetsservice.com/v104/static/front/img/";

// Sid → banner image mapping
function getBannerImg(sid) {
  const sidNum = Number(sid);
  if (sidNum === 65) return "4339.png";
  return "10.png"; // default for sid=10 and unknown
}

// The feed time is IST wall-clock with no zone marker, so the countdown has to
// parse it explicitly — `new Date(stime)` resolves it in the VIEWER's timezone
// and was only correct for users in India.
function useCountdown(targetTimeStr) {
  const [remaining, setRemaining] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!targetTimeStr) {
      setRemaining(null);
      return;
    }

    const update = () => {
      const target = parseFeedIstTime(targetTimeStr);
      if (target == null) {
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

  // Racing boards nest country → venue → race, so the banner title is built
  // from those (e.g. "US > Louisiana Downs"). The RACE title itself
  // ("R4 1m Mdn Claim") is not published by this provider — it appears only if
  // a feed ever supplies one.
  const country = matchInfo?.country || "";
  const venue = matchInfo?.venue || "";
  const location = [country, venue].filter(Boolean).join(" > ");
  const matchName = matchInfo?.name || "";
  const isNumericName = /^\d+$/.test(matchName.trim());
  const raceName = location || (isNumericName ? "" : matchName);

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
                {/* Racecard time — the IST parts reformatted, NOT converted, so
                    every viewer sees what the racecard says. */}
                <span>{formatFeedIstTime(matchInfo.time)}</span>
              </h5>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
