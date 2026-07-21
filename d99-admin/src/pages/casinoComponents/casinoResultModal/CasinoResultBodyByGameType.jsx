import React from 'react';
import CasinoResultBodyTeen from './CasinoResultBodyTeen';
import CasinoResultBodyTeen20 from './CasinoResultBodyTeen20';
import CasinoResultBodyTeenUnique from './CasinoResultBodyTeenUnique';
import CasinoResultBodySuperOver2 from './CasinoResultBodySuperOver2';
import CasinoResultBodyGoal from './CasinoResultBodyGoal';
import CasinoResultBodyRace17 from './CasinoResultBodyRace17';
import CasinoResultBodyQueen from './CasinoResultBodyQueen';
import CasinoResultBodyTeenPattiTest from './CasinoResultBodyTeenPattiTest';
import CasinoResultBodyTeen33 from './CasinoResultBodyTeen33';
import CasinoResultBodyTeenMuf from './CasinoResultBodyTeenMuf';

/**
 * Renders the correct result modal body by game type (switch case).
 * Used inside ResultModalLayout on both: game pages (ResultTeen, ResultTeen20) and casino result report.
 * detailResult = API response t1: { rid, mtime, ename, rdesc, card, winnat, win }.
 */
const CasinoResultBodyByGameType = ({ gameType, detailResult }) => {
  const normalized = (gameType || '').toLowerCase().trim();

  switch (normalized) {
    case 'teen20':
    case 'teen20b':
    case 'teen20c':
    case 'pteen20':
      return <CasinoResultBodyTeen20 detailResult={detailResult} />;
    case 'teen':
    case 'pteen':
    case 'teen8':
    case 'teen41':
    case 'teen42':
    case 'teen62':
    case 'teen6':
    case 'teen1':
    case 'teensin':
    case 'patti2':
      return <CasinoResultBodyTeen detailResult={detailResult} />;
    case 'teen3':
    case 'teen32':
    case 'teen33':
      return <CasinoResultBodyTeen33 detailResult={detailResult} />;
    case 'teenmuf':
      return <CasinoResultBodyTeenMuf detailResult={detailResult} />;
    case 'teen9':
    case 'teenpattitest':
      return <CasinoResultBodyTeenPattiTest detailResult={detailResult} />;
    case 'teenunique':
      return <CasinoResultBodyTeenUnique detailResult={detailResult} />;
    case 'superover2':
    case 'superover3':
      return <CasinoResultBodySuperOver2 detailResult={detailResult} />;
    case 'goal':
    case 'goals':
      return <CasinoResultBodyGoal detailResult={detailResult} />;
    case 'race20':
    case 'race17':
    case 'vrace17':
    case 'race2':
      return <CasinoResultBodyRace17 detailResult={detailResult} />;
    case 'queen':
      return <CasinoResultBodyQueen detailResult={detailResult} />;
    default:
      return <CasinoResultBodyTeen detailResult={detailResult} />;
  }
};

export default CasinoResultBodyByGameType;
