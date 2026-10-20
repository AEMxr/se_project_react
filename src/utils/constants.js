export const DEFAULT_COORDS = { latitude: 40.7128, longitude: -74.006 };
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 30;
export const PASSWORD_MIN_LENGTH = 8;
export const VALID_WEATHER_TYPES = ["hot", "warm", "cold"];
export const GEOLOCATION_TIMEOUT_MS = 5000;
export const GEOLOCATION_MAX_AGE_MS = 300000;
export const REQUEST_TIMEOUT_MS = 15000;
export const HOT_TEMPERATURE_F = 86;
export const WARM_TEMPERATURE_F = 66;
export const FREEZING_TEMPERATURE_F = 32;
export const CELSIUS_SCALE = 5 / 9;

export const weatherConditions = [
  { time: "day", condition: "Sunny", imageUrl: "daySunny.svg" },
  { time: "day", condition: "Cloudy", imageUrl: "dayCloudy.svg" },
  { time: "day", condition: "Rain", imageUrl: "dayRain.svg" },
  { time: "day", condition: "Storm", imageUrl: "dayStorm.svg" },
  { time: "day", condition: "Snow", imageUrl: "daySnow.svg" },
  { time: "day", condition: "Fog", imageUrl: "dayFog.svg" },
  { time: "night", condition: "Sunny", imageUrl: "nightSunny.svg" },
  { time: "night", condition: "Cloudy", imageUrl: "nightCloudy.svg" },
  { time: "night", condition: "Rain", imageUrl: "nightRain.svg" },
  { time: "night", condition: "Storm", imageUrl: "nightStorm.svg" },
  { time: "night", condition: "Snow", imageUrl: "nightSnow.svg" },
  { time: "night", condition: "Fog", imageUrl: "nightFog.svg" },
];
