import { NavLink } from "react-router"
import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";

import styles from "./DragonTiger.module.css"

import CasinoHeading from "../../casinoComponents/casinoHeading"


import Result from "../Result/Result"

export default function DragonTiger() {
  const gameName = ""

 const resultdata=['A','A','B','A','A','A','B','B'];

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sectionA}>
          <div className={styles.videoBox}>
            <CasinoHeading name={gameName.toUpperCase} roundId="157250124095658" />

            {/* <LiveTv width={"20em"} height={"15em"}  /> */}
            <div style={{}}></div>
            <div className={styles.tv}> </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4em", gap: "1rem" }}></div>

          <div className={styles.heading}>
            <div>Last Result</div>
            <NavLink to="/casino/results">
              <div style={{ cursor: "pointer" }}>View All</div>
            </NavLink>
          </div>
          <Result data={resultdata} />
        </div>

        <div>
          <PlaceBet />
          <div className={styles.sectionB}>
            <div className={styles.section1}>
              <div>My Bet</div>
              <div className={styles.smallText}>Range 100 to 2L</div>
            </div>
            <div className={styles.section2}>
              <div>Matched Bet</div>
              <div>Odds</div>
              <div>Stake</div>
            </div>
          </div>
        </div>

        {/* Display error if it exists */}
      </div>
    </>
  )
}

