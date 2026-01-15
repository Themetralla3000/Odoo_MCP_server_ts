import { z } from "zod";

export const GetProjectsSchema = z.object({
  stage_name: z.string().optional().describe("Filtrar por nombre de la etapa (ej: 'TODO','DOING','DONE','Backlog'). Si se omite, trae todos."),
  limit: z.number().optional().default(20).describe("Número máximo de proyectos a recuperar"),
});