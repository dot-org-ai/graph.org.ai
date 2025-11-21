import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { MdxDbFs } from "./fs/index.js";

export class MdxDbMcpServer {
  private server: Server;
  private db: MdxDbFs;

  constructor(rootDir: string) {
    this.db = new MdxDbFs(rootDir);
    this.server = new Server(
      {
        name: "mdxdb",
        version: "0.0.1",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
  }

  private setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "list_files",
            description: "List MDX files matching a glob pattern",
            inputSchema: {
              type: "object",
              properties: {
                collection: { type: "string", description: "Collection name (directory)" },
                pattern: { type: "string", description: "Glob pattern (default: **/*.{md,mdx})" },
              },
              required: ["collection"],
            },
          },
          {
            name: "read_file",
            description: "Read an MDX file by ID",
            inputSchema: {
              type: "object",
              properties: {
                collection: { type: "string", description: "Collection name" },
                id: { type: "string", description: "Document ID (filename without extension)" },
              },
              required: ["collection", "id"],
            },
          },
          {
            name: "create_file",
            description: "Create a new MDX file",
            inputSchema: {
              type: "object",
              properties: {
                collection: { type: "string" },
                data: { type: "object", description: "JSON-LD data object. Must include id/code." },
              },
              required: ["collection", "data"],
            },
          },
          {
            name: "update_file",
            description: "Update an existing MDX file",
            inputSchema: {
              type: "object",
              properties: {
                collection: { type: "string" },
                id: { type: "string" },
                data: { type: "object", description: "Partial JSON-LD data to merge" },
              },
              required: ["collection", "id", "data"],
            },
          },
          {
            name: "search_files",
            description: "Search files using a MongoDB-style query",
            inputSchema: {
              type: "object",
              properties: {
                collection: { type: "string" },
                query: { type: "object", description: "Sift query object" },
              },
              required: ["collection", "query"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      if (!args) throw new Error("Missing arguments");

      try {
        switch (name) {
          case "list_files": {
            const collection = this.db.collection(args.collection as string);
            const files = await collection.list(args.pattern as string);
            return { content: [{ type: "text", text: JSON.stringify(files, null, 2) }] };
          }
          case "read_file": {
            const collection = this.db.collection(args.collection as string);
            const doc = await collection.get(args.id as string);
            if (!doc) return { content: [{ type: "text", text: "File not found" }], isError: true };
            return { content: [{ type: "text", text: JSON.stringify(doc, null, 2) }] };
          }
          case "create_file": {
            const collection = this.db.collection(args.collection as string);
            const doc = await collection.create(args.data as any);
            return { content: [{ type: "text", text: JSON.stringify(doc, null, 2) }] };
          }
          case "update_file": {
            const collection = this.db.collection(args.collection as string);
            const doc = await collection.update(args.id as string, args.data as any);
            return { content: [{ type: "text", text: JSON.stringify(doc, null, 2) }] };
          }
          case "search_files": {
            const collection = this.db.collection(args.collection as string);
            const docs = await collection.search(args.query as any);
            return { content: [{ type: "text", text: JSON.stringify(docs, null, 2) }] };
          }
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("MdxDb MCP Server running on stdio");
  }
}
