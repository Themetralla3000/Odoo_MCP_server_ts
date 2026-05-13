import { zodToJsonSchema } from "zod-to-json-schema"; 
import { ProjectsService } from "./service.js";
import { GetProjectsSchema } from "./schemas.js";

export const projectsTools = [
  {
    definition: {
      name: "projects_get_list",
      description: "Obtener lista de proyectos de Odoo con sus fechas de montaje y evento. Los resultados se ordenan por fecha de creación descendente (los creados más recientemente primero), NO por fecha de evento. IMPORTANTE: el límite por defecto es 20, lo que puede excluir proyectos con eventos próximos si fueron creados hace tiempo. Si buscas proyectos activos o futuros, aumenta el límite a 50 o más para asegurarte de cubrir todos los proyectos relevantes.",
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