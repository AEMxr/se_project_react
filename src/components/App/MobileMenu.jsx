import { useContext, useId } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import CurrentUserContext from "../../contexts/CurrentUserContext.js";
import useDialog from "../../hooks/useDialog.js";
import Avatar from "./Avatar.jsx";
import "./MobileMenu.css";

export default function MobileMenu({
  isOpen,
  onClose,
  onAddClothes,
  onSignUp,
  onLogIn,
}) {
  const user = useContext(CurrentUserContext);
  const titleId = useId();
  const dialogRef = useDialog(isOpen, onClose);
  if (!isOpen) return null;
  function handleAction(action) {
    onClose();
    action();
  }

  return createPortal(
    <div
      className="mobile-menu"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="mobile-menu__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <h2 id={titleId} className="visually-hidden">
          Menu
        </h2>
        <button
          className="mobile-menu__close interactive"
          type="button"
          aria-label="Close menu"
          onClick={onClose}
        >
          ×
        </button>
        <div className="mobile-menu__content">
          {user ? (
            <>
              <Link
                to="/profile"
                className="mobile-menu__user interactive"
                onClick={onClose}
              >
                <span className="mobile-menu__user-name">{user.name}</span>
                <Avatar
                  name={user.name}
                  avatar={user.avatar}
                  className="mobile-menu__user-avatar"
                />
              </Link>
              <button
                className="mobile-menu__add-clothes interactive"
                type="button"
                onClick={() => handleAction(onAddClothes)}
              >
                + Add Clothes
              </button>
            </>
          ) : (
            <>
              <button
                className="mobile-menu__auth interactive"
                type="button"
                onClick={() => handleAction(onSignUp)}
              >
                Sign Up
              </button>
              <button
                className="mobile-menu__auth interactive"
                type="button"
                onClick={() => handleAction(onLogIn)}
              >
                Log In
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
