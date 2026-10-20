import ItemCard from "./ItemCard.jsx";

const INITIAL_CARD_COUNT = 4;
const PLACEHOLDER_KEYS = [0, 1, 2, 3];

export default function ClothingGrid({
  items,
  className,
  isLoading = false,
  variant = "main",
  onCardClick,
  onCardLike,
}) {
  return (
    <ul className={className} aria-busy={isLoading}>
      {isLoading && items.length === 0
        ? PLACEHOLDER_KEYS.map((key) => (
            <li
              key={key}
              className={`card card_loading${variant === "profile" ? " card_context_profile" : ""}`}
              aria-hidden="true"
            >
              <div className="card__preview">
                <span className="card__image card__image_skeleton" />
              </div>
            </li>
          ))
        : items.map((item, index) => (
            <ItemCard
              key={item._id}
              item={item}
              variant={variant}
              imageLoading={index < INITIAL_CARD_COUNT ? "eager" : "lazy"}
              onCardClick={onCardClick}
              onCardLike={onCardLike}
            />
          ))}
    </ul>
  );
}
