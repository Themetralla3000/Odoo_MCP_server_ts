import { z } from "zod";

export const GetProjectsSchema = z.object({
  stage_name: z.string().optional().describe("Filtrar por etapa del proyecto. Valores válidos: 'TODO' (pendiente), 'DOING' (en curso), 'DONE' (finalizado), 'Pendiente de cierre'. Si se omite, trae proyectos de todas las etapas."),
  limit: z.number().optional().default(20).describe("Número máximo de proyectos a recuperar. Por defecto 20, pero usa 50-100 si buscas proyectos actuales o futuros, ya que los proyectos más antiguos podrían no aparecer con el límite por defecto."),
});