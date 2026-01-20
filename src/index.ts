#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { odooClient } from "./core/odoo-client.js";
import cors from "cors";
import express from "express";

//Modulos a usar
import { projectsTools } from "./modules/projects/tools.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

// Configuración del Servidor MCP
const server = new Server(
  {
    name: "odoo-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Sistema de Registro de Tools
const toolHandlers = new Map<string, Function>();
const toolDefinitions: any[] = [];

function registerModuleTools(tools: any[]) {
  for (const tool of tools) {
    toolDefinitions.push(tool.definition);
    toolHandlers.set(tool.definition.name, tool.handler);
  }
}

//Las tools se registran aquí
registerModuleTools(projectsTools);

// Handlers del Protocolo MCP
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: toolDefinitions,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const handler = toolHandlers.get(request.params.name);
  if (!handler) {
    throw new Error(`Tool '${request.params.name}' not found.`);
  }
  return handler(request.params.arguments);
});


const app = express();
app.use(cors());
const transports = new Map<string, SSEServerTransport>();
app.get("/sse", async (req, res) => {

  const transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);

  transports.set(transport.sessionId, transport);

  console.log("SSE sesion connected:" + transport.sessionId);
  
  req.on("close", () => {
    console.log("SSE sesion closed:" + transport.sessionId);
    transports.delete(transport.sessionId);
    transport.close();
  });
});

app.post("/messages", async (req, res)=>{
  const sessionId = req.query.sessionId as string;

  if(!sessionId){
    res.status(400).send("SessionId not included in req")
    return;
  }

  const transport = transports.get(sessionId);

    //caso directamente al message sin pasar por sse
  if(!transport){
    res.status(404).send("Session not found or inactive")
    return;
  }
  //delegar al transport correcto
  await transport.handlePostMessage(req,res);

});

async function startServer(){
  try{
    await odooClient.connect();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, ()=>{
      console.log(`MCP server runnign in htpp://localhost:${PORT}`)
    });
  } catch(error){
      console.error("fatal error: ",error)
      process.exit(1);
  }
}

export {app};

if (import.meta.url ===`file://${process.argv[1]}`){
  startServer();
}
