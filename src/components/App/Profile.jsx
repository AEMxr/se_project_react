import SideBar from "./Profile/SideBar.jsx";
import ClothesSection from "./Profile/ClothesSection.jsx";

const Profile = ({ clothingItems, onAddClothes }) => {
  return (
    <section className="profile">
      <SideBar
        user={{ name: "Terrence Tegegne", avatar: "/assets/avatar.svg" }}
      />
      <ClothesSection items={clothingItems} onAddClothes={onAddClothes} />
    </section>
  );
};

export default Profile;
