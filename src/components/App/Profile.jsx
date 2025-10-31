import SideBar from "./Profile/SideBar.jsx";
import ClothesSection from "./Profile/ClothesSection.jsx";

const Profile = ({ clothingItems, onAddClothes, onCardClick }) => {
  return (
    <section className="profile">
      <SideBar
        user={{ name: "Terrence Tegegne", avatar: "/assets/avatar.svg" }}
      />
      <ClothesSection
        items={clothingItems}
        onAddClothes={onAddClothes}
        onCardClick={onCardClick}
      />
    </section>
  );
};

export default Profile;
