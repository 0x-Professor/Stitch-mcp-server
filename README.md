# Stitch MCP Server

An enterprise-ready Model Context Protocol (MCP) server for the [Google Stitch SDK](https://github.com/google-labs-code/stitch-sdk). 

This server acts as a bridge between your coding agent (Claude, Gemini, Copilot, Cursor, etc.) and Google's Stitch UI Generation API. It exposes powerful native tools, intelligent macro features, resources, and templates so AI agents can fluidly design, generate, and scaffold UI components straight into your workspace.

## Features

- **Standard Tools**: Direct support for Native Stitch functionalities (`create_project`, `generate_screen`, `edit_screen`, etc.)
- **Advanced Agent Macro Tools**: 
  - `generate_and_fetch_code`: Create a UI and retrieve its HTML code in a single round-trip, saving extreme token latency and minimizing prompt complexity.
  - `scaffold_project_files`: Seamlessly save and map an abstract Stitch UI directly to local files in the active workspace.
- **Context Resources**: Map abstract IDs natively with `stitch://projects` and `stitch://projects/{projectId}/screens` context providers.
- **Bootstrapping Prompts**: Leverage the native `create_web_app` prompt for zero-shot orchestration to guide agents from project creation to scaffolding.

## Setup

You need an active `STITCH_API_KEY` to run this server. 

### Global Execution (npx)
```json
{
  "mcpServers": {
    "stitch-mcp": {
      "command": "npx",
      "args": ["stitch-mcp-server"],
      "env": {
        "STITCH_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Run the server (or configure your client to run it locally):
   ```bash
   STITCH_API_KEY=your-api-key npm start
   ```

## Development

Built natively with:
- Node.js & TypeScript
- `@modelcontextprotocol/sdk` (Official SDK)
- `@google/stitch-sdk`
- Zod for rigorous run-time schema validation
- `tsup` for rapid transparent builds

## License
MIT
