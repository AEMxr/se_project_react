import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function useDialog(isOpen, onClose) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const background = [];
    let ancestor = dialog;
    while (
      ancestor.parentElement &&
      ancestor.parentElement !== document.documentElement
    ) {
      for (const sibling of ancestor.parentElement.children) {
        if (sibling !== ancestor && !sibling.hasAttribute("inert")) {
          sibling.setAttribute("inert", "");
          background.push(sibling);
        }
      }
      ancestor = ancestor.parentElement;
    }
    document.body.style.overflow = "hidden";

    function getFocusableElements() {
      return [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
        (element) =>
          !element.matches(":disabled") &&
          !element.closest("[hidden], [inert]") &&
          getComputedStyle(element).display !== "none" &&
          getComputedStyle(element).visibility !== "hidden",
      );
    }
    const firstInput = dialog.querySelector("input:not(:disabled)");
    (firstInput || getFocusableElements()[0] || dialog).focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
      } else if (event.key === "Tab") {
        const elements = getFocusableElements();
        const first = elements[0];
        const last = elements.at(-1);
        if (!first) {
          event.preventDefault();
          dialog.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first ||
            !dialog.contains(document.activeElement))
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !dialog.contains(document.activeElement))
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      background.forEach((element) => element.removeAttribute("inert"));
      const focusTarget =
        previousFocus?.isConnected && previousFocus !== document.body
          ? previousFocus
          : document.querySelector(".header__user") ||
            document.querySelector(".header__logo");
      focusTarget?.focus();
    };
  }, [isOpen]);

  return dialogRef;
}
