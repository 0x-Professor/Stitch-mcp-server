import fs from "fs";
import path from "path";
import os from "os";
import { checkbox, input, confirm } from "@inquirer/prompts";

const homedir = os.homedir();
const platform = os.platform();

const getAppDataPath = () => {
  if (platform === "win32") {
    return process.env.APPDATA || path.join(homedir, "AppData", "Roaming");
  } else if (platform === "darwin") {
    return path.join(homedir, "Library", "Application Support");
  } else {
    return path.join(homedir, ".config");
  }
};

const getClaudeDesktopConfigPath = () => {
  if (platform === "darwin") {
    return path.join(homedir, "Library", "Application Support", "Claude", "claude_desktop_config.json");
  }
  return path.join(getAppDataPath(), "Claude", "claude_desktop_config.json");
};

const getClineConfigPath = () => {
  if (platform === "darwin") {
    return path.join(homedir, "Library", "Application Support", "Code", "User", "globalStorage", "saoudrizwan.claude-dev", "settings", "cline_mcp_settings.json");
  } else if (platform === "win32") {
    return path.join(getAppDataPath(), "Code", "User", "globalStorage", "saoudrizwan.claude-dev", "settings", "cline_mcp_settings.json");
  }
  return path.join(getAppDataPath(), "Code", "User", "globalStorage", "saoudrizwan.claude-dev", "settings", "cline_mcp_settings.json");
};

const getCursorConfigDir = () => {
  // Cursor usually configures MCP via the UI which stores in its SQLite DB or in workspace .cursor/mcp.json. 
  // However, we can create a `.cursor/mcp.json` in the user's home directory if they want a start. 
  // Or we can just prompt them to set it up in the UI.
  return path.join(homedir, ".cursor");
};

export const runSetup = async () => {
  console.log("\n🚀 Welcome to the Stitch MCP Server Setup!");
  console.log("This utility will automatically configure your favorite tools to use the Stitch MCP Server.\n");

  const tools = [
    {
      name: "Claude Desktop",
      value: "claude",
      checked: fs.existsSync(getClaudeDesktopConfigPath()),
    },
    {
      name: "Cline (VS Code Extension)",
      value: "cline",
      checked: fs.existsSync(getClineConfigPath()),
    },
    {
      name: "Cursor (Workspace Config)",
      value: "cursor",
      checked: fs.existsSync(getCursorConfigDir()),
    }
  ];

  const selectedTools = await checkbox({
    message: "Which tools would you like to configure this MCP Server for?",
    choices: tools,
  });

  if (selectedTools.length === 0) {
    console.log("❌ No tools selected. Exiting.");
    return;
  }

  const apiKey = await input({
    message: "Please enter your Stitch API Key (STITCH_API_KEY):",
  });

  if (!apiKey) {
    console.log("❌ API Key is required. Exiting.");
    return;
  }

  console.log("\nConfiguring selected tools...\n");

  const serverCommand = platform === "win32" ? "npx.cmd" : "npx";
  const serverArgs = ["-y", "stitch-mcp-server"];

  const mcpConfigEntry = {
    command: serverCommand,
    args: serverArgs,
    env: {
      STITCH_API_KEY: apiKey
    }
  };

  const updateJsonConfig = (configPath: string, keyName: string = "stitch", serverDef = mcpConfigEntry) => {
    let config: any = { mcpServers: {} };
    try {
      if (fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, "utf-8");
        config = JSON.parse(fileContent);
        if (!config.mcpServers) config.mcpServers = {};
      } else {
        fs.mkdirSync(path.dirname(configPath), { recursive: true });
      }
      
      config.mcpServers[keyName] = serverDef;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`✅ Successfully updated: ${configPath}`);
    } catch (err) {
      console.error(`❌ Failed to update ${configPath}:`, err);
    }
  };

  for (const tool of selectedTools) {
    if (tool === "claude") {
      updateJsonConfig(getClaudeDesktopConfigPath());
    } else if (tool === "cline") {
      updateJsonConfig(getClineConfigPath());
    } else if (tool === "cursor") {
      // Create a global or workspace .cursor/mcp.json snippet
      const cursorPath = path.join(process.cwd(), ".cursor", "mcp.json");
      console.log(`\n💡 Note: Cursor handles MCP per-workspace or via its UI Settings.`);
      console.log(`Generating workspace config for Cursor at ${cursorPath}`);
      updateJsonConfig(cursorPath);
      console.log(`👉 In Cursor: Go to Cursor Settings Menu > Settings > Features > MCP to manage servers visually.`);
    }
  }

  console.log("\n🎉 Setup complete! You can now use Stitch-mcp-server in your selected tools.");
  console.log("Make sure to restart Claude Desktop or reload your Editor for changes to take effect.");
};

