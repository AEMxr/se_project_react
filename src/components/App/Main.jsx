import { useContext, useState } from "react";
import WeatherCard from "./Main/WeatherCard.jsx";
import ItemCard from "./Main/ItemCard.jsx";
import { getWeatherType } from "../../utils/weatherApi.js";
import "./Main.css";
import CurrentTemperatureUnitContext from "../../contexts/CurrentTemperatureUnitContext.js";
import { buildOutfit } from "../../utils/outfitBuilder.js";

function Main({ weather, clothingItems, onCardClick, onCardLike }) {
  const [displayItemIds, setDisplayItemIds] = useState(null);
  const { currentTemperatureUnit } = useContext(CurrentTemperatureUnitContext);

  // console.log("Main component received:");
  // console.log("weather:", weather);
  console.log("clothingItems:", clothingItems);
  console.log("clothingItems length:", clothingItems?.length);

  const tempF = weather?.temperature?.F ?? null;
  const weatherType = tempF !== null ? getWeatherType(tempF) : null;
  const weatherCondition = weather?.condition;

  // console.log("weatherType:", weatherType);
  // console.log("weatherCondition:", weatherCondition);

  const filteredItems = clothingItems.filter((item) => {
    const matchesType =
      !weatherType || item.weather === weatherType || item.weather === "any";

    const matchesCondition =
      !weatherCondition ||
      !item.condition ||
      (Array.isArray(item.condition) && item.condition.includes("any")) ||
      (Array.isArray(item.condition) &&
        item.condition.includes(weatherCondition)) ||
      item.condition === weatherCondition ||
      item.condition === "any";

    // console.log(`Item: ${item.name}`);
    // console.log(
    //   `  weather: "${item.weather}" vs weatherType: "${weatherType}"`
    // );
    // console.log(`  condition: ${JSON.stringify(item.condition)}`);
    // console.log(`  matchesType: ${matchesType}`);
    // console.log(`  matchesCondition: ${matchesCondition}`);
    // console.log(`  final result: ${matchesType && matchesCondition}`);
    // console.log("---");
    // console.log("[Main] distinct item weathers in data:", allWeathers);

    return matchesType && matchesCondition;
  });

  // console.log("filteredItems:", filteredItems);
  // console.log("filteredItems length:", filteredItems.length);

  // const handleShowAll = () => {
  //   setDisplayItemIds(null);
  //   // console.log("Showing all weather-appropriate items");
  // };

  const handleRandomize = () => {
    if (filteredItems.length === 0) {
      // console.log("No items available for current weather conditions");
      return;
    }

    //removed "reasons" from constant declaration.  
    // I don't remember what that was used for.
    const { selectedItems } = buildOutfit({
      items: filteredItems,
      weatherType,
      tempF,
      weatherCondition,
    });

    // console.table(reasons);

    setDisplayItemIds(selectedItems.map((item) => item._id));
  };

  let itemsToDisplay = filteredItems;

if (displayItemIds !== null) {
  const itemsById = new Map(
    clothingItems.map((item) => [item._id, item])
  );

  itemsToDisplay = displayItemIds
    .map((id) => itemsById.get(id))
    .filter(Boolean);
}

  return (
    <main className="main">
      <WeatherCard
        temperature={weather.temperature}
        condition={weather.condition}
        time={weather.time}
      />
      <div className="main__headliner">
        Today is{" "}
        {weather?.temperature?.[currentTemperatureUnit] != null
          ? `${weather.temperature[currentTemperatureUnit]}°${currentTemperatureUnit}`
          : "..."}{" "}
        / You may want to wear:
      </div>
      <ul className="main__card-list">
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
        className="main__randomize-button"
        type="button"
        onClick={handleRandomize}
        disabled={filteredItems.length === 0}
      >
        Randomize
      </button>

      {/* {displayItems && (
        <button
          className="main__showall-button"
          type="button"
          onClick={handleShowAll}
        >
          Show all
        </button>
      )} */}
    </main>
  );
}

export default Main;
