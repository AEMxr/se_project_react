import { useEffect, useState } from "react";

export default function useCurrentDate() {
  const [date, setDate] = useState(() => new Date());
  useEffect(() => {
    let timer;
    function refreshDate() {
      clearTimeout(timer);
      const now = new Date();
      setDate(now);
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      timer = setTimeout(refreshDate, midnight.getTime() - now.getTime());
    }
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") refreshDate();
    }
    refreshDate();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  return date;
}
