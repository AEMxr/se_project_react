import { useContext } from "react";
import CurrentUserContext from "../../contexts/CurrentUserContext.js";
import "./Profile/Profile.css";
import SideBar from "./Profile/SideBar.jsx";
import ClothesSection from "./Profile/ClothesSection.jsx";

export default function Profile({
  clothingItems,
  onAddClothes,
  onCardClick,
  onLogout,
  onEditProfile,
  onCardLike,
  isItemsLoading,
  itemsError,
}) {
  const user = useContext(CurrentUserContext);
  if (!user) return null;
  const userItems = clothingItems.filter((item) => item.owner === user._id);
  return (
    <main id="main-content" className="profile" tabIndex={-1}>
      <h1 className="visually-hidden">Your profile</h1>
      <SideBar onLogout={onLogout} onEditProfile={onEditProfile} />
      <ClothesSection
        items={userItems}
        onAddClothes={onAddClothes}
        onCardClick={onCardClick}
        onCardLike={onCardLike}
        isLoading={isItemsLoading}
        errorMessage={itemsError}
      />
    </main>
  );
}
