import { useId } from "react";
import { createPortal } from "react-dom";
import useDialog from "../../hooks/useDialog.js";
import "./ModalWithForm.css";

function ModalWithForm({
  title,
  name,
  buttonText,
  onClose,
  onSubmit,
  children,
  secondaryAction,
  isOpen,
  isSubmitDisabled = false,
  isSubmitting = false,
  isCloseDisabled = false,
  pendingText = "Saving...",
  hideSubmit = false,
  errorMessage = "",
}) {
  const titleId = useId();
  const errorId = useId();
  function handleClose() {
    if (!isCloseDisabled) onClose();
  }
  const dialogRef = useDialog(isOpen, handleClose);
  if (!isOpen) return null;

  return createPortal(
    <div
      className={`modal modal_type_${name}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div
        ref={dialogRef}
        className="modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={errorMessage ? errorId : undefined}
        aria-busy={isSubmitting}
        tabIndex={-1}
      >
        <button
          type="button"
          className="modal__close interactive"
          aria-label="Close"
          disabled={isCloseDisabled}
          onClick={handleClose}
        />
        <h2 id={titleId} className="modal__title">
          {title}
        </h2>
        <form
          className="modal__form"
          name={name}
          onSubmit={onSubmit}
          aria-describedby={errorMessage ? errorId : undefined}
        >
          <fieldset className="modal__fields" disabled={isSubmitting}>
            {children}
          </fieldset>
          {errorMessage && (
            <p id={errorId} className="modal__error" role="alert">
              {errorMessage}
            </p>
          )}
          {!hideSubmit && (
            <div className="modal__actions">
              <button
                className="modal__submit interactive"
                type="submit"
                disabled={isSubmitDisabled || isSubmitting}
              >
                {isSubmitting ? pendingText : buttonText}
              </button>
              {secondaryAction}
            </div>
          )}
        </form>
      </div>
    </div>,
    document.body,
  );
}
export default ModalWithForm;
