#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { odooClient } from "./core/odoo-client.js";
import { registerAllTools } from "./all-tools.js";
import express from "express";
import cors from "cors";


const toolHandlers = new Map<string, Function>();
const toolDefinitions: any[] = [];
registerAllTools(toolHandlers, toolDefinitions);


function createOdooServer() {
  const server = new Server(
    { name: "odoo-mcp-server", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: toolDefinitions };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const handler = toolHandlers.get(request.params.name);
    if (!handler) throw new Error(`Tool '${request.params.name}' not found.`);
    return handler(request.params.arguments);
  });

  return server;
}
//exportada para los tests
export function createHttpServer() {
  const app = express();
  app.use(cors());

  // El mapa de transportes vive dentro de esta instancia de la app
  const transports = new Map<string, SSEServerTransport>();

  app.get("/sse", async (req, res) => {
    console.log("🔌 Nueva conexión SSE entrante...");
    const server = createOdooServer();
    const transport = new SSEServerTransport("/messages", res);
    
    await server.connect(transport);
    transports.set(transport.sessionId, transport);

    req.on("close", () => {
      transports.delete(transport.sessionId);
      server.close();
    });
  });

  app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      res.status(400).send("SessionId required");
      return;
    }
    
    const transport = transports.get(sessionId);
    if (!transport) {
      res.status(404).send("Session not found");
      return;
    }
    await transport.handlePostMessage(req, res);
  });

  return app;
}


async function startServer() {
  
  if (process.env.NODE_ENV === 'test') return;

  try {
    await odooClient.connect();

    const args = process.argv.slice(2);
    const mode = args.includes("--sse") ? "sse" : "stdio";

    if (mode === "sse") {
      // modo sse
      const app = createHttpServer()
      const PORT = process.env.PORT;
      app.listen(PORT, ()=>{
          console.log(`Server running in SSE mode on port ${PORT}`);
      });

      
    } else {
      //modo stdio
      const server = createOdooServer();
      const transport = new StdioServerTransport();
      await server.connect(transport);
    }

  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

startServer();