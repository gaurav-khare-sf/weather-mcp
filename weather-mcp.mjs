import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

const server = new McpServer({
  name: "weather-mcp",
  version: "1.0.0"
});

server.tool(
  "getWeather",
  {
    city: z.string()
  },
  async ({ city }) => {

    try {

      const geoResponse = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
      );

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

      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
      );

      return {
        content: [
          {
            type: "text",
            text:
              `Current temperature in ${city} is ` +
              `${weatherResponse.data.current.temperature_2m}°C`
          }
        ]
      };

    } catch (error) {

      return {
        content: [
          {
            type: "text",
            text: error.message
          }
        ]
      };

    }

  }
);

const transport = new StdioServerTransport();

await server.connect(transport);

console.error("Weather MCP running...");