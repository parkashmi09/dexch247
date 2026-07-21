import { useState, useEffect, useRef, useCallback } from "react";

const INACTIVITY_LIMIT = 60 * 1000; // 1 minute

export default function useInactivity(timeout = INACTIVITY_LIMIT) {
  const [isDisconnected, setIsDisconnected] = useState(false);
  const timerRef = useRef(null);

  const reconnect = useCallback(() => {
    setIsDisconnected(false);
  }, []);

  useEffect(() => {
    if (isDisconnected) return;

    const clear = () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };

    const start = () => {
      clear();
      timerRef.current = setTimeout(() => {
        clear();
        setIsDisconnected(true);
      }, timeout);
    };

    let lastActivity = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity < 1000) return;
      lastActivity = now;
      start();
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        lastActivity = 0;
        handleActivity();
      }
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    document.addEventListener("visibilitychange", handleVisibility);

    start();

    return () => {
      clear();
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isDisconnected, timeout]);

  return [isDisconnected, reconnect];
}
