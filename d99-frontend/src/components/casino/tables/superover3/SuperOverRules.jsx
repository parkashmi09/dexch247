export default function SuperOverRules() {
  return (
    <div>
      <style>{`
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section .table { color: #fff; border: 1px solid #444; background-color: #222; font-size: 12px; }
        .rules-section .table td, .rules-section .table th { border-bottom: 1px solid #444; }
        .rules-section ul li, .rules-section p { margin-bottom: 5px; }
        .rules-section .rules-highlight { color: #FDCF13; font-size: 16px; }
        .rules-section img { max-width: 100%; }
      `}</style>
      <div className="rules-section">
        <div>
          <img src="/assets/img/casino-rules/superover.jpg" className="img-fluid" alt="Super Over Rules" />
        </div>
      </div>
    </div>
  );
}
