import { z } from "zod";

export const SearchTasksSchema = z.object({
  keyword: z.string().optional().describe("Texto a buscar en título o descripción"),
  project: z.string().optional().describe("Nombre del proyecto (ej: 'MWC')"),
  assignee: z.string().optional().describe("Nombre del responsable/asignado"),
  tag: z.string().optional().describe("Etiqueta (ej: 'Bug', 'Urgente')"),
  limit: z.number().optional().default(10).describe("Límite de resultados")
});

export type SearchTasksInput = z.infer<typeof SearchTasksSchema>;