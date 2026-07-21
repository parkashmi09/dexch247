import { useState } from "react";
import cardA from "../../../assets/img/aa2/A.png";
import card2 from "../../../assets/img/aa2/2.png";
import card3 from "../../../assets/img/aa2/3.png";
import card4 from "../../../assets/img/aa2/4.png";
import card5 from "../../../assets/img/aa2/5.png";
import card6 from "../../../assets/img/aa2/6.png";
import card7 from "../../../assets/img/aa2/7.png";
import card8 from "../../../assets/img/aa2/8.png";
import card9 from "../../../assets/img/aa2/9.png";
import card10 from "../../../assets/img/aa2/10.png";
import cardJ from "../../../assets/img/aa2/J.png";
import cardQ from "../../../assets/img/aa2/Q.png";
import cardK from "../../../assets/img/aa2/K.png";

const CARDS = [
  { value: "A", image: cardA },
  { value: "2", image: card2 },
  { value: "3", image: card3 },
  { value: "4", image: card4 },
  { value: "5", image: card5 },
  { value: "6", image: card6 },
  { value: "7", image: card7 },
  { value: "8", image: card8 },
  { value: "9", image: card9 },
  { value: "10", image: card10 },
  { value: "J", image: cardJ },
  { value: "Q", image: cardQ },
  { value: "K", image: cardK },
];

function formatRangeVal(val) {
  if (val == null || val === "") return "0";
  const n = Number(val);
  if (n >= 100000) return `${n / 100000}L`;
  if (n >= 1000) return `${n / 1000}K`;
  return String(n);
}

export default function BetTableDragon({
  data = [],
  onBetClick,
  exposures = {},
  myBets = [],
}) {
  const [rangeDragon, setRangeDragon] = useState(false);
  const [rangeTiger, setRangeTiger] = useState(false);
  const [rangeDragonCards, setRangeDragonCards] = useState(false);
  const [rangeTigerCards, setRangeTigerCards] = useState(false);

  const findBetData = (name) =>
    data.find((item) => item.nat === name) || { nat: name, b: undefined, sid: null, min: undefined, max: undefined };

  const findCardBetData = (side, card) => {
    const apiVal = card.value === "A" ? "1" : card.value;
    return findBetData(`${side} Card ${apiVal}`);
  };

  const getOdds = (bet, fallback) =>
    bet?.b !== undefined && bet.b !== null && bet.b !== "" ? bet.b : fallback;

  const isSuspended = (bet) => bet?.gstatus === "SUSPENDED";

  const getExposure = (name) => {
    const v = exposures[name] ?? exposures[name?.toLowerCase()];
    return v != null ? Number(v) : 0;
  };

  const getBookClass = (exp) => (exp >= 0 ? "casino-book book-green" : "casino-book book-red");
  const renderBook = (name) => {
    const exp = getExposure(name);
    return <span className={getBookClass(exp)}>{exp}</span>;
  };

  const renderRange = (bet, isOpen, toggle) => {
    const min = bet?.min != null ? formatRangeVal(bet.min) : "1K";
    const max = bet?.max != null ? formatRangeVal(bet.max) : "20K";
    return (
      <div className="float-right pr">
        <i
          className="fas fa-info-circle"
          onClick={(e) => { e.preventDefault(); toggle((v) => !v); }}
          role="button"
          aria-label="Toggle range"
        />
        <div className={`collapse icon-range ${isOpen ? "show" : ""}`}>
          R:<span>{min}</span>-<span>{max}</span>
        </div>
      </div>
    );
  };

  const dragonBet = findBetData("Dragon");
  const tieBet = findBetData("Tie");
  const tigerBet = findBetData("Tiger");
  const pairBet = findBetData("Pair");

  const dragonEven = findBetData("Dragon Even");
  const dragonOdd = findBetData("Dragon Odd");
  const dragonRed = findBetData("Dragon Red");
  const dragonBlack = findBetData("Dragon Black");
  const tigerEven = findBetData("Tiger Even");
  const tigerOdd = findBetData("Tiger Odd");
  const tigerRed = findBetData("Tiger Red");
  const tigerBlack = findBetData("Tiger Black");

  const backItem = (label, bet, oddsFallback, onClick, exposureKey) => {
    const suspended = isSuspended(bet);
    const exp = getExposure(exposureKey ?? bet?.nat);
    const selection = bet?.nat ?? label;
    return (
      <div className="casino-bl-box">
        <div
          className={`back casino-bl-box-item ${suspended ? "suspended" : ""}`}
          onClick={() => !suspended && onClick?.(selection, getOdds(bet, oddsFallback), bet)}
          role="button"
        >
          <span className="casino-box-odd">{label}</span>
          <span className={getBookClass(exp)}>{exp}</span>
        </div>
      </div>
    );
  };

  const backItemSuits = (suitSymbols, bet, oddsFallback, onClick, exposureKey) => {
    const suspended = isSuspended(bet);
    const exp = getExposure(exposureKey ?? bet?.nat);
    const selection = bet?.nat;
    return (
      <div className="casino-bl-box">
        <div
          className={`back casino-bl-box-item casino-card-img ${suspended ? "suspended" : ""}`}
          onClick={() => !suspended && selection && onClick?.(selection, getOdds(bet, oddsFallback), bet)}
          role="button"
        >
          <span>{suitSymbols}</span>
          <span className={getBookClass(exp)}>{exp}</span>
        </div>
      </div>
    );
  };

  const cardItem = (side, card) => {
    const bet = findCardBetData(side, card);
    const apiVal = card.value === "A" ? "1" : card.value;
    const label = `${side} Card ${apiVal}`;
    const suspended = isSuspended(bet);
    const odds = bet?.b != null && bet.b !== "" && bet.b !== 0 ? String(bet.b) : "12";
    const exp = getExposure(label);
    return (
      <div
        key={`${side}-${card.value}`}
        className="casino-card-item"
        onClick={() => !suspended && onBetClick?.(label, odds, bet)}
        role="button"
      >
        <div className={`card-image ${suspended ? "suspended" : ""}`}>
          <img src={card.image} alt={card.value} />
        </div>
        <div className={getBookClass(exp)}>{exp}</div>
      </div>
    );
  };

  return (
    <div className="casino-table casino-detail dt20">
      <div className="dtobx-top">
        <div
          className={`dragon-box ${isSuspended(dragonBet) ? "suspended" : ""}`}
          onClick={() => !isSuspended(dragonBet) && onBetClick?.("Dragon", getOdds(dragonBet, "2"), dragonBet)}
          role="button"
        >
          <div><b>Dragon</b></div>
          <div className="text-center">
            <span className="d-block"><b>{getOdds(dragonBet, "2")}</b></span>
            <span className="d-block casino-book book-red">{getExposure("Dragon")}</span>
          </div>
        </div>
        <div
          className={`tiebox ${isSuspended(tieBet) ? "suspended" : ""}`}
          onClick={() => !isSuspended(tieBet) && onBetClick?.("Tie", getOdds(tieBet, "50"), tieBet)}
          role="button"
        >
          <div><b>Tie</b></div>
          <div className="text-center">
            <span className="d-block"><b>{getOdds(tieBet, "50")}</b></span>
            <span className="d-block casino-book book-red">{getExposure("Tie")}</span>
          </div>
        </div>
        <div
          className={`tiger-box ${isSuspended(tigerBet) ? "suspended" : ""}`}
          onClick={() => !isSuspended(tigerBet) && onBetClick?.("Tiger", getOdds(tigerBet, "2"), tigerBet)}
          role="button"
        >
          <div><b>Tiger</b></div>
          <div className="text-center">
            <span className="d-block"><b>{getOdds(tigerBet, "2")}</b></span>
            <span className="d-block casino-book book-red">{getExposure("Tiger")}</span>
          </div>
        </div>
        <div
          className={`pair-box ${isSuspended(pairBet) ? "suspended" : ""}`}
          onClick={() => !isSuspended(pairBet) && onBetClick?.("Pair", getOdds(pairBet, "12"), pairBet)}
          role="button"
        >
          <div><b>Pair</b></div>
          <div className="text-center">
            <span className="d-block"><b>{getOdds(pairBet, "12")}</b></span>
            <span className="d-block casino-book book-red">{getExposure("Pair")}</span>
          </div>
        </div>
      </div>

      <div className="teen1daycasino-container mt-5">
        <div className="teen1dayleft">
          <div>
            <div className="casino-box-row justify-content-center casino-odds casino-title">
              <div className="text-left w-100">
                <b className="text-playera">Dragon</b>
                {renderRange(dragonEven, rangeDragon, setRangeDragon)}
              </div>
            </div>
            <div className="casino-box-row">
              <div className="casino-bl-box"><b>{getOdds(dragonEven, "2.1")}</b></div>
              <div className="casino-bl-box"><b>{getOdds(dragonOdd, "1.79")}</b></div>
              <div className="casino-bl-box"><b>{getOdds(dragonRed, "1.95")}</b></div>
              <div className="casino-bl-box"><b>{getOdds(dragonBlack, "1.95")}</b></div>
            </div>
            <div className="casino-box-row">
              {backItem("Even", dragonEven, "2.1", onBetClick, "Dragon Even")}
              {backItem("Odd", dragonOdd, "1.79", onBetClick, "Dragon Odd")}
              {backItemSuits(<span className="casino-box-odd">♠ ♣</span>, dragonBlack, "1.95", onBetClick, "Dragon Black")}
              {backItemSuits(<span className="casino-box-odd text-danger">♥ ♦</span>, dragonRed, "1.95", onBetClick, "Dragon Red")}
            </div>
          </div>
          <div className="casino-box cards-box">
            <div className="w-100">
              <div className="casino-odds casino-cards-odds-title">
                <div className="text-center w-100">
                  <b>12</b>
                  {renderRange(pairBet, rangeDragonCards, setRangeDragonCards)}
                </div>
              </div>
              <div className="casino-cards text-center mt-1">
                {CARDS.map((card) => cardItem("Dragon", card))}
              </div>
            </div>
          </div>
        </div>

        <div className="teen1daycenter" />

        <div className="teen1dayright">
          <div>
            <div className="casino-box-row justify-content-center casino-odds casino-title">
              <div className="text-left w-100">
                <b className="text-playerb">Tiger</b>
                {renderRange(tigerEven, rangeTiger, setRangeTiger)}
              </div>
            </div>
            <div className="casino-box-row">
              <div className="casino-bl-box"><b>{getOdds(tigerEven, "2.1")}</b></div>
              <div className="casino-bl-box"><b>{getOdds(tigerOdd, "1.79")}</b></div>
              <div className="casino-bl-box"><b>{getOdds(tigerRed, "1.95")}</b></div>
              <div className="casino-bl-box"><b>{getOdds(tigerBlack, "1.95")}</b></div>
            </div>
            <div className="casino-box-row">
              {backItem("Even", tigerEven, "2.1", onBetClick, "Tiger Even")}
              {backItem("Odd", tigerOdd, "1.79", onBetClick, "Tiger Odd")}
              {backItemSuits(<span className="casino-box-odd">♠ ♣</span>, tigerBlack, "1.95", onBetClick, "Tiger Black")}
              {backItemSuits(<span className="casino-box-odd text-danger">♥ ♦</span>, tigerRed, "1.95", onBetClick, "Tiger Red")}
            </div>
          </div>
          <div className="casino-box cards-box">
            <div className="w-100">
              <div className="casino-odds casino-cards-odds-title">
                <div className="text-center w-100">
                  <b>12</b>
                  {renderRange(pairBet, rangeTigerCards, setRangeTigerCards)}
                </div>
              </div>
              <div className="casino-cards text-center mt-1">
                {CARDS.map((card) => cardItem("Tiger", card))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
