import "./Header.css";
import menuIcon from "../../assets/hamburgIcon.svg";
import Toggle_Switch from "../ToggleSwitch/ToggleSwitch.jsx";
import { useContext } from "react";
import CurrentTemperatureUnitContext from "../../contexts/CurrentTemperatureUnitContext.js";
import { Link } from "react-router-dom";

const currentDate = new Date().toLocaleString("default", {
  month: "long",
  day: "numeric",
});

function Header({ city, onAddClothes, onMenuClick }) {
  const { currentTemperatureUnit, handleToggleSwitchChange } = useContext(
    CurrentTemperatureUnitContext
  );

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo" aria-label="Go to home" />

        <div className="header__date-location">
          {currentDate}, {city ? city : "Loading..."}
        </div>

        <Toggle_Switch
          isOn={currentTemperatureUnit === "C"}
          handleToggle={handleToggleSwitchChange}
        />

        <button
          className="header__add-clothes-button"
          type="button"
          onClick={onAddClothes}
        >
          + Add Clothes
        </button>

        <Link to="/profile" className="header__user" aria-label="Go to profile">
          <div className="header__user-name">Terrence Tegegne</div>
          <div className="header__user-avatar"></div>
        </Link>

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
