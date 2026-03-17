# Stitch MCP Server

An enterprise-ready Model Context Protocol (MCP) server for the [Google Stitch SDK](https://github.com/google-labs-code/stitch-sdk). 

This server acts as a bridge between your coding agent (Claude, Gemini, Copilot, Cursor, etc.) and Google's Stitch UI Generation API. It exposes powerful native tools, intelligent macro features, resources, and templates so AI agents can fluidly design, generate, and scaffold UI components straight into your workspace.

## Features

- **Standard Tools**: Direct support for Native Stitch functionalities (`create_project`, `generate_screen`, `edit_screen`, `list_projects`, `generate_variants`).
- **Advanced Agent Macro Tools**: 
  - `get_screen_code`: Fetches raw HTML for generated screens.
  - `get_screen_image`: Fetches screenshot images associated with your screens.
  - `generate_and_fetch_code`: Create a UI and retrieve its HTML code in a single round-trip, saving extreme token latency and minimizing prompt complexity.
  - `scaffold_project_files`: Seamlessly save and map an abstract Stitch UI directly to local files in the active workspace.
- **Context Resources**: Map abstract IDs natively with `stitch://projects` and `stitch://projects/{projectId}/screens` context providers.
- **Bootstrapping Prompts**: Leverage the native `create_web_app` prompt for zero-shot orchestration to guide agents from project creation to scaffolding.

## Installation & Setup

You need an active `STITCH_API_KEY` to run this server. You can sign up with your Google account to get one.

This package comes with a built-in automated installer for **Claude Desktop**, **Cline**, and **Cursor**.

### The Easy Way (Interactive Setup)

Run the following command anywhere on your machine. It will ask which AI tools you want to configure, and it will safely insert the server and prompt you for your `STITCH_API_KEY`:

```bash
npx -y stitch-mcp-server@latest setup
```

That's it! Restart your target application and the tools will appear.

### The Manual Way (JSON Config)

If you prefer to configure your client manually, use the following snippet. Ensure you replace `your-api-key` with your actual Stitch API Key.

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "stitch-mcp-server@latest"],
      "env": {
        "STITCH_API_KEY": "your-api-key"
      }
    }
  }
}
```

---

## Capabilities

The `stitch-mcp-server` gives your AI assistant several specialized tools:

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

## Publishing to NPM

This project is fully weaponized for NPM publishing.

1. Ensure you are logged into NPM: `npm login`
2. Test the build: `npm run build`
3. Publish publicly: `npm publish --access public`

The `package.json` uses the `files` directive to only pack the optimized `dist` folder, keeping the package extremely lightweight.

## License
MIT
