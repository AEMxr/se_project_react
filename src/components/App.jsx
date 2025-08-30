import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchWeather } from "../utils/weatherApi.js";
// import { defaultClothingItems } from "../utils/constants.js";
import { getItems, createItem, removeItem } from "../utils/api.js";
import "./App.css";
import Header from "./App/Header.jsx";
import Main from "./App/Main.jsx";
import Footer from "./App/Footer.jsx";
// import ModalWithForm from "./App/ModalWithForm.jsx";
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
  // const [form, setForm] = useState({
  //   name: "",
  //   image: "",
  //   weather: "",
  // });
  // const [touched, setTouched] = useState({ name: false, image: false });

  // For ItemModal
  const [selectedItem, setSelectedItem] = useState(null);

  // Form validation
  // const nameIsValid = /[A-Za-z0-9]/.test(form.name);
  // const imageIsValid = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
  //   form.image
  // );
  // const isFormValid = nameIsValid && imageIsValid && form.weather.trim() !== "";

  // Form modal handlers
  function handleAddClothesClick() {
    setIsModalOpen(true);
  }

  function handleCloseAddModal() {
    setIsModalOpen(false);
  }

  // const [clothingItems, setClothingItems] = useState(defaultClothingItems);
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

  // function handleItemDelete(item) {
  //   if (!item?._id) return;
  //   removeItem(item._id)
  //     .then(() => {
  //       setClothingItems((prev) => prev.filter((i) => i._id !== item._id));
  //       setSelectedItem(null);
  //     })
  //     .catch(console.error);
  // }

  // function handleAddItem(values) {
  //   const newItem = {
  //     _id: Date.now(),
  //     name: values.name,
  //     weather: values.weather,
  //     link: values.image,
  //     condition: ["any"],
  //   };
  //   setClothingItems((prev) => [newItem, ...prev]);
  //   setIsModalOpen(false);
  // }

  // function handleCloseModal() {
  //   setIsModalOpen(false);
  //   setForm({ name: "", image: "", weather: "" });
  //   setTouched({ name: false, image: false });
  //   setSelectedItem(null);
  // }

  // function handleFormSubmit(e) {
  //   e.preventDefault();
  //   setIsModalOpen(false);
  //   setForm({ name: "", image: "", weather: "" });
  //   setTouched({ name: false, image: false });
  // }

  // function handleInputChange(e) {
  //   const { name, value } = e.target;
  //   setForm((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // }

  // function handleBlur(e) {
  //   const { name } = e.target;
  //   setTouched((prev) => ({
  //     ...prev,
  //     [name]: true,
  //   }));
  // }

  // For ItemCard click
  function handleCardClick(item) {
    console.log("Card clicked:", item);
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
