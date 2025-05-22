import { weatherConditions } from "../../../utils/constants.js";
import "./WeatherCard.css";

function WeatherCard({ temperature, condition, time }) {
  const weatherImage = weatherConditions.find(
    (c) => c.condition === condition && c.time === time
  );

  return (
    <section className="weather-card">
      {weatherImage && (
        <img
          className="weather-card__image"
          src={`${import.meta.env.BASE_URL}weatherConditions/${
            weatherImage.imageUrl
          }`}
          alt={condition}
        />
      )}
      <span className="weather-card__temp">{temperature}°F</span>
    </section>
  );
}

export default WeatherCard;
