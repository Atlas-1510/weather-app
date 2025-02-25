// Styles
import "./styles/style.scss";
import "./styles/load_spinner.scss";

// Modules
import * as Toggle from "./toggle/toggle";

// Images
import CloudyDayOne from "./img/weather_icons/cloudy-day-1.svg";
import CloudyNightOne from "./img/weather_icons/cloudy-night-1.svg";
import CloudyDayTwo from "./img/weather_icons/cloudy-day-2.svg";
import CloudyNightTwo from "./img/weather_icons/cloudy-night-2.svg";
import Cloudy from "./img/weather_icons/cloudy.svg";
import Day from "./img/weather_icons/day.svg";
import Night from "./img/weather_icons/night.svg";
import RainyThree from "./img/weather_icons/rainy-3.svg";
import RainyFour from "./img/weather_icons/rainy-4.svg";
import RainySix from "./img/weather_icons/rainy-6.svg";
import Thunder from "./img/weather_icons/thunder.svg";
import Snowy3 from "./img/weather_icons/snowy-3.svg";
import Snowy6 from "./img/weather_icons/snowy-6.svg";

// API Keys
const openweathermap_key = "8d3007697e1595ff555d6df24f4492f3";

// DOM elements
const main = document.querySelector("main");
const glassPopUp = document.getElementById("glassPopUp");
const settingsContainer = document.getElementById("settingsContainer");
const settingsPanel = document.getElementById("settingsPanel");
const settings = document.getElementById("settings");
const settingsExit = document.getElementById("settingsExit");
// Nav
const searchInput = document.getElementById("searchInput");
const searchSubmit = document.getElementById("searchSubmit");
const geolocation = document.getElementById("geolocation");
// Primary Tile
const primaryTile = document.getElementById("primaryWeather");
const locationTitle = document.getElementById("locationTitle");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const conditions = document.getElementById("conditions");
const rain = document.getElementById("rain");
const highLow = document.getElementById("highLow");
const locationTime = document.getElementById("locationTime");
// Secondary Tile
const secondaryTile = document.getElementById("secondaryWeather");
// Tertiary Tile
const wind = document.getElementById("wind").querySelector(".weatherDetail");
const humidity = document
  .getElementById("humidity")
  .querySelector(".weatherDetail");
const uv = document.getElementById("uv").querySelector(".weatherDetail");
const pressure = document
  .getElementById("pressure")
  .querySelector(".weatherDetail");
const dew = document.getElementById("dew").querySelector(".weatherDetail");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const moonrise = document.getElementById("moonrise");
const moonset = document.getElementById("moonset");
// Loading indicator
const spinnerContainer = document.getElementById("spinnerContainer");
// Mobile Menu
const mobileSearch = document.getElementById("mobileSearch");
const mobileSearchInput = document.getElementById("mobileSearchInput");
const mobileSearchSubmit = document.getElementById("mobileSearchSubmit");
const mobileSearchCancel = document.getElementById("mobileSearchCancel");

const Options = {
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

const Control = (() => {
  async function updateWeather(searchValue) {
    main.dispatchEvent(Styling.weatherRequested);

    let returnedWeather;
    if (searchValue) {
      returnedWeather = await Weather.customWeatherSearch(searchValue);
    } else {
      returnedWeather = await Weather.currentLocationWeatherSearch();
    }
    let localTime = Utilities.getLocalTime(
      new Date(),
      returnedWeather.weather.timezone
    );
    returnedWeather.localTime = localTime;

    Utilities.updatePrimaryTile(returnedWeather);
    Utilities.updateSecondaryTile(returnedWeather);
    Utilities.updateTertiaryTile(returnedWeather);

    main.dispatchEvent(Styling.weatherRecieved);
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
      `https://api.openweathermap.org/data/2.5/onecall?exclude=minutely&units=${Options.weatherUnit}&lat=${lat}&lon=${lon}&appid=${openweathermap_key}`,
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
    weatherIcon.src = Options.icons[icon];

    // Current temperature
    temperature.textContent = `${Math.round(tileInfo.weather.current.temp)}°`;

    // Current conditions
    let textContent = tileInfo.weather.current.weather[0].description;
    textContent = textContent.charAt(0).toUpperCase() + textContent.slice(1);
    conditions.textContent = textContent;

    // Chance of rain
    rain.textContent = `${Math.round(
      tileInfo.weather.daily[0].pop * 100
    )}% chance of rain`;

    // High and low
    highLow.textContent = `${Math.round(
      tileInfo.weather.daily[0].temp.max
    )}° / ${Math.round(tileInfo.weather.daily[0].temp.min)}°`;
  }

  function getLocalTime(time, timezone) {
    const options = {
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
      timeZoneName: "short",
      timeZone: timezone,
    };

    let dateTime = new Intl.DateTimeFormat("en-AU", options).formatToParts(
      time
    );

    dateTime = {
      weekday: dateTime[0].value,
      time: `${dateTime[2].value}:${dateTime[4].value} ${dateTime[6].value}`,
    };

    return dateTime;
  }

  function updateSecondaryTile(tileInfo) {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const forecasts = [...secondaryTile.querySelectorAll(".dailyForecast")];

    // Loop starts on 1 as first day (0) is in the primary tile
    for (let i = 1; i < 7; i++) {
      // Update day
      let nextDay = days.indexOf(tileInfo.localTime.weekday) + i;

      if (nextDay > 6) {
        nextDay = nextDay % 7;
      }
      nextDay = days[nextDay];

      let dayNode = forecasts[i - 1].querySelector(".day");
      dayNode.textContent = nextDay;

      // Update icon
      let icon = forecasts[i - 1].querySelector(".forecastIcon");
      let icon_code = tileInfo.weather.daily[i].weather[0].icon;
      icon.src = Options.icons[icon_code];

      // Update conditions
      let condition = forecasts[i - 1].querySelector(".forecast-conditions");

      let conditionInput = tileInfo.weather.daily[i].weather[0].description;
      conditionInput =
        conditionInput.charAt(0).toUpperCase() + conditionInput.slice(1);
      condition.textContent = conditionInput;

      // Update Rain
      let rain = forecasts[i - 1]

        .querySelector(".forecast-rain")
        .querySelector("span");
      let pop = Math.round(tileInfo.weather.daily[i].pop * 100);
      rain.textContent = ` ${pop}%`;

      // Update high / low
      let highLow = forecasts[i - 1].querySelector(".forecast-highLow");
      let high = Math.round(tileInfo.weather.daily[i].temp.max);
      let low = Math.round(tileInfo.weather.daily[i].temp.min);
      highLow.textContent = `${high}° / ${low}°`;
    }
  }

  function updateTertiaryTile(tileInfo) {
    // Update assorted weather
    wind.textContent = `${Math.round(
      tileInfo.weather.daily[0].wind_speed
    )} km/h`;

    humidity.textContent = `${Math.round(tileInfo.weather.daily[0].humidity)}%`;

    uv.textContent = `${Math.round(tileInfo.weather.daily[0].uvi)} of 10`;

    pressure.textContent = `${Math.round(
      tileInfo.weather.daily[0].pressure
    )} mb`;

    dew.textContent = `${Math.round(tileInfo.weather.daily[0].dew_point)}°`;

    // Update sun and moon times
    sunrise.textContent = getLocalTime(
      1000 * tileInfo.weather.daily[0].sunrise,
      tileInfo.weather.timezone
    ).time;

    sunset.textContent = getLocalTime(
      1000 * tileInfo.weather.daily[0].sunset,
      tileInfo.weather.timezone
    ).time;

    moonrise.textContent = getLocalTime(
      1000 * tileInfo.weather.daily[0].moonrise,
      tileInfo.weather.timezone
    ).time;

    moonset.textContent = getLocalTime(
      1000 * tileInfo.weather.daily[0].moonset,
      tileInfo.weather.timezone
    ).time;
  }
  return {
    parseResponse,
    updatePrimaryTile,
    getLocalTime,
    updateSecondaryTile,
    updateTertiaryTile,
  };
})();

const Styling = (() => {
  const weatherRequested = new Event("weatherRequested");
  main.addEventListener("weatherRequested", () => {
    spinnerContainer.classList.add("active");
    let tiles = main.querySelectorAll(".bubble");
    tiles = [...tiles];
    tiles.forEach((tile) => {
      tile.style.opacity = 0;
    });
  });

  const weatherRecieved = new Event("weatherRecieved");
  main.addEventListener("weatherRecieved", () => {
    spinnerContainer.classList.remove("active");
    let tiles = main.querySelectorAll(".bubble");
    tiles = [...tiles];
    tiles.forEach((tile) => {
      tile.style.opacity = 1;
    });
  });

  return { weatherRequested, weatherRecieved };
})();

const App = (() => {
  window.onload = () => {
    Control.updateWeather();
    const unitToggle = Toggle.generateToggle("unitToggle");
    unitToggle.addEventListener("change", () => {
      if (unitToggle.checked) {
        Options.weatherUnit = "metric";
        unitToggle.checked = false;
      } else if (!unitToggle.checked) {
        Options.weatherUnit = "imperial";
        unitToggle.checked = true;
      }
    });

    document.querySelector(".togggleHolder").appendChild(unitToggle);
  };

  searchSubmit.addEventListener("click", (event) => {
    event.preventDefault();
    const vw = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );

    // Mobile
    if (vw < 700) {
      glassPopUp.classList.add("active");
      mobileSearch.style.display = "flex";
    } else {
      // Desktop
      Control.updateWeather(searchInput.value);
      searchInput.value = "";
    }
  });

  geolocation.addEventListener("click", (event) => {
    event.preventDefault();
    Control.updateWeather();
  });

  settings.addEventListener("click", () => {
    glassPopUp.classList.add("active");
    settingsContainer.style.display = "flex";
  });

  // Mobile
  mobileSearchCancel.addEventListener("click", () => {
    mobileSearch.style.display = "none";
    glassPopUp.classList.remove("active");
  });

  mobileSearchSubmit.addEventListener("click", () => {
    mobileSearch.style.display = "none";
    glassPopUp.classList.remove("active");
    Control.updateWeather(mobileSearchInput.value);
    mobileSearchInput.value = "";
  });

  // Settings
  settingsExit.addEventListener("click", () => {
    settingsContainer.style.display = "none";
    glassPopUp.classList.remove("active");
  });
})();
