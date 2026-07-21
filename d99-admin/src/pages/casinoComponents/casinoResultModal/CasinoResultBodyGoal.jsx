import React from 'react';

const parseRdesc = (rdesc) => {
  if (!rdesc) return { playerName: "", eventType: "" };
  const parts = rdesc.split('#');
  return { playerName: parts[0] || "", eventType: parts[1] || "" };
};

/**
 * Modal body for Goal game result.
 * Used in Casino Result Report (/admin/reports/casinoresult/goal).
 * detailResult = API t1: { rid, mtime, rdesc, winnat, win }.
 */
const CasinoResultBodyGoal = ({ detailResult }) => {
  if (!detailResult) {
    return <div className="text-center p-3">No result data.</div>;
  }

  const { playerName, eventType } = parseRdesc(detailResult.rdesc);
  const winner = detailResult.winnat || playerName || '';

  const displayText = eventType
    ? `${eventType} by ${playerName}`
    : playerName
      ? `Shot Goal by ${playerName}`
      : 'Goal';

  return (
    <div className="text-center p-3">
      <div className="cricket20ballresult" style={{ fontSize: '18px', fontWeight: 'bold' }}>
        <span>{displayText}</span>
      </div>
      {winner && (
        <div className="mt-2">
          Winner: <span className="text-fancy" style={{ color: '#17a2b8', fontWeight: 'bold' }}>{winner}</span>
        </div>
      )}
    </div>
  );
};

export default CasinoResultBodyGoal;
