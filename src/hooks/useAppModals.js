import { useRef } from "react";

const AUTH_MODALS = ["registration", "login"];

export default function useAppModals({
  currentUser,
  authRequestId,
  pendingDeleteId,
  setSelectedItem,
  setActiveModal,
  setAuthError,
}) {
  const modalRef = useRef("");
  function openModal(name, item = null) {
    if (modalRef.current === "confirm-delete" && pendingDeleteId.current)
      return;
    if (AUTH_MODALS.includes(modalRef.current) && modalRef.current !== name)
      authRequestId.current += 1;
    modalRef.current = name;
    setSelectedItem(item);
    setActiveModal(name);
  }

  function handleCloseModal() {
    if (modalRef.current === "confirm-delete" && pendingDeleteId.current)
      return;
    if (AUTH_MODALS.includes(modalRef.current)) authRequestId.current += 1;
    modalRef.current = "";
    setActiveModal("");
    setSelectedItem(null);
  }

  function handleSignUpClick() {
    setAuthError("");
    openModal("registration");
  }
  function handleLoginClick() {
    setAuthError("");
    openModal("login");
  }
  function handleAddClothesClick() {
    openModal(currentUser ? "add-clothes" : "login");
  }
  function handleEditProfileClick() {
    if (currentUser) openModal("edit-profile");
  }
  function handleCardClick(item) {
    openModal("preview", item);
  }
  function openConfirmationModal(item) {
    if (currentUser && item.owner === currentUser._id)
      openModal("confirm-delete", item);
  }

  return {
    modalRef,
    openModal,
    handleCloseModal,
    handleSignUpClick,
    handleLoginClick,
    handleAddClothesClick,
    handleEditProfileClick,
    handleCardClick,
    openConfirmationModal,
  };
}
