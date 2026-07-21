import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Bar2mobile from "./Bar2mobile";
import LiveBoard from "../../components/liveBoard";
import RacingBoard from "../../components/racingBoard";
import Slider from "../../components/slider/Slider";
import styles from "./DiamondHome.module.css";
import { Games } from "../diamondCasinoAllGames";
import HotGames from "../../components/HotGames";

const data2 = [
  { index: 0, event: "Cricket", sid: 4 },
  { index: 1, event: "Football", sid: 1 },
  { index: 2, event: "Tennis", sid: 2 },
  { index: 3, event: "Table Tennis", sid: 8 },
  { index: 4, event: "Esoccer", sid: 68 },
  { index: 5, event: "Horse Racing", sid: 10 },
  { index: 6, event: "Greyhound Racing", sid: 65 },
  { index: 7, event: "Basketball", sid: 15 },
  // { index: 8, event: "Wrestling", sid: 69 },
  { index: 9, event: "Volleyball", sid: 18 },
  { index: 10, event: "Badminton", sid: 22 },
  { index: 11, event: "Snooker", sid: 59 },
  { index: 12, event: "Darts", sid: 57 },
  { index: 13, event: "Boxing", sid: 6 },
  { index: 14, event: "Mixed Martial Arts", sid: 3 },
  { index: 15, event: "American Football", sid: 58 },
  { index: 16, event: "E Games", sid: 11 },
  { index: 17, event: "Ice Hockey", sid: 19 },
  { index: 18, event: "Futsal", sid: 9 },
  { index: 19, event: "Politics", sid: 40 },
  { index: 20, event: "Motor Sports", sid: 52 },
  { index: 21, event: "Kabaddi", sid: 66 },
];



const Bar2 = ({ index, text, isActive, onClick }) => {
  return (
    <div className={`${styles.bar2} ${isActive ? styles["bar2-active"] : ""}`} onClick={() => onClick(index)}>
      <div>{text}</div>
    </div>
  );
};

export default function DiamondHome() {
  const { tab } = useParams();
  const navigate = useNavigate();
  // Map tab param to tab index
  const getIndexFromTab = (tabParam) => {
    if (!tabParam || tabParam === "cricket" || tabParam === "home") return 0;
    const idx = data2.findIndex(d => d.event.toLowerCase().replace(/ /g, "") === tabParam);
    return idx !== -1 ? idx : -1;
  };
  const [activeIndex, setActiveIndex] = useState(getIndexFromTab(tab));
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  useEffect(() => {
    setActiveIndex(getIndexFromTab(tab));
  }, [tab]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Top bar events are now handled in the Header component
  }, []);

  const handleClick = (index) => {
    setActiveIndex(index);
    const tabName = data2[index]?.event?.toLowerCase().replace(/ /g, "");
    if (tabName && tabName !== "cricket") {
      navigate(`/home/${tabName}`);
    } else {
      navigate(`/home`);
    }
  };

  const activeSid = data2[activeIndex]?.sid || data2[0]?.sid || 4;
  // Only show main content for valid tabs in data2
  const showMainContent = activeIndex !== -1;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.section1}>
          {tab === 'home' || !tab ? (
            <HotGames />
          ) : (
            <div></div>
          )}

        </div>
        <div className={styles.section2}>
          {isMobileView ? (
            <Bar2mobile
              data={data2}
              activeIndex={activeIndex}
              onClick={handleClick}
            />

          ) : (
            <Slider>
              {data2.map((item) => (
                <Bar2
                  key={item.index}
                  index={item.index}
                  text={item.event}
                  isActive={activeIndex === item.index}
                  onClick={handleClick}
                />

              ))}
            </Slider>
          )}
        </div>
        {showMainContent ? (
          <>
            <div className={styles.liveBoard}>
              {activeSid === 10 || activeSid === 65 ? (
                <RacingBoard sid={activeSid} isMobile={isMobileView} />
              ) : (
                <LiveBoard sid={activeSid} isMobile={isMobileView} />
              )}
            </div>
            <Games />
          </>
        ) : (
          <div style={{ minHeight: '40vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontSize: 24, color: '#2C3E50', fontWeight: 600 }}>
            This section is currently not active, try again later.
          </div>
        )}
      </div>
    </>
  );
}