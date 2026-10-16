import { useContext, useState } from "react";
import WeatherCard from "./Main/WeatherCard.jsx";
import ItemCard from "./Main/ItemCard.jsx";
import { getWeatherType } from "../../utils/weatherApi.js";
import CurrentTemperatureUnitContext from "../../contexts/CurrentTemperatureUnitContext.js";
import { buildOutfit } from "../../utils/outfitBuilder.js";
import "./Main.css";

export default function Main({
  weather,
  clothingItems,
  onCardClick,
  onCardLike,
  isWeatherLoading,
  isItemsLoading,
}) {
  const [selection, setSelection] = useState(null);
  const { currentTemperatureUnit } = useContext(CurrentTemperatureUnitContext);
  const tempF = weather?.temperature?.F;
  const weatherType = getWeatherType(tempF);
  const weatherCondition = weather?.condition;
  const weatherKey = `${weatherType}:${weatherCondition}`;
  const filteredItems = clothingItems.filter(
    (item) => weatherType && item.weather === weatherType,
  );
  let itemsToDisplay = filteredItems;
  if (selection?.weatherKey === weatherKey) {
    const selectedIds = new Set(selection.ids);
    itemsToDisplay = filteredItems.filter((item) => selectedIds.has(item._id));
  }
  function handleRandomize() {
    if (!filteredItems.length) return;
    const { selectedItems } = buildOutfit({
      items: filteredItems,
      weatherType,
      tempF,
      weatherCondition,
    });
    const chosen = selectedItems.length
      ? selectedItems
      : [filteredItems[Math.floor(Math.random() * filteredItems.length)]];
    setSelection({ weatherKey, ids: chosen.map((item) => item._id) });
  }
  const temperature = weather?.temperature?.[currentTemperatureUnit];
  return (
    <main className="main">
      <WeatherCard
        temperature={weather.temperature}
        condition={weather.condition}
        time={weather.time}
      />
      <h1 className="main__headliner">
        {Number.isFinite(temperature)
          ? `Today is ${temperature}°${currentTemperatureUnit} / You may want to wear:`
          : isWeatherLoading
            ? "Loading weather..."
            : "Weather recommendations are unavailable."}
      </h1>
      {isItemsLoading && (
        <p className="main__status" role="status">
          Loading clothing items...
        </p>
      )}
      <ul className="main__card-list" aria-busy={isItemsLoading}>
        {itemsToDisplay.map((item) => (
          <ItemCard
            key={item._id}
            item={item}
            onCardClick={onCardClick}
            onCardLike={onCardLike}
          />
        ))}
      </ul>
      <button
        className="main__randomize-button interactive"
        type="button"
        onClick={handleRandomize}
        disabled={!filteredItems.length}
      >
        Randomize
      </button>
    </main>
  );
}
