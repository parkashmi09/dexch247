import React from "react";
import styles from "./MyBet.module.css";
import GroupedBetsTable from "../../game-details/GroupedBetsTable";

function formatBetDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${h}:${m}:${s}`;
  } catch {
    return dateStr;
  }
}

/**
 * Group bets by market/description and bet type for table display (same as game-details).
 * Supports API shape (description, game_type) and formatted shape (marketType, type).
 * Returns array of { marketType, betType, borderClass, date, bets } sorted by newest first.
 */
function groupBetsForTable(bets) {
  if (!bets || !bets.length) return [];
  const map = new Map();
  bets.forEach((bet) => {
    const marketType =
      bet.description ??
      bet.market_type ??
      bet.marketType ??
      "Casino";
    const betType = (
      bet.game_type ??
      bet.bet_type ??
      bet.betType ??
      bet.type ??
      "back"
    ).toLowerCase();
    const key = `${marketType}|${betType}`;
    if (!map.has(key)) {
      map.set(key, {
        marketType,
        betType,
        borderClass: betType === "lay" ? "lay-border" : "back-border",
        bets: [],
      });
    }
    map.get(key).bets.push(bet);
  });
  const groups = Array.from(map.values());
  groups.forEach((g) => {
    g.bets.sort(
      (a, b) =>
        new Date(b.created_at || b.placeDate || 0) -
        new Date(a.created_at || a.placeDate || 0)
    );
    g.date = g.bets[0]?.created_at ?? g.bets[0]?.placeDate;
  });
  groups.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return groups;
}

const MY_BET_COLUMNS = [
  { key: "username", label: "UserName", headerStyle: { minWidth: "90px" }, getValue: (bet) => bet.username ?? bet.userName ?? bet.user?.username ?? "-" },
  { key: "selection", label: "Nation", headerStyle: { minWidth: "90px" }, getValue: (bet) => bet.selection ?? bet.selection_name ?? bet.matchedBet ?? bet.player_name ?? "-" },
  { key: "odds", label: "Rate", headerClassName: "text-right", headerStyle: { minWidth: "50px" }, className: "text-right", getValue: (bet) => bet.odds ?? bet.userrate ?? "-" },
  { key: "amount", label: "Amount", headerClassName: "text-right", headerStyle: { minWidth: "70px" }, className: "text-right", getValue: (bet) => bet.amount ?? bet.stake ?? bet.stake_amount ?? "-" },
  { key: "placeDate", label: "PlaceDate", headerClassName: "text-right", headerStyle: { minWidth: "70px" }, className: "text-right", getValue: (bet) => formatBetDate(bet.created_at ?? bet.placeDate) || "-" },
  { key: "game_type", label: "Gametype", headerClassName: "text-right", headerStyle: { minWidth: "70px" }, className: "text-right", getValue: (bet) => bet.description ?? bet.market_type ?? bet.marketType ?? "-" },
];

export default function MyBet({ bets = [], onViewMore }) {
  const displayBets = Array.isArray(bets) ? bets : [];

  const handleViewMore = (e) => {
    e.preventDefault();
    if (typeof onViewMore === "function") onViewMore();
  };

  const groups = groupBetsForTable(displayBets);

  return (
    <div
      id="my-game-bets"
      className={`card m-b-10 my-bet ${styles.myBetWrap}`}
    >
      <div className="card-header">
        <h6 className="card-title float-left">My Bets</h6>
        <a
          href="javascript:void(0)"
          className="btn btn-back float-right"
          onClick={handleViewMore}
        >
          View More
        </a>
      </div>
      <div className="card-body1">
        <div className="tab-content">
          <div id="matched-bet" className="tab-pane active">
            <div className="table-responsive1">
              <GroupedBetsTable
                columns={MY_BET_COLUMNS}
                groups={groups}
                emptyMessage="No records found"
                formatDate={formatBetDate}
                tableClassName="table my-bets-table mb-0"
                showGroupHeader={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
