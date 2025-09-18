import "./Profile.css";

const SideBar = ({ user }) => {
  return (
    <aside className="sidebar">
      <img
        src={user.avatar}
        alt={`${user.name} avatar`}
        className="sidebar__avatar"
      />
      <div className="sidebar__name">{user.name}</div>
    </aside>
  );
};

export default SideBar;
