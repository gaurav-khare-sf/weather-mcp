import { Server } from "@modelcontextprotocol/sdk/server";

console.log("Server:", Server);

console.log(
  Object.getOwnPropertyNames(Server.prototype)
);