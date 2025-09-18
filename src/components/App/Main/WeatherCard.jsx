import { weatherConditions } from "../../../utils/constants.js";
import "./WeatherCard.css";
import CurrentTemperatureUnitContext from "../../../contexts/CurrentTemperatureUnitContext.js";
import { useContext } from "react";

function WeatherCard({ temperature, condition, time }) {
  const { currentTemperatureUnit } = useContext(CurrentTemperatureUnitContext);

  const weatherImage = weatherConditions.find(
    (c) => c.condition === condition && c.time === time
  );

  const temp = temperature?.[currentTemperatureUnit];
  const imageSrc = weatherImage
    ? `${import.meta.env.BASE_URL}weatherConditions/${weatherImage.imageUrl}`
    : `${import.meta.env.BASE_URL}weatherConditions/daySunny.svg`;

  return (
    <section className="weather-card">
      {weatherImage && (
        <img
          className="weather-card__image"
          src={imageSrc}
          alt={condition || "Weather"}
        />
      )}
      <span className="weather-card__temp">
        {temp != null ? `${temp}°${currentTemperatureUnit}` : "..."}
      </span>
    </section>
  );
}

export default WeatherCard;
