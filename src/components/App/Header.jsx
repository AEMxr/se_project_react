import "./Header.css";
import menuIcon from "../../assets/hamburgIcon.svg";

const currentDate = new Date().toLocaleString("default", {
  month: "long",
  day: "numeric",
});

function Header({ city, onAddClothes, onMenuClick }) {
  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo"></div>

        <div className="header__date-location">
          {currentDate}, {city ? city : "Loading..."}
        </div>

        <button
          className="header__add-clothes-button"
          type="button"
          onClick={onAddClothes}
        >
          + Add Clothes
        </button>

        <div className="header__user">
          <div className="header__user-name">Terrence Tegegne</div>
          <div className="header__user-avatar"></div>
        </div>

        <button
          className="header__menu-button"
          type="button"
          onClick={onMenuClick}
        >
          <img src={menuIcon} alt="Menu" className="header__menu-icon" />
        </button>
      </div>
    </header>
  );
}

export default Header;
