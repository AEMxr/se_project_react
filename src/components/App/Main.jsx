import { useState } from "react";
import WeatherCard from "./Main/WeatherCard.jsx";
import ItemCard from "./Main/ItemCard.jsx";
import { getWeatherType } from "../../utils/weatherApi.js";
import "./Main.css";

function Main({ weather, clothingItems, onCardClick }) {
  const [displayItems, setDisplayItems] = useState(null);

  // console.log("Main component received:");
  // console.log("weather:", weather);
  // console.log("clothingItems:", clothingItems);
  // console.log("clothingItems length:", clothingItems?.length);

  const weatherType =
    weather.temperature !== null ? getWeatherType(weather.temperature) : null;
  const weatherCondition = weather.condition;

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

    return matchesType && matchesCondition;
  });

  // console.log("filteredItems:", filteredItems);
  // console.log("filteredItems length:", filteredItems.length);

  // Smart outfit builder function
  const handleRandomize = () => {
    if (filteredItems.length === 0) {
      console.log("No items available for current weather conditions");
      return;
    }

    console.log("RANDOMIZING OUTFIT:");
    console.log(
      `Weather: ${weatherType} (${weather.temperature}°F), Condition: ${weatherCondition}`
    );
    console.log(
      "Available items:",
      filteredItems.map((item) => item.name)
    );

    const categories = {
      head: [],
      face: [],
      topBase: [], // shirts, tank tops, base layers
      topOuter: [], // sweaters, jackets, coats
      bottomBase: [], // underwear, leggings, base layers
      bottomMain: [], // pants, shorts, skirts
      feet: [],
      socks: [],
      hands: [],
      accessories: [],
    };

    filteredItems.forEach((item) => {
      const name = item.name.toLowerCase();

      if (
        name.includes("hat") ||
        name.includes("cap") ||
        name.includes("beanie") ||
        name.includes("toque") ||
        name.includes("headband") ||
        name.includes("headscarf") ||
        name.includes("headwrap") ||
        name.includes("headbandana")
      ) {
        categories.head.push(item);
      } else if (
        name.includes("scarf") ||
        name.includes("mask") ||
        name.includes("earmuff") ||
        name.includes("earflap") ||
        name.includes("balaclava") ||
        name.includes("facecover") ||
        name.includes("nasal") ||
        name.includes("neck") ||
        name.includes("buff") ||
        name.includes("neckwarmer") ||
        name.includes("shawl")
      ) {
        categories.face.push(item);
      } else if (
        name.includes("shirt") ||
        name.includes("tank") ||
        name.includes("tee") ||
        name.includes("blouse")
      ) {
        categories.topBase.push(item);
      } else if (
        name.includes("sweater") ||
        name.includes("jacket") ||
        name.includes("coat") ||
        name.includes("hoodie") ||
        name.includes("cardigan")
      ) {
        categories.topOuter.push(item);
      } else if (
        name.includes("legging") ||
        name.includes("thermal") ||
        name.includes("underwear")
      ) {
        categories.bottomBase.push(item);
      } else if (
        name.includes("pants") ||
        name.includes("shorts") ||
        name.includes("skirt") ||
        name.includes("jeans")
      ) {
        categories.bottomMain.push(item);
      } else if (
        name.includes("shoe") ||
        name.includes("boot") ||
        name.includes("sandal") ||
        name.includes("flip") ||
        name.includes("slide") ||
        name.includes("slipper") ||
        name.includes("loafer") ||
        name.includes("sneaker") ||
        name.includes("trainer")
      ) {
        categories.feet.push(item);
      } else if (name.includes("sock") || name.includes("stocking")) {
        categories.socks.push(item);
      } else if (name.includes("glove") || name.includes("mitten")) {
        categories.hands.push(item);
      } else {
        categories.topBase.push(item);
      }
    });

    console.log("\nOUTFIT ANALYSIS:");

    const outfit = {};
    const reasons = {};

    // HEAD COVERAGE
    if (weatherType === "cold" || weather.temperature < 40) {
      if (categories.head.length > 0) {
        outfit.head =
          categories.head[Math.floor(Math.random() * categories.head.length)];
        reasons.head = `Selected: ${outfit.head.name} - Cold weather protection needed`;
      } else {
        reasons.head = `No head coverage available - Recommended for ${weather.temperature}°F weather`;
      }
    } else {
      reasons.head = `No head coverage needed - Weather is ${weatherType} (${weather.temperature}°F)`;
    }

    // FACE COVERAGE
    if (
      (weatherType === "cold" && weather.temperature < 30) ||
      weatherCondition === "dusty" ||
      weatherCondition === "windy"
    ) {
      if (categories.face.length > 0) {
        outfit.face =
          categories.face[Math.floor(Math.random() * categories.face.length)];
        reasons.face = `Selected: ${outfit.face.name} - Protection from ${
          weatherCondition || "extreme cold"
        }`;
      } else {
        reasons.face = `No face coverage available - Recommended for ${
          weatherCondition || "extreme cold"
        } conditions`;
      }
    } else {
      reasons.face = `No face coverage needed - Current conditions don't require it`;
    }

    // TOP LAYERS
    const topLayers = [];

    // Base layer
    if (categories.topBase.length > 0) {
      const baseTop =
        categories.topBase[
          Math.floor(Math.random() * categories.topBase.length)
        ];
      topLayers.push(baseTop);
      reasons.topBase = `Selected: ${baseTop.name} - Base layer essential`;
    } else {
      reasons.topBase = `No base tops available - CRITICAL: Need at least one shirt!`;
    }

    // Outer layer
    const needsOuterLayer = weatherType === "cold" || weather.temperature < 60;
    if (needsOuterLayer) {
      if (categories.topOuter.length > 0) {
        const outerTop =
          categories.topOuter[
            Math.floor(Math.random() * categories.topOuter.length)
          ];
        topLayers.push(outerTop);
        reasons.topOuter = `Selected: ${outerTop.name} - Outer layer for ${weather.temperature}°F weather`;
      } else {
        reasons.topOuter = `No outer layers available - Recommended for ${weather.temperature}°F weather`;
      }
    } else {
      reasons.topOuter = `No outer layer needed - Weather is ${weatherType} (${weather.temperature}°F)`;
    }

    outfit.tops = topLayers;

    // BOTTOM LAYERS
    const bottomLayers = [];

    // Base layer
    const needsBottomBase = weatherType === "cold" || weather.temperature < 50;
    if (needsBottomBase) {
      if (categories.bottomBase.length > 0) {
        const baseBottom =
          categories.bottomBase[
            Math.floor(Math.random() * categories.bottomBase.length)
          ];
        bottomLayers.push(baseBottom);
        reasons.bottomBase = `Selected: ${baseBottom.name} - Base layer for warmth/coverage`;
      } else {
        reasons.bottomBase = `No base bottoms available - Recommended for ${weather.temperature}°F weather`;
      }
    } else {
      reasons.bottomBase = `No base layer needed - Weather is ${weatherType} (${weather.temperature}°F)`;
    }

    // Main bottom
    if (categories.bottomMain.length > 0) {
      const mainBottom =
        categories.bottomMain[
          Math.floor(Math.random() * categories.bottomMain.length)
        ];
      bottomLayers.push(mainBottom);
      reasons.bottomMain = `Selected: ${mainBottom.name} - Main bottom essential`;
    } else {
      reasons.bottomMain = `No main bottoms available - CRITICAL: Need pants/shorts/skirt!`;
    }

    outfit.bottoms = bottomLayers;

    // FEET
    if (categories.feet.length > 0) {
      outfit.feet =
        categories.feet[Math.floor(Math.random() * categories.feet.length)];
      reasons.feet = `Selected: ${outfit.feet.name} - Footwear required`;
    } else {
      reasons.feet = `No footwear available - CRITICAL: Need shoes!`;
    }

    // SOCKS
    const needsSocks =
      outfit.feet &&
      !outfit.feet.name.toLowerCase().includes("flip") &&
      !outfit.feet.name.toLowerCase().includes("sandal");
    if (needsSocks) {
      if (categories.socks.length > 0) {
        outfit.socks =
          categories.socks[Math.floor(Math.random() * categories.socks.length)];
        reasons.socks = `Selected: ${outfit.socks.name} - Needed with ${
          outfit.feet?.name || "closed shoes"
        }`;
      } else {
        reasons.socks = `No socks available - Recommended with ${
          outfit.feet?.name || "closed shoes"
        }`;
      }
    } else {
      reasons.socks = `No socks needed - Wearing ${
        outfit.feet?.name || "open footwear"
      }`;
    }

    // HANDS
    if (weatherType === "cold" || weather.temperature < 35) {
      if (categories.hands.length > 0) {
        outfit.hands =
          categories.hands[Math.floor(Math.random() * categories.hands.length)];
        reasons.hands = `Selected: ${outfit.hands.name} - Hand protection for ${weather.temperature}°F`;
      } else {
        reasons.hands = `No gloves available - Recommended for ${weather.temperature}°F weather`;
      }
    } else {
      reasons.hands = `No gloves needed - Weather is ${weatherType} (${weather.temperature}°F)`;
    }

    Object.entries(reasons).forEach(([category, reason]) => {
      console.log(`${category.toUpperCase()}: ${reason}`);
    });

    console.log("\nFINAL LAYERED OUTFIT:");
    let outfitCount = 1;

    if (outfit.tops && outfit.tops.length > 0) {
      outfit.tops.forEach((item, index) => {
        const layer = index === 0 ? "(Base layer)" : "(Outer layer)";
        console.log(`${outfitCount}. ${item.name} ${layer}`);
        outfitCount++;
      });
    }

    if (outfit.bottoms && outfit.bottoms.length > 0) {
      outfit.bottoms.forEach((item, index) => {
        const layer =
          index === 0 && outfit.bottoms.length > 1 ? "(Base layer)" : "(Main)";
        console.log(`${outfitCount}. ${item.name} ${layer}`);
        outfitCount++;
      });
    }

    [outfit.feet, outfit.socks, outfit.head, outfit.face, outfit.hands].forEach(
      (item) => {
        if (item) {
          console.log(`${outfitCount}. ${item.name}`);
          outfitCount++;
        }
      }
    );

    if (outfitCount === 1) {
      console.log("Cannot create complete outfit - missing essential items!");
    }

    const selectedItems = [];
    if (outfit.head) selectedItems.push(outfit.head);
    if (outfit.face) selectedItems.push(outfit.face);
    if (outfit.tops) selectedItems.push(...outfit.tops);
    if (outfit.bottoms) selectedItems.push(...outfit.bottoms);
    if (outfit.feet) selectedItems.push(outfit.feet);
    if (outfit.socks) selectedItems.push(outfit.socks);
    if (outfit.hands) selectedItems.push(outfit.hands);

    console.log("\nUPDATING VISUAL DISPLAY:");
    console.log(
      "Selected items for display:",
      selectedItems.map((item) => item.name)
    );
    setDisplayItems(selectedItems);
  };

  const handleShowAll = () => {
    setDisplayItems(null);
    console.log("Showing all weather-appropriate items");
  };

  const itemsToDisplay = displayItems || filteredItems;

  return (
    <main className="main">
      <WeatherCard
        temperature={weather.temperature}
        condition={weather.condition}
        time={weather.time}
      />
      <div className="main__headliner">
        Today is{" "}
        {weather.temperature !== null ? `${weather.temperature}°F` : "..."} /
        You may want to wear:
      </div>
      <ul className="main__card-list">
        {itemsToDisplay.map((item) => (
          <ItemCard key={item._id} item={item} onCardClick={onCardClick} />
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
    </main>
  );
}

export default Main;
