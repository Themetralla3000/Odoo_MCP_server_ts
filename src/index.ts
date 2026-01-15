#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { odooClient } from "./core/odoo-client.js"; // Importamos tu cliente

//Modulos a usar
import { projectsTools } from "./modules/projects/tools.js";

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

// Función Principal (Main)
async function main() {
  try {
    console.error("🔌 Conectando a Odoo...");
    await odooClient.connect(); // Conexión inicial
    console.error("✅ Odoo Conectado.");

    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error("🚀 Servidor MCP listo y escuchando.");
    
  } catch (error) {
    console.error("❌ Error fatal al iniciar:", error);
    process.exit(1);
  }
}

main();