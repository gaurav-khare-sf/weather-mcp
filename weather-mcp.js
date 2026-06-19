const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const axios = require("axios");

const server = new Server(
  {
    name: "weather-mcp",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.tool(
  "getWeather",
  "Get current weather for a city",
  {
    city: z.string()
  },
  async ({ city }) => {

    try {

      const geoUrl =
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

      const geoResponse = await axios.get(geoUrl);

      if (!geoResponse.data.results) {
        return {
          content: [
            {
              type: "text",
              text: `City ${city} not found`
            }
          ]
        };
      }

      const latitude =
        geoResponse.data.results[0].latitude;

      const longitude =
        geoResponse.data.results[0].longitude;

      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`;

      const weatherResponse =
        await axios.get(weatherUrl);

      return {
        content: [
          {
            type: "text",
            text: `Current temperature in ${city} is ${weatherResponse.data.current.temperature_2m}°C`
          }
        ]
      };

    } catch (err) {

      return {
        content: [
          {
            type: "text",
            text: `Error: ${err.message}`
          }
        ]
      };

    }

  }
);

async function main() {

  const transport =
    new StdioServerTransport();

  await server.connect(transport);

  console.error("Weather MCP Server Running");
}

main();