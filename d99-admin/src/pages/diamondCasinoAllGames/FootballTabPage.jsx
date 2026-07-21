import { useState, useEffect } from "react";
import LiveBoard from "../../components/liveBoard";
import styles from "../diamondHome/DiamondHome.module.css";



export default function FootballTabPage() {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const sid = 1; // Football sid

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.section1}>
          <div></div>
        </div>
        <div className={styles.liveBoard}>
          <LiveBoard sid={sid} isMobile={isMobileView} />
        </div>
     
      </div>
    </>
  );
}
