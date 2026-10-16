import ItemCard from "../Main/ItemCard.jsx";
import "./Profile.css";

export default function ClothesSection({
  items,
  onAddClothes,
  onCardClick,
  onCardLike,
  isLoading,
  errorMessage,
}) {
  return (
    <section className="clothes" aria-labelledby="clothes-title">
      <div className="clothes__header">
        <h2 id="clothes-title" className="clothes__title">
          Your items
        </h2>
        <button
          className="clothes__add interactive"
          type="button"
          onClick={onAddClothes}
        >
          + Add New
        </button>
      </div>
      {isLoading && (
        <p className="clothes__status" role="status">
          Loading clothing items...
        </p>
      )}
      {!isLoading && !errorMessage && !items.length && (
        <p className="clothes__status">Add a garment to start your wardrobe.</p>
      )}
      <ul className="clothes__grid" aria-busy={isLoading}>
        {items.map((item) => (
          <ItemCard
            key={item._id}
            item={item}
            variant="profile"
            onCardClick={onCardClick}
            onCardLike={onCardLike}
          />
        ))}
      </ul>
    </section>
  );
}
