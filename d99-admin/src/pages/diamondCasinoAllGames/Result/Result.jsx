import React from 'react';
import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";

import "./Result.css";

const Result = ({ data=[], gameType="default" }) => {
  console.log(data,"results....>>>>>")
  
  const getResultClass = (res) => {
    if (gameType === "baccarat") {
      // For Baccarat: 1 = Player (P), 2 = Banker (B)
      if (res === "1" || res === 1 || res === "P") {
        return "result-a";
      } else if (res === "2" || res === 2 || res === "B") {
        return "result-b";
      }
    }
    // Default behavior
    return res === "A" ? "yes" : "no";
  };
  
  const getResultLabel = (res) => {
    if (gameType === "baccarat") {
      if (res === "1" || res === 1 || res === "P") {
        return "P";
      } else if (res === "2" || res === 2 || res === "B") {
        return "B";
      }
    }
    return res;
  };
  
  return (
    <div className={`result-row ${gameType === "baccarat" ? "baccarat" : ""}`}>
      {data.map((res, index) => (
        <div
          key={index}
          className={`result-circle ${getResultClass(res)}`}
        >
          {getResultLabel(res)}
        </div>
      ))}
    </div>
    
  );
};

export default Result;
