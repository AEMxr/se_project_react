import ModalWithForm from "./ModalWithForm.jsx";
import "./DeleteConfirmationModal.css";

export default function DeleteConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
}) {
  return (
    <ModalWithForm
      title=""
      name="confirm-delete"
      buttonText=""
      onClose={onCancel}
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm?.();
      }}
      isOpen={isOpen}
    >
      <h1 className="del-modal__title">
        Are you sure you want to delete this item? <br />
        This action is irreversible.
      </h1>
      {/* <h1 className="del-modal__subtitle">This action is irreversible.</h1> */}

      <div className="del-modal__actions">
        <button
          type="button"
          className="del-modal__confirm"
          onClick={onConfirm}
          aria-label="Confirm delete"
        >
          Yes, delete item
        </button>
        <button
          type="button"
          className="del-modal__cancel"
          onClick={onCancel}
          aria-label="Cancel delete"
        >
          Cancel
        </button>
      </div>
    </ModalWithForm>
  );
}
