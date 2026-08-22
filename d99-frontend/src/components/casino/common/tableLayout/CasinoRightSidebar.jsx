import { useState, useEffect, useRef } from "react";
import BetTable from "../BetTable.jsx";
import PlaceBet from "../PlaceBet.jsx";

export default function CasinoRightSidebar({
  bets = [],
  children,
  beforeBets,
  showPlaceBet,
  betValue,
  displayOdds,
  betType,
  selection,
  min,
  max,
  stakeAmount,
  setStakeAmount,
  placing,
  onClosePlaceBet,
  onSubmitBet,
  gameType,
  lotteryBall,
  jokerCardSrc,
  submitDisabled,
}) {
  const [isSticky, setIsSticky] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={ref}
      className={`sidebar right-sidebar casino-right-sidebar${isSticky ? " sticky" : ""}`}
    >
      <PlaceBet
        show={showPlaceBet}
        betValue={betValue}
        displayOdds={displayOdds}
        betType={betType}
        selection={selection}
        min={min}
        max={max}
        stakeAmount={stakeAmount}
        setStakeAmount={setStakeAmount}
        placing={placing}
        onClose={onClosePlaceBet}
        onSubmit={onSubmitBet}
        gameType={gameType}
        lotteryBall={lotteryBall}
        jokerCardSrc={jokerCardSrc}
        submitDisabled={submitDisabled}
      />
      {beforeBets}
      <BetTable bets={bets} />
      {children}
    </div>
  );
}
