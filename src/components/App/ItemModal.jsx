// import "./ItemModal.css";

function ItemModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="modal">
      <button className="modal__close" onClick={onClose}>
        ×
      </button>
      <img src={item.imageUrl} alt={item.name} className="modal__image" />
      <h2 className="modal__title">{item.name}</h2>
    </div>
  );
}

export default ItemModal;
