import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import CurrentUserContext from "../../../contexts/CurrentUserContext.js";
import Avatar from "../Avatar.jsx";
import "./SideBar.css";

export default function SideBar({ onLogout, onEditProfile }) {
  const user = useContext(CurrentUserContext);
  const navigate = useNavigate();
  function handleLogoutClick() {
    onLogout();
    navigate("/", { replace: true });
  }
  if (!user) return null;
  return (
    <aside className="sidebar" aria-label="Profile controls">
      <div className="sidebar__user">
        <Avatar
          name={user.name}
          avatar={user.avatar}
          className="sidebar__avatar"
        />
        <span className="sidebar__name">{user.name}</span>
      </div>
      <button
        className="sidebar__action interactive"
        type="button"
        onClick={onEditProfile}
      >
        Change profile data
      </button>
      <button
        className="sidebar__action interactive"
        type="button"
        onClick={handleLogoutClick}
      >
        Log out
      </button>
    </aside>
  );
}
