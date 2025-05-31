import "./ItemModal.css";
import closeIcon from "../../assets/Union.svg";

function ItemModal({ item, onClose }) {
  if (!item) return null;

  console.log("ItemModal received item:", item);
  console.log("Image source:", item.link);

  return (
    <div className="item-modal__overlay" onClick={onClose}>
      <div className="item-modal" onClick={(e) => e.stopPropagation()}>
        <button className="item-modal__close" onClick={onClose}>
          <img src={closeIcon} alt="Close" className="item-modal__close-icon" />
        </button>
        <div className="item-modal__image-section">
          <img
            src={item.link}
            alt={item.name}
            className="item-modal__image"
            onError={(e) => {
              console.log("Image failed to load:", e.target.src);
            }}
            onLoad={() => {
              console.log("Image loaded successfully:", item.link);
            }}
          />
        </div>
        <div className="item-modal__content">
          <p className="item-modal__title">{item.name}</p>
          <p className="item-modal__weather">Weather: {item.weather}</p>
        </div>
      </div>
    </div>
  );
}

export default ItemModal;
