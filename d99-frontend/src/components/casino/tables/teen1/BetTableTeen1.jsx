function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExpBook({ value, className = "" }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  if (isNaN(n) || n === 0) return null;
  return (
    <div className={`casino-nation-book ${n >= 0 ? "text-success" : "text-danger"}${className ? " " + className : ""}`}>
      {n}
    </div>
  );
}

function isSus(item) {
  return !item || item.gstatus !== "OPEN";
}

export default function BetTableTeen1({ tableData = [], onBetClick, exposures = {} }) {
  const find = (nat) => tableData.find((d) => d.nat === nat);

  const player = find("Player");
  const dealer = find("Dealer");
  const upPlayer = find("7 Up Player");
  const downPlayer = find("7 Down Player");
  const upDealer = find("7 Up Dealer");
  const downDealer = find("7 Down Dealer");

  const playerSus = isSus(player);
  const dealerSus = isSus(dealer);
  const playerUpDownSus = isSus(upPlayer) && isSus(downPlayer);
  const dealerUpDownSus = isSus(upDealer) && isSus(downDealer);

  const expPlayer = getExp(exposures, "Player");
  const expDealer = getExp(exposures, "Dealer");
  const expUpPlayer = getExp(exposures, "7 Up Player");
  const expDownPlayer = getExp(exposures, "7 Down Player");
  const expUpDealer = getExp(exposures, "7 Up Dealer");
  const expDownDealer = getExp(exposures, "7 Down Dealer");

  return (
    <div className="casino-table">
      {/* Player / Dealer back + lay */}
      <div className="casino-table-box">
        <div className="casino-table-left-box">
          <div className="casino-table-body">
            <div className="casino-table-row">
              <div className="casino-nation-detail">
                <div className="casino-nation-name">Player</div>
                <ExpBook value={expPlayer} />
              </div>
              <div
                className={`casino-odds-box back${playerSus ? " suspended-box" : ""}`}
                onClick={() => !playerSus && player?.b > 0 && onBetClick?.(player.b, player.nat, player, "back")}
              >
                <span className="casino-odds">{playerSus ? 0 : (player?.b || 0)}</span>
              </div>
              <div
                className={`casino-odds-box lay${playerSus ? " suspended-box" : ""}`}
                onClick={() => !playerSus && player?.l > 0 && onBetClick?.(player.l, player.nat, player, "lay")}
              >
                <span className="casino-odds">{playerSus ? 0 : (player?.l || 0)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="casino-table-box-divider"></div>
        <div className="casino-table-right-box">
          <div className="casino-table-body">
            <div className="casino-table-row">
              <div className="casino-nation-detail">
                <div className="casino-nation-name">Dealer</div>
                <ExpBook value={expDealer} />
              </div>
              <div
                className={`casino-odds-box back${dealerSus ? " suspended-box" : ""}`}
                onClick={() => !dealerSus && dealer?.b > 0 && onBetClick?.(dealer.b, dealer.nat, dealer, "back")}
              >
                <span className="casino-odds">{dealerSus ? 0 : (dealer?.b || 0)}</span>
              </div>
              <div
                className={`casino-odds-box lay${dealerSus ? " suspended-box" : ""}`}
                onClick={() => !dealerSus && dealer?.l > 0 && onBetClick?.(dealer.l, dealer.nat, dealer, "lay")}
              >
                <span className="casino-odds">{dealerSus ? 0 : (dealer?.l || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seven Up/Down box — Player + Dealer */}
      <div className="casino-table-box mt-3 sevenupbox">
        {/* Player side */}
        <div className="casino-table-left-box">
          <h4 className="d-md-none mb-2">Player</h4>
          <div className="seven-up-down-box">
            {/* up-box shows DOWN label; maps to 7 Down Player */}
            <div
              className={`up-box${isSus(downPlayer) ? " suspended-box" : ""}`}
              onClick={() => !isSus(downPlayer) && downPlayer?.b > 0 && onBetClick?.(downPlayer.b, downPlayer.nat, downPlayer, "back")}
              style={{ cursor: isSus(downPlayer) ? "default" : "pointer" }}
            >
              <ExpBook value={expDownPlayer} className="up-down-book" />
              <div className="text-end">
                <div className="up-down-odds">{downPlayer?.b || 0}</div>
                <span>DOWN</span>
              </div>
            </div>
            {/* down-box shows UP label; maps to 7 Up Player */}
            <div
              className={`down-box${isSus(upPlayer) ? " suspended-box" : ""}`}
              onClick={() => !isSus(upPlayer) && upPlayer?.b > 0 && onBetClick?.(upPlayer.b, upPlayer.nat, upPlayer, "back")}
              style={{ cursor: isSus(upPlayer) ? "default" : "pointer" }}
            >
              <ExpBook value={expUpPlayer} className="up-down-book" />
              <div className="text-start">
                <div className="up-down-odds">{upPlayer?.b || 0}</div>
                <span>UP</span>
              </div>
            </div>
            <div className="seven-box">
              <img src="/assets/img/trape-seven.png" alt="7" />
            </div>
          </div>
        </div>
        <div className="casino-table-box-divider"></div>
        {/* Dealer side */}
        <div className="casino-table-right-box">
          <h4 className="d-md-none mb-2">Dealer</h4>
          <div className="seven-up-down-box">
            <div
              className={`up-box${isSus(downDealer) ? " suspended-box" : ""}`}
              onClick={() => !isSus(downDealer) && downDealer?.b > 0 && onBetClick?.(downDealer.b, downDealer.nat, downDealer, "back")}
              style={{ cursor: isSus(downDealer) ? "default" : "pointer" }}
            >
              <ExpBook value={expDownDealer} className="up-down-book" />
              <div className="text-end">
                <div className="up-down-odds">{downDealer?.b || 0}</div>
                <span>DOWN</span>
              </div>
            </div>
            <div
              className={`down-box${isSus(upDealer) ? " suspended-box" : ""}`}
              onClick={() => !isSus(upDealer) && upDealer?.b > 0 && onBetClick?.(upDealer.b, upDealer.nat, upDealer, "back")}
              style={{ cursor: isSus(upDealer) ? "default" : "pointer" }}
            >
              <ExpBook value={expUpDealer} className="up-down-book" />
              <div className="text-start">
                <div className="up-down-odds">{upDealer?.b || 0}</div>
                <span>UP</span>
              </div>
            </div>
            <div className="seven-box">
              <img src="/assets/img/trape-seven.png" alt="7" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
