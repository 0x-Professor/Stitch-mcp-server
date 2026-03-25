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

const getCursorConfigPath = () => {
  return path.join(process.cwd(), ".cursor", "mcp.json");
};

// Helper to safely parse JSON with error recovery
const safeParseJSON = (content: string, configPath: string): { mcpServers: Record<string, unknown> } | null => {
  try {
    const parsed = JSON.parse(content);
    return parsed;
  } catch (err) {
    console.warn(`Warning: ${configPath} contains invalid JSON and will be reset.`);
    return null;
  }
};

// Helper to create backup of existing config
const backupConfig = (configPath: string): string | null => {
  try {
    if (fs.existsSync(configPath)) {
      const backupPath = `${configPath}.backup.${Date.now()}`;
      fs.copyFileSync(configPath, backupPath);
      return backupPath;
    }
  } catch {
    // Ignore backup failures
  }
  return null;
};

export const runSetup = async () => {
  console.log("\nWelcome to the Stitch MCP Server Setup");
  console.log("This utility will automatically configure your favorite tools to use the Stitch MCP Server.\n");

  const claudeInstalled = fs.existsSync(path.dirname(getClaudeDesktopConfigPath()));
  const clineInstalled = fs.existsSync(path.dirname(getClineConfigPath()));
  const cursorInstalled = fs.existsSync(path.join(process.cwd(), ".cursor"));

  const availableTools: string[] = [];
  if (claudeInstalled) availableTools.push("Claude Desktop");
  if (clineInstalled) availableTools.push("Cline AI");
  if (cursorInstalled) availableTools.push("Cursor");

  if (availableTools.length === 0) {
    console.log("No automatically configurable AI apps detected on this system.");
    console.log("We will provide you with the JSON configuration you can manually paste into your MCP settings.\n");
  }

  let apiKey: string;
  try {
    apiKey = await input({
      message: "Please enter your Stitch API Key (STITCH_API_KEY):",
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return "API Key is required. Get one at https://stitch.google.com";
        }
        if (value.trim().length < 10) {
          return "API Key seems too short. Please check and try again.";
        }
        return true;
      },
    });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'name' in err && err.name === 'ExitPromptError') {
      console.log("\nSetup cancelled by user.");
      return;
    }
    throw err;
  }

  apiKey = apiKey.trim();

  const serverCommand = platform === "win32" ? "npx.cmd" : "npx";
  const serverArgs = ["-y", "stitch-mcp-server@latest"];

  const mcpConfigEntry = {
    command: serverCommand,
    args: serverArgs,
    env: {
      STITCH_API_KEY: apiKey
    }
  };

  if (availableTools.length === 0) {
    console.log("\n================ MCP CONFIGURATION ================\n");
    console.log(JSON.stringify({
      mcpServers: {
        "stitch": mcpConfigEntry
      }
    }, null, 2));
    console.log("\n===================================================\n");
    console.log("Please copy the JSON above and paste it into your app's MCP settings.");
    return;
  }

  const tools = [
    {
      name: `Claude Desktop${claudeInstalled ? "" : " (not detected)"}`,
      value: "claude",
      checked: claudeInstalled,
    },
    {
      name: `Cline (VS Code Extension)${clineInstalled ? "" : " (not detected)"}`,
      value: "cline",
      checked: clineInstalled,
    },
    {
      name: "Cursor (Workspace Config)",
      value: "cursor",
      checked: cursorInstalled,
    }
  ];

  let selectedTools: string[];
  try {
    selectedTools = await checkbox({
      message: "Which tools would you like to configure this MCP Server for?",
      choices: tools,
    });
  } catch (err: unknown) {
    // Handle user cancellation (Ctrl+C)
    if (err && typeof err === 'object' && 'name' in err && err.name === 'ExitPromptError') {
      console.log("\nSetup cancelled by user.");
      return;
    }
    throw err;
  }

  if (selectedTools.length === 0) {
    console.log("\nNo tools selected. Here is your raw configuration:\n");
    console.log(JSON.stringify({
      mcpServers: {
        "stitch": mcpConfigEntry
      }
    }, null, 2));
    return;
  }

  console.log("\nConfiguring selected tools...\n");

  const updateJsonConfig = (configPath: string, keyName: string = "stitch", serverDef = mcpConfigEntry): boolean => {
    let config: { mcpServers: Record<string, unknown> } = { mcpServers: {} };
    
    try {
      // Create directory if it doesn't exist
      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
        console.log(`Created directory: ${configDir}`);
      }

      // Read existing config if it exists
      if (fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, "utf-8");
        const parsed = safeParseJSON(fileContent, configPath);
        
        if (parsed === null) {
          // Invalid JSON - backup and start fresh
          const backupPath = backupConfig(configPath);
          if (backupPath) {
            console.log(`Backed up corrupted config to: ${backupPath}`);
          }
          config = { mcpServers: {} };
        } else {
          config = parsed;
          if (!config.mcpServers || typeof config.mcpServers !== 'object') {
            config.mcpServers = {};
          }
        }
      }
      
      // Add/update the stitch server config
      config.mcpServers[keyName] = serverDef;
      
      // Write config with proper formatting
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", { mode: 0o600 });
      console.log(`Successfully updated: ${configPath}`);
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Failed to update ${configPath}: ${errorMessage}`);
      return false;
    }
  };

  let successCount = 0;
  let failCount = 0;

  for (const tool of selectedTools) {
    if (tool === "claude") {
      const success = updateJsonConfig(getClaudeDesktopConfigPath());
      success ? successCount++ : failCount++;
    } else if (tool === "cline") {
      const success = updateJsonConfig(getClineConfigPath());
      success ? successCount++ : failCount++;
    } else if (tool === "cursor") {
      const cursorPath = getCursorConfigPath();
      console.log(`\nNote: Cursor handles MCP per-workspace or via its UI Settings.`);
      console.log(`Generating workspace config for Cursor at ${cursorPath}`);
      const success = updateJsonConfig(cursorPath);
      success ? successCount++ : failCount++;
      if (success) {
        console.log(`In Cursor: Go to Cursor Settings Menu > Settings > Features > MCP to manage servers visually.`);
      }
    }
  }

  console.log("\n" + "-".repeat(60));
  
  if (failCount === 0) {
    console.log("Setup complete. All configurations updated successfully.");
  } else if (successCount > 0) {
    console.log(`Setup partially complete. ${successCount} succeeded, ${failCount} failed.`);
  } else {
    console.log("Setup failed. Please check the errors above and try again.");
    process.exitCode = 1;
    return;
  }
  
  console.log("\nNext steps:");
  console.log("   1. Restart Claude Desktop or reload your Editor");
  console.log("   2. Look for 'stitch' in your MCP tools list");
  console.log("   3. Try asking your AI assistant to 'create a Stitch project'");
  console.log("\nDocumentation: https://github.com/0x-Professor/Stitch-mcp-server");
};
