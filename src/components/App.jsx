import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchWeather } from "../utils/weatherApi.js";
import { getItems, createItem, removeItem, updateCurrentUser, toggleItemLike, } from "../utils/api.js";
import "./App.css";
import Header from "./App/Header.jsx";
import Main from "./App/Main.jsx";
import Footer from "./App/Footer.jsx";
import ItemModal from "./App/ItemModal.jsx";
import MobileMenu from "./App/MobileMenu.jsx";
import Profile from "./App/Profile.jsx";
import CurrentTemperatureUnitContext from "../contexts/CurrentTemperatureUnitContext.js";
import AddItemModal from "../components/AddItemModal/AddItemModal.jsx";
import DeleteConfirmationModal from "./App/DeleteConfirmationModal.jsx";
import RegisterModal from "./Authentication/RegisterModal.jsx";
import LoginModal from "./Authentication/LoginModal.jsx";
import { signIn, signUp, getCurrentUser } from "../utils/auth.js";
import CurrentUserContext from "../contexts/CurrentUserContext.js";
import ProtectedRoute from "./Authentication/ProtectedRoute.jsx";
import EditProfileModal from "./App/Profile/EditProfileModal.jsx";
import { UNAUTHORIZED_STATUS } from "../utils/request.js";

const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;

function App() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  function openConfirmationModal(item) {
    setItemToDelete(item);
    setIsConfirmOpen(true);
  }
  function closeConfirmationModal() {
    setIsConfirmOpen(false);
    setItemToDelete(null);
  }

function handleConfirmDelete() {
  if (!itemToDelete?._id) {
    return Promise.resolve();
  }

  const token = localStorage.getItem("jwt");

  return removeItem(itemToDelete._id, token)
    .then(() => {
      setClothingItems((prev) =>
        prev.filter((item) => item._id !== itemToDelete._id)
      );

      setSelectedItem(null);
      closeConfirmationModal();
    })
    .catch(console.error);
}

  // Temp Switch
  const [currentTemperatureUnit, setCurrentTemperatureUnit] = useState("F");

  const handleToggleSwitchChange = () => {
    setCurrentTemperatureUnit((u) => (u === "F" ? "C" : "F"));
  };

  // Weather condition based on browser location
  const [weather, setWeather] = useState({
    city: "",
    condition: undefined,
    time: undefined,
    temperature: { F: null, C: null },
  });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude)
            .then(setWeather)
            .catch(console.error);
        },
        () => {
          fetchWeather().then(setWeather).catch(console.error);
        }
      );
    } else {
      fetchWeather().then(setWeather).catch(console.error);
    }
  }, []);

  //Guest or User Authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeModal, setActiveModal] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  function handleSignUpClick() {
    setActiveModal("registration");
  }

  function handleLoginClick() {
    setActiveModal("login")
  }

  function handleCloseModal() {
    setActiveModal("");
  }

  function handleEditProfileClick() {
  setActiveModal("edit-profile");
}

function handleUpdateProfile(values) {
  const token = localStorage.getItem("jwt");

  return updateCurrentUser(values, token)
    .then((user) => {
      setCurrentUser(user);
    })
    .catch((error) => {
      throw error;
    });
}

  function handleRegisterModal(values) {
    return signUp(values)
      .then(() => {
      return handleLoginModal(values);
    })
    .catch((error) => {
      throw error;
    });
  }

  function handleLoginModal(values) {
    return signIn(values)
    .then(({ token }) => {
      localStorage.setItem("jwt", token);
      return getCurrentUser(token);
    })
    .then((user) => {
      setCurrentUser(user);
      setIsLoggedIn(true);
    })
    .catch((error) => {
      localStorage.removeItem("jwt");
      setCurrentUser(null);
      setIsLoggedIn(false);
      throw error;
    });
  }

  function handleLogout() {
  localStorage.removeItem("jwt");
  setCurrentUser(null);
  setIsLoggedIn(false);
}

useEffect(() => {
  const token = localStorage.getItem("jwt");

  if (token) {
    getCurrentUser(token)
      .then((user) => {
        if (localStorage.getItem("jwt") !== token) {
          return;
        }

        setCurrentUser(user);
        setIsLoggedIn(true);
      })
      .finally(() => {
        setIsAuthChecking(false);
      })
      .catch((error) => {
        if (localStorage.getItem("jwt") !== token) {
          return;
        }

        if (error.status === UNAUTHORIZED_STATUS) {
          localStorage.removeItem("jwt");
          return;
        }

        console.error(error);
      });
  } else {
    setIsAuthChecking(false);
  }
}, []);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // For ItemModal
  const [selectedItem, setSelectedItem] = useState(null);

  // Form modal handlers
  function handleAddClothesClick() {
    setIsModalOpen(true);
  }

  function handleCloseAddModal() {
    setIsModalOpen(false);
  }

  const [clothingItems, setClothingItems] = useState([]);

  useEffect(() => {
    getItems()
      .then((items) => {
        setClothingItems(
          items.map((i) => ({
            ...i,
            link: i.imageUrl,
            weather: (i.weather || "any").toLowerCase(),
          }))
        );
      })
      .catch(console.error);
  }, []);

  function handleAddItem(values) {
    const token = localStorage.getItem("jwt");

    return createItem(values, token)
      .then((created) => {
        const normalized = {
          ...created,
          link: created.imageUrl,
          condition: ["any"],
          weather: (created.weather || "any").toLowerCase(),
        };
        setClothingItems((prev) => [normalized, ...prev]);
        // setIsModalOpen(false);
      })
      .catch((error) => {
        throw error;
      });
  }

  // For ItemCard click
  function handleCardClick(item) {
    // console.log("Card clicked:", item);
    setSelectedItem(item);
  }

  function handleCardLike({ id, isLiked }) {
  const token = localStorage.getItem("jwt");

  return toggleItemLike(id, isLiked, token)
    .then((updatedItem) => {
      setClothingItems((prev) =>
        prev.map((item) => {
          if (item._id === id) {
            return { ...item, ...updatedItem };
          }

          return item;
        })
      );
    })
    .catch((error) => {
      throw error;
    });
}

  function handleCloseItemModal() {
    setSelectedItem(null);
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleMenuClick() {
    setIsMobileMenuOpen(true);
  }

  function handleCloseMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
    <CurrentTemperatureUnitContext.Provider
      value={{ currentTemperatureUnit, handleToggleSwitchChange }}
    >
      <Router>
        <div className="app">
          <Header
            city={weather.city}
            onAddClothes={handleAddClothesClick}
            onMenuClick={handleMenuClick}
            isLoggedIn={isLoggedIn}
            onSignUp={handleSignUpClick}
            onLogIn={handleLoginClick}
          />
          <Routes>
            <Route
              path="/"
              element={
                <Main
                  weather={weather}
                  clothingItems={clothingItems}
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
                  onAddClothes={handleAddClothesClick}
                  onCardClick={handleCardClick}
                  onLogout={handleLogout}
                  onEditProfile={handleEditProfileClick}
                  onCardLike={handleCardLike}
                />
                </ProtectedRoute>

              }
            />
          </Routes>

          <Footer />
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={handleCloseMobileMenu}
            onAddClothes={handleAddClothesClick}
            onSignUp={handleSignUpClick}
            onLogIn={handleLoginClick}
          />
          <ItemModal
            item={selectedItem}
            onClose={handleCloseItemModal}
            onOpenConfirm={openConfirmationModal}
          />
          <DeleteConfirmationModal
            isOpen={isConfirmOpen}
            onConfirm={handleConfirmDelete}
            onCancel={closeConfirmationModal}
          />
          <AddItemModal
            isOpen={isModalOpen}
            onCloseModal={handleCloseAddModal}
            onAddItem={handleAddItem}
          />
          <RegisterModal
            isOpen={activeModal === "registration"}
            onCloseModal={handleCloseModal}
            onSubmit={handleRegisterModal}
            onSwitchToLogin={handleLoginClick}
          />
          <LoginModal
            isOpen={activeModal === "login"}
            onCloseModal={handleCloseModal}
            onSubmit={handleLoginModal}
            onSwitchToRegister={handleSignUpClick}
          />
          <EditProfileModal
  isOpen={activeModal === "edit-profile"}
  onSubmit={handleUpdateProfile}
  onCloseModal={handleCloseModal}
/>
        </div>
      </Router>
    </CurrentTemperatureUnitContext.Provider>
    </CurrentUserContext.Provider>
  );
}

export default App;
