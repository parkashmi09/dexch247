import { lazy } from "react";

// Lazy-loaded casino table pages — add new games here
const casinoRoutes = [
  {
    path: "/casino/worli3",
    component: lazy(() => import("../pages/casinoTableGames/worli3/Worli3Page.jsx")),
  },
  {
    path: "/casino/teen6",
    component: lazy(() => import("../pages/casinoTableGames/teen6/Teen6Page.jsx")),
  },
  {
    path: "/casino/teen62",
    component: lazy(() => import("../pages/casinoTableGames/teen62/Teen62Page.jsx")),
  },
  {
    path: "/casino/dolidana",
    component: lazy(() => import("../pages/casinoTableGames/dolidana/DoliDanaPage.jsx")),
  },
  {
    path: "/casino/mogambo",
    component: lazy(() => import("../pages/casinoTableGames/mogambo/MogamboPage.jsx")),
  },
  {
    path: "/casino/lucky5",
    component: lazy(() => import("../pages/casinoTableGames/lucky5/Lucky5Page.jsx")),
  },
  {
    path: "/casino/teenunique",
    component: lazy(() => import("../pages/casinoTableGames/teenunique/TeenUniquePage.jsx")),
  },
  {
    path: "/casino/teen",
    component: lazy(() => import("../pages/casinoTableGames/teen/TeenPage.jsx")),
  },
  {
    path: "/casino/teen33",
    component: lazy(() => import("../pages/casinoTableGames/teen33/Teen33Page.jsx")),
  },
  {
    path: "/casino/sicbo",
    component: lazy(() => import("../pages/casinoTableGames/sicbo/SicBoPage.jsx")),
  },
  {
    path: "/casino/sicbo2",
    component: lazy(() => import("../pages/casinoTableGames/sicbo2/SicBo2Page.jsx")),
  },
  {
    path: "/casino/teen42",
    component: lazy(() => import("../pages/casinoTableGames/teen42/Teen42Page.jsx")),
  },
  {
    path: "/casino/teen41",
    component: lazy(() => import("../pages/casinoTableGames/teen41/Teen41Page.jsx")),
  },
  {
    path: "/casino/lucky15",
    component: lazy(() => import("../pages/casinoTableGames/lucky15/Lucky15Page.jsx")),
  },
  {
    path: "/casino/ab4",
    component: lazy(() => import("../pages/casinoTableGames/ab4/AB4Page.jsx")),
  },
  {
    path: "/casino/ab3",
    component: lazy(() => import("../pages/casinoTableGames/ab3/AB3Page.jsx")),
  },
  {
    path: "/casino/ab20",
    component: lazy(() => import("../pages/casinoTableGames/ab20/AB20Page.jsx")),
  },
  {
    path: "/casino/goal",
    component: lazy(() => import("../pages/casinoTableGames/goal/GoalPage.jsx")),
  },
  {
    path: "/casino/superover",
    component: lazy(() => import("../pages/casinoTableGames/superover/SuperOverPage.jsx")),
  },
  {
    path: "/casino/superover2",
    component: lazy(() => import("../pages/casinoTableGames/superover2/SuperOver2Page.jsx")),
  },
  {
    path: "/casino/superover3",
    component: lazy(() => import("../pages/casinoTableGames/superover3/SuperOver3Page.jsx")),
  },
  {
    path: "/casino/ourroullete",
    component: lazy(() => import("../pages/casinoTableGames/ourroullete/OurRoulettePage.jsx")),
  },
  {
    path: "/casino/btable2",
    component: lazy(() => import("../pages/casinoTableGames/btable2/Btable2Page.jsx")),
  },
  {
    path: "/casino/teen20c",
    component: lazy(() => import("../pages/casinoTableGames/teen20c/Teen20cPage.jsx")),
  },
  {
    path: "/casino/joker1",
    component: lazy(() => import("../pages/casinoTableGames/joker1/Joker1Page.jsx")),
  },
  {
    path: "/casino/joker20",
    component: lazy(() => import("../pages/casinoTableGames/joker20/Joker20Page.jsx")),
  },
  {
    path: "/casino/joker120",
    component: lazy(() => import("../pages/casinoTableGames/joker120/Joker120Page.jsx")),
  },
  {
    path: "/casino/poison20",
    component: lazy(() => import("../pages/casinoTableGames/poison20/Poison20Page.jsx")),
  },
  {
    path: "/casino/poison",
    component: lazy(() => import("../pages/casinoTableGames/poison/PoisonPage.jsx")),
  },
  {
    path: "/casino/roulette11",
    component: lazy(() => import("../pages/casinoTableGames/roulette11/Roulette11Page.jsx")),
  },
  {
    path: "/casino/roulette12",
    component: lazy(() => import("../pages/casinoTableGames/roulette12/Roulette12Page.jsx")),
  },
  {
    path: "/casino/roulette13",
    component: lazy(() => import("../pages/casinoTableGames/roulette13/Roulette13Page.jsx")),
  },
  {
    path: "/casino/teen20",
    component: lazy(() => import("../pages/casinoTableGames/teen20/Teen20Page.jsx")),
  },
  {
    path: "/casino/teen9",
    component: lazy(() => import("../pages/casinoTableGames/teen9/Teen9Page.jsx")),
  },
  {
    path: "/casino/teen8",
    component: lazy(() => import("../pages/casinoTableGames/teen8/Teen8Page.jsx")),
  },
  {
    path: "/casino/poker",
    component: lazy(() => import("../pages/casinoTableGames/poker/PokerPage.jsx")),
  },
  {
    path: "/casino/poker20",
    component: lazy(() => import("../pages/casinoTableGames/poker20/Poker20Page.jsx")),
  },
  {
    path: "/casino/poker6",
    component: lazy(() => import("../pages/casinoTableGames/poker6/Poker6Page.jsx")),
  },
  {
    path: "/casino/baccarat",
    component: lazy(() => import("../pages/casinoTableGames/baccarat/BaccaratPage.jsx")),
  },
  {
    path: "/casino/baccarat2",
    component: lazy(() => import("../pages/casinoTableGames/baccarat2/Baccarat2Page.jsx")),
  },
  {
    path: "/casino/dt20",
    component: lazy(() => import("../pages/casinoTableGames/dt20/DT20Page.jsx")),
  },
  {
    path: "/casino/dt202",
    component: lazy(() => import("../pages/casinoTableGames/dt202/DT202Page.jsx")),
  },
  {
    path: "/casino/dt6",
    component: lazy(() => import("../pages/casinoTableGames/dt6/DT6Page.jsx")),
  },
  {
    path: "/casino/dtl20",
    component: lazy(() => import("../pages/casinoTableGames/dtl20/DTL20Page.jsx")),
  },
  {
    path: "/casino/card32",
    component: lazy(() => import("../pages/casinoTableGames/card32/Card32Page.jsx")),
  },
  {
    path: "/casino/card32eu",
    component: lazy(() => import("../pages/casinoTableGames/card32eu/Card32EUPage.jsx")),
  },
  {
    path: "/casino/abj",
    component: lazy(() => import("../pages/casinoTableGames/abj/ABJPage.jsx")),
  },
  {
    path: "/casino/lucky7",
    component: lazy(() => import("../pages/casinoTableGames/lucky7/Lucky7Page.jsx")),
  },
  {
    path: "/casino/lucky7eu",
    component: lazy(() => import("../pages/casinoTableGames/lucky7eu/Lucky7EUPage.jsx")),
  },
  {
    path: "/casino/lucky7eu2",
    component: lazy(() => import("../pages/casinoTableGames/lucky7eu2/Lucky7EU2Page.jsx")),
  },
  {
    path: "/casino/3cardj",
    component: lazy(() => import("../pages/casinoTableGames/threecardj/ThreeCardJPage.jsx")),
  },
  {
    path: "/casino/war",
    component: lazy(() => import("../pages/casinoTableGames/war/WarPage.jsx")),
  },
  {
    path: "/casino/aaa",
    component: lazy(() => import("../pages/casinoTableGames/aaa/AAAPage.jsx")),
  },
  {
    path: "/casino/worli",
    component: lazy(() => import("../pages/casinoTableGames/worli/WorliPage.jsx")),
  },
  {
    path: "/casino/worli2",
    component: lazy(() => import("../pages/casinoTableGames/worli2/Worli2Page.jsx")),
  },
  {
    path: "/casino/btable",
    component: lazy(() => import("../pages/casinoTableGames/btable/BtablePage.jsx")),
  },
  {
    path: "/casino/lottcard",
    component: lazy(() => import("../pages/casinoTableGames/lottcard/LottcardPage.jsx")),
  },
  {
    path: "/casino/cricketv3",
    component: lazy(() => import("../pages/casinoTableGames/cricketv3/CricketV3Page.jsx")),
  },
  {
    path: "/casino/cmatch20",
    component: lazy(() => import("../pages/casinoTableGames/cmatch20/Cmatch20Page.jsx")),
  },
  {
    path: "/casino/cmeter",
    component: lazy(() => import("../pages/casinoTableGames/cmeter/CmeterPage.jsx")),
  },
  {
    path: "/casino/queen",
    component: lazy(() => import("../pages/casinoTableGames/queen/QueenPage.jsx")),
  },
  {
    path: "/casino/race20",
    component: lazy(() => import("../pages/casinoTableGames/race20/Race20Page.jsx")),
  },
  {
    path: "/casino/trap",
    component: lazy(() => import("../pages/casinoTableGames/trap/TrapPage.jsx")),
  },
  {
    path: "/casino/patti2",
    component: lazy(() => import("../pages/casinoTableGames/patti2/Patti2Page.jsx")),
  },
  {
    path: "/casino/teensin",
    component: lazy(() => import("../pages/casinoTableGames/teensin/TeensinPage.jsx")),
  },
  {
    path: "/casino/teenmuf",
    component: lazy(() => import("../pages/casinoTableGames/teenmuf/TeenmufPage.jsx")),
  },
  {
    path: "/casino/race17",
    component: lazy(() => import("../pages/casinoTableGames/race17/Race17Page.jsx")),
  },
  {
    path: "/casino/teen20b",
    component: lazy(() => import("../pages/casinoTableGames/teen20b/Teen20bPage.jsx")),
  },
  {
    path: "/casino/trio",
    component: lazy(() => import("../pages/casinoTableGames/trio/TrioPage.jsx")),
  },
  {
    path: "/casino/notenum",
    component: lazy(() => import("../pages/casinoTableGames/notenum/NotenumPage.jsx")),
  },
  {
    path: "/casino/teen120",
    component: lazy(() => import("../pages/casinoTableGames/teen120/Teen120Page.jsx")),
  },
  {
    path: "/casino/teen1",
    component: lazy(() => import("../pages/casinoTableGames/teen1/Teen1Page.jsx")),
  },
  {
    path: "/casino/aaa2",
    component: lazy(() => import("../pages/casinoTableGames/aaa2/AAA2Page.jsx")),
  },
  {
    path: "/casino/race2",
    component: lazy(() => import("../pages/casinoTableGames/race2/Race2Page.jsx")),
  },
  {
    path: "/casino/teen3",
    component: lazy(() => import("../pages/casinoTableGames/teen3/Teen3Page.jsx")),
  },
  {
    path: "/casino/dum10",
    component: lazy(() => import("../pages/casinoTableGames/dum10/Dum10Page.jsx")),
  },
  {
    path: "/casino/cmeter1",
    component: lazy(() => import("../pages/casinoTableGames/cmeter1/Cmeter1Page.jsx")),
  },
  {
    path: "/casino/teen32",
    component: lazy(() => import("../pages/casinoTableGames/teen32/Teen32Page.jsx")),
  },
  {
    path: "/casino/ballbyball",
    component: lazy(() => import("../pages/casinoTableGames/ballbyball/BallByBallPage.jsx")),
  },
  // Add more casino table games here:
];

export default casinoRoutes;
