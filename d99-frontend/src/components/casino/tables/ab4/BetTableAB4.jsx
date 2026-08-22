import { useMemo, useRef, useState, useEffect, useCallback, memo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const AB_CARD_BASE = "/assets/front/img/andar-bahar-cards/";
const CARD_BASE = "/assets/img/cards/";
const CARD_BACK = "/assets/img/cards/1.jpg";

const SUFFIX_POS = { A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13 };

function parseCards(cardStr) {
  if (!cardStr) return [];
  return cardStr.split(",").map((c) => c.trim()).filter((c) => c && c !== "1");
}

function cardSrc(code) {
  if (!code || code === "1") return CARD_BACK;
  return `${CARD_BASE}${code}.jpg`;
}

function getCardPos(nat) {
  const suffix = nat.split(" ").slice(1).join(" ");
  return SUFFIX_POS[suffix] ?? 0;
}

// Simple slider component
const CardSlider = memo(function CardSlider({ cards, label }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [cards.length]);

  return (
    <>
      <h5>{label}</h5>
      <div className="ms-4" style={{ overflow: "hidden", position: "relative" }}>
        <div ref={containerRef} style={{ display: "flex", overflowX: "auto", scrollBehavior: "smooth", gap: 2 }}>
          {cards.map((code, i) => (
            <div key={i} style={{ minWidth: 24, flexShrink: 0 }}>
              <img src={cardSrc(code)} alt="" style={{ width: "100%", display: "inline-block" }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
});

// Slick slider for card strip
const CardStrip = memo(function CardStrip({ cards }) {
  const sliderRef = useRef(null);
  const prevLen = useRef(cards.length);

  useEffect(() => {
    if (cards.length !== prevLen.current && sliderRef.current) {
      prevLen.current = cards.length;
      sliderRef.current.slickGoTo(Math.max(0, cards.length - 3));
    }
  }, [cards.length]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 3,
    slidesToScroll: 3,
    initialSlide: Math.max(0, cards.length - 3),
    rtl: false,
    arrows: true,
  };

  return (
    <div className="ms-4">
      <Slider ref={sliderRef} {...settings}>
        {cards.map((code, i) => (
          <div key={i}>
            <img src={cardSrc(code)} alt="" style={{ width: "100%", display: "inline-block" }} />
          </div>
        ))}
      </Slider>
    </div>
  );
});

// Video cards section with Andar/Bahar card strips
export function AB4VideoCards({ cardString = "", nextCount = "0", nextSide = "Bahar" }) {
  const allCards = useMemo(() => parseCards(cardString), [cardString]);
  const andarCards = useMemo(() => allCards.filter((_, i) => i % 2 === 1), [allCards]);
  const baharCards = useMemo(() => allCards.filter((_, i) => i % 2 === 0), [allCards]);

  return (
    <div className="casino-video-cards">
      <span className="text-white">
        Next Card Count: <span className="text-warning">{nextCount} / {nextSide}</span>
      </span>
      <div className="ab-cards-container">
        <h5>Andar</h5>
        <CardStrip cards={andarCards} />
        <h5>Bahar</h5>
        <CardStrip cards={baharCards} />
      </div>
    </div>
  );
}

// ANDAR BAHAR 150 CARDS pays a flat 100% of the stake on a win (game rules:
// "a winning payout of 100% of the bet amount will be given"), so the PRICE is
// ALWAYS decimal 2.0 — it never varies by card or by side.
//
// The vendor feed carries no odds for this table at all. Its two child fields
// are easy to mistake for a price, and both have been mistaken for one:
//   child[].b → 0/1 flag, "is this side currently bettable"
//   child[].l → how many of that rank are still left in the 156-card shoe
//               (12 at a fresh shoe, counting down)
//
// So the card box and the bet price show DIFFERENT numbers, and that is correct:
//   • printed ON the card  → `l`, the remaining count (matches the live site,
//     which shows a different number per rank, e.g. 8 9 8 9 7 6 7 8 7 10 8 9 8)
//   • sent as the odds     → AB4_ODDS, always 2
// Passing `l` as the odds is what overpaid winners: a bet early in the shoe was
// stored at odds 12 and settlement paid stake×(12−1), returning 1100 on a 100
// bet instead of 100.
const AB4_ODDS = 2;

// Betting grid for 13 card positions
function CardsBetBox({ boxClass, title, items, isSuspended, onBetClick }) {
  return (
    <div className={`${boxClass}${isSuspended ? " suspended-box" : ""}`}>
      <div className="ab-title">{title}</div>
      <div className="ab-cards">
        {items.map((item) => {
          const pos = getCardPos(item.nat);
          const isActive = Number(item.b) > 0;
          // Show card image only when this side is active (b > 0), blank when suspended
          const imgNum = isActive ? pos : 0;
          // Remaining count of this rank in the shoe — printed on the card, and
          // the reason the box can be dead: at 0 the rank is exhausted and can
          // never be drawn again, so it must not take a bet.
          const remaining = Number(item.l) || 0;
          const canClick = !isSuspended && isActive && remaining > 0;

          return (
            <div
              key={item.sid}
              className="card-odd-box"
              onClick={canClick ? () => onBetClick?.(AB4_ODDS, item.nat, item, "back") : undefined}
              style={canClick ? { cursor: "pointer" } : undefined}
            >
              {/* the shoe count, NOT the price — see AB4_ODDS above */}
              <div className="casino-odds">{remaining}</div>
              <div className={isSuspended ? "" : ""}>
                <img src={`${AB_CARD_BASE}${imgNum}.jpg`} alt={item.nat} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// `exposures` is deliberately NOT accepted/rendered: this table shows no
// worst-case book under the cards. AB4Page still passes the prop; it is ignored.
export default function BetTableAB4({ gameData, onBetClick }) {
  const child = gameData?.data?.data?.child || gameData?.data?.child || gameData?.child || [];
  const sub = gameData?.data?.data?.sub || gameData?.data?.sub || gameData?.sub || [];
  const card = gameData?.data?.data?.card || gameData?.data?.card || gameData?.card || "";

  const andarItems = child.filter((c) => c.nat?.startsWith("Andar"));
  const baharItems = child.filter((c) => c.nat?.startsWith("Bahar"));

  const globalSusp = sub.length > 0 && (sub[0].gstatus === "SUSPENDED" || sub[0].gstatus === "0");

  // b=1 means it's this side's turn to bet, b=0 means other side's turn
  // Cards should always show (based on l > 0), only "suspended-box" overlay when can't bet
  const andarCanBet = andarItems.some((c) => Number(c.b) > 0);
  const baharCanBet = baharItems.some((c) => Number(c.b) > 0);
  const andarSusp = globalSusp || !andarCanBet;
  const baharSusp = globalSusp || !baharCanBet;

  const nextCardItem = sub[0];
  const nextCount = nextCardItem ? String(nextCardItem.nat || "").replace("Card ", "") : "0";
  const allCards = parseCards(card);
  const andarCards = allCards.filter((_, i) => i % 2 === 1);
  const baharCards = allCards.filter((_, i) => i % 2 === 0);
  const nextSide = andarCards.length <= baharCards.length ? "Andar" : "Bahar";

  return (
    <div className="casino-table">
      <div className="casino-table-box">
        <CardsBetBox
          boxClass="andar-box"
          title="ANDAR"
          items={andarItems}
          isSuspended={andarSusp}
          onBetClick={onBetClick}
        />
        <CardsBetBox
          boxClass="bahar-box"
          title="BAHAR"
          items={baharItems}
          isSuspended={baharSusp}
          onBetClick={onBetClick}
        />
      </div>
    </div>
  );
}
