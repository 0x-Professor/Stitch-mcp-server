import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getStitchClient } from "../utils/stitch.js";

import fs from 'fs/promises';
import path from 'path';

export function registerTools(server: McpServer) {
  const { stitch, toolClient } = getStitchClient();

  // ----- Core Tools -----

  server.tool(
    "create_project",
    "Create a new Stitch project",
    {
      title: z.string().describe("Title of the new project"),
    },
    async ({ title }) => {
      try {
        const result = await toolClient.callTool("create_project", { title });
        return {
          content: [{ type: "text", text: `Project created successfully!\n\n${JSON.stringify(result, null, 2)}` }],
        };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Error creating project: ${error?.message || String(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "list_projects",
    "List all available Stitch projects",
    {},
    async () => {
      try {
        const projects = await stitch.projects();
        const projectList = projects.map(p => `- ${p.id}`).join('\\n');
        return {
          content: [{ type: "text", text: `Projects:\n${projectList}` }],
        };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Error listing projects: ${error?.message || String(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "generate_screen",
    "Generate a UI screen from a text prompt within a project",
    {
      projectId: z.string().describe("The ID of the project to generate the screen in"),
      prompt: z.string().describe("Text prompt describing the desired screen (e.g., 'A login page with email and password fields')"),
      deviceType: z.enum(["MOBILE", "DESKTOP", "TABLET", "AGNOSTIC"]).optional().describe("Target device type"),
    },
    async ({ projectId, prompt, deviceType }) => {
      try {
        const project = stitch.project(projectId);
        const screen = await project.generate(prompt, deviceType);
        
        return {
          content: [
            { 
              type: "text", 
              text: `Screen generated successfully!\nScreen ID: ${screen.id}\nProject ID: ${screen.projectId}\nUse get_screen_code tool to retrieve the HTML.` 
            }
          ],
        };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Error generating screen: ${error?.message || String(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "edit_screen",
    "Edit an existing screen using a text prompt",
    {
      projectId: z.string().describe("The ID of the project containing the screen"),
      screenId: z.string().describe("The ID of the screen to edit"),
      prompt: z.string().describe("Text prompt describing the changes (e.g., 'Make the background dark and add a sidebar')"),
      deviceType: z.enum(["MOBILE", "DESKTOP", "TABLET", "AGNOSTIC"]).optional().describe("Target device type"),
      modelId: z.enum(["GEMINI_3_PRO", "GEMINI_3_FLASH"]).optional().describe("Generative model to use"),
    },
    async ({ projectId, screenId, prompt, deviceType, modelId }) => {
      try {
        const project = stitch.project(projectId);
        const screen = await project.getScreen(screenId);
        const editedScreen = await screen.edit(prompt, deviceType, modelId);
        
        return {
          content: [{ type: "text", text: `Screen edited successfully!\nNew Screen ID: ${editedScreen.id}\nOriginal Screen ID: ${screen.id}\nUse get_screen_code to retrieve the updated HTML.` }],
        };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Error editing screen: ${error?.message || String(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "generate_variants",
    "Generate design variants of an existing screen",
    {
      projectId: z.string().describe("The ID of the project containing the screen"),
      screenId: z.string().describe("The ID of the screen to generate variants from"),
      prompt: z.string().describe("Prompt guiding the variants (e.g., 'Try different color schemes')"),
      variantCount: z.number().min(1).max(5).default(3).describe("Number of variants to generate (1-5)"),
      creativeRange: z.enum(["REFINE", "EXPLORE", "REIMAGINE"]).default("EXPLORE").describe("How different the variants should be"),
      aspects: z.array(z.enum(["COLOR_SCHEME", "LAYOUT", "IMAGES", "TEXT_FONT", "TEXT_CONTENT"])).optional().describe("Aspects of the design to vary"),
    },
    async ({ projectId, screenId, prompt, variantCount, creativeRange, aspects }) => {
      try {
        const project = stitch.project(projectId);
        const screen = await project.getScreen(screenId);
        
        const variants = await screen.variants(prompt, { variantCount, creativeRange, aspects });
        const variantList = variants.map((v, i) => `Variant ${i + 1} ID: ${v.id}`).join('\\n');

        return {
          content: [{ type: "text", text: `Variants generated successfully:\n${variantList}` }],
        };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Error generating variants: ${error?.message || String(error)}` }], isError: true };
      }
    }
  );

  // ----- Advanced Macro Tools -----

  server.tool(
    "get_screen_code",
    "Retrieve the HTML code download URL (and extract full HTML if possible) for a generated screen",
    {
      projectId: z.string().describe("The ID of the project"),
      screenId: z.string().describe("The ID of the screen"),
    },
    async ({ projectId, screenId }) => {
      try {
        const project = stitch.project(projectId);
        const screen = await project.getScreen(screenId);
        const htmlUrl = await screen.getHtml();
        
        // Fetch the actual HTML content
        const response = await fetch(htmlUrl);
        if (!response.ok) {
           return { content: [{ type: "text", text: `Failed to fetch HTML content from URL: ${htmlUrl}` }], isError: true };
        }
        const htmlContent = await response.text();

        return {
          content: [
            { type: "text", text: `Code fetched successfully from URL: ${htmlUrl}` },
            { type: "text", text: `\n\n\`\`\`html\n${htmlContent}\n\`\`\`\n` }
          ],
        };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Error retrieving screen code: ${error?.message || String(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "generate_and_fetch_code",
    "One-step tool to generate a UI screen and immediately retrieve its HTML code",
    {
      projectId: z.string().describe("The ID of the project"),
      prompt: z.string().describe("Text prompt describing the desired screen"),
      deviceType: z.enum(["MOBILE", "DESKTOP", "TABLET", "AGNOSTIC"]).optional().describe("Target device type"),
    },
    async ({ projectId, prompt, deviceType }) => {
      try {
        const project = stitch.project(projectId);
        const screen = await project.generate(prompt, deviceType);
        const htmlUrl = await screen.getHtml();
        
        const response = await fetch(htmlUrl);
        const htmlContent = await response.text();

        return {
          content: [
            { type: "text", text: `Screen generated! Screen ID: ${screen.id}` },
            { type: "text", text: `\n\n\`\`\`html\n${htmlContent}\n\`\`\`\n` }
          ],
        };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Error in generate_and_fetch_code: ${error?.message || String(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "scaffold_project_files",
    "Maps a specific screen from a project to a local file path. Use this to save UI designs directly into the user's workspace.",
    {
      projectId: z.string().describe("The ID of the project"),
      screenId: z.string().describe("The ID of the screen"),
      filePath: z.string().describe("Absolute or relative file path to save the HTML (e.g., 'src/components/MyComponent.html')"),
    },
    async ({ projectId, screenId, filePath }) => {
      try {
        const project = stitch.project(projectId);
        const screen = await project.getScreen(screenId);
        const htmlUrl = await screen.getHtml();
        
        const response = await fetch(htmlUrl);
        const htmlContent = await response.text();

        // Save to file system
        const resolvedPath = path.resolve(process.cwd(), filePath);
        await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
        await fs.writeFile(resolvedPath, htmlContent, 'utf-8');

        return {
          content: [
            { type: "text", text: `Successfully wrote screen ${screenId} to file: ${resolvedPath}` }
          ],
        };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Error scaffolding file: ${error?.message || String(error)}` }], isError: true };
      }
    }
  );

}