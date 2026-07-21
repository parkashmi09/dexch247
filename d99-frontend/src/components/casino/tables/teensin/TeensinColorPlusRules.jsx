export default function TeensinColorPlusRules({ className = "" }) {
  return (
    <div className={`sidebar-box my-bet-container${className ? ` ${className}` : ""}`}>
      <div className="sidebar-title">
        <h4>Rules</h4>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th colSpan="2" className="text-center">Color Plus Rules</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Straight</td>
              <td>1 TO 2</td>
            </tr>
            <tr>
              <td>Flush</td>
              <td>1 TO 5</td>
            </tr>
            <tr>
              <td>Trio</td>
              <td>1 TO 20</td>
            </tr>
            <tr>
              <td>Straight Flush</td>
              <td>1 TO 30</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
