import { useContext } from "react";
import { Link } from "react-router-dom";
import CurrentUserContext from "../../contexts/CurrentUserContext.js";
import "./MobileMenu.css";
import Avatar from "./Avatar.jsx";

function MobileMenu({
  isOpen,
  onClose,
  onAddClothes,
  onSignUp,
  onLogIn,
}) {
  const currentUser = useContext(CurrentUserContext);

  if (!isOpen) {
    return null;
  }

  function handleAction(action) {
    onClose();
    action();
  }

  let accountControls;

  if (currentUser) {
    accountControls = (
      <>
        <Link
          to="/profile"
          className="mobile-menu__user"
          onClick={onClose}
          aria-label="Go to profile"
        >
          <span className="mobile-menu__user-name">
            {currentUser.name}
          </span>
          <Avatar
            name={currentUser.name}
            avatar={currentUser.avatar}
            className="mobile-menu__user-avatar"
          />
        </Link>

        <button
          className="mobile-menu__add-clothes"
          type="button"
          onClick={() => handleAction(onAddClothes)}
        >
          + Add Clothes
        </button>
      </>
    );
  } else {
    accountControls = (
      <>
        <button
          type="button"
          onClick={() => handleAction(onSignUp)}
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={() => handleAction(onLogIn)}
        >
          Log In
        </button>
      </>
    );
  }

  return (
    <div className="mobile-menu__overlay" onClick={onClose}>
      <div
        className="mobile-menu"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="mobile-menu__close"
          type="button"
          onClick={onClose}
        >
          ×
        </button>

        <div className="mobile-menu__content">
          {accountControls}
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;