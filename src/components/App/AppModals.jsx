import ItemModal from "./ItemModal.jsx";
import MobileMenu from "./MobileMenu.jsx";
import AddItemModal from "../AddItemModal/AddItemModal.jsx";
import DeleteConfirmationModal from "./DeleteConfirmationModal.jsx";
import RegisterModal from "../Authentication/RegisterModal.jsx";
import LoginModal from "../Authentication/LoginModal.jsx";
import EditProfileModal from "./Profile/EditProfileModal.jsx";

export default function AppModals({
  activeModal,
  selectedItem,
  modalActions,
  authActions,
  wardrobeActions,
}) {
  const {
    handleCloseModal,
    handleAddClothesClick,
    handleSignUpClick,
    handleLoginClick,
    openConfirmationModal,
  } = modalActions;
  const { handleRegisterModal, handleLoginModal, handleUpdateProfile } =
    authActions;
  const { handleConfirmDelete, handleAddItem } = wardrobeActions;
  return (
    <>
      {activeModal === "mobile-menu" && (
        <MobileMenu
          isOpen
          onClose={handleCloseModal}
          onAddClothes={handleAddClothesClick}
          onSignUp={handleSignUpClick}
          onLogIn={handleLoginClick}
        />
      )}
      {activeModal === "preview" && (
        <ItemModal
          item={selectedItem}
          onClose={handleCloseModal}
          onOpenConfirm={openConfirmationModal}
        />
      )}
      {activeModal === "confirm-delete" && (
        <DeleteConfirmationModal
          isOpen
          onConfirm={handleConfirmDelete}
          onCancel={handleCloseModal}
        />
      )}
      {activeModal === "add-clothes" && (
        <AddItemModal
          isOpen
          onCloseModal={handleCloseModal}
          onAddItem={handleAddItem}
        />
      )}
      {activeModal === "registration" && (
        <RegisterModal
          isOpen
          onCloseModal={handleCloseModal}
          onSubmit={handleRegisterModal}
          onSwitchToLogin={handleLoginClick}
        />
      )}
      {activeModal === "login" && (
        <LoginModal
          isOpen
          onCloseModal={handleCloseModal}
          onSubmit={handleLoginModal}
          onSwitchToRegister={handleSignUpClick}
        />
      )}
      {activeModal === "edit-profile" && (
        <EditProfileModal
          isOpen
          onSubmit={handleUpdateProfile}
          onCloseModal={handleCloseModal}
        />
      )}
    </>
  );
}
