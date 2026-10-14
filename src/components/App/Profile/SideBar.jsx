import { useContext } from "react";
import CurrentUserContext from "../../../contexts/CurrentUserContext.js";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import Avatar from "../Avatar.jsx";

const SideBar = ({ onLogout, onEditProfile }) => {
  const user = useContext(CurrentUserContext);
  const navigate = useNavigate();

  function handleLogoutClick() {
    onLogout();
    navigate("/", { replace: true });
  }

  if (!user) {
    return null;
  }

  return (
    <aside className="sidebar">
      <Avatar
        name={user.name}
        avatar={user.avatar}
        className="sidebar__avatar"
      />
      <div className="sidebar__name">{user.name}</div>
      <button type="button" onClick={onEditProfile}>
  Edit profile
</button>
      <button type="button" onClick={handleLogoutClick}>
        Log Out
      </button>
    </aside>
  );
};

export default SideBar;
