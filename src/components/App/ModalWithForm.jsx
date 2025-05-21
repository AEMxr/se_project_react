import React, { useEffect } from "react";
import "./ModalWithForm.css";

function ModalWithForm({
  title,
  name,
  buttonText,
  onClose,
  onSubmit,
  children,
  isOpen,
  isSubmitDisabled = false,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Close on overlay click
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className={`modal modal_type_${name}`}
      onMouseDown={handleOverlayClick}
    >
      <div className="modal__content">
        <button
          type="button"
          className="modal__close"
          aria-label="Close"
          onClick={onClose}
        />
        <h2 className="modal__title">{title}</h2>
        <form
          className="modal__form"
          name={name}
          onSubmit={onSubmit}
          autoComplete="off"
        >
          {children}
          <button
            className="modal__submit"
            type="submit"
            disabled={isSubmitDisabled}
          >
            {buttonText}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ModalWithForm;
