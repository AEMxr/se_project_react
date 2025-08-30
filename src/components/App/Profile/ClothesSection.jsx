import "./Profile.css";

const ClothesSection = ({ items, onAddClothes }) => {
  return (
    <section className="clothes">
      <div className="clothes__header">
        <h2 className="clothes__title">Your items</h2>
        <button className="clothes__add" type="button" onClick={onAddClothes}>
          + Add New
        </button>
      </div>
      <ul className="clothes__grid">
        {items.map((i) => (
          <li key={i._id} className="clothes__card">
            <img
              src={i.imageUrl || i.link}
              alt={i.name}
              className="clothes__img"
            />
            <div className="clothes__name">{i.name}</div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ClothesSection;
