import { useState } from "react";
import { Modal } from "react-bootstrap";

/**
 * Result modal for SPORTS account-statement rows.
 *
 * Currently rendered with static mock data; wire `meta`/`bets` props to live
 * data once the sports result API is available.
 */

const MOCK_META = {
  path: "Football  -> THAILAND University League  -> Bangkok University - Thaksin University  -> MATCH_ODDS",
  winner: "Bangkok University",
  gameTime: "08/06/2026 13:55:00",
};

const MOCK_BETS = [
  {
    type: "back",
    nation: "Thaksin University",
    rate: "1.28",
    bhav: "0",
    amount: "100",
    win: "-100",
    date: "08/06/2026 15:50:51",
    ip: "122.173.121.150",
  },
];

const FILTERS = [
  { id: "all", label: "All", value: "all" },
  { id: "back", label: "Back", value: "back" },
  { id: "lay", label: "Lay", value: "lay" },
  { id: "delete", label: "Deleted", value: "delete" },
];

export default function SportsResultModal({ show, onHide, title, meta = MOCK_META, bets = MOCK_BETS }) {
  const [filter, setFilter] = useState("all");

  const visibleBets = filter === "all" ? bets : bets.filter((b) => b.type === filter);
  const totalAmount = visibleBets.reduce((sum, b) => sum + Number(b.win || 0), 0);

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>{title || "Result"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mt-1">{meta.path}</div>
        <div className="mt-1">
          <div className="row">
            <div className="col-6">Winner: {meta.winner} </div>
            <div className="col-6 text-end">Game Time: {meta.gameTime}</div>
          </div>
        </div>
        <div className="row mt-4 justify-content-between">
          <div className="col-md-6">
            {FILTERS.map((f) => (
              <div className="form-check form-check-inline" key={f.id}>
                <input
                  type="radio"
                  className="form-check-input"
                  id={f.id}
                  name="filter"
                  value={f.value}
                  checked={filter === f.value}
                  onChange={() => setFilter(f.value)}
                />
                {f.label}
                <label className="form-check-label" htmlFor={f.id}></label>
              </div>
            ))}
          </div>
          <div className="col-md-6 text-end">
            <div>
              Total Bets: <span className="me-2">{visibleBets.length}</span>
              Total Amount:
              <span className={`me-2 ${totalAmount < 0 ? "text-danger" : "text-success"}`}>
                {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-2 table-responsive">
          <table role="table" className="table table-bordered table-striped">
            <thead>
              <tr role="row">
                <th colSpan="1" role="columnheader">Nation</th>
                <th colSpan="1" role="columnheader" className="text-end">Rate</th>
                <th colSpan="1" role="columnheader" className="text-end">Bhav</th>
                <th colSpan="1" role="columnheader" className="text-end">Amount</th>
                <th colSpan="1" role="columnheader" className="text-end">Win</th>
                <th colSpan="1" role="columnheader">Date</th>
                <th colSpan="1" role="columnheader">Ip Address</th>
                <th colSpan="1" role="columnheader">Browser Details</th>
                <th colSpan="1" role="columnheader">
                  <div className="text-end">
                    <div className="form-check form-check-inline">
                      <input type="checkbox" className="form-check-input" title="Toggle All Rows Selected" style={{ cursor: "pointer" }} />
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {visibleBets.map((b, i) => {
                const win = Number(b.win || 0);
                return (
                  <tr role="row" className={b.type} key={i}>
                    <td role="cell">{b.nation}</td>
                    <td role="cell" className="text-end">{b.rate}</td>
                    <td role="cell" className="text-end">{b.bhav}</td>
                    <td role="cell" className="text-end">{b.amount}</td>
                    <td role="cell" className="text-end">
                      <span role="cell" className={win < 0 ? "text-danger" : "text-success"}>{b.win}</span>
                    </td>
                    <td role="cell"><span role="cell">{b.date}</span></td>
                    <td role="cell">{b.ip}</td>
                    <td role="cell"><u>Detail</u></td>
                    <td role="cell">
                      <div className="text-end">
                        <div className="form-check form-check-inline">
                          <input type="checkbox" className="form-check-input" title="Toggle Row Selected" style={{ cursor: "pointer" }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Modal.Body>
    </Modal>
  );
}
