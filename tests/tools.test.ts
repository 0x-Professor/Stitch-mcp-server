import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { registerTools } from '../src/handlers/tools.js';
import { registerResources } from '../src/handlers/resources.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';

dotenv.config();

describe('Stitch MCP Server Integration Tests', () => {
  let mcpServer: McpServer;
  let client: Client;
  let clientTransport: InMemoryTransport;
  let serverTransport: InMemoryTransport;

  beforeAll(async () => {
    if (!process.env.STITCH_API_KEY) {
      throw new Error("STITCH_API_KEY is not defined in environment.");
    }

    mcpServer = new McpServer({
      name: "Test-Stitch-MCP",
      version: "1.0.0"
    });

    registerTools(mcpServer);
    registerResources(mcpServer);

    // Create linked transports
    const [t1, t2] = InMemoryTransport.createLinkedPair();
    clientTransport = t1;
    serverTransport = t2;

    await mcpServer.connect(serverTransport);

    client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await clientTransport.close();
    await serverTransport.close();
  });

  it('should list projects without error', async () => {
    const listResult = await client.listTools();
    expect(listResult.tools.some(t => t.name === 'list_projects')).toBe(true);

    const result = await client.callTool({
      name: 'list_projects',
      arguments: {}
    });

    expect(result.isError).toBeFalsy();
    // @ts-ignore
    expect(result.content[0].type).toBe('text');
    // @ts-ignore
    expect(result.content[0].text).toContain('Projects:');
  });

  it('should create a project', async () => {
    const result = await client.callTool({
      name: 'create_project',
      arguments: { title: 'Test Project via Vitest' }
    });
    
    expect(result.isError).toBeFalsy();
    // @ts-ignore
    expect(result.content[0].text).toContain('Project created successfully!');
  });
  
  it('should generate a screen and fetch code (generate_and_fetch_code tool)', async () => {
    const listResult = await client.callTool({
      name: 'list_projects',
      arguments: {}
    });
    // @ts-ignore
    const projectsText = listResult.content[0].text as string;
    
    const match = projectsText.match(/- (\d+)/);
    if (match && match[1]) {
      const projectId = match[1];

      const result = await client.request(
        { method: "tools/call", params: { name: 'generate_and_fetch_code', arguments: { projectId: projectId, prompt: "A simple red button centered on the screen", deviceType: "DESKTOP" } } },
        CallToolResultSchema,
        { timeout: 180000 }
      );

      expect(result.isError).toBeFalsy();
      // @ts-ignore
      expect(result.content.length).toBeGreaterThan(1);
      // @ts-ignore
      const text0 = result.content[0].text || "";
      // @ts-ignore
      const text1 = result.content[1].text || "";
      
      expect(text0).toContain('Screen generated!');
      expect(text1).toContain('```html');
      expect(text1).toContain('</html>');
    }
  }, 180000); 

  it('should scaffold project files successfully', async () => {
    const listResult = await client.callTool({
      name: 'list_projects',
      arguments: {}
    });
    // @ts-ignore
    const projectIdMatch = (listResult.content[0].text as string).match(/- (\d+)/);
    
    if (projectIdMatch && projectIdMatch[1]) {
      const projectId = projectIdMatch[1];
      
      const genResult = await client.request(
        { method: "tools/call", params: { name: 'generate_screen', arguments: { projectId: projectId, prompt: "A test heading for scaffolding", deviceType: "MOBILE" } } },
        CallToolResultSchema,
        { timeout: 120000 }
      );

      // @ts-ignore
      const screenIdMatch = (genResult.content[0].text as string).match(/Screen ID: ([a-zA-Z0-9]+)/);
      if (screenIdMatch && screenIdMatch[1]) {
        const screenId = screenIdMatch[1];
        
        const filePath = 'tests/fixtures/test-scaffold.html';
        
        const scaffoldResult = await client.request(
          { method: "tools/call", params: { name: 'scaffold_project_files', arguments: { projectId: projectId, screenId: screenId, filePath: filePath } } },
          CallToolResultSchema,
          { timeout: 120000 }
        );

        expect(scaffoldResult.isError).toBeFalsy();
        
        const resolvedPath = path.resolve(process.cwd(), filePath);
        const fileStat = await fs.stat(resolvedPath);
        expect(fileStat.isFile()).toBe(true);
        
        const content = await fs.readFile(resolvedPath, 'utf8');
        expect(content).toContain('<!DOCTYPE html');
      }
    }
  }, 120000);
});