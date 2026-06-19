const express = require("express");
const axios = require("axios");

const app = express();

app.get("/", (req, res) => {
  res.send("Weather MCP Server");
});

app.get("/weather/:city", async (req, res) => {

  const city = req.params.city;

  try {

    const geoUrl =
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

    const geoResponse = await axios.get(geoUrl);

    if (!geoResponse.data.results) {
      return res.status(404).json({
        error: "City not found"
      });
    }

    const latitude =
      geoResponse.data.results[0].latitude;

    const longitude =
      geoResponse.data.results[0].longitude;

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`;

    const weatherResponse =
      await axios.get(weatherUrl);

    res.json({
      city,
      temperature:
        weatherResponse.data.current.temperature_2m
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});