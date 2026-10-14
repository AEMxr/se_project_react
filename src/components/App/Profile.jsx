import { useContext } from "react";
import CurrentUserContext from "../../contexts/CurrentUserContext.js";
import SideBar from "./Profile/SideBar.jsx";
import ClothesSection from "./Profile/ClothesSection.jsx";

const Profile = ({ clothingItems, onAddClothes, onCardClick, onLogout, onEditProfile, onCardLike }) => {
  const currentUser = useContext(CurrentUserContext);

  if (!currentUser) {
    return null;
  }

  const userItems = clothingItems.filter(
    (item) => item.owner === currentUser._id
  );

  return (
    <section className="profile">
      <SideBar onLogout={onLogout} onEditProfile={onEditProfile} />
      <ClothesSection
        items={userItems}
        onAddClothes={onAddClothes}
        onCardClick={onCardClick}
        onCardLike={onCardLike}
      />
    </section>
  );
};

export default Profile;