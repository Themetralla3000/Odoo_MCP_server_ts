import { z } from "zod";

//busqueda a saco
export const SearchUsersSchema = z.object({
  query: z.string().optional().describe("Texto para buscar por nombre o email. Si se omite, lista todos los usuarios."),
  limit: z.number().optional().default(20).describe("Límite de resultados (default 20)")
});

// busqueda por ids, pensado para encadenar con otras calls
export const GetUsersDetailsSchema = z.object({
  ids: z.array(z.number()).describe("Lista de IDs numéricos de usuarios (ej: [35, 42])")
});

export type SearchUsersInput = z.infer<typeof SearchUsersSchema>;
export type GetUsersDetailsInput = z.infer<typeof GetUsersDetailsSchema>;