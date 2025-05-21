import { useEffect, useState } from "react";
import { fetchWeather } from "../utils/weatherApi.js";
import "./App.css";
import Header from "./App/Header.jsx";
import ModalWithForm from "./App/ModalWithForm.jsx";
// import Main from "./App/Main.jsx";
// import Footer from "./App/Footer.jsx";

function App() {
  const [weather, setWeather] = useState({ city: "", temperature: null });

  useEffect(() => {
    fetchWeather().then(setWeather).catch(console.error);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    image: "",
    weather: "",
  });

  const [touched, setTouched] = useState({ name: false, image: false });

  const nameIsValid = /[A-Za-z0-9]/.test(form.name);
  const imageIsValid = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
    form.image
  );
  const isFormValid = nameIsValid && imageIsValid && form.weather.trim() !== "";

  function handleAddClothesClick() {
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setForm({ name: "", image: "", weather: "" });
    setTouched({ name: false, image: false });
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

  return (
    <>
      <Header city={weather.city} onAddClothes={handleAddClothesClick} />
      {/* <Main />
      <Footer /> */}
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
    </>
  );
}

export default App;
