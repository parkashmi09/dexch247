import { lazy, Suspense } from "react";

const Teen62ResultContent = lazy(() => import("../../tables/teen62/Teen62ResultContent.jsx"));
const Teen6ResultContent = lazy(() => import("../../tables/teen6/Teen6ResultContent.jsx"));
const DoliDanaResultContent = lazy(() => import("../../tables/dolidana/DoliDanaResultContent.jsx"));
const MogamboResultContent = lazy(() => import("../../tables/mogambo/MogamboResultContent.jsx"));
const Lucky5ResultContent = lazy(() => import("../../tables/lucky5/Lucky5ResultContent.jsx"));
const Roulette12ResultContent = lazy(() => import("../../tables/roulette12/Roulette12ResultContent.jsx"));
const PoisonResultContent = lazy(() => import("../../tables/poison/PoisonResultContent.jsx"));
const TeenUniqueResultContent = lazy(() => import("../../tables/teenunique/TeenUniqueResultContent.jsx"));
const Joker1ResultContent = lazy(() => import("../../tables/joker1/Joker1ResultContent.jsx"));
const Teen20cResultContent = lazy(() => import("../../tables/teen20c/Teen20cResultContent.jsx"));
const Btable2ResultContent = lazy(() => import("../../tables/btable2/Btable2ResultContent.jsx"));
const SuperOverResultContent = lazy(() => import("../../tables/superover3/SuperOverResultContent.jsx"));
const GoalResultContent = lazy(() => import("../../tables/goal/GoalResultContent.jsx"));
const AB3ResultContent = lazy(() => import("../../tables/ab3/AB3ResultContent.jsx"));
const AAA2ResultContent = lazy(() => import("../../tables/aaa2/AAA2ResultContent.jsx"));
const AB4ResultContent = lazy(() => import("../../tables/ab4/AB4ResultContent.jsx"));
const AB20ResultContent = lazy(() => import("../../tables/ab20/AB20ResultContent.jsx"));
const Lucky15ResultContent = lazy(() => import("../../tables/lucky15/Lucky15ResultContent.jsx"));
const Teen41ResultContent = lazy(() => import("../../tables/teen41/Teen41ResultContent.jsx"));
const SicBo2ResultContent = lazy(() => import("../../tables/sicbo2/SicBo2ResultContent.jsx"));
const Teen9ResultContent = lazy(() => import("../../tables/teen9/Teen9ResultContent.jsx"));
const Teen8ResultContent = lazy(() => import("../../tables/teen8/Teen8ResultContent.jsx"));
const PokerResultContent = lazy(() => import("../../tables/poker/PokerResultContent.jsx"));
const Poker6ResultContent = lazy(() => import("../../tables/poker6/Poker6ResultContent.jsx"));
const BaccaratResultContent = lazy(() => import("../../tables/baccarat/BaccaratResultContent.jsx"));
const DT20ResultContent = lazy(() => import("../../tables/dt20/DT20ResultContent.jsx"));
const DT202ResultContent = lazy(() => import("../../tables/dt202/DT202ResultContent.jsx"));
const DT6ResultContent = lazy(() => import("../../tables/dt6/DT6ResultContent.jsx"));
const DTL20ResultContent = lazy(() => import("../../tables/dtl20/DTL20ResultContent.jsx"));
const Card32ResultContent = lazy(() => import("../../tables/card32/Card32ResultContent.jsx"));
const Card32EUResultContent = lazy(() => import("../../tables/card32eu/Card32EUResultContent.jsx"));
const ABJResultContent = lazy(() => import("../../tables/abj/ABJResultContent.jsx"));
const Lucky7ResultContent = lazy(() => import("../../tables/lucky7/Lucky7ResultContent.jsx"));
const ThreeCardJResultContent = lazy(() => import("../../tables/threecardj/ThreeCardJResultContent.jsx"));
const WarResultContent = lazy(() => import("../../tables/war/WarResultContent.jsx"));
const AAAResultContent = lazy(() => import("../../tables/aaa/AAAResultContent.jsx"));
const BtableResultContent = lazy(() => import("../../tables/btable/BtableResultContent.jsx"));
const WorliResultContent = lazy(() => import("../../tables/worli/WorliResultContent.jsx"));
const LottcardResultContent = lazy(() => import("../../tables/lottcard/LottcardResultContent.jsx"));
const CricketV3ResultContent = lazy(() => import("../../tables/cricketv3/CricketV3ResultContent.jsx"));
const CricketMatch20ResultContent = lazy(() => import("../../tables/cmatch20/CricketMatch20ResultContent.jsx"));
const CmeterResultContent = lazy(() => import("../../tables/cmeter/CmeterResultContent.jsx"));
const QueenResultContent = lazy(() => import("../../tables/queen/QueenResultContent.jsx"));
const Race20ResultContent = lazy(() => import("../../tables/race20/Race20ResultContent.jsx"));
const TrapResultContent = lazy(() => import("../../tables/trap/TrapResultContent.jsx"));
const Patti2ResultContent = lazy(() => import("../../tables/patti2/Patti2ResultContent.jsx"));
const TeensinResultContent = lazy(() => import("../../tables/teensin/TeensinResultContent.jsx"));
const TeenmufResultContent = lazy(() => import("../../tables/teenmuf/TeenmufResultContent.jsx"));
const Race17ResultContent = lazy(() => import("../../tables/race17/Race17ResultContent.jsx"));
const Teen20bResultContent = lazy(() => import("../../tables/teen20b/Teen20bResultContent.jsx"));
const TrioResultContent = lazy(() => import("../../tables/trio/TrioResultContent.jsx"));
const NotenumResultContent = lazy(() => import("../../tables/notenum/NotenumResultContent.jsx"));
const Teen120ResultContent = lazy(() => import("../../tables/teen120/Teen120ResultContent.jsx"));
const Teen1ResultContent = lazy(() => import("../../tables/teen1/Teen1ResultContent.jsx"));
const Race2ResultContent = lazy(() => import("../../tables/race2/Race2ResultContent.jsx"));
const Dum10ResultContent = lazy(() => import("../../tables/dum10/Dum10ResultContent.jsx"));
const Cmeter1ResultContent = lazy(() => import("../../tables/cmeter1/Cmeter1ResultContent.jsx"));
const BallByBallResultContent = lazy(() => import("../../tables/ballbyball/BallByBallResultContent.jsx"));

/**
 * Switch-based result content renderer.
 * Each game type gets its own result layout.
 */
export default function CasinoResultContent({ gameType, detailData }) {
  if (!detailData) return <div className="text-center p-4">No data</div>;

  let Component = null;
  switch (gameType) {
    case "teen6":
      Component = Teen6ResultContent;
      break;
    case "teen62":
      Component = Teen62ResultContent;
      break;
    case "dolidana":
      Component = DoliDanaResultContent;
      break;
    case "mogambo":
      Component = MogamboResultContent;
      break;
    case "lucky5":
      Component = Lucky5ResultContent;
      break;
    case "lucky7":
    case "lucky7eu":
    case "lucky7eu2":
      Component = Lucky7ResultContent;
      break;
    case "roulette12":
      Component = Roulette12ResultContent;
      break;
    case "poison": case "poison20":
      Component = PoisonResultContent;
      break;
    case "joker20":
      return (
        <Suspense fallback={<div className="text-center p-4"><i className="fa fa-spinner fa-spin"></i></div>}>
          <PoisonResultContent detailData={detailData} label="Joker" />
        </Suspense>
      );
    case "joker1":
    case "joker120":
      Component = Joker1ResultContent;
      break;
    case "teenunique":
      Component = TeenUniqueResultContent;
      break;
    case "teen20c": case "teen20":
      Component = Teen20cResultContent;
      break;
    case "teen20b":
      Component = Teen20bResultContent;
      break;
    case "btable2":
      Component = Btable2ResultContent;
      break;
    case "superover3": case "superover2": case "superover":
      Component = SuperOverResultContent;
      break;
    case "goal":
      Component = GoalResultContent;
      break;
    case "ab3":
      Component = AB3ResultContent;
      break;
    case "ab4":
      Component = AB4ResultContent;
      break;
    case "ab20":
      Component = AB20ResultContent;
      break;
    case "lucky15":
      Component = Lucky15ResultContent;
      break;
    case "teen41": case "teen42":
      Component = Teen41ResultContent;
      break;
    case "sicbo2": case "sicbo":
      Component = SicBo2ResultContent;
      break;
    case "teen9":
      Component = Teen9ResultContent;
      break;
    case "teen8":
      Component = Teen8ResultContent;
      break;
    case "poker": case "poker20":
      Component = PokerResultContent;
      break;
    case "poker6":
      Component = Poker6ResultContent;
      break;
    case "baccarat": case "baccarat2":
      Component = BaccaratResultContent;
      break;
    case "dt20":
      Component = DT20ResultContent;
      break;
    case "dt202":
      Component = DT202ResultContent;
      break;
    case "dt6":
      Component = DT6ResultContent;
      break;
    case "dtl20":
      Component = DTL20ResultContent;
      break;
    case "card32":
      Component = Card32ResultContent;
      break;
    case "card32eu":
      Component = Card32EUResultContent;
      break;
    case "abj":
      Component = ABJResultContent;
      break;
    case "teen":
    case "teen3":
    case "teen32":
      Component = Teen62ResultContent;
      break;
    case "3cardj":
      Component = ThreeCardJResultContent;
      break;
    case "war":
      Component = WarResultContent;
      break;
    case "aaa":
      Component = AAAResultContent;
      break;
    case "aaa2":
      Component = AAA2ResultContent;
      break;
    case "btable":
      Component = BtableResultContent;
      break;
    case "worli":
    case "worli2":
      Component = WorliResultContent;
      break;
    case "lottcard":
      Component = LottcardResultContent;
      break;
    case "cricketv3":
      Component = CricketV3ResultContent;
      break;
    case "cmatch20":
      Component = CricketMatch20ResultContent;
      break;
    case "cmeter":
      Component = CmeterResultContent;
      break;
    case "queen":
      Component = QueenResultContent;
      break;
    case "race20":
      Component = Race20ResultContent;
      break;
    case "trap":
      Component = TrapResultContent;
      break;
    case "patti2":
      Component = Patti2ResultContent;
      break;
    case "teensin":
      Component = TeensinResultContent;
      break;
    case "teenmuf":
      Component = TeenmufResultContent;
      break;
    case "race17":
      Component = Race17ResultContent;
      break;
    case "trio":
      Component = TrioResultContent;
      break;
    case "notenum":
      Component = NotenumResultContent;
      break;
    case "teen120":
      Component = Teen120ResultContent;
      break;
    case "teen1":
      Component = Teen1ResultContent;
      break;
    case "race2":
      Component = Race2ResultContent;
      break;
    case "dum10":
      Component = Dum10ResultContent;
      break;
    case "cmeter1":
      Component = Cmeter1ResultContent;
      break;
    case "ballbyball":
      Component = BallByBallResultContent;
      break;
    default:
      return <div className="text-center p-4">Result view not available</div>;
  }

  return (
    <Suspense fallback={<div className="text-center p-4"><i className="fa fa-spinner fa-spin"></i></div>}>
      <Component detailData={detailData} />
    </Suspense>
  );
}
