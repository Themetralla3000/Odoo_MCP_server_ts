import { zodToJsonSchema } from "zod-to-json-schema";
import { TasksService } from "./service.js";
import { SearchTasksSchema } from "./schemas.js";

export const tasksTools = [
  {
    definition: {
      name: "tasks_search",
      description: "Busca tareas en Odoo filtrando por proyecto, asignado, tags, estado o palabra clave.",
     inputSchema: (() => {
        const schema = zodToJsonSchema(SearchTasksSchema) as any;
        delete schema.$schema; //sino el mongo que usa el cliente que he elejido, se queja
        return schema;
      })(),
    },
    handler: async (args: any) => {
      const validatedArgs = SearchTasksSchema.parse(args);
      const results = await TasksService.searchTasks(validatedArgs);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    },
  },
];