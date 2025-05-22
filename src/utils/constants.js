//home.openweathermap.org/api_keys: fd485a5230f45716ba6db534b6745df9
export const defaultClothingItems = [
  {
    _id: 0,
    name: "Cap",
    weather: "hot",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/wtwr-project/Cap.png?etag=f3dad389b22909cafa73cff9f9a3d591",
  },
  {
    _id: 1,
    name: "Hoodie",
    weather: "warm",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/wtwr-project/Hoodie.png?etag=5f52451d0958ccb1016c78a45603a4e8",
  },
  {
    _id: 2,
    name: "Jacket",
    weather: "cold",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/wtwr-project/Jacket.png?etag=f4bb188deaa25ac84ce2338be2d404ad",
  },
  {
    _id: 3,
    name: "Sneakers",
    weather: "cold",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/wtwr-project/Sneakers.png?etag=3efeec41c1c78b8afe26859ca7fa7b6f",
  },
  {
    _id: 4,
    name: "T-Shirt",
    weather: "hot",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/wtwr-project/T-Shirt.png?etag=44ed1963c44ab19cd2f5011522c5fc09",
  },
  {
    _id: 5,
    name: "Coat",
    weather: "cold",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/wtwr-project/Coat.png?etag=298717ed89d5e40b1954a1831ae0bdd4",
  },
];

export const API_KEY = "fd485a5230f45716ba6db534b6745df9";
export const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
export const DEFAULT_COORDS = {
  latitude: "40.7128", // Example: New York City
  longitude: "-74.0060",
};

export const clothingItemsData = [
  {
    _id: "1",
    name: "T-Shirt",
    imageUrl: "tshirt.svg",
    weather: "hot",
  },
  {
    _id: "2",
    name: "Shorts",
    imageUrl: "shorts.svg",
    weather: "hot",
  },
  {
    _id: "3",
    name: "Cap",
    imageUrl: "cap.svg",
    weather: "hot",
  },
  {
    _id: "4",
    name: "Sneakers",
    imageUrl: "sneakers.svg",
    weather: "warm",
  },
  {
    _id: "5",
    name: "Custom Cap",
    imageUrl: "customCap.svg",
    weather: "hot",
  },
  {
    _id: "6",
    name: "Custom Sneakers",
    imageUrl: "customSneakers.png",
    weather: "warm",
  },
];

export const weatherConditions = [
  { _id: "1", time: "day", condition: "Sunny", imageUrl: "daySunny.svg" },
  { _id: "2", time: "day", condition: "Cloudy", imageUrl: "dayCloudy.svg" },
  { _id: "3", time: "day", condition: "Rain", imageUrl: "dayRain.svg" },
  { _id: "4", time: "day", condition: "Storm", imageUrl: "dayStorm.svg" },
  { _id: "5", time: "day", condition: "Snow", imageUrl: "daySnow.svg" },
  { _id: "6", time: "day", condition: "Fog", imageUrl: "dayFog.svg" },
  { _id: "7", time: "night", condition: "Sunny", imageUrl: "nightSunny.svg" },
  { _id: "8", time: "night", condition: "Cloudy", imageUrl: "nightCloudy.svg" },
  { _id: "9", time: "night", condition: "Rain", imageUrl: "nightRain.svg" },
  { _id: "10", time: "night", condition: "Storm", imageUrl: "nightStorm.svg" },
  { _id: "11", time: "night", condition: "Snow", imageUrl: "nightSnow.svg" },
  { _id: "12", time: "night", condition: "Fog", imageUrl: "nightFog.svg" },
];
