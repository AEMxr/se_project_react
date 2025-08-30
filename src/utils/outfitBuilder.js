function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function buildOutfit({ items, weatherType, tempF, weatherCondition }) {
  const categories = {
    head: [],
    face: [],
    topBase: [],
    topOuter: [],
    bottomBase: [],
    bottomMain: [],
    feet: [],
    socks: [],
    hands: [],
    accessories: [],
  };

  items.forEach((item) => {
    const name = (item.name || "").toLowerCase();

    if (
      /(hat|cap|beanie|toque|headband|headscarf|headwrap|headbandana)/.test(
        name
      )
    )
      categories.head.push(item);
    else if (
      /(scarf|mask|earmuff|earflap|balaclava|facecover|nasal|neck|buff|neckwarmer|shawl)/.test(
        name
      )
    )
      categories.face.push(item);
    else if (/(shirt|tank|tee|blouse)/.test(name))
      categories.topBase.push(item);
    else if (/(sweater|jacket|coat|hoodie|cardigan)/.test(name))
      categories.topOuter.push(item);
    else if (/(legging|thermal|underwear)/.test(name))
      categories.bottomBase.push(item);
    else if (/(pants|shorts|skirt|jeans)/.test(name))
      categories.bottomMain.push(item);
    else if (
      /(shoe|boot|sandal|flip|slide|slipper|loafer|sneaker|trainer)/.test(name)
    )
      categories.feet.push(item);
    else if (/(sock|stocking)/.test(name)) categories.socks.push(item);
    else if (/(glove|mitten)/.test(name)) categories.hands.push(item);
    else categories.accessories.push(item);
  });

  const outfit = {};
  const reasons = {};
  const t = (n, fallback = 999) => n ?? fallback;

  if (weatherType === "cold" || t(tempF) < 40) {
    if (categories.head.length) {
      outfit.head = pick(categories.head);
      reasons.head = `Selected: ${outfit.head.name} - Cold weather protection needed`;
    } else {
      reasons.head = `No head coverage available - Recommended for ${tempF}°F`;
    }
  } else {
    reasons.head = `No head coverage needed - Weather ${weatherType} (${tempF}°F)`;
  }

  if (
    (weatherType === "cold" && t(tempF) < 30) ||
    ["dusty", "windy"].includes((weatherCondition || "").toLowerCase())
  ) {
    if (categories.face.length) {
      outfit.face = pick(categories.face);
      reasons.face = `Selected: ${outfit.face.name} - Protection from ${
        weatherCondition || "extreme cold"
      }`;
    } else {
      reasons.face = `No face coverage available - Recommended for ${
        weatherCondition || "extreme cold"
      }`;
    }
  } else {
    reasons.face = `No face coverage needed`;
  }

  const topLayers = [];
  if (categories.topBase.length) {
    const baseTop = pick(categories.topBase);
    topLayers.push(baseTop);
    reasons.topBase = `Selected: ${baseTop.name} - Base layer essential`;
  } else {
    reasons.topBase = `No base tops available - CRITICAL`;
  }

  const needsOuterLayer = weatherType === "cold" || t(tempF) < 60;
  if (needsOuterLayer) {
    if (categories.topOuter.length) {
      const outerTop = pick(categories.topOuter);
      topLayers.push(outerTop);
      reasons.topOuter = `Selected: ${outerTop.name} - Outer layer for ${tempF}°F`;
    } else {
      reasons.topOuter = `No outer layers available - Recommended for ${tempF}°F`;
    }
  } else {
    reasons.topOuter = `No outer layer needed (${tempF}°F)`;
  }
  outfit.tops = topLayers;

  const bottomLayers = [];
  const needsBottomBase = weatherType === "cold" || t(tempF) < 50;
  if (needsBottomBase) {
    if (categories.bottomBase.length) {
      const baseBottom = pick(categories.bottomBase);
      bottomLayers.push(baseBottom);
      reasons.bottomBase = `Selected: ${baseBottom.name} - Base layer for warmth`;
    } else {
      reasons.bottomBase = `No base bottoms available - Recommended for ${tempF}°F`;
    }
  } else {
    reasons.bottomBase = `No base layer needed (${tempF}°F)`;
  }

  if (categories.bottomMain.length) {
    const mainBottom = pick(categories.bottomMain);
    bottomLayers.push(mainBottom);
    reasons.bottomMain = `Selected: ${mainBottom.name} - Main bottom essential`;
  } else {
    reasons.bottomMain = `No main bottoms available - CRITICAL`;
  }
  outfit.bottoms = bottomLayers;

  if (categories.feet.length) {
    outfit.feet = pick(categories.feet);
    reasons.feet = `Selected: ${outfit.feet.name} - Footwear required`;
  } else {
    reasons.feet = `No footwear available - CRITICAL`;
  }

  const needsSocks =
    outfit.feet && !/flip|sandal/.test(outfit.feet.name.toLowerCase());
  if (needsSocks) {
    if (categories.socks.length) {
      outfit.socks = pick(categories.socks);
      reasons.socks = `Selected: ${outfit.socks.name} - Needed with ${outfit.feet?.name}`;
    } else {
      reasons.socks = `No socks available - Recommended`;
    }
  } else {
    reasons.socks = `No socks needed with ${
      outfit.feet?.name || "open footwear"
    }`;
  }

  if (weatherType === "cold" || t(tempF) < 35) {
    if (categories.hands.length) {
      outfit.hands = pick(categories.hands);
      reasons.hands = `Selected: ${outfit.hands.name} - Hand protection for ${tempF}°F`;
    } else {
      reasons.hands = `No gloves available - Recommended for ${tempF}°F`;
    }
  } else {
    reasons.hands = `No gloves needed (${tempF}°F)`;
  }

  const lowerCond = (weatherCondition || "").toLowerCase();
  const hasUmbrella = categories.accessories.find((i) =>
    /umbrella/.test((i.name || "").toLowerCase())
  );
  const hasSunglasses = categories.accessories.find((i) =>
    /(sunglass|shades|sunnies|sunglasses)/.test((i.name || "").toLowerCase())
  );
  if (/rain|storm/.test(lowerCond) && hasUmbrella) {
    outfit.accessories = [...(outfit.accessories || []), hasUmbrella];
    reasons.accessories = `Selected: ${hasUmbrella.name} - Rain protection`;
  } else if ((/sunny/.test(lowerCond) || t(tempF) >= 66) && hasSunglasses) {
    outfit.accessories = [...(outfit.accessories || []), hasSunglasses];
    reasons.accessories = `Selected: ${hasSunglasses.name} - Bright conditions`;
  }

  const selectedItems = [];
  if (outfit.head) selectedItems.push(outfit.head);
  if (outfit.face) selectedItems.push(outfit.face);
  if (outfit.tops?.length) selectedItems.push(...outfit.tops);
  if (outfit.bottoms?.length) selectedItems.push(...outfit.bottoms);
  if (outfit.feet) selectedItems.push(outfit.feet);
  if (outfit.socks) selectedItems.push(outfit.socks);
  if (outfit.hands) selectedItems.push(outfit.hands);
  if (outfit.accessories?.length) selectedItems.push(...outfit.accessories);

  return { outfit, reasons, selectedItems };
}
