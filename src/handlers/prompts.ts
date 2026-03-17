import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer) {
  server.prompt(
    "create_web_app",
    {
      description: "Generates instructions for the agent to orchestrate the generation and scaffolding of a web app using Google Stitch.",
      appIdea: z.string().describe("What kind of web app you'd like to build"),
    },
    ({ appIdea }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I want to build a web application using the Google Stitch SDK. Here is my idea: "${appIdea}"

Please act as an expert frontend engineer and perform the following steps:
1. Call \`create_project\` to create a new workspace for this idea.
2. Formulate a detailed visual prompt for a high-quality UI layout based on my idea.
3. Call \`generate_and_fetch_code\` to produce the initial screen UI and fetch its HTML code instantly.
4. Review the generated code visually if possible, or propose edits. Use \`scaffold_project_files\` to save the HTML correctly inside this workspace (e.g. into an \`index.html\` or wrapped into a component file).
5. Let me know when you are done, or if you encounter any errors!`,
            },
          },
        ],
      };
    }
  );
}