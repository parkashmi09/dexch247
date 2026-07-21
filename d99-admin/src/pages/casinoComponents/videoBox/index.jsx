import React, { useState, useEffect } from "react";
import { getCardValue } from "../resultVisuals/cardAssets";
import styles from "./VideoBox.module.css";
import {
  VideoBoxTitle,
  VideoBoxTimer,
  MogamboCardsOverlay,
  VideoBoxResultOverlay,
  TeenUniqueCardsOverlay,
  Race20CardsOverlay,
  QueenCardsOverlay,
  Teen1DayCardsOverlay,
  Teen20CardsOverlay,
} from "./overlays";

const VideoBox = ({
  playerA,
  playerB,
  iframeSrc,
  timerValue,
  gameType,
  resultData,
  poisonCard,
  roundId,
  subData,
  winIndex = -1,
  videoTitle,
}) => {
  const [iframeError, setIframeError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [timerSize, setTimerSize] = useState(50);

  // Normalize card data: API may return string "6DD,7CC,..." or array ["6DD","7CC",...]
  const normalizedResultData =
    Array.isArray(resultData)
      ? resultData.join(",")
      : typeof resultData === "string"
        ? resultData
        : resultData ?? "";

  // Mogambo: parse card string → Daga/Teja (first 2), Mogambo (1). Total = sum of face values.
  const mogamboCards = (() => {
    if (gameType !== "mogambo") return null;
    const cards = String(normalizedResultData)
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const dagaTeja = [cards[0] || "1", cards[1] || "1"];
    const mogambo = [cards[2] || "1"];
    const allThree = [dagaTeja[0], dagaTeja[1], mogambo[0]];
    const total = allThree.reduce((sum, token) => sum + getCardValue(token), 0);
    const allPlaceholder =
      dagaTeja.every((c) => !c || c === "0" || c === "1") &&
      mogambo.every((c) => !c || c === "0" || c === "1");
    return { dagaTeja, mogambo, allPlaceholder, total };
  })();

  const handleIframeError = () => {
    setIframeError(true);
    setErrorMessage("Video stream unavailable");
  };

  useEffect(() => {
    setIframeError(false);
    setErrorMessage("");
  }, [iframeSrc]);

  useEffect(() => {
    const handleResize = () => {
      setTimerSize(window.innerWidth <= 768 ? 30 : 50);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMogambo = gameType === "mogambo";
  const isTeenunique = gameType === "teenunique";
  const isRace20 = gameType === "race20";
  const isQueen = gameType === "queen";
  const isTeen1Day = gameType === "teen33" || gameType === "teen32" || gameType === "teen3" || gameType === "teen" || gameType === "pteen" || gameType === "teenmuf";
  const isTeen20 = gameType === "teen20" || gameType === "teen20b" || gameType === "pteen20";

  // Unique Teenpatti: 6 cards from result string
  const teenuniqueCards = isTeenunique
    ? String(normalizedResultData).split(",").map((c) => c.trim()).filter(Boolean).slice(0, 6)
    : [];

  return (
    <div className={`${styles.videoBox} ${isTeenunique ? styles.teenunique : ""}`}>
      <VideoBoxTitle
        show={isMogambo || isRace20 || isQueen || isTeen1Day}
        title={isMogambo ? "Mogambo" : isRace20 ? "Race 20" : isQueen ? "Queen" : videoTitle || "Premium Teenpatti 1 Day"}
        roundId={roundId}
      />
      <VideoBoxTimer timerValue={timerValue} size={timerSize} />
      {isMogambo ? (
        <MogamboCardsOverlay mogamboCards={mogamboCards} />
      ) : isTeenunique ? (
        <TeenUniqueCardsOverlay cardTokens={teenuniqueCards} />
      ) : isRace20 ? (
        <Race20CardsOverlay normalizedResultData={normalizedResultData} />
      ) : isQueen ? (
        <QueenCardsOverlay
          normalizedResultData={normalizedResultData}
          subData={subData}
          winIndex={winIndex}
        />
      ) : isTeen1Day ? (
        <Teen1DayCardsOverlay normalizedResultData={normalizedResultData} />
      ) : isTeen20 ? (
        <Teen20CardsOverlay normalizedResultData={normalizedResultData} />
      ) : (
        <VideoBoxResultOverlay
          gameType={gameType}
          normalizedResultData={normalizedResultData}
          poisonCard={poisonCard}
          playerA={playerA}
          playerB={playerB}
        />
      )}

      <div className={styles.videoframe}>
        {iframeError ? (
          <div className={styles.errorMessage}>
            <div>🎥</div>
            <div>{errorMessage}</div>
            <div style={{ fontSize: "0.9rem", marginTop: "0.5rem", opacity: 0.8 }}>
              Please check your connection or try again later
            </div>
          </div>
        ) : (
          <iframe
            src={iframeSrc}
            className={styles.iframe}
            title="Live Stream"
            allowFullScreen
            onError={handleIframeError}
            onLoad={(e) => {
              try {
                const iframeDoc =
                  e.target.contentDocument || e.target.contentWindow?.document;
                if (
                  iframeDoc?.body?.innerText?.includes("not allowed")
                ) {
                  handleIframeError();
                  setErrorMessage("Stream access not allowed");
                }
              } catch {
                console.log(
                  "Cannot access iframe content due to CORS"
                );
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default VideoBox;
