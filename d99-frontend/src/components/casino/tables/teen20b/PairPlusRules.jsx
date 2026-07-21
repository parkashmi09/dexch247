export default function PairPlusRules({ className = "" }) {
  return (
    <div className={`sidebar-box my-bet-container ${className}`}>
      <div className="sidebar-title"><h4>Rules</h4></div>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr><th colSpan="2" className="text-center">Pair Plus</th></tr>
          </thead>
          <tbody>
            <tr><td>Pair</td><td>1 TO 1</td></tr>
            <tr><td>Flush</td><td>1 TO 4</td></tr>
            <tr><td>Straight</td><td>1 TO 6</td></tr>
            <tr><td>Trio</td><td>1 TO 30</td></tr>
            <tr><td>Straight Flush</td><td>1 TO 40</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
