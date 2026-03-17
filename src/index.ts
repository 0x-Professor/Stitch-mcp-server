#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { registerTools } from "./handlers/tools.js";
import { registerResources } from "./handlers/resources.js";
import { registerPrompts } from "./handlers/prompts.js";

// Load environment variables
dotenv.config();

async function main() {
  if (!process.env.STITCH_API_KEY) {
    console.error("Error: STITCH_API_KEY environment variable is required.");
    console.error("Please provide it via .env file or environment variable.");
    process.exit(1);
  }

  const server = new McpServer({
    name: "Stitch-MCP-Server",
    version: "1.0.0",
  });

  // Register Handlers
  registerTools(server);
  registerResources(server);
  registerPrompts(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Informative log (to stderr, so it doesn't pollute stdout where MCP protocol communicates)
  console.error("Stitch MCP Server is running and listening on stdio.");
}

main().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});