import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  getItems,
  createItem,
  removeItem,
  updateCurrentUser,
  toggleItemLike,
} from "../utils/api.js";
import { signIn, signUp, getCurrentUser } from "../utils/auth.js";
import { UNAUTHORIZED_STATUS } from "../utils/request.js";
import {
  createAbortError,
  createUserError,
  rejectRequest,
} from "../utils/errors.js";
import { mergeInitialItems, normalizeItem } from "../utils/items.js";
import useWeather from "../hooks/useWeather.js";
import CurrentTemperatureUnitContext from "../contexts/CurrentTemperatureUnitContext.js";
import CurrentUserContext from "../contexts/CurrentUserContext.js";
import Header from "./App/Header.jsx";
import Main from "./App/Main.jsx";
import Footer from "./App/Footer.jsx";
import ItemModal from "./App/ItemModal.jsx";
import MobileMenu from "./App/MobileMenu.jsx";
import Profile from "./App/Profile.jsx";
import AddItemModal from "./AddItemModal/AddItemModal.jsx";
import DeleteConfirmationModal from "./App/DeleteConfirmationModal.jsx";
import RegisterModal from "./Authentication/RegisterModal.jsx";
import LoginModal from "./Authentication/LoginModal.jsx";
import ProtectedRoute from "./Authentication/ProtectedRoute.jsx";
import EditProfileModal from "./App/Profile/EditProfileModal.jsx";
import "./App.css";

const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;
const AUTH_MODALS = ["registration", "login"];

function App() {
  const [currentTemperatureUnit, setCurrentTemperatureUnit] = useState("F");
  const [activeModal, setActiveModal] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [clothingItems, setClothingItems] = useState([]);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState("");
  const [authError, setAuthError] = useState("");
  const authRequestId = useRef(0);
  const modalRef = useRef("");
  const changedItemIds = useRef(new Set());
  const pendingDeleteId = useRef(null);
  const pendingLikes = useRef(new Set());
  const profileQueues = useRef(new Map());
  const {
    weather,
    isLoading: isWeatherLoading,
    errorMessage: weatherError,
  } = useWeather();

  useEffect(
    () => () => {
      authRequestId.current += 1;
    },
    [],
  );

  function handleToggleSwitchChange() {
    setCurrentTemperatureUnit((unit) => (unit === "F" ? "C" : "F"));
  }

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

  function handleLogout(message = "") {
    authRequestId.current += 1;
    localStorage.removeItem("jwt");
    modalRef.current = "";
    setCurrentUser(null);
    setIsLoggedIn(false);
    setIsAuthChecking(false);
    setActiveModal("");
    setSelectedItem(null);
    setAuthError(message);
  }

  function assertCurrentAuthRequest(requestId) {
    if (authRequestId.current !== requestId) throw createAbortError();
  }

  function assertCurrentSession(token, requestId) {
    assertCurrentAuthRequest(requestId);
    if (localStorage.getItem("jwt") !== token) throw createAbortError();
  }

  function handleProtectedRequestError(error, token, requestId) {
    assertCurrentSession(token, requestId);
    if (error?.status === UNAUTHORIZED_STATUS)
      handleLogout("Your session expired. Please log in again.");
    throw error;
  }

  function authenticateUser(values, requestId) {
    return signIn(values)
      .then(({ token }) => {
        assertCurrentAuthRequest(requestId);
        if (typeof token !== "string" || !token)
          throw createUserError("Unable to sign in. Please try again.");
        return getCurrentUser(token).then((user) => {
          assertCurrentAuthRequest(requestId);
          if (!user?._id)
            throw createUserError(
              "Unable to load your profile. Please try again.",
            );
          localStorage.setItem("jwt", token);
          setCurrentUser(user);
          setIsLoggedIn(true);
          setIsAuthChecking(false);
          setAuthError("");
        });
      })
      .catch(rejectRequest);
  }

  function handleRegisterModal(values) {
    const requestId = ++authRequestId.current;
    return signUp(values)
      .then(() => {
        assertCurrentAuthRequest(requestId);
        return authenticateUser(values, requestId);
      })
      .catch(rejectRequest);
  }

  function handleLoginModal(values) {
    const requestId = ++authRequestId.current;
    return authenticateUser(values, requestId).catch(rejectRequest);
  }

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const requestId = authRequestId.current;
    const controller = new AbortController();
    let active = true;
    if (!token) {
      setIsAuthChecking(false);
      return () => {
        active = false;
        controller.abort();
      };
    }

    getCurrentUser(token, { signal: controller.signal })
      .then((user) => {
        if (
          !active ||
          authRequestId.current !== requestId ||
          localStorage.getItem("jwt") !== token
        )
          return;
        if (!user?._id) throw new Error("Invalid profile response");
        setCurrentUser(user);
        setIsLoggedIn(true);
      })
      .catch((error) => {
        if (
          !active ||
          error?.name === "AbortError" ||
          authRequestId.current !== requestId ||
          localStorage.getItem("jwt") !== token
        )
          return;
        if (error?.status === UNAUTHORIZED_STATUS)
          localStorage.removeItem("jwt");
        else
          setAuthError(
            "Your session could not be verified. Please try logging in again.",
          );
      })
      .finally(() => {
        if (active) setIsAuthChecking(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    getItems({ signal: controller.signal })
      .then((items) => {
        if (!active) return;
        if (!Array.isArray(items)) throw new Error("Invalid clothing response");
        const loaded = items.map(normalizeItem);
        setClothingItems((current) =>
          mergeInitialItems(current, loaded, changedItemIds.current),
        );
      })
      .catch((error) => {
        if (active && error?.name !== "AbortError")
          setItemsError(
            "Clothing items could not be loaded. Please try refreshing the page.",
          );
      })
      .finally(() => {
        if (active) setIsItemsLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  function handleUpdateProfile(values) {
    const token = localStorage.getItem("jwt");
    const requestId = authRequestId.current;
    const userId = currentUser?._id;
    if (!token || !userId) {
      handleLogout("Please log in before updating your profile.");
      return Promise.reject(createAbortError());
    }

    // Finish each user's saves in order, including saves from a reopened form.
    const previous = profileQueues.current.get(userId) ?? Promise.resolve();
    const request = previous
      .catch(() => undefined)
      .then(() => {
        assertCurrentSession(token, requestId);
        return updateCurrentUser(values, token);
      })
      .then((user) => {
        assertCurrentSession(token, requestId);
        setCurrentUser(user);
      })
      .catch((error) => handleProtectedRequestError(error, token, requestId));
    profileQueues.current.set(userId, request);
    return request.finally(() => {
      if (profileQueues.current.get(userId) === request)
        profileQueues.current.delete(userId);
    });
  }

  function handleAddItem(values) {
    const token = localStorage.getItem("jwt");
    const requestId = authRequestId.current;
    return createItem(values, token)
      .then((created) => {
        const item = normalizeItem(created);
        changedItemIds.current.add(item._id);
        setClothingItems((previous) => [
          item,
          ...previous.filter((existing) => existing._id !== item._id),
        ]);
      })
      .catch((error) => handleProtectedRequestError(error, token, requestId));
  }

  function handleConfirmDelete() {
    const id = selectedItem?._id;
    if (!id || pendingDeleteId.current)
      return Promise.reject(
        createUserError("This item is already being deleted."),
      );
    const token = localStorage.getItem("jwt");
    const requestId = authRequestId.current;
    pendingDeleteId.current = id;
    return removeItem(id, token)
      .then(() => {
        changedItemIds.current.add(id);
        setClothingItems((previous) =>
          previous.filter((item) => item._id !== id),
        );
        setSelectedItem((current) => (current?._id === id ? null : current));
      })
      .catch((error) => handleProtectedRequestError(error, token, requestId))
      .finally(() => {
        pendingDeleteId.current = null;
      });
  }

  function handleCardLike({ id, isLiked }) {
    if (pendingLikes.current.has(id))
      return Promise.reject(
        createUserError("This item is still updating. Please try again."),
      );
    const token = localStorage.getItem("jwt");
    const requestId = authRequestId.current;
    pendingLikes.current.add(id);
    return toggleItemLike(id, isLiked, token)
      .then((updated) => {
        changedItemIds.current.add(id);
        setClothingItems((previous) =>
          previous.map((item) =>
            item._id === id ? normalizeItem({ ...item, ...updated }) : item,
          ),
        );
      })
      .catch((error) => handleProtectedRequestError(error, token, requestId))
      .finally(() => {
        pendingLikes.current.delete(id);
      });
  }

  const messages = [weatherError, itemsError, authError].filter(Boolean);
  return (
    <CurrentUserContext.Provider value={currentUser}>
      <CurrentTemperatureUnitContext.Provider
        value={{ currentTemperatureUnit, handleToggleSwitchChange }}
      >
        <Router>
          <div className="app">
            <Header
              city={
                weather.city ||
                (isWeatherLoading ? "Loading..." : "Location unavailable")
              }
              onAddClothes={handleAddClothesClick}
              onMenuClick={() => openModal("mobile-menu")}
              isLoggedIn={isLoggedIn}
              onSignUp={handleSignUpClick}
              onLogIn={handleLoginClick}
            />
            {messages.length > 0 && (
              <div className="app__messages" aria-live="polite">
                {messages.map((message) => (
                  <p className="app__error" key={message}>
                    {message}
                  </p>
                ))}
              </div>
            )}
            <Routes>
              <Route
                path="/"
                element={
                  <Main
                    weather={weather}
                    clothingItems={clothingItems}
                    isWeatherLoading={isWeatherLoading}
                    isItemsLoading={isItemsLoading}
                    onCardClick={handleCardClick}
                    onCardLike={handleCardLike}
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute
                    isLoggedIn={isLoggedIn}
                    isAuthChecking={isAuthChecking}
                  >
                    <Profile
                      clothingItems={clothingItems}
                      isItemsLoading={isItemsLoading}
                      itemsError={itemsError}
                      onAddClothes={handleAddClothesClick}
                      onCardClick={handleCardClick}
                      onLogout={() => handleLogout()}
                      onEditProfile={handleEditProfileClick}
                      onCardLike={handleCardLike}
                    />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Footer />
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
          </div>
        </Router>
      </CurrentTemperatureUnitContext.Provider>
    </CurrentUserContext.Provider>
  );
}
export default App;
