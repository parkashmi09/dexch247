import { MARKET_TYPE, detectMarketType } from "../../../utils/gameDetailsUtils.js";
import SixColumnMarket from "./SixColumnMarket.jsx";
import TwoColumnMarket from "./TwoColumnMarket.jsx";
import FancyGridMarket from "./FancyGridMarket.jsx";
import KhadoMarket from "./KhadoMarket.jsx";
import CricketCasinoMarket from "./CricketCasinoMarket.jsx";
import OddEvenMarket from "./OddEvenMarket.jsx";
import HtftMarket from "./HtftMarket.jsx";
import RacingMarket from "./RacingMarket.jsx";

export default function MarketSection({ market, exposures, onBetClick, widthClass, onCashout, onCombinedBetClick, combinedSlip, sportId }) {
  const type = detectMarketType(market);

  switch (type) {
    case MARKET_TYPE.MATCH_ODDS:
    case MARKET_TYPE.TIED_MATCH:
      return (
        <SixColumnMarket
          market={market}
          exposures={exposures}
          marketType={type}
          onBetClick={onBetClick}
          onCashout={onCashout}
        />
      );
    case MARKET_TYPE.BOOKMAKER:
      return (
        <SixColumnMarket
          market={market}
          exposures={exposures}
          marketType={type}
          onBetClick={onBetClick}
          widthClass={widthClass}
          onCashout={onCashout}
        />
      );
    case MARKET_TYPE.BOOKMAKER2:
      return (
        <TwoColumnMarket
          market={market}
          exposures={exposures}
          onBetClick={onBetClick}
          onCashout={onCashout}
          widthClass="width30"
        />
      );
    case MARKET_TYPE.TWOCOL_MATCH: {
      const mn1 = (market.mname || "").toLowerCase();
      // Football bookmaker (3 runners, match1) = no cashout
      // Tennis bookmaker / BM Set Winner (2 runners, match1) = has cashout
      const isTennisBookmaker = market.section?.length === 2;
      const isBmSetWinner = mn1.startsWith("bm ");
      return (
        <TwoColumnMarket
          market={market}
          exposures={exposures}
          onBetClick={onBetClick}
          onCashout={isTennisBookmaker ? onCashout : undefined}
          widthClass={isBmSetWinner ? "width30" : widthClass}
          showCashout={isTennisBookmaker}
        />
      );
    }
    case MARKET_TYPE.FANCY2:
      return (
        <SixColumnMarket
          market={market}
          exposures={exposures}
          marketType={type}
          onBetClick={onBetClick}
          onCashout={onCashout}
        />
      );
    case MARKET_TYPE.METER:
    case MARKET_TYPE.NORMAL:
    case MARKET_TYPE.OVERBYOVER:
    case MARKET_TYPE.BALLBYBALL:
      return (
        <FancyGridMarket
          market={market}
          exposures={exposures}
          showBook={false}
          headerLay="No"
          headerBack="Yes"
          marketType={type}
          onBetClick={onBetClick}
        />
      );
    case MARKET_TYPE.FANCY1:
      return (
        <FancyGridMarket
          market={market}
          exposures={exposures}
          showBook={true}
          headerLay="Lay"
          headerBack="Back"
          marketType={type}
          onBetClick={onBetClick}
        />
      );
    case MARKET_TYPE.KHADO:
      return <KhadoMarket market={market} exposures={exposures} onBetClick={onBetClick} />;
    case MARKET_TYPE.CRICKETCASINO:
      return <CricketCasinoMarket market={market} exposures={exposures} onBetClick={onBetClick} />;
    case MARKET_TYPE.ODDEVEN:
      return <OddEvenMarket market={market} exposures={exposures} onBetClick={onBetClick} />;
    case MARKET_TYPE.HTFT:
      return <HtftMarket market={market} exposures={exposures} onBetClick={onBetClick} />;
    case MARKET_TYPE.RACING:
    case MARKET_TYPE.RACING_TOP3:
      return (
        <RacingMarket
          market={market}
          exposures={exposures}
          onBetClick={onBetClick}
          onCombinedBetClick={onCombinedBetClick}
          combinedSlip={combinedSlip}
          sportId={sportId}
        />
      );
    case MARKET_TYPE.GREYHOUND:
      return (
        <RacingMarket
          market={market}
          exposures={exposures}
          onBetClick={onBetClick}
          sportId={sportId}
          isGreyhound
        />
      );
    case MARKET_TYPE.MATCH_BET:
      // Racing MATCH_BET renders as standard 6-column market
      return (
        <SixColumnMarket
          market={market}
          exposures={exposures}
          marketType={MARKET_TYPE.MATCH_ODDS}
          onBetClick={onBetClick}
        />
      );
    case MARKET_TYPE.FOOTBALL_TWOCOL: {
      const mn2 = (market.mname || "").toLowerCase();
      // Football: only some markets get cashout. Tennis: all secondary markets get cashout.
      const noCashoutList = ["1st period winner", "2nd period winner", "next goal"];
      const noCashout = noCashoutList.some((n) => mn2.includes(n));
      // Game Winner uses market-11 class in reference
      const isGameWinner = mn2.includes("game winner");
      return (
        <TwoColumnMarket
          market={market}
          exposures={exposures}
          onBetClick={onBetClick}
          onCashout={noCashout ? undefined : onCashout}
          showCashout={!noCashout}
          marketClass={isGameWinner ? "market-11" : undefined}
        />
      );
    }
    default:
      return (
        <SixColumnMarket
          market={market}
          exposures={exposures}
          marketType={MARKET_TYPE.MATCH_ODDS}
          onBetClick={onBetClick}
        />
      );
  }
}
