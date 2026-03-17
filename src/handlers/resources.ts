import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getStitchClient } from "../utils/stitch.js";

export function registerResources(server: McpServer) {
  const { stitch } = getStitchClient();

  // Resource to list all projects
  server.resource(
    "projects",
    "stitch://projects",
    { mimeType: "application/json" },
    async (uri) => {
      try {
        const projects = await stitch.projects();
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(projects.map(p => ({ id: p.id, projectId: p.projectId })), null, 2),
            },
          ],
        };
      } catch (error: any) {
        throw new Error(`Failed to list projects: ${error.message}`);
      }
    }
  );

  // Resource template to fetch screens for a specific project
  server.resource(
    "project_screens",
    new ResourceTemplate("stitch://projects/{projectId}/screens", { list: undefined }),
    async (uri, { projectId }) => {
      try {
        if (typeof projectId !== "string") {
          throw new Error("Invalid projectId");
        }
        
        const project = stitch.project(projectId);
        const screens = await project.screens();
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(screens.map(s => ({ id: s.id, screenId: s.screenId, projectId: s.projectId })), null, 2),
            },
          ],
        };
      } catch (error: any) {
        throw new Error(`Failed to load screens for project ${projectId}: ${error.message}`);
      }
    }
  );
}