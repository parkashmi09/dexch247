import { useRef, useState, useEffect } from "react";

function FlipDigit({ current }) {
  const prevRef = useRef(current);
  const [prev, setPrev] = useState(current);
  const [flipKey, setFlipKey] = useState(0);

  useEffect(() => {
    if (current !== prevRef.current) {
      setPrev(prevRef.current);
      prevRef.current = current;
      // Change key to force re-mount → re-trigger CSS animations
      setFlipKey((k) => k + 1);
    }
  }, [current]);

  return (
    <ul className="flip play" key={flipKey}>
      <li className="flip-clock-before">
        <a href="#">
          <div className="up"><div className="shadow"></div><div className="inn">{prev}</div></div>
          <div className="down"><div className="shadow"></div><div className="inn">{prev}</div></div>
        </a>
      </li>
      <li className="flip-clock-active">
        <a href="#">
          <div className="up"><div className="shadow"></div><div className="inn">{current}</div></div>
          <div className="down"><div className="shadow"></div><div className="inn">{current}</div></div>
        </a>
      </li>
    </ul>
  );
}

export default function FlipClock({ value = 0, className = "" }) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  const tens = Math.floor(seconds / 10);
  const ones = seconds % 10;

  return (
    <div className={`clock${className ? " " + className : ""} flip-clock-wrapper`}>
      <FlipDigit current={tens} />
      <FlipDigit current={ones} />
    </div>
  );
}
