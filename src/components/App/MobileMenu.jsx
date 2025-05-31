import "./MobileMenu.css";

function MobileMenu({ isOpen, onClose, onAddClothes }) {
  if (!isOpen) return null;

  return (
    <div className="mobile-menu__overlay" onClick={onClose}>
      <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
        <button className="mobile-menu__close" onClick={onClose}>
          ×
        </button>

        <div className="mobile-menu__content">
          <div className="mobile-menu__user">
            <div className="mobile-menu__user-name">Terrence Tegegne</div>
            <div className="mobile-menu__user-avatar"></div>
          </div>
          <button
            className="mobile-menu__add-clothes"
            type="button"
            onClick={() => {
              onAddClothes();
              onClose();
            }}
          >
            + Add Clothes
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;
