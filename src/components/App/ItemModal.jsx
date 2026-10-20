import { useContext, useId } from "react";
import { createPortal } from "react-dom";
import CurrentUserContext from "../../contexts/CurrentUserContext.js";
import useDialog from "../../hooks/useDialog.js";
import ImageWithPlaceholder from "./ImageWithPlaceholder.jsx";
import closeIcon from "../../assets/Union.svg";
import "./ItemModal.css";

export default function ItemModal({ item, onClose, onOpenConfirm }) {
  const user = useContext(CurrentUserContext);
  const titleId = useId();
  const dialogRef = useDialog(Boolean(item), onClose);
  if (!item) return null;
  return createPortal(
    <div
      className="item-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="item-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <button
          className="item-modal__close interactive"
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          <img src={closeIcon} alt="" className="item-modal__close-icon" />
        </button>
        <div className="item-modal__image-section">
          <ImageWithPlaceholder
            src={item.link || item.imageUrl}
            alt={item.name}
            className="item-modal__image"
            loading="eager"
          />
        </div>
        <div className="item-modal__content">
          <div className="item-modal__row">
            <h2 id={titleId} className="item-modal__title">
              {item.name}
            </h2>
            {user && item.owner === user._id && (
              <button
                type="button"
                className="item-modal__delete interactive"
                onClick={() => onOpenConfirm(item)}
              >
                Delete item
              </button>
            )}
          </div>
          <p className="item-modal__weather">Weather: {item.weather}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
