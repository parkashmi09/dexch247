import { Link } from "react-router-dom";
import { useLiveBoard } from "../../hooks/useLiveBoard.js";
import HorseRacingTable from "./HorseRacingTable.jsx";

// Convert "5/25/2026 1:10:00 AM" → "25/05/2026 01:10:00"
function formatStime(stime) {
  if (!stime) return "";
  try {
    const d = new Date(stime);
    if (isNaN(d)) return stime;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${dd}/${mm}/${yy} ${hh}:${mi}:${ss}`;
  } catch {
    return stime;
  }
}

function pickOdds(section, sno) {
  const entry = section?.find((s) => s.sno === sno);
  const pair = entry?.odds ?? [];
  const back = toNum(pair[0]?.odds);
  const lay = toNum(pair[1]?.odds);
  const backVal = back > 0 ? back : "-";
  const layVal = lay > 0 ? lay : "-";
  const hasPrice = back > 0 || lay > 0;
  const gs = (entry?.gstatus || "").toUpperCase();
  const suspended = gs !== "" && gs !== "ACTIVE";
  return { back: backVal, lay: layVal, hasPrice, suspended };
}
function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// suspended: true = always add class
// noPrice: true = add class only for col 1/2 (not X) on non-cricket sports
function OddsCell({ back, lay, suspended }) {
  const cls = "bet-nation-odd" + (suspended ? " suspended-box" : "");
  return (
    <div className={cls}>
      <div className="back odd-box">
        <span className="bet-odd">
          <b>{back}</b>
        </span>
      </div>
      <div className="lay odd-box">
        <span className="bet-odd">
          <b>{lay}</b>
        </span>
      </div>
    </div>
  );
}

// Detect game type from name/gtype for icons and routing
function getGameType(game) {
  const name = game.ename || "";
  const gt = (game.gtype || "").toLowerCase();
  if (/\(e\)/.test(name)) return "tp-virtual";
  if (gt.includes("virtual") || /\bT10\b/.test(name)) return "virtual";
  if (/\bXI\b/.test(name)) return "cricketv";
  return "regular";
}

// 5 game-icon slots matching reference exactly
function GameIcons({ game }) {
  const type = getGameType(game);
  return (
    <div className="game-icons">
      <div className="game-icon">
        {game.iplay ? <span className="active"></span> : null}
      </div>
      <div className="game-icon">
        {game.tv ? <i className="fas fa-tv icon-tv"></i> : null}
      </div>
      <div className="game-icon">
        {(game.f || game.f1) && type !== "tp-virtual" ? (
          <img src="/assets/ic/ic_fancy.png" alt="fancy" />
        ) : null}
      </div>
      <div className="game-icon">
        {game.bm && type !== "tp-virtual" ? (
          <img src="/assets/ic/ic_bm.png" alt="bm" />
        ) : null}
      </div>
      <div className="game-icon ">
        {type === "tp-virtual" ? (
          <div className="game-icon e-games"><span>e</span></div>
        ) : type === "virtual" ? (
          <img src="/assets/ic/game-icon.svg" alt="virtual" />
        ) : type === "cricketv" ? (
          <img src="/assets/ic/ic_vir.png" alt="virtual" />
        ) : null}
      </div>
    </div>
  );
}

function MobileOddLabels() {
  return (
    <>
      <div className="bet-nation-odd d-xl-none">
        <b>1</b>
      </div>
      <div className="bet-nation-odd d-xl-none">
        <b>X</b>
      </div>
      <div className="bet-nation-odd d-xl-none">
        <b>2</b>
      </div>
    </>
  );
}

// Cricket: Super Over2 row (first row)
function SuperoverRow() {
  return (
    <div className="bet-table-row">
      <div className="bet-nation-name">
        <Link className="bet-nation-game-name" to="/casino/superover2">
          <span>Super Over2</span>
        </Link>
        <div className="game-icons">
          <div className="game-icon">
            <span className="active"></span>
          </div>
          <div className="game-icon">
            <i className="fas fa-tv icon-tv"></i>
          </div>
          <div className="game-icon">
            <img src="/assets/ic/ic_fancy.png" alt="fancy" />
          </div>
          <div className="game-icon">
            <div className="game-icon">
              <img src="/assets/ic/ic_bm.png" alt="bm" />
            </div>
          </div>
          <div className="game-icon"></div>
        </div>
      </div>
      <OddsCell back="-" lay="-" />
      <OddsCell back="-" lay="-" />
      <OddsCell back="-" lay="-" />
    </div>
  );
}

// Football: Goal casino row (first row)
function GoalRow() {
  return (
    <div className="bet-table-row">
      <div className="bet-nation-name">
        <Link className="bet-nation-game-name" to="/casino/goal">
          <span>Goal</span>
        </Link>
        <div className="game-icons">
          <div className="game-icon">
            <span className="active"></span>
          </div>
          <div className="game-icon">
            <i className="fas fa-tv icon-tv"></i>
          </div>
          <div className="game-icon"></div>
          <div className="game-icon"></div>
          <div className="game-icon"></div>
        </div>
      </div>
      <OddsCell back="-" lay="-" suspended />
      <OddsCell back="-" lay="-" />
      <OddsCell back="-" lay="-" suspended />
    </div>
  );
}

// Route picker based on game type
function matchHref(game) {
  const type = getGameType(game);
  switch (type) {
    case "tp-virtual":
      return `/tp-virtual-cricket/${game.etid}/${game.gmid}`;
    case "virtual":
      return `/virtual-cricket/${game.etid}/${game.gmid}`;
    case "cricketv":
      return `/cricketv/${game.etid}/${game.gmid}`;
    default:
      return `/game-details/${game.etid}/${game.gmid}`;
  }
}

function MatchRow({ game, sid }) {
  const home = pickOdds(game.section, 1);
  const draw = pickOdds(game.section, 2);
  const away = pickOdds(game.section, 3);

  // For cricket (sid=4): never show suspended-box
  // For other sports: show suspended-box when market is suspended OR no price on col 1/2
  const isCricket = sid === 4;

  const homeSuspended = !isCricket && home.suspended;
  const drawSuspended = !isCricket && draw.suspended;
  const awaySuspended = !isCricket && away.suspended;

  return (
    <div className="bet-table-row">
      <div className="bet-nation-name">
        <Link
          className="bet-nation-game-name"
          to={matchHref(game)}
          state={{ game, racing: sid === 10 || sid === 65 }}
        >
          <span>{game.ename}</span>
          <span className="d-none d-md-inline-block">&nbsp;/&nbsp;</span>
          <span>{formatStime(game.stime)}</span>
        </Link>
        <GameIcons game={game} />
      </div>
      <MobileOddLabels />
      <OddsCell back={home.back} lay={home.lay} suspended={homeSuspended} />
      <OddsCell back={draw.back} lay={draw.lay} suspended={drawSuspended} />
      <OddsCell back={away.back} lay={away.lay} suspended={awaySuspended} />
    </div>
  );
}

export default function BetTable({ sid }) {
  // Horse Racing (10) and Greyhound Racing (65) have a completely different
  // layout with venue rows and race time links instead of match odds.
  if (sid === 10 || sid === 65) {
    return <HorseRacingTable sid={sid} />;
  }

  const { data, loading, error } = useLiveBoard(sid);

  const body = (() => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center p-5">
          <i className="fa fa-spinner fa-spin fa-2x"></i>
        </div>
      );
    }
    if (error) {
      return (
        <div className="bet-table-row">No Record Found</div>
      );
    }
    if (data.length === 0) {
      return (
        <div className="bet-table-row">No Record Found</div>
      );
    }
    return (
      <>
        {sid === 4 && <SuperoverRow />}
        {sid === 1 && <GoalRow />}
        {data.map((game) => (
          <MatchRow key={game.gmid} game={game} sid={sid} />
        ))}
      </>
    );
  })();

  return (
    <div className="tab-content mt-1">
      <div className="tab-pane active">
        <div className="bet-table">
          <div className="bet-table-header">
            <div className="bet-nation-name">
              <b>Game</b>
            </div>
            <div className="bet-nation-odd">
              <b>1</b>
            </div>
            <div className="bet-nation-odd">
              <b>X</b>
            </div>
            <div className="bet-nation-odd">
              <b>2</b>
            </div>
          </div>
          <div className="bet-table-body">{body}</div>
        </div>
      </div>
    </div>
  );
}
