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

  function handleAddClothesClick() {
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    setIsModalOpen(false);
  }

  return (
    <>
      <Header city={weather.city} onAddClothes={handleAddClothesClick} />
      {/* <Main />
      <Footer /> */}
      <ModalWithForm
        title="Add New Clothes"
        name="add-clothes"
        buttonText="Add"
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        isOpen={isModalOpen}
      >
        <label>
          Name
          <input type="text" name="name" required />
        </label>
        <label>
          Image URL
          <input type="url" name="image" required />
        </label>
        <label>
          Image URL
          <input type="url" name="image" required />
        </label>
      </ModalWithForm>
    </>
  );
}

export default App;
