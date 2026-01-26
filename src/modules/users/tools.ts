import { zodToJsonSchema } from "zod-to-json-schema";
import { UsersService } from "./service.js";
import { SearchUsersSchema, GetUsersDetailsSchema } from "./schemas.js";

export const usersTools = [
  {
    definition: {
      name: "users_search",
      description: "Busca usuarios en Odoo por nombre/email o lista todos si no se especifica filtro.",
      inputSchema: (() => {
        const schema = zodToJsonSchema(SearchUsersSchema) as any;
        delete schema.$schema; // Fix MongoDB
        return schema;
      })(),
    },
    handler: async (args: any) => {
      const validatedArgs = SearchUsersSchema.parse(args);
      const results = await UsersService.searchUsers(validatedArgs);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    },
  },

  {
    definition: {
      name: "users_get_details",
      description: "Obtiene los detalles (Nombre, Email) de una lista específica de IDs. Úsalo cuando otra herramienta te devuelva IDs numéricos (ej: [35]).",
      inputSchema: (() => {
        const schema = zodToJsonSchema(GetUsersDetailsSchema) as any;
        delete schema.$schema; // Fix MongoDB
        return schema;
      })(),
    },
    handler: async (args: any) => {
      const { ids } = GetUsersDetailsSchema.parse(args);
      const results = await UsersService.getUsersDetails(ids);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    },
  },
];