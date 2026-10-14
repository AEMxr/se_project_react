import { useContext, useEffect } from "react";
import "./ItemModal.css";
import closeIcon from "../../assets/Union.svg";
import CurrentUserContext from "../../contexts/CurrentUserContext";

function ItemModal({ item, onClose, onOpenConfirm }) {

  const currentUser = useContext(CurrentUserContext);
  
  // console.log("ItemModal received item:", item);
  // console.log("Image source:", item.link);

  useEffect(() => {
  if (!item) {
    return;
  }

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [item, onClose]);

if (!item) {
  return null;
}

let deleteAction = null;

if (currentUser && item.owner === currentUser._id) {
  deleteAction = (
    <button
      type="button"
      className="item-modal__delete"
      onClick={() => {
        onClose();
        onOpenConfirm?.(item);
      }}
      aria-label="Delete item"
    >
      Delete item
    </button>
  );
}

  return (
    <div className="item-modal__overlay" onClick={onClose}>
      <div className="item-modal" onClick={(e) => e.stopPropagation()}>
        <button className="item-modal__close" onClick={onClose}>
          <img src={closeIcon} alt="Close" className="item-modal__close-icon" />
        </button>
        <div className="item-modal__image-section">
          <img
            src={item.link || item.imageUrl}
            alt={item.name}
            className="item-modal__image"
            // onError={(e) => {
              // console.log("Image failed to load:", e.target.src);
            // }}
            // onLoad={() => {
              // console.log("Image loaded successfully:", item.link);
            // }}
          />
        </div>
        <div className="item-modal__content">
          {deleteAction}
          <p className="item-modal__title">{item.name}</p>
          <p className="item-modal__weather">Weather: {item.weather}</p>
        </div>
      </div>
    </div>
  );
}

export default ItemModal;
