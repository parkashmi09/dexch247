import React from "react";
import { Link } from "react-router-dom";
import styles from "./CasinoLastResult.module.css";

// Result components by game type (strict switch – add new games here)
import ResultTeen from "../../diamondCasinoAllGames/resultui/resultTeen/ResultTeen";
import ResultTrio from "../../diamondCasinoAllGames/resultui/resultTrio/ResultTrio";
import ResultTrap from "../../diamondCasinoAllGames/resultui/resultTrap/ResultTrap";
import ResultPoker from "../../diamondCasinoAllGames/resultui/resultPoker/ResultPoker";
import ResultPoker20 from "../../diamondCasinoAllGames/resultui/resultPoker20/ResultPoker20";
import ResultPoker6 from "../../diamondCasinoAllGames/resultui/resultPoker6/ResultPoker6";
import ResultBaccarat from "../../diamondCasinoAllGames/resultui/resultBaccarat/ResultBaccarat";
import ResultBaccarat2 from "../../diamondCasinoAllGames/resultui/resultBaccarat2/ResultBaccarat2";
import ResultDragonTiger from "../../diamondCasinoAllGames/resultui/resultDragonTiger/ResultDragonTiger";
import ResultDragonTiger202 from "../../diamondCasinoAllGames/resultui/resultDragonTiger202/ResultDragonTiger202";
import ResultDragonTiger6 from "../../diamondCasinoAllGames/resultui/resultDragonTiger6/ResultDragonTiger6";
import ResultLucky7 from "../../diamondCasinoAllGames/resultui/resultLucky7/ResultLucky7";
import ResultCard32 from "../../diamondCasinoAllGames/resultui/resultCard32/ResultCard32";
import ResultCard32B from "../../diamondCasinoAllGames/resultui/resultCard32B/ResultCard32B";
import ResultSimple from "../../diamondCasinoAllGames/Result/Result";
import ResultTeen20 from "../../diamondCasinoAllGames/resultui/resultTeen20/ResultTeen20";
import ResultMogambo from "../../diamondCasinoAllGames/resultui/resultMogambo/ResultMogambo";
import ResultTeenUnique from "../../diamondCasinoAllGames/resultui/resultTeenUnique/ResultTeenUnique";
import ResultSuperOver2 from "../../diamondCasinoAllGames/resultui/resultSuperOver2/ResultSuperOver2";
import ResultSuperOver from "../../diamondCasinoAllGames/resultui/resultSuperOver/ResultSuperOver";
import ResultLucky15 from "../../diamondCasinoAllGames/resultui/resultLucky15/ResultLucky15";
import ResultGoals from "../../diamondCasinoAllGames/resultui/resultGoals/ResultGoals";
import ResultRace20 from "../../diamondCasinoAllGames/resultui/resultRace20/ResultRace20";
import ResultQueen from "../../diamondCasinoAllGames/resultui/resultQueen/ResultQueen";
import ResultTeenPattiTest from "../../diamondCasinoAllGames/resultui/resultTeenPattiTest/ResultTeenPattiTest";
import ResultTeen33 from "../../diamondCasinoAllGames/resultui/resultTeen33/ResultTeen33";

/**
 * Renders the "Last Result" block: heading + View All link + game-type-specific result UI.
 * Based on gameType, a strict switch picks the correct result component (like ResultVisuals).
 */
function ResultByGameType({ gameType, data, gameData, ...rest }) {
  const normalized = (gameType || "").toLowerCase().trim();

  switch (normalized) {
    case "teen20":
    case "teen20b":
    case "teen20c":
    case "pteen20":
      return <ResultTeen20 gameType={normalized} data={data || []} gameData={gameData || {}} {...rest} />;

    case "teen":
    case "pteen":
    case "teen8":
    case "teen41":
    case "teen42":
    case "teen62":
    case "teen6":
    case "teen1":
    case "teensin":
    case "patti2":
      return <ResultTeen gameType={normalized} data={data || []} gameData={gameData || {}} {...rest} />;

    case "teen3":
    case "teen32":
    case "teen33":
    case "teenmuf":
      return <ResultTeen33 gameType={normalized} data={data || []} gameData={gameData || {}} {...rest} />;

    case "teen9":
    case "teenpattitest":
      return <ResultTeenPattiTest gameType={normalized} data={data || []} gameData={gameData || {}} {...rest} />;
    case "teenunique":
      return <ResultTeenUnique gameType={normalized} data={data || []} gameData={gameData || {}} {...rest} />;

    case "trio":
      return <ResultTrio data={data || []} gameData={gameData || {}} {...rest} />;
    case "trap":
      return <ResultTrap data={data || []} gameData={gameData || {}} {...rest} />;

    case "poker":
      return <ResultPoker data={data || []} gameData={gameData || {}} {...rest} />;
    case "poker20":
      return <ResultPoker20 data={data || []} gameData={gameData || {}} {...rest} />;
    case "poker6":
      return <ResultPoker6 data={data || []} gameData={gameData || {}} {...rest} />;

    case "baccarat":
      return <ResultBaccarat data={data || []} gameData={gameData || {}} {...rest} />;
    case "baccarat2":
    case "pbaccarat":
      return <ResultBaccarat2 data={data || []} gameData={gameData || {}} {...rest} />;

    case "dt20":
    case "pdt20":
    case "dragontiger":
      return <ResultDragonTiger gameType={normalized} data={data || []} gameData={gameData || {}} {...rest} />;
    case "dt202":
      return <ResultDragonTiger202 data={data || []} gameData={gameData || {}} {...rest} />;
    case "dt6":
      return <ResultDragonTiger6 data={data || []} gameData={gameData || {}} {...rest} />;

    case "lucky7":
    case "plucky7":
      return <ResultLucky7 data={data || []} gameData={gameData || {}} {...rest} />;

    case "card32":
    case "pcard32":
      return <ResultCard32 data={data || []} gameData={gameData || {}} {...rest} />;
    case "card32eu":
      return <ResultCard32B data={data || []} gameData={gameData || {}} {...rest} />;

    case "sicbo":
    case "sicbo2":
      return <ResultSimple data={data || []} gameType={normalized} {...rest} />;

    case "mogambo":
      return <ResultMogambo data={data || []} gameData={gameData || {}} {...rest} />;

    case "superover":
      return <ResultSuperOver data={data || []} gameData={gameData || {}} {...rest} />;
    case "superover2":
    case "superover3":
      return <ResultSuperOver2 data={data || []} gameData={gameData || {}} {...rest} />;

    case "lucky15":
      return <ResultLucky15 data={data || []} gameData={gameData || {}} {...rest} />;

    case "goal":
    case "goals":
      return <ResultGoals data={data || []} gameData={gameData || {}} {...rest} />;

    case "race20":
      return <ResultRace20 data={data || []} gameData={gameData || {}} {...rest} />;

    case "queen":
      return <ResultQueen data={data || []} gameData={gameData || {}} {...rest} />;

    case "joker20":
      return <ResultSimple data={data || []} gameType={normalized} {...rest} />;

    default:
      return <ResultSimple data={data || []} gameType="default" {...rest} />;
  }
}

export default function CasinoLastResult({
  gameType,
  data = [],
  gameData = {},
  viewAllLink,
  ...rest
}) {
  const reportLink = gameType
    ? `/admin/reports/casinoresult/${gameType}`
    : "/admin/reports/casinoresult"
  const linkTo = viewAllLink != null ? viewAllLink : reportLink
  return (
    <div className={styles.section}>
      <div className={styles.heading}>
        <span>Last Result</span>
        <Link style={{ color: "white" }} to={linkTo}>
          <span className={styles.viewAll}>View All</span>
        </Link>
      </div>
      <div className={styles.content}>
        <ResultByGameType
          gameType={gameType}
          data={data}
          gameData={gameData}
          {...rest}
        />
      </div>
    </div>
  );
}
