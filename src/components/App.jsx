import { useEffect, useState } from "react";
import { fetchWeather } from "../utils/weatherApi.js";
import { defaultClothingItems } from "../utils/constants.js";
import "./App.css";
import Header from "./App/Header.jsx";
import Main from "./App/Main.jsx";
import Footer from "./App/Footer.jsx";
import ModalWithForm from "./App/ModalWithForm.jsx";
import ItemModal from "./App/ItemModal.jsx";
import MobileMenu from "./App/MobileMenu.jsx";

function App() {
  const [weather, setWeather] = useState({ city: "", temperature: null });

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
  const [form, setForm] = useState({
    name: "",
    image: "",
    weather: "",
  });
  const [touched, setTouched] = useState({ name: false, image: false });

  // For ItemModal
  const [selectedItem, setSelectedItem] = useState(null);

  // Form validation
  const nameIsValid = /[A-Za-z0-9]/.test(form.name);
  const imageIsValid = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
    form.image
  );
  const isFormValid = nameIsValid && imageIsValid && form.weather.trim() !== "";

  // Form modal handlers
  function handleAddClothesClick() {
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setForm({ name: "", image: "", weather: "" });
    setTouched({ name: false, image: false });
    setSelectedItem(null);
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    setIsModalOpen(false);
    setForm({ name: "", image: "", weather: "" });
    setTouched({ name: false, image: false });
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }

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
    <div className="app">
      <Header
        city={weather.city}
        onAddClothes={handleAddClothesClick}
        onMenuClick={handleMenuClick}
      />
      <Main
        weather={weather}
        clothingItems={defaultClothingItems}
        onCardClick={handleCardClick}
      />
      <Footer />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
        onAddClothes={handleAddClothesClick}
      />
      <ItemModal item={selectedItem} onClose={handleCloseModal} />
      <ModalWithForm
        title="New garment"
        name="add-clothes"
        buttonText="Add garment"
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        isOpen={isModalOpen}
        isSubmitDisabled={!isFormValid}
      >
        <label
          className={`modal__form-label${
            touched.name && !nameIsValid ? " modal__form-label--invalid" : ""
          }`}
        >
          Name
          <input
            type="text"
            name="name"
            placeholder="Name"
            className={`modal__input${
              touched.name && !nameIsValid ? " modal__input--invalid" : ""
            }`}
            required
            value={form.name}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
        </label>
        <label
          className={`modal__form-label${
            touched.image && !imageIsValid ? " modal__form-label--invalid" : ""
          }`}
        >
          Image
          <input
            type="url"
            name="image"
            placeholder="Image URL"
            className={`modal__input${
              touched.name && !nameIsValid ? " modal__input--invalid" : ""
            }`}
            required
            value={form.image}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
        </label>
        <label className="modal__form-label">
          Select the weather type:
          <div className="modal__weather-radio-group">
            {["hot", "warm", "cold"].map((type) => (
              <label
                className={`modal__weather-radio${
                  form.weather === type ? " modal__weather-radio--active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="weather"
                  value={type}
                  required
                  checked={form.weather === type}
                  onChange={handleInputChange}
                  className="modal__weather-radio-input"
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>
        </label>
      </ModalWithForm>
    </div>
  );
}

export default App;
