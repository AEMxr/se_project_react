import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchWeather } from "../utils/weatherApi.js";
import { getItems, createItem, removeItem } from "../utils/api.js";
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
    if (!itemToDelete?._id) return Promise.resolve();
    return removeItem(itemToDelete._id)
      .then(() => {
        setClothingItems((prev) =>
          prev.filter((i) => i._id !== itemToDelete._id)
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
        (error) => {
          fetchWeather().then(setWeather).catch(console.error);
        }
      );
    } else {
      fetchWeather().then(setWeather).catch(console.error);
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
    return createItem(values)
      .then((created) => {
        const normalized = {
          ...created,
          link: created.imageUrl,
          condition: ["any"],
          weather: (created.weather || "any").toLowerCase(),
        };
        setClothingItems((prev) => [normalized, ...prev]);
        setIsModalOpen(false);
      })
      .catch(console.error);
  }

  // For ItemCard click
  function handleCardClick(item) {
    // console.log("Card clicked:", item);
    setSelectedItem(item);
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
    <CurrentTemperatureUnitContext.Provider
      value={{ currentTemperatureUnit, handleToggleSwitchChange }}
    >
      <Router>
        <div className="app">
          <Header
            city={weather.city}
            onAddClothes={handleAddClothesClick}
            onMenuClick={handleMenuClick}
          />
          <Routes>
            <Route
              path="/"
              element={
                <Main
                  weather={weather}
                  clothingItems={clothingItems}
                  onCardClick={handleCardClick}
                />
              }
            />

            <Route
              path="/profile"
              element={
                <Profile
                  clothingItems={clothingItems}
                  onAddClothes={handleAddClothesClick}
                  onCardClick={handleCardClick}
                />
              }
            />
          </Routes>

          <Footer />
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={handleCloseMobileMenu}
            onAddClothes={handleAddClothesClick}
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
        </div>
      </Router>
    </CurrentTemperatureUnitContext.Provider>
  );
}

export default App;
