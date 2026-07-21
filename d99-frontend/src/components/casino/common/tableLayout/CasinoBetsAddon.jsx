import { useState, useMemo } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

/**
 * Account-statement-only add-on shown BELOW the casino result content:
 * a Back/Lay/Deleted filter + the user's bets table for that round.
 *
 * `bets` is an array of real rows mapped from the casino bet API:
 *   { nation, rate, amount, win, date, ip, browser, side: "back"|"lay", deleted }
 */

const FILTERS = [
  { id: "all", label: "All" },
  { id: "back", label: "Back" },
  { id: "lay", label: "Lay" },
  { id: "delete", label: "Deleted" },
];

function fmt(n) {
  const v = Number(n);
  if (isNaN(v)) return n;
  return v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CasinoBetsAddon({ bets }) {
  const rows = Array.isArray(bets) ? bets : [];
  const [filter, setFilter] = useState("all");

  const visible = useMemo(() => {
    if (filter === "delete") return rows.filter((b) => b.deleted);
    const live = rows.filter((b) => !b.deleted);
    if (filter === "all") return live;
    return live.filter((b) => String(b.side || "").toLowerCase() === filter);
  }, [rows, filter]);

  const totalAmount = visible.reduce((sum, b) => sum + Number(b.win || 0), 0);

  return (
    <>
      <div className="row mt-4 justify-content-between">
        <div className="col-md-6">
          {FILTERS.map((f) => (
            <div className="form-check form-check-inline" key={f.id}>
              <input
                type="radio"
                className="form-check-input"
                id={`bet-filter-${f.id}`}
                name="bet-filter"
                value={f.id}
                checked={filter === f.id}
                onChange={() => setFilter(f.id)}
              />
              {f.label}
              <label className="form-check-label" htmlFor={`bet-filter-${f.id}`}></label>
            </div>
          ))}
        </div>
        <div className="col-md-6 text-end">
          <div>
            Total Bets: <span className="me-2">{visible.length}</span>
            Total Amount:
            <span className={`me-2 ${totalAmount < 0 ? "text-danger" : "text-success"}`}>
              {fmt(totalAmount)}
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
            {visible.length === 0 ? (
              <tr role="row"><td role="cell" colSpan="8" className="text-center text-muted">No bets</td></tr>
            ) : visible.map((b, i) => (
              <tr role="row" className={String(b.side || "").toLowerCase()} key={i}>
                <td role="cell">{b.nation}</td>
                <td role="cell" className="text-end">{b.rate}</td>
                <td role="cell" className="text-end">{fmt(b.amount)}</td>
                <td role="cell" className="text-end">
                  <span role="cell" className={Number(b.win) < 0 ? "text-danger" : "text-success"}>{fmt(b.win)}</span>
                </td>
                <td role="cell"><span role="cell">{b.date}</span></td>
                <td role="cell">{b.ip}</td>
                <td role="cell">
                  <OverlayTrigger
                    placement="top"
                    container={document.body}
                    overlay={
                      <Tooltip id={`browser-tip-${i}`}>
                        {b.browser || "Not recorded for this bet"}
                      </Tooltip>
                    }
                  >
                    <u style={{ cursor: "pointer" }}>Detail</u>
                  </OverlayTrigger>
                </td>
                <td role="cell">
                  <div className="text-end">
                    <div className="form-check form-check-inline">
                      <input type="checkbox" className="form-check-input" title="Toggle Row Selected" style={{ cursor: "pointer" }} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
