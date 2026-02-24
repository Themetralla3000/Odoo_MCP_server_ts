import { zodToJsonSchema } from "zod-to-json-schema";
import { ProjectStateService } from "./service.js";
import { 
  GetProjectStateInput,
  UpdateProjectStateInput,
  GetProjectsByStateInput
} from "./schemas.js";

export const projectStateTools = [
  {
    definition: {
      name: "project_get_state",
      description: "Obtiene el estado actual de un proyecto (a_tiempo, en_riesgo, atrasado, en_espera, hecho)",
      inputSchema: (() => {
        const schema = zodToJsonSchema(GetProjectStateInput) as any;
        delete schema.$schema;
        return schema;
      })(),
    },
    handler: async (args: any) => {
      const validatedArgs = GetProjectStateInput.parse(args);
      const result = await ProjectStateService.getProjectState(validatedArgs);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },
  {
    definition: {
      name: "project_update_state",
      description: "Actualiza el estado de un proyecto. Estados disponibles: a_tiempo (verde), en_riesgo (amarillo), atrasado (rojo), en_espera (azul), hecho (morado)",
      inputSchema: (() => {
        const schema = zodToJsonSchema(UpdateProjectStateInput) as any;
        delete schema.$schema;
        return schema;
      })(),
    },
    handler: async (args: any) => {
      const validatedArgs = UpdateProjectStateInput.parse(args);
      const result = await ProjectStateService.updateProjectState(validatedArgs);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },
  {
    definition: {
      name: "projects_search_by_state",
      description: "Busca todos los proyectos que tienen un estado específico. Opcionalmente puede filtrar por responsable del proyecto",
      inputSchema: (() => {
        const schema = zodToJsonSchema(GetProjectsByStateInput) as any;
        delete schema.$schema;
        return schema;
      })(),
    },
    handler: async (args: any) => {
      const validatedArgs = GetProjectsByStateInput.parse(args);
      const result = await ProjectStateService.getProjectsByState(validatedArgs);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },
];