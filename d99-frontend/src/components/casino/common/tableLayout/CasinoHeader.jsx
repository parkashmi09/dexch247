import { useState } from "react";
import CasinoRulesModal from "./CasinoRulesModal.jsx";

export default function CasinoHeader({ name, gameId, roundId, extra, hideRules }) {
  const [showRules, setShowRules] = useState(false);

  return (
    <>
      <div className="casino-header">
        <span className="casino-name">
          {name}
          {!hideRules && (
            <a className="ms-1" style={{ cursor: "pointer" }} onClick={() => setShowRules(true)}>
              <small>Rules</small>
            </a>
          )}
        </span>
        {roundId && (
          <span className="casino-rid d-none d-xl-inline-block">
            <small>Round ID: <span>{roundId}</span></small>
            {extra && extra}
          </span>
        )}
      </div>

      <CasinoRulesModal
        show={showRules}
        onHide={() => setShowRules(false)}
        title={name}
        gameType={gameId}
      />
    </>
  );
}
