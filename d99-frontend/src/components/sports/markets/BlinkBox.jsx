import { useState, useEffect, useRef } from "react";

export function ExposureValue({ value, className = "" }) {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (num === 0) return null;
  const cls = `market-book ${className} ${num < 0 ? "text-danger" : "text-success"}`
    .replace(/\s+/g, " ")
    .trim();
  return <span className={cls}>{Math.round(num)}</span>;
}

// ---------------------------------------------------------------------------
// Blink wrapper — detects value changes and flashes the blink CSS class
// ---------------------------------------------------------------------------

export default function BlinkBox({ value, size, className, children, onClick }) {
  const prevValRef = useRef(value);
  const prevSizeRef = useRef(size);
  const [pulsing, setPulsing] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const valChanged = prevValRef.current !== value;
    const sizeChanged = prevSizeRef.current !== size;
    prevValRef.current = value;
    prevSizeRef.current = size;

    // Only pulse when BOTH odds AND size change (like old frontend)
    if (valChanged && sizeChanged && value !== "-") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPulsing(true);
      timerRef.current = setTimeout(() => setPulsing(false), 1300);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, size]);

  // Disable click if value is "-" or 0
  const isClickable = onClick && value !== "-" && value !== 0 && value !== "0";

  return (
    <div
      className={`${className}${pulsing ? " odds-pulse" : ""}`}
      onClick={isClickable ? onClick : undefined}
      style={isClickable ? { cursor: "pointer" } : undefined}
    >
      {children}
    </div>
  );
}
