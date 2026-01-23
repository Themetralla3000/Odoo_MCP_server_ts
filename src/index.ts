#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { odooClient } from "./core/odoo-client.js";
import { registerAllTools } from "./all-tools.js";
import express from "express";
import cors from "cors";
//para los tests
import { fileURLToPath } from 'url';

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
//exportada para los test
export function createHttpServer() {
  const app = express();
  app.use(cors());

  const transports = new Map<string, SSEServerTransport>();

  app.get("/sse", async (req, res) => {
    console.log("New sse conexion");
    const server = createOdooServer();
    const transport = new SSEServerTransport("/mcp/messages", res);
    
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
  try {
    console.log("Iniciando conexión con Odoo...");
    await odooClient.connect();
    console.log("Conexión con Odoo establecida.");

    const app = createHttpServer();
    const PORT = process.env.PORT || 3000;
    
    console.log(`Levantando servidor en el puerto: ${PORT}...`);

    // Guardamos la instancia del servidor
    const httpServer = app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running in SSE mode on port ${PORT}`);
    });

    // IMPORTANTE: Escuchar errores de arranque (puerto ocupado, permisos, etc)
    httpServer.on('error', (e: any) => {
        if (e.code === 'EADDRINUSE') {
            console.error(`ERROR: El puerto ${PORT} esta ocupado por otro proceso.`);
        } else if (e.code === 'EACCES') {
            console.error(`ERROR: no tienes permiso para usar el puerto ${PORT}.`);
        } else {
            console.error('error en el servidor HTTP:', e);
        }
        process.exit(1);
    });

  } catch (error) {
    console.error("fatal error en startServer:", error);
    process.exit(1);
  }
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
    startServer();
}