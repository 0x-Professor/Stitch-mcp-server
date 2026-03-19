# Stitch MCP Server

[![npm version](https://img.shields.io/npm/v/stitch-mcp-server.svg)](https://www.npmjs.com/package/stitch-mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/stitch-mcp-server.svg)](https://www.npmjs.com/package/stitch-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/stitch-mcp-server.svg)](https://nodejs.org)
[![CI](https://github.com/0x-Professor/Stitch-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/0x-Professor/Stitch-mcp-server/actions/workflows/ci.yml)

> **Enterprise-ready Model Context Protocol (MCP) server for [Google Stitch SDK](https://github.com/AugmentedCode/stitch-sdk)** — Generate beautiful web UIs from text prompts using AI.

The **Stitch MCP Server** bridges your AI coding assistant (Claude, Cursor, Cline, Copilot, etc.) with Google's Stitch UI Generation API. Design, generate, and scaffold production-ready HTML components directly into your workspace using natural language.

---

## Features

| Feature | Description |
|---------|-------------|
| **AI UI Generation** | Generate complete HTML screens from text descriptions |
| **Edit and Iterate** | Modify existing screens with natural language prompts |
| **Design Variants** | Generate multiple design variations to explore options |
| **Auto-Scaffold** | Save generated UI directly to your project files |
| **Multi-Client Support** | Works with Claude Desktop, Cursor, Cline (VS Code), and any MCP client |
| **One-Click Setup** | Interactive installer configures everything automatically |

---

## Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **Stitch API Key** — [Get one here](https://stitch.google.com) (sign in with Google)

### Installation (30 seconds)

Run the interactive setup wizard:

```bash
npx stitch-mcp-server setup
```

This will:
1. Ask which AI tools you want to configure (Claude, Cursor, Cline)
2. Prompt for your Stitch API key
3. Automatically update your MCP configuration files
4. Done - restart your AI tool and start generating UIs

### Manual Configuration

If you prefer manual setup, add this to your MCP config file:

<details>
<summary><strong>Claude Desktop</strong> — <code>~/Library/Application Support/Claude/claude_desktop_config.json</code></summary>

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "stitch-mcp-server@latest"],
      "env": {
        "STITCH_API_KEY": "your-api-key-here"
      }
    }
  }
}
```
</details>

<details>
<summary><strong>Cursor</strong> — <code>.cursor/mcp.json</code> in your workspace</summary>

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "stitch-mcp-server@latest"],
      "env": {
        "STITCH_API_KEY": "your-api-key-here"
      }
    }
  }
}
```
</details>

<details>
<summary><strong>Cline (VS Code)</strong> — MCP Settings in Cline extension</summary>

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "stitch-mcp-server@latest"],
      "env": {
        "STITCH_API_KEY": "your-api-key-here"
      }
    }
  }
}
```
</details>

---

## Available Tools

### Core Tools

| Tool | Description | Example Prompt |
|------|-------------|----------------|
| `create_project` | Create a new Stitch project | *"Create a project called 'My App'"* |
| `list_projects` | List all your projects | *"Show my Stitch projects"* |
| `generate_screen` | Generate a UI from description | *"Create a login page with email and password"* |
| `edit_screen` | Modify an existing screen | *"Make the background dark and add a sidebar"* |
| `generate_variants` | Create design alternatives | *"Show me 3 different color schemes"* |

### Advanced Tools

| Tool | Description | Use Case |
|------|-------------|----------|
| `get_screen_code` | Fetch HTML source code | Get the raw HTML for a generated screen |
| `get_screen_image` | Get screenshot URL | Preview the generated design |
| `generate_and_fetch_code` | Generate + fetch in one call | Streamlined workflow for quick prototyping |
| `scaffold_project_files` | Save HTML to local files | Export directly to `src/components/` |

### Resources

- `stitch://projects` — List all projects as context
- `stitch://projects/{id}/screens` — List screens in a project

### Prompts

- `create_web_app` — Guided workflow to build a complete web app from idea to scaffolded files

---

## Usage Examples

### Generate a Landing Page

```
Create a modern landing page for a SaaS product with:
- Hero section with headline and CTA button
- Features grid with 3 columns
- Testimonials carousel
- Footer with links
```

### Create a Dashboard

```
Generate an admin dashboard with:
- Sidebar navigation
- Stats cards at the top
- Data table with pagination
- Dark mode theme
```

### Edit an Existing Design

```
Take the login screen and:
- Add social login buttons (Google, GitHub)
- Make it mobile responsive
- Add a "Remember me" checkbox
```

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/0x-Professor/Stitch-mcp-server.git
cd Stitch-mcp-server

# Install dependencies
npm install

# Build
npm run build

# Run locally
STITCH_API_KEY=your-key npm start
```

### Running Tests

```bash
STITCH_API_KEY=your-key npm test
```

---

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **MCP SDK**: [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- **Stitch SDK**: [@google/stitch-sdk](https://github.com/AugmentedCode/stitch-sdk)
- **Validation**: Zod
- **Build**: tsup
- **Testing**: Vitest

---

## Security

This server implements several security measures:

- **Path Traversal Protection** — Prevents writing files outside your workspace
- **Input Validation** — All inputs validated with Zod schemas
- **Secure Config Storage** — API keys stored with restricted file permissions (0600)
- **HTTP Response Validation** — Proper error handling for all network requests

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT - [0x-Professor](https://github.com/0x-Professor)

---

## Links

- **npm**: [npmjs.com/package/stitch-mcp-server](https://www.npmjs.com/package/stitch-mcp-server)
- **GitHub**: [github.com/0x-Professor/Stitch-mcp-server](https://github.com/0x-Professor/Stitch-mcp-server)
- **Issues**: [Report a bug](https://github.com/0x-Professor/Stitch-mcp-server/issues)
- **Stitch SDK**: [github.com/AugmentedCode/stitch-sdk](https://github.com/AugmentedCode/stitch-sdk)
- **MCP Protocol**: [modelcontextprotocol.io](https://modelcontextprotocol.io)

---

<p align="center">
  <sub>Built for the AI-assisted development community</sub>
</p>
