#!/usr/bin/env node
import { runSetup } from "./setup.js";

// Check if 'setup' argument was passed (for npx stitch-mcp-server setup)
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();

if (command === 'setup' || command === '--setup' || command === '-s') {
  runSetup().catch((err) => {
    console.error("An error occurred during setup:", err);
    process.exitCode = 1;
  });
} else if (command === '--help' || command === '-h') {
  console.log(`
Stitch MCP Server Setup CLI

Usage:
  stitch-mcp-setup          Run the interactive setup wizard
  stitch-mcp-setup --help   Show this help message

Or run via npx:
  npx stitch-mcp-server setup

This will configure the Stitch MCP server for:
  - Claude Desktop
  - Cline (VS Code Extension)  
  - Cursor (Workspace Config)
`);
} else if (command && command !== '') {
  console.error(`Unknown command: ${command}`);
  console.log("Run 'stitch-mcp-setup --help' for usage information.");
  process.exitCode = 1;
} else {
  // Default: run setup
  runSetup().catch((err) => {
    console.error("An error occurred during setup:", err);
    process.exitCode = 1;
  });
}
