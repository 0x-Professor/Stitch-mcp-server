#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { registerTools } from "./handlers/tools.js";
import { registerResources } from "./handlers/resources.js";
import { registerPrompts } from "./handlers/prompts.js";

// Load environment variables
dotenv.config();

// Check for setup subcommand
const args = process.argv.slice(2);
if (args[0] === 'setup' || args[0] === '--setup') {
  // Dynamic import to avoid loading setup deps when running as server
  import("./setup.js").then(({ runSetup }) => {
    runSetup().catch((err) => {
      console.error("An error occurred during setup:", err);
      process.exit(1);
    });
  });
} else {
  // Run as MCP server
  main().catch((err) => {
    console.error("Fatal error starting server:", err);
    process.exit(1);
  });
}

async function main() {
  if (!process.env.STITCH_API_KEY) {
    console.error("Error: STITCH_API_KEY environment variable is required.");
    console.error("Please provide it via .env file or environment variable.");
    console.error("\nTo set up the server, run: npx stitch-mcp-server setup");
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