import { useState, useCallback } from "react";

export default function useTouch(initial = { name: false, image: false }) {
  const [touched, setTouched] = useState(initial);

  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    setTouched((touch) => ({ ...touch, [name]: true }));
  }, []);

  const resetTouched = useCallback(() => setTouched(initial), [initial]);

  return { touched, handleBlur, resetTouched, setTouched };
}
