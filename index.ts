import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// 1. Definimos el Servidor "Core" con capacidades explícitas
const server = new Server(
  {
    name: "odoo-mcp-js",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, // ¡CRUCIAL! Esto le dice a Claude que aguantaremos la conexión para herramientas
    },
  }
);

// 2. Handler para LISTAR las herramientas
// Claude llama a esto primero para saber qué puede hacer
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_weather_arenys_de_munt",
        description: "Get the weather in Arenys de Munt",
        inputSchema: {
          type: "object",
          properties: {}, // Sin argumentos
        },
      },
    ],
  };
});

// 3. Handler para EJECUTAR las herramientas
// Claude llama a esto cuando el usuario pide el clima
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_weather_arenys_de_munt") {
    return {
      content: [
        {
          type: "text",
          text: "It is sunny, 25°C in Arenys de Munt",
        },
      ],
    };
  }

  throw new Error(`Tool not found: ${name}`);
});

// 4. Iniciar el servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Odoo MCP Server running on stdio...");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});