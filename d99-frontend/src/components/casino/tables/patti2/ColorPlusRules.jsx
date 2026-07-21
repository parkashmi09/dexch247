export default function ColorPlusRules({ className = "" }) {
  return (
    <div className={`sidebar-box my-bet-container ${className}`}>
      <div className="sidebar-title">
        <h4>Rules</h4>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th colSpan={2} className="text-center">Color Plus Rules</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Three card Sequence</td>
              <td>1 TO 3</td>
            </tr>
            <tr>
              <td>Four card color</td>
              <td>1 TO 9</td>
            </tr>
            <tr>
              <td>Four card Sequence</td>
              <td>1 TO 9</td>
            </tr>
            <tr>
              <td>Three of a kind</td>
              <td>1 TO 12</td>
            </tr>
            <tr>
              <td>Three card pure Sequence</td>
              <td>1 TO 15</td>
            </tr>
            <tr>
              <td>Four card pure Sequence</td>
              <td>1 TO 150</td>
            </tr>
            <tr>
              <td>Four of a kind</td>
              <td>1 TO 200</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
