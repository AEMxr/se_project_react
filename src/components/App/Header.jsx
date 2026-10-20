import { useContext } from "react";
import { Link } from "react-router-dom";
import menuIcon from "../../assets/hamburgIcon.svg";
import CurrentTemperatureUnitContext from "../../contexts/CurrentTemperatureUnitContext.js";
import CurrentUserContext from "../../contexts/CurrentUserContext.js";
import useCurrentDate from "../../hooks/useCurrentDate.js";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch.jsx";
import Avatar from "./Avatar.jsx";
import "./Header.css";

export default function Header({
  city,
  onAddClothes,
  onMenuClick,
  isLoggedIn,
  onSignUp,
  onLogIn,
}) {
  const user = useContext(CurrentUserContext);
  const { currentTemperatureUnit, handleToggleSwitchChange } = useContext(
    CurrentTemperatureUnitContext,
  );
  const date = useCurrentDate().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <header className="header">
      <div className="header__container">
        <Link
          to="/"
          className="header__logo interactive"
          aria-label="Go to home"
        />
        <div className="header__date-location">
          {date}, {city}
        </div>
        <ToggleSwitch
          isOn={currentTemperatureUnit === "C"}
          handleToggle={handleToggleSwitchChange}
        />
        {isLoggedIn && user ? (
          <>
            <button
              className="header__add-clothes-button interactive"
              type="button"
              onClick={onAddClothes}
            >
              + Add Clothes
            </button>
            <Link
              to="/profile"
              className="header__user interactive"
              aria-label={`Go to profile: ${user.name}`}
            >
              <span className="header__user-name">{user.name}</span>
              <Avatar
                name={user.name}
                avatar={user.avatar}
                className="header__user-avatar"
              />
            </Link>
          </>
        ) : (
          <div className="header__auth-controls">
            <button
              className="header__auth-button interactive"
              type="button"
              onClick={onSignUp}
            >
              Sign Up
            </button>
            <button
              className="header__auth-button interactive"
              type="button"
              onClick={onLogIn}
            >
              Log In
            </button>
          </div>
        )}
        <button
          className="header__menu-button interactive"
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          aria-haspopup="dialog"
        >
          <img src={menuIcon} alt="" className="header__menu-icon" />
        </button>
      </div>
    </header>
  );
}
