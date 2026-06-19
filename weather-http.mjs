import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import axios from "axios";

const app = express();
app.use((req, res, next) => {
  console.log("METHOD:", req.method);
  console.log("URL:", req.url);
  console.log("BODY:", JSON.stringify(req.body));
  next();
});
app.use(express.json());

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

    const latitude = geoResponse.data.results[0].latitude;
    const longitude = geoResponse.data.results[0].longitude;

    const weatherResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
    );

    return {
      content: [
        {
          type: "text",
          text: `Current temperature in ${city} is ${weatherResponse.data.current.temperature_2m}°C`
        }
      ]
    };
  }
);
app.get("/mcp", (req, res) => {
  res.send("MCP endpoint reachable");
});
app.post("/mcp", async (req, res) => {

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  await server.connect(transport);

  await transport.handleRequest(
    req,
    res,
    req.body
  );

});

app.get("/", (req, res) => {
  res.send("Weather MCP HTTP Server Running V2 - Gaurav");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});