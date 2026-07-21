export default function RatesTable({ sub2 = {}, className = "" }) {
  return (
    <div className={`sidebar-box my-bet-container roulette-rules ${className}`}>
      {!className.includes("d-xl-none") && <div className="sidebar-title"><h4>Rates</h4></div>}
      <div className={className.includes("d-xl-none") ? "" : ""}>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th className="text-center">Single</th>
                <th className="text-center">Split</th>
                <th className="text-center">Street</th>
                <th className="text-center">Corner</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center"><b>{sub2.Single || 0}</b></td>
                <td className="text-center"><b>{sub2.Split || 0}</b></td>
                <td className="text-center"><b>{sub2.Street || 0}</b></td>
                <td className="text-center"><b>{sub2.Corner || 0}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
