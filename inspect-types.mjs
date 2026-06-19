import * as types from "@modelcontextprotocol/sdk/types.js";

console.log(
  Object.keys(types)
    .filter(x =>
      x.includes("Tools") ||
      x.includes("Tool")
    )
);