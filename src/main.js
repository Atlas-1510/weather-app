import "./style.scss";
import * as Toggle from "./toggle/toggle";

const openweathermap_key = "8d3007697e1595ff555d6df24f4492f3";
const location = document.getElementById("location");
const locationSubmit = document.getElementById("locationSubmit");
const geolocation = document.getElementById("geolocation");
const toggleHolder = document.querySelector(".toggle-holder");

const Settings = {
  weatherUnit: "metric",
};

const toggle = Toggle.generateToggle("metricUnitToggle");
toggleHolder.appendChild(toggle);

async function getCoordinatesAPI(input) {
  // Uses nominatim API (https://nominatim.org) from OpenStreetMap to get latitude and longitude of user input
  let API_response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${input}&format=json&limit=1`,
    {
      mode: "cors",
    }
  );
  return await parseResponse(API_response);
}

async function parseResponse(API_response) {
  return await API_response.json();
}

async function getWeatherAPI(lat, lon) {
  // Uses OpenWeatherMap one-call API (https://openweathermap.org/api/one-call-api) to get weather information
  let API_response = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?exclude=minutely&units=${Settings.weatherUnit}&lat=${lat}&lon=${lon}&appid=${openweathermap_key}`,
    { mode: "cors" }
  );
  return await parseResponse(API_response);
}

async function customWeatherSearch(searchInput) {
  let locationJSON = (await getCoordinatesAPI(searchInput))[0];
  let weatherJSON = await getWeatherAPI(locationJSON.lat, locationJSON.lon);
  console.log(weatherJSON);
}

async function currentLocationWeatherSearch(e) {
  e.preventDefault();
  function getLocalCoordinates() {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  const pos = await getLocalCoordinates();
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  let weatherJSON = await getWeatherAPI(lat, lon);
  console.log(weatherJSON);
}

locationSubmit.addEventListener("click", (event) => {
  event.preventDefault();
  customWeatherSearch(location.value);
});

geolocation.addEventListener("click", currentLocationWeatherSearch);

toggleHolder.addEventListener("change", (e) => {
  console.log("CHANGE");
  if (e.target.checked) {
    Settings.weatherUnit = "metric";
  } else {
    Settings.weatherUnit = "imperial";
  }
});
