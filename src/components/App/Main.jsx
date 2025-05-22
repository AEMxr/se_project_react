import WeatherCard from "./Main/WeatherCard.jsx";
import ItemCard from "./Main/ItemCard.jsx";
import "./Main.css";

function Main({ weather, clothingItems, onCardClick }) {
  const filteredItems = clothingItems.filter(
    (item) => !weather.type || item.weather === weather.type
  );

  return (
    <main className="main">
      <WeatherCard
        temperature={weather.temperature}
        condition={weather.condition}
        time={weather.time}
      />

      <ul className="card-list">
        {filteredItems.map((item) => (
          <ItemCard key={item._id} item={item} onCardClick={onCardClick} />
        ))}
      </ul>
    </main>
  );
}

export default Main;
