import LikeButton from "../LikeButton.jsx";
import "./ItemCard.css";

function ItemCard({ item, onCardClick, onCardLike }) {
  return (
    <li className="card">
      <div className="card__image-container">
        <img
          src={item.link || item.imageUrl}
          alt={item.name}
          className="card__image"
          onClick={() => onCardClick(item)}
        />
        <div className="card__header">
          <span className="card__title">{item.name}</span>
          <LikeButton item={item} onCardLike={onCardLike} />
        </div>
      </div>
    </li>
  );
}

export default ItemCard;