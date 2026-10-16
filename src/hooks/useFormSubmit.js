import { useLayoutEffect, useRef, useState } from "react";
import { getErrorMessage } from "../utils/errors.js";

export default function useFormSubmit(isOpen) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const requestId = useRef(0);
  const pending = useRef(false);

  useLayoutEffect(() => {
    requestId.current += 1;
    pending.current = false;
    setIsSubmitting(false);
    setErrorMessage("");
    return () => {
      requestId.current += 1;
      pending.current = false;
    };
  }, [isOpen]);

  function submitForm(request, onSuccess) {
    if (!isOpen || pending.current) return;
    const id = ++requestId.current;
    pending.current = true;
    setIsSubmitting(true);
    setErrorMessage("");
    return Promise.resolve()
      .then(request)
      .then((result) => {
        if (requestId.current === id) onSuccess?.(result);
      })
      .catch((error) => {
        if (requestId.current === id && error?.name !== "AbortError")
          setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (requestId.current === id) {
          pending.current = false;
          setIsSubmitting(false);
        }
      });
  }
  return { isSubmitting, submitForm, errorMessage };
}
