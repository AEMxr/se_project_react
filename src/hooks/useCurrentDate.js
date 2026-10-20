import { useEffect, useState } from "react";

export default function useCurrentDate() {
  const [date, setDate] = useState(() => new Date());
  useEffect(() => {
    const timer = { id: null };
    function refreshDate() {
      clearTimeout(timer.id);
      const now = new Date();
      setDate(now);
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      timer.id = setTimeout(refreshDate, midnight.getTime() - now.getTime());
    }
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") refreshDate();
    }
    refreshDate();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearTimeout(timer.id);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  return date;
}
