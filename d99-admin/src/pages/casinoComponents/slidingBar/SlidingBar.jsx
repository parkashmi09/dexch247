"use client";

import { useRef, useState } from "react";
import { FaAngleRight } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa";
import styles from "./SlidingBar.module.css"; // External CSS for styling

export default function SlidingBar({ items }) {
  const slidingContentRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0); // Track the active tab

  const handleSlide = (amount) => {
    const content = slidingContentRef.current;
    const maxScroll = content.scrollWidth - content.clientWidth;

    let newScrollPosition = scrollPosition + amount;

    // Prevent over-scrolling
    if (newScrollPosition < 0) newScrollPosition = 0;
    if (newScrollPosition > maxScroll) newScrollPosition = maxScroll;

    setScrollPosition(newScrollPosition);
    content.style.transform = `translateX(-${newScrollPosition}px)`;
  };

  const handleTabClick = (index) => {
    setActiveIndex(index); // Update the active index
  };

  return (
    <div className={styles.slidingContainer}>
      <button className={`${styles.slideBtn} ${styles.prevBtn}`} onClick={() => handleSlide(-200)}>
        <FaAngleLeft className={styles.icon} />
      </button>
      <div className={styles.slidingBar}>
        <div className={styles.slidingContent} ref={slidingContentRef}>
          {items.map((item, index) => (
            <a
              key={index}
              href="/"
              className={`${styles.tab} ${activeIndex === index ? styles.active : ""}`} // Apply active class
              onClick={(e) => { e.preventDefault(); handleTabClick(index); }}
            >
              {item}
            </a>
          ))}
        </div>
      </div>
      <button className={`${styles.slideBtn} ${styles.nextBtn}`} onClick={() => handleSlide(200)}>
        <FaAngleRight className={styles.icon} />
      </button>
    </div>
  );
}