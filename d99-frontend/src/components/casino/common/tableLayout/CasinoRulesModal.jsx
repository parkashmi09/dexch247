import { lazy, Suspense } from "react";
import { Modal } from "react-bootstrap";
import "../../../../styles/casinoRules.css";

const Teen6Rules = lazy(() => import("../../tables/teen6/Teen6Rules.jsx"));
const Teen62Rules = lazy(() => import("../../tables/teen62/Teen62Rules.jsx"));
const Worli3Rules = lazy(() => import("../../tables/worli3/Worli3Rules.jsx"));
const DoliDanaRules = lazy(() => import("../../tables/dolidana/DoliDanaRules.jsx"));
const MogamboRules = lazy(() => import("../../tables/mogambo/MogamboRules.jsx"));
const Lucky5Rules = lazy(() => import("../../tables/lucky5/Lucky5Rules.jsx"));
const Roulette12Rules = lazy(() => import("../../tables/roulette12/Roulette12Rules.jsx"));
const Joker1Rules = lazy(() => import("../../tables/joker1/Joker1Rules.jsx"));
const Teen20cRules = lazy(() => import("../../tables/teen20c/Teen20cRules.jsx"));
const OurRouletteRules = lazy(() => import("../../tables/ourroullete/OurRouletteRules.jsx"));
const SuperOver3Rules = lazy(() => import("../../tables/superover3/SuperOver3Rules.jsx"));
const SuperOverRules = lazy(() => import("../../tables/superover3/SuperOverRules.jsx"));
const SuperOver2Rules = lazy(() => import("../../tables/superover3/SuperOver2Rules.jsx"));
const GoalRules = lazy(() => import("../../tables/goal/GoalRules.jsx"));
const AB3Rules = lazy(() => import("../../tables/ab3/AB3Rules.jsx"));
const AB4Rules = lazy(() => import("../../tables/ab4/AB4Rules.jsx"));
const AB20Rules = lazy(() => import("../../tables/ab20/AB20Rules.jsx"));
const Lucky15Rules = lazy(() => import("../../tables/lucky15/Lucky15Rules.jsx"));
const Teen41Rules = lazy(() => import("../../tables/teen41/Teen41Rules.jsx"));
const Teen42Rules = lazy(() => import("../../tables/teen41/Teen42Rules.jsx"));
const Teen33Rules = lazy(() => import("../../tables/teen41/Teen33Rules.jsx"));
const SicBo2Rules = lazy(() => import("../../tables/sicbo2/SicBo2Rules.jsx"));
const PoisonRules = lazy(() => import("../../tables/poison/PoisonRules.jsx"));
const Poison20Rules = lazy(() => import("../../tables/poison/Poison20Rules.jsx"));
const TeenRules = lazy(() => import("../../tables/teen/TeenRules.jsx"));
const Teen9Rules = lazy(() => import("../../tables/teen9/Teen9Rules.jsx"));
const Teen8Rules = lazy(() => import("../../tables/teen8/Teen8Rules.jsx"));
const PokerRules = lazy(() => import("../../tables/poker/PokerRules.jsx"));
const BaccaratRules = lazy(() => import("../../tables/baccarat/BaccaratRules.jsx"));
const Baccarat2Rules = lazy(() => import("../../tables/baccarat2/Baccarat2Rules.jsx"));
const DT20Rules = lazy(() => import("../../tables/dt20/DT20Rules.jsx"));
const DT202Rules = lazy(() => import("../../tables/dt202/DT202Rules.jsx"));
const DT6Rules = lazy(() => import("../../tables/dt6/DT6Rules.jsx"));
const DTL20Rules = lazy(() => import("../../tables/dtl20/DTL20Rules.jsx"));
const Card32Rules = lazy(() => import("../../tables/card32/Card32Rules.jsx"));
const Card32EURules = lazy(() => import("../../tables/card32eu/Card32EURules.jsx"));
const ABJRules = lazy(() => import("../../tables/abj/ABJRules.jsx"));
const Lucky7Rules = lazy(() => import("../../tables/lucky7/Lucky7Rules.jsx"));
const WarRules = lazy(() => import("../../tables/war/WarRules.jsx"));
const AAARules = lazy(() => import("../../tables/aaa/AAARules.jsx"));
const AAA2Rules = lazy(() => import("../../tables/aaa2/AAA2Rules.jsx"));
const BtableRules = lazy(() => import("../../tables/btable/BtableRules.jsx"));
const WorliRules = lazy(() => import("../../tables/worli/WorliRules.jsx"));
const LottcardRules = lazy(() => import("../../tables/lottcard/LottcardRules.jsx"));
const CricketV3Rules = lazy(() => import("../../tables/cricketv3/CricketV3Rules.jsx"));
const Cmatch20Rules = lazy(() => import("../../tables/cmatch20/Cmatch20Rules.jsx"));
const CmeterRules = lazy(() => import("../../tables/cmeter/CmeterRules.jsx"));
const Race20Rules = lazy(() => import("../../tables/race20/Race20Rules.jsx"));
const TrapRules = lazy(() => import("../../tables/trap/TrapRules.jsx"));
const Patti2Rules = lazy(() => import("../../tables/patti2/Patti2Rules.jsx"));
const TeensinRules = lazy(() => import("../../tables/teensin/TeensinRules.jsx"));
const TeenmufRules = lazy(() => import("../../tables/teenmuf/TeenmufRules.jsx"));
const Race17Rules = lazy(() => import("../../tables/race17/Race17Rules.jsx"));
const Teen20bRules = lazy(() => import("../../tables/teen20b/Teen20bRules.jsx"));
const TrioRules = lazy(() => import("../../tables/trio/TrioRules.jsx"));
const NotenumRules = lazy(() => import("../../tables/notenum/NotenumRules.jsx"));
const Teen120Rules = lazy(() => import("../../tables/teen120/Teen120Rules.jsx"));
const Teen1Rules = lazy(() => import("../../tables/teen1/Teen1Rules.jsx"));
const Race2Rules = lazy(() => import("../../tables/race2/Race2Rules.jsx"));
const Teen3Rules = lazy(() => import("../../tables/teen3/Teen3Rules.jsx"));
const Dum10Rules = lazy(() => import("../../tables/dum10/Dum10Rules.jsx"));
const Cmeter1Rules = lazy(() => import("../../tables/cmeter1/Cmeter1Rules.jsx"));
const BallByBallRules = lazy(() => import("../../tables/ballbyball/BallByBallRules.jsx"));
const TeenUniqueRules = lazy(() => import("../../tables/teenunique/TeenUniqueRules.jsx"));
const Joker120Rules = lazy(() => import("../../tables/joker1/Joker120Rules.jsx"));

function getRulesComponent(gameType) {
  switch (gameType) {
    case "teen6": return Teen6Rules;
    case "teen62": return Teen62Rules;
    case "worli3": return Worli3Rules;
    case "dolidana": return DoliDanaRules;
    case "mogambo": return MogamboRules;
    case "lucky5": return Lucky5Rules;
    case "lucky7": case "lucky7eu": case "lucky7eu2": return Lucky7Rules;
    case "war": return WarRules;
    case "aaa": return AAARules;
    case "aaa2": return AAA2Rules;
    case "btable": case "btable2": return BtableRules;
    case "worli": return WorliRules;
    case "roulette12": return Roulette12Rules;
    case "poison": return PoisonRules;
    case "poison20": return Poison20Rules;
    case "joker20": return PoisonRules;
    case "joker1": return Joker1Rules;
    case "joker120": return Joker120Rules;
    case "teen20c": case "teen20": return Teen20cRules;
    case "ourroullete": return OurRouletteRules;
    case "superover3": return SuperOver3Rules;
    case "superover": return SuperOverRules;
    case "superover2": return SuperOver2Rules;
    case "goal": return GoalRules;
    case "ab3": return AB3Rules;
    case "ab4": return AB4Rules;
    case "ab20": return AB20Rules;
    case "lucky15": return Lucky15Rules;
    case "teen41": return Teen41Rules;
    case "teen42": return Teen42Rules;
    case "sicbo2": case "sicbo": return SicBo2Rules;
    case "teen33": return Teen33Rules;
    case "teen": return TeenRules;
    case "teen9": return Teen9Rules;
    case "teen8": return Teen8Rules;
    case "poker": case "poker20": case "poker6": return PokerRules;
    case "baccarat": return BaccaratRules;
    case "baccarat2": return Baccarat2Rules;
    case "dt20": return DT20Rules;
    case "dt202": return DT202Rules;
    case "dt6": return DT6Rules;
    case "dtl20": return DTL20Rules;
    case "card32": return Card32Rules;
    case "card32eu": return Card32EURules;
    case "abj": return ABJRules;
    case "lottcard": return LottcardRules;
    case "cricketv3": return CricketV3Rules;
    case "cmatch20": return Cmatch20Rules;
    case "cmeter": return CmeterRules;
    case "race20": return Race20Rules;
    case "trap": return TrapRules;
    case "patti2": return Patti2Rules;
    case "teensin": return TeensinRules;
    case "teenmuf": return TeenmufRules;
    case "race17": return Race17Rules;
    case "teen20b": return Teen20bRules;
    case "trio": return TrioRules;
    case "notenum": return NotenumRules;
    case "teen120": return Teen120Rules;
    case "teen1": return Teen1Rules;
    case "race2": return Race2Rules;
    case "teen3": return Teen3Rules;
    case "dum10": return Dum10Rules;
    case "cmeter1": return Cmeter1Rules;
    case "teen32": return Teen3Rules;
    case "ballbyball": return BallByBallRules;
    case "teenunique": return TeenUniqueRules;
    default: return null;
  }
}

export default function CasinoRulesModal({ show, onHide, title, gameType }) {
  const Component = getRulesComponent(gameType);

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title} Rules</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {Component ? (
          <Suspense fallback={<div className="text-center p-3"><i className="fa fa-spinner fa-spin"></i></div>}>
            <Component />
          </Suspense>
        ) : (
          <div className="text-center p-3">Rules not available</div>
        )}
      </Modal.Body>
    </Modal>
  );
}
