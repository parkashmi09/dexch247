const D = "/assets/img/dice";

const RULES_DATA = [
  { win: [3, 3], loss: [1, 1] },
  { win: [5, 5], loss: [2, 2] },
  { win: [6, 6], loss: [4, 4] },
  { win: [5, 6], loss: [1, 2] },
];

export default function DoliDanaRulesTable({ className = "" }) {
  return (
    <div className={`sidebar-box my-bet-container doli-dana-rules ${className}`}>
      <div className="sidebar-title"><h4>Rules</h4></div>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead><tr><th>Win</th><th>Loss</th></tr></thead>
          <tbody>
            {RULES_DATA.map((r, i) => (
              <tr key={i}>
                <td>
                  <img src={`${D}/dice${r.win[0]}.png`} alt="" />
                  <img src={`${D}/dice${r.win[1]}.png`} alt="" />
                </td>
                <td>
                  <img src={`${D}/dice${r.loss[0]}.png`} alt="" />
                  <img src={`${D}/dice${r.loss[1]}.png`} alt="" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
