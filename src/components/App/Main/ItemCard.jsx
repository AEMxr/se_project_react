import "./ItemCard.css";

function ItemCard({ item, onCardClick }) {
  return (
    <li className="card">
      <div className="card__image-container">
        <img
          // src={`${import.meta.env.BASE_URL}items/${item.imageUrl}`}
          src={item.link}
          alt={item.name}
          className="card__image"
          onClick={() => onCardClick(item)}
        />
        <span className="card__title">{item.name}</span>
      </div>
    </li>
  );
}

export default ItemCard;
