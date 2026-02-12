import { z } from "zod";

export const UpdateProjectStateInput = z.object({
  project_id: z.number().describe("ID del proyecto"),
  state: z.enum(['a_tiempo', 'en_riesgo', 'atrasado', 'en_espera', 'hecho'])
    .describe("Estado del proyecto: a_tiempo (verde), en_riesgo (amarillo), atrasado (rojo), en_espera (azul), hecho (morado)")
});

export const GetProjectStateInput = z.object({
  project_id: z.number().describe("ID del proyecto")
});

export const GetProjectsByStateInput = z.object({
  state: z.enum(['a_tiempo', 'en_riesgo', 'atrasado', 'en_espera', 'hecho'])
    .describe("Estado del proyecto a filtrar"),
  user_id: z.number().optional()
    .describe("Filtrar por responsable del proyecto")
});

export type UpdateProjectStateInput = z.infer<typeof UpdateProjectStateInput>;
export type GetProjectStateInput = z.infer<typeof GetProjectStateInput>;
export type GetProjectsByStateInput = z.infer<typeof GetProjectsByStateInput>;