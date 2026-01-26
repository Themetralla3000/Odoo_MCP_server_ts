import { zodToJsonSchema } from "zod-to-json-schema"; 
import { ProjectsService } from "./service.js";
import { GetProjectsSchema } from "./schemas.js";

export const projectsTools = [
  {
    definition: {
      name: "projects_get_list",
      description: "Obtener lista de proyectos de Odoo con sus fechas (Montaje, Evento). Permite filtrar por etapa.",
      //Sino le llega basura al cliente
     inputSchema: (() => {
        const schema = zodToJsonSchema(GetProjectsSchema) as any;
        // BORRAMOS EL CAMPO PROHIBIDO PARA MONGODB
        delete schema.$schema; 
        return schema;
      })(),
    },
    handler: async (args: any) => {
      const { stage_name, limit } = GetProjectsSchema.parse(args);
      
      const projects = await ProjectsService.getProjects(stage_name, limit);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(projects, null, 2),
          },
        ],
      };
    },
  },
];