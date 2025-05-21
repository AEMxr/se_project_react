//import files
import "./Header.css";
//Logo
//current date The current date that
// can be generated using the
// Date() object: javascript
// const currentDate = new Date().toLocaleString('default', { month: 'long', day: 'numeric' });
//The current location (see Section 5 for details)
//An “Add Clothes” button that opens ModalWithForm
//The user’s name and avatar (both are hardcoded at this point)

const currentDate = new Date().toLocaleString("default", {
  month: "long",
  day: "numeric",
});

function Header({ city, onAddClothes }) {
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
      </div>
    </header>
  );
}

export default Header;
