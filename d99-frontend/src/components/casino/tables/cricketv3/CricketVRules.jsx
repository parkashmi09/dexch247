// Rules content for the cricketv ("XI") virtual game — uses the cricketv2 art.
export default function CricketVRules() {
  return (
    <div>
      <style>{`
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section ul li, .rules-section p { margin-bottom: 5px; }
        .rules-section .rules-highlight { color: #FDCF13; font-size: 16px; }
        .rules-section .rules-sub-highlight { color: #FDCF13; font-size: 14px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
      `}</style>
      <div className="rules-section">
        <img
          src="/assets/img/casino-rules/cricketv2.jpg"
          className="img-fluid"
          alt="Cricket V Rules"
        />
      </div>
    </div>
  );
}
