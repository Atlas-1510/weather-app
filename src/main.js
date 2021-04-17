// Styles
import "./style.scss";

// Modules
import * as Toggle from "./toggle/toggle";

// Images
import CloudyDayOne from "./weather_icons/cloudy-day-1.svg";
import CloudyNightOne from "./weather_icons/cloudy-night-1.svg";
import CloudyDayTwo from "./weather_icons/cloudy-day-2.svg";
import CloudyNightTwo from "./weather_icons/cloudy-night-2.svg";
import Cloudy from "./weather_icons/cloudy.svg";
import Day from "./weather_icons/day.svg";
import Night from "./weather_icons/night.svg";
import RainyThree from "./weather_icons/rainy-3.svg";
import RainyFour from "./weather_icons/rainy-4.svg";
import RainySix from "./weather_icons/rainy-6.svg";
import Thunder from "./weather_icons/thunder.svg";
import Snowy3 from "./weather_icons/snowy-3.svg";
import Snowy6 from "./weather_icons/snowy-6.svg";

// API Keys
const openweathermap_key = "8d3007697e1595ff555d6df24f4492f3";

// DOM elements
// NAV
const searchInput = document.getElementById("searchInput");
const searchSubmit = document.getElementById("searchSubmit");
const geolocation = document.getElementById("geolocation");
// Primary Tile
const locationTitle = document.getElementById("locationTitle");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const conditions = document.getElementById("conditions");
const rain = document.getElementById("rain");
const highLow = document.getElementById("highLow");
const locationTime = document.getElementById("locationTime");
// const toggleHolder = document.querySelector(".toggle-holder");

const Settings = {
  weatherUnit: "metric",
  icons: {
    "01d": Day,
    "01n": Night,
    "02d": CloudyDayTwo,
    "02n": CloudyNightTwo,
    "03d": Cloudy,
    "03n": Cloudy,
    "04d": CloudyDayOne,
    "04n": CloudyNightOne,
    "09d": RainyFour,
    "09n": RainyFour,
    "10d": RainyThree,
    "10n": RainySix,
    "11d": Thunder,
    "11n": Thunder,
    "13d": Snowy3,
    "13n": Snowy6,
    "50d": Cloudy,
    "50n": Cloudy,
  },
};

const Main = (() => {
  async function updateWeather(searchValue) {
    let returnedWeather;
    if (searchValue) {
      returnedWeather = await Weather.customWeatherSearch(searchValue);
    } else {
      returnedWeather = await Weather.currentLocationWeatherSearch();
    }
    console.log(returnedWeather.weather.timezone_offset);
    let localTime = Utilities.getLocalTime(returnedWeather.weather.timezone);
    returnedWeather.localTime = localTime;

    console.log(returnedWeather);
    Utilities.updatePrimaryTile(returnedWeather);
  }

  return { updateWeather };
})();

const Weather = (() => {
  async function getCoordinatesAPI(input) {
    // Uses nominatim API (https://nominatim.org) from OpenStreetMap to get latitude and longitude of user input
    let API_response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${input}&format=json&limit=1`,
      {
        mode: "cors",
      }
    );
    return await Utilities.parseResponse(API_response);
  }

  async function getLocationDetailsAPI(lat, lon) {
    // Nomatim API used below for a reverse lookup, to get place name associated with the lat/lon coordinates
    // Determine zoom level based on guide here: https://nominatim.org/release-docs/develop/api/Reverse/
    const locationLookup = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`
    );
    const location = await Utilities.parseResponse(locationLookup);
    return location.address;
  }

  async function getWeatherAPI(lat, lon) {
    // Uses OpenWeatherMap one-call API (https://openweathermap.org/api/one-call-api) to get weather information
    let API_response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?exclude=minutely&units=${Settings.weatherUnit}&lat=${lat}&lon=${lon}&appid=${openweathermap_key}`,
      { mode: "cors" }
    );

    let weather = await Utilities.parseResponse(API_response);
    return weather;
  }

  async function customWeatherSearch(searchInput) {
    let coordinates = (await getCoordinatesAPI(searchInput))[0];
    let location = await getLocationDetailsAPI(
      coordinates.lat,
      coordinates.lon
    );
    let weather = await getWeatherAPI(coordinates.lat, coordinates.lon);
    return { weather, location };
  }

  async function currentLocationWeatherSearch() {
    function getLocalCoordinates() {
      return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
    }

    const position = await getLocalCoordinates();
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const location = await getLocationDetailsAPI(lat, lon);
    const weather = await getWeatherAPI(lat, lon);
    return { weather, location };
  }

  return { customWeatherSearch, currentLocationWeatherSearch };
})();

const Utilities = (() => {
  async function parseResponse(API_response) {
    return await API_response.json();
  }

  function updatePrimaryTile(tileInfo) {
    // Location heading
    locationTitle.textContent = `${tileInfo.location.city}, ${tileInfo.location.country}`;

    // Current time
    locationTime.textContent = `${tileInfo.localTime.weekday}, ${tileInfo.localTime.time}`;

    // Weather icon
    let icon = tileInfo.weather.current.weather[0].icon;
    weatherIcon.src = Settings.icons[icon];

    // Current temperature
    temperature.textContent = `${Math.round(tileInfo.weather.current.temp)}°`;

    // Current conditions
    conditions.textContent = tileInfo.weather.current.weather[0].description;

    // Chance of rain
    rain.textContent = `${Math.round(
      tileInfo.weather.daily[0].pop
    )}% chance of rain`;

    // High and low
    highLow.textContent = `${Math.round(
      tileInfo.weather.daily[0].temp.max
    )}° / ${Math.round(tileInfo.weather.daily[0].temp.min)}°`;
  }

  function getLocalTime(timezone) {
    let now = new Date();
    const options = {
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
      timeZoneName: "short",
      timeZone: timezone,
    };

    let dateTime = new Intl.DateTimeFormat("en-AU", options).formatToParts(now);

    dateTime = {
      weekday: dateTime[0].value,
      time: `${dateTime[2].value}:${dateTime[4].value} ${dateTime[6].value}`,
    };

    console.log(dateTime);

    return dateTime;
  }

  return { parseResponse, updatePrimaryTile, getLocalTime };
})();

const App = (() => {
  window.onload = Main.updateWeather();

  searchSubmit.addEventListener("click", (event) => {
    event.preventDefault();
    Main.updateWeather(searchInput.value);
  });

  geolocation.addEventListener("click", (event) => {
    event.preventDefault();
    Main.updateWeather();
  });
})();

// toggleHolder.addEventListener("change", (e) => {
//   console.log("CHANGE");
//   if (e.target.checked) {
//     Settings.weatherUnit = "metric";
//   } else {
//     Settings.weatherUnit = "imperial";
//   }
//   console.log(Settings.weatherUnit);
// });
