#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { odooClient } from "./core/odoo-client.js";
import { registerAllTools } from "./all-tools.js";
import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { fileURLToPath } from 'url';

//registre de tools -- igual que en sse
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

export function createHttpServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Emmagatzematge de sessions actives
  const sessions = new Map<string, {
    server: Server;
    transport: StreamableHTTPServerTransport; //en comptes de sse
  }>();

  /*
  Unic endpoint "/mcp" (abans /sse + /messages)

  */
  app.post("/mcp", async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    //cas 1: nova sessió ( Post "/mcp {initialize}")
    if (isInitializeRequest(req.body) && !sessionId) {
      console.log("New MCP session request");

      const server = createOdooServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          console.log(`Session initialized: ${id}`);
          sessions.set(id, { server, transport });
        },
      });
      //tancar sessió
      res.on('close', () => {
        const sid = transport.sessionId;
        if (sid) {
          console.log(`Connexion closed for session: ${sid}`);
        }
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    }

    //cas 2: sessió existent 
    if (sessionId) {
      const session = sessions.get(sessionId);

      if (!session) {
        res.status(404).json({
          jsonrpc: '2.0',
          error: { code: -32001, message: 'Session not found' },
          id: req.body?.id || null,
        });
        return;
      }

      await session.transport.handleRequest(req, res, req.body);
      return;
    }

    //cas 3: sense session id i no es {initialize}
    res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32002, message: 'Mcp-Session-Id required' },
      id: req.body?.id || null,
    });
  });

  //GET /mcp -> canal sse per notificacions
  app.get("/mcp", async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string;

    if (!sessionId) {
      res.status(400).json({ error: 'Mcp-Session-Id required' });
      return;
    }

    const session = sessions.get(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    console.log(`SSE channel open for session: ${sessionId}`);
    await session.transport.handleRequest(req, res);
  });

  //DELETE /mcp -> tancar sessió
  app.delete("/mcp", async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string;

    if (!sessionId) {
      res.status(400).json({ error: 'Mcp-Session-Id required' });
      return;
    }

    const session = sessions.get(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    console.log(`clossing session: ${sessionId}`);
    await session.server.close();
    sessions.delete(sessionId);
    res.status(200).end();
  });

  //no es part del standard mcp pero per fer proves va be
  app.get("/health", (req, res) => {
    res.json({
      status: 'ok',
      activeSessions: sessions.size,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}

async function startServer() {
  try {
    console.log("Connecting to Odoo...");
    await odooClient.connect();
    console.log("Connexion to Odoo stablished");

    const app = createHttpServer();
    const PORT = process.env.PORT || 3000;

    const httpServer = app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running in Streamable HTTP mode on port ${PORT}`);
      console.log(`Endpoints:`);
      console.log(`  POST   /mcp    - JSON-RPC messages`);
      console.log(`  GET    /mcp    - SSE channel`);
      console.log(`  DELETE /mcp    - Close session`);
      console.log(`  GET    /health - Health check`);
    });

    httpServer.on('error', (e: any) => {
      if (e.code === 'EADDRINUSE') {
        console.error(`ERROR: El puerto ${PORT} esta ocupado.`);
      } else if (e.code === 'EACCES') {
        console.error(`ERROR: No tienes permiso para usar el puerto ${PORT}.`);
      } else {
        console.error('Error en el servidor HTTP:', e);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error("Fatal error en startServer:", error);
    process.exit(1);
  }
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  startServer();
}