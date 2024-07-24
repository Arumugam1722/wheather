const express = require("express");
const axios = require("axios");
const app = express();

let cities = [];
let currentIndex = -1;

// Set the view engine to EJS
app.set("view engine", "ejs");

// Serve the public folder as static files
app.use(express.static("public"));

// Render the index template with default values for weather, forecast, and error
app.get("/", (req, res) => {
  res.render("index", { weather: null, forecast: null, error: null });
});

// Handle the /weather route
app.get("/weather", async (req, res) => {
  const city = req.query.city;
  const direction = req.query.direction;

  if (city) {
    cities.push(city);
    currentIndex = cities.length - 1;
  } else if (direction) {
    if (direction === 'prev' && currentIndex > 0) {
      currentIndex--;
    } else if (direction === 'next' && currentIndex < cities.length - 1) {
      currentIndex++;
    }
  }

  const cur_city = cities[currentIndex];
  const apiKey = "93fab423499db905cc87eac55cf10c26";

  // Fetch current weather data to get the coordinates
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cur_city}&units=imperial&appid=${apiKey}`;
  let weather;
  let forecast;
  let fiveForecast;
  let error = null;

  try {
    const response = await axios.get(currentWeatherUrl);
    weather = response.data;

    // Use the coordinates from the current weather data to fetch the 5-day forecast
    const { coord } = weather;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&units=imperial&appid=${apiKey}`;
    const forecastResponse = await axios.get(forecastUrl);
    forecast = forecastResponse.data.list.slice(1,7); // All forecast data points
    const fiveForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&units=imperial&appid=${apiKey}`;
    const fiveForecastResponse = await axios.get(forecastUrl);
    fiveForecast = fiveForecastResponse.data;
  } catch (err) {
    console.error("Error fetching weather data:", err.message);
    weather = null;
    forecast = null;
    error = "Error, Please try again";
  }

  // Render the index template with the weather data and forecast
  res.render("index", { weather, forecast, error, fiveForecast });
});

// Start the server and listen on port 3000 or the value of the PORT environment variable
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
