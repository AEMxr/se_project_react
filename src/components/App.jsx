import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { useRef, useState } from "react";
import useWeather from "../hooks/useWeather.js";
import useAuthentication from "../hooks/useAuthentication.js";
import useClothingItems from "../hooks/useClothingItems.js";
import useAppModals from "../hooks/useAppModals.js";
import CurrentTemperatureUnitContext from "../contexts/CurrentTemperatureUnitContext.js";
import CurrentUserContext from "../contexts/CurrentUserContext.js";
import Header from "./App/Header.jsx";
import SkipLink from "./App/SkipLink.jsx";
import Main from "./App/Main.jsx";
import Footer from "./App/Footer.jsx";
import Profile from "./App/Profile.jsx";
import AppModals from "./App/AppModals.jsx";
import ProtectedRoute from "./Authentication/ProtectedRoute.jsx";
import "./App.css";

const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;

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
  const pendingDeleteId = useRef(null);
  const {
    weather,
    isLoading: isWeatherLoading,
    errorMessage: weatherError,
    retry: retryWeather,
  } = useWeather();

  const modalActions = useAppModals({
    currentUser,
    authRequestId,
    pendingDeleteId,
    setSelectedItem,
    setActiveModal,
    setAuthError,
  });
  const authActions = useAuthentication({
    currentUser,
    authRequestId,
    modalRef: modalActions.modalRef,
    setCurrentUser,
    setIsLoggedIn,
    setIsAuthChecking,
    setAuthError,
    setActiveModal,
    setSelectedItem,
  });
  const wardrobeActions = useClothingItems({
    authRequestId,
    pendingDeleteId,
    selectedItem,
    setSelectedItem,
    setClothingItems,
    setIsItemsLoading,
    setItemsError,
    handleProtectedRequestError: authActions.handleProtectedRequestError,
  });
  const {
    openModal,
    handleAddClothesClick,
    handleSignUpClick,
    handleLoginClick,
    handleCardClick,
    handleEditProfileClick,
  } = modalActions;
  const { handleLogout } = authActions;
  const { handleCardLike, retryItems } = wardrobeActions;

  function handleToggleSwitchChange() {
    setCurrentTemperatureUnit((unit) => (unit === "F" ? "C" : "F"));
  }

  const messages = [
    { message: weatherError, retry: retryWeather, label: "Retry weather" },
    { message: itemsError, retry: retryItems, label: "Retry clothing" },
    { message: authError },
  ].filter(({ message }) => message);
  return (
    <CurrentUserContext.Provider value={currentUser}>
      <CurrentTemperatureUnitContext.Provider
        value={{ currentTemperatureUnit, handleToggleSwitchChange }}
      >
        <Router>
          <div className="app">
            <SkipLink />
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
                {messages.map(({ message, retry, label }) => (
                  <p className="app__error" key={message}>
                    {message}
                    {retry && (
                      <button
                        className="app__retry interactive"
                        type="button"
                        onClick={retry}
                      >
                        {label}
                      </button>
                    )}
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
            <AppModals
              activeModal={activeModal}
              selectedItem={selectedItem}
              modalActions={modalActions}
              authActions={authActions}
              wardrobeActions={wardrobeActions}
            />
          </div>
        </Router>
      </CurrentTemperatureUnitContext.Provider>
    </CurrentUserContext.Provider>
  );
}
export default App;
