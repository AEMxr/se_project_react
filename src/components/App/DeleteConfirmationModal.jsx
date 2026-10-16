import ModalWithForm from "./ModalWithForm.jsx";
import useFormSubmit from "../../hooks/useFormSubmit.js";
import "./DeleteConfirmationModal.css";

export default function DeleteConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
}) {
  const { isSubmitting, submitForm, errorMessage } = useFormSubmit(isOpen);
  function handleSubmit(event) {
    event.preventDefault();
    submitForm(onConfirm, onCancel);
  }
  return (
    <ModalWithForm
      title="Are you sure you want to delete this item?"
      name="confirm-delete"
      onClose={onCancel}
      onSubmit={handleSubmit}
      isOpen={isOpen}
      isSubmitting={isSubmitting}
      isCloseDisabled={isSubmitting}
      hideSubmit
      errorMessage={errorMessage}
    >
      <p className="del-modal__subtitle">This action is irreversible.</p>
      <div className="del-modal__actions">
        <button
          type="submit"
          className="del-modal__confirm interactive"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Deleting..." : "Yes, delete item"}
        </button>
        <button
          type="button"
          className="del-modal__cancel interactive"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </ModalWithForm>
  );
}
