import LikeButton from "../LikeButton.jsx";
import ImageWithPlaceholder from "../ImageWithPlaceholder.jsx";
import "./ItemCard.css";

export default function ItemCard({
  item,
  onCardClick,
  onCardLike,
  variant = "main",
  imageLoading = "lazy",
}) {
  return (
    <li
      className={`card${variant === "profile" ? " card_context_profile" : ""}`}
    >
      <div className="card__image-container">
        <button
          className="card__preview interactive"
          type="button"
          onClick={() => onCardClick(item)}
          aria-label={`View ${item.name}`}
        >
          <ImageWithPlaceholder
            src={item.link || item.imageUrl}
            alt={item.name}
            className="card__image"
            loading={imageLoading}
          />
        </button>
        <div className="card__header">
          <span className="card__title">{item.name}</span>
          <LikeButton item={item} onCardLike={onCardLike} />
        </div>
      </div>
    </li>
  );
}
