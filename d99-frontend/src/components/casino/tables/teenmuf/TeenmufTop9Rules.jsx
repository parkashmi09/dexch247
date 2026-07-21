export default function TeenmufTop9Rules({ className = "" }) {
  return (
    <div className={`sidebar-box my-bet-container${className ? ` ${className}` : ""}`}>
      <div className="sidebar-title">
        <h4>Rules</h4>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th colSpan="2" className="text-center">Top 9</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Card 9</td>
              <td>1 TO 3</td>
            </tr>
            <tr>
              <td>Card 8</td>
              <td>1 TO 4</td>
            </tr>
            <tr>
              <td>Card 7</td>
              <td>1 TO 5</td>
            </tr>
            <tr>
              <td>Card 6</td>
              <td>1 TO 8</td>
            </tr>
            <tr>
              <td>Card 5</td>
              <td>1 TO 30</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
