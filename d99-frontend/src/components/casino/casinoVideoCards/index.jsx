import { lazy, Suspense } from "react";

// Lazy load per-game card overlays — add new cases as games are built
const Teen6Cards = lazy(() => import("../tables/teen6/Teen6VideoCards.jsx"));
const Teen62Cards = lazy(() => import("../tables/teen62/CasinoVideoCards.jsx"));
const DoliDanaCards = lazy(() => import("../tables/dolidana/DoliDanaCards.jsx"));
const MogamboCards = lazy(() => import("../tables/mogambo/MogamboVideoCards.jsx"));
const Lucky5Cards = lazy(() => import("../tables/lucky5/Lucky5VideoCards.jsx"));
const PoisonCards = lazy(() => import("../tables/poison/PoisonVideoCards.jsx"));
const JokerCards = lazy(() => import("../tables/poison/JokerVideoCards.jsx"));
const Teen9Cards = lazy(() => import("../tables/teen9/Teen9VideoCards.jsx"));
const Teen8Cards = lazy(() => import("../tables/teen8/Teen8VideoCards.jsx"));
const PokerCards = lazy(() => import("../tables/poker/PokerVideoCards.jsx"));
const Poker6Cards = lazy(() => import("../tables/poker6/Poker6VideoCards.jsx"));
const DT20Cards = lazy(() => import("../tables/dt20/DT20VideoCards.jsx"));
const DT202Cards = lazy(() => import("../tables/dt202/DT202VideoCards.jsx"));
const DT6Cards = lazy(() => import("../tables/dt6/DT6VideoCards.jsx"));
const DTL20Cards = lazy(() => import("../tables/dtl20/DTL20VideoCards.jsx"));
const Card32Cards = lazy(() => import("../tables/card32/Card32VideoCards.jsx"));
const Card32EUCards = lazy(() => import("../tables/card32/Card32VideoCards.jsx"));
const Lucky7Cards = lazy(() => import("../tables/lucky7/Lucky7VideoCards.jsx"));
const WarCards = lazy(() => import("../tables/war/WarVideoCards.jsx"));
const AAACards = lazy(() => import("../tables/aaa/AAAVideoCards.jsx"));
const AAA2Cards = lazy(() => import("../tables/aaa2/AAA2VideoCards.jsx"));
const BtableCards = lazy(() => import("../tables/btable/BtableVideoCards.jsx"));
const WorliCards = lazy(() => import("../tables/worli/WorliVideoCards.jsx"));
const LottcardCards = lazy(() => import("../tables/lottcard/LottcardVideoCards.jsx"));
const CricketV3Cards = lazy(() => import("../tables/cricketv3/CricketV3VideoCards.jsx"));
const Cmatch20Cards = lazy(() => import("../tables/cmatch20/Cmatch20VideoCards.jsx"));
const Race20Cards = lazy(() => import("../tables/race20/Race20VideoCards.jsx"));
const TrapCards = lazy(() => import("../tables/trap/TrapVideoCards.jsx"));
const Patti2Cards = lazy(() => import("../tables/patti2/Patti2VideoCards.jsx"));
const TeensinCards = lazy(() => import("../tables/teensin/TeensinVideoCards.jsx"));
const TeenmufCards = lazy(() => import("../tables/teenmuf/TeenmufVideoCards.jsx"));
const Teen20bCards = lazy(() => import("../tables/teen20b/Teen20bVideoCards.jsx"));
const TrioCards = lazy(() => import("../tables/trio/TrioVideoCards.jsx"));
const NotenumCards = lazy(() => import("../tables/notenum/NotenumVideoCards.jsx"));
const Teen120Cards = lazy(() => import("../tables/teen120/Teen120VideoCards.jsx"));
const Teen1Cards = lazy(() => import("../tables/teen1/Teen1VideoCards.jsx"));
const Race2Cards = lazy(() => import("../tables/race2/Race2VideoCards.jsx"));
const Teen3Cards = lazy(() => import("../tables/teen3/Teen3VideoCards.jsx"));
const Dum10Cards = lazy(() => import("../tables/dum10/Dum10VideoCards.jsx"));
const Cmeter1Cards = lazy(() => import("../tables/cmeter1/Cmeter1VideoCards.jsx"));

/**
 * Switch-based card overlay for casino video.
 * Each gameType gets its own card layout component.
 * Games without cards (e.g. worli3) return null.
 */
export default function CasinoVideoCards({ gameType, cardString, tableData }) {
  let CardComponent = null;

  switch (gameType) {
    case "teen6":
      CardComponent = Teen6Cards;
      break;
    case "teen62":
      CardComponent = Teen62Cards;
      break;
    case "dolidana":
      CardComponent = DoliDanaCards;
      break;
    case "mogambo":
      CardComponent = MogamboCards;
      break;
    case "lucky5":
      CardComponent = Lucky5Cards;
      break;
    case "lucky7":
    case "lucky7eu":
    case "lucky7eu2":
      CardComponent = Lucky7Cards;
      break;
    case "poison":
    case "poison20":
      CardComponent = PoisonCards;
      break;
    case "joker20":
      CardComponent = JokerCards;
      break;
    case "teen20b":
      CardComponent = Teen20bCards;
      break;
    case "teen20c":
    case "teen20":
    case "teen41":
    case "teen42":
    case "teen33":
    case "teen":
      CardComponent = Teen62Cards;
      break;
    case "teen9":
      CardComponent = Teen9Cards;
      break;
    case "teen8":
      CardComponent = Teen8Cards;
      break;
    case "poker":
    case "poker20":
      CardComponent = PokerCards;
      break;
    case "poker6":
      CardComponent = Poker6Cards;
      break;
    case "btable2":
      CardComponent = Lucky5Cards;
      break;
    case "dt20":
      CardComponent = DT20Cards;
      break;
    case "dt202":
      CardComponent = DT202Cards;
      break;
    case "dt6":
      CardComponent = DT6Cards;
      break;
    case "dtl20":
      CardComponent = DTL20Cards;
      break;
    case "card32":
      return (
        <Suspense fallback={null}>
          <Card32Cards cardString={cardString} tableData={tableData} />
        </Suspense>
      );
    case "card32eu":
      return (
        <Suspense fallback={null}>
          <Card32EUCards cardString={cardString} tableData={tableData} />
        </Suspense>
      );
    case "war":
      CardComponent = WarCards;
      break;
    case "aaa":
      CardComponent = AAACards;
      break;
    case "aaa2":
      CardComponent = AAA2Cards;
      break;
    case "btable":
      CardComponent = BtableCards;
      break;
    case "worli":
    case "worli2":
      CardComponent = WorliCards;
      break;
    case "lottcard":
      CardComponent = LottcardCards;
      break;
    case "cricketv3":
      CardComponent = CricketV3Cards;
      break;
    case "cmatch20":
      CardComponent = Cmatch20Cards;
      break;
    case "race20":
      CardComponent = Race20Cards;
      break;
    case "trap":
      CardComponent = TrapCards;
      break;
    case "patti2":
      CardComponent = Patti2Cards;
      break;
    case "teensin":
      CardComponent = TeensinCards;
      break;
    case "teenmuf":
      CardComponent = TeenmufCards;
      break;
    case "trio":
      CardComponent = TrioCards;
      break;
    case "notenum":
      CardComponent = NotenumCards;
      break;
    case "teen120":
      CardComponent = Teen120Cards;
      break;
    case "teen1":
      CardComponent = Teen1Cards;
      break;
    case "race2":
      CardComponent = Race2Cards;
      break;
    case "teen3":
    case "teen32":
      CardComponent = Teen3Cards;
      break;
    case "dum10":
      return (
        <Suspense fallback={null}>
          <Dum10Cards cardString={cardString} tableData={tableData} />
        </Suspense>
      );
    case "cmeter1":
      CardComponent = Cmeter1Cards;
      break;
    case "baccarat":
    case "baccarat2":
      return null;
    default:
      return null;
  }

  return (
    <Suspense fallback={null}>
      <CardComponent cardString={cardString} />
    </Suspense>
  );
}
