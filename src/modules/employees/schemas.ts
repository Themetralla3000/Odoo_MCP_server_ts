import { z } from "zod";

export const SearchEmployeesSchema = z.object({
  query: z.string().optional().describe("Texto para buscar por nombre. Si se omite, lista todos los empleados activos."),
  department: z.string().optional().describe("Filtrar por nombre de departamento (ej: 'Producción', 'IT')"),
  user_ids: z.array(z.number()).optional().describe("Filtrar por IDs de usuario de Odoo (res.users). Útil para obtener los empleados asignados a una tarea, ya que project.task.user_ids devuelve IDs de res.users."),
  limit: z.number().optional().default(20).describe("Límite de resultados (default 20)"),
});

export const GetEmployeesDetailsSchema = z.object({
  ids: z.array(z.number()).describe("Lista de IDs numéricos de empleados (ej: [12, 35])"),
});

export type SearchEmployeesInput = z.infer<typeof SearchEmployeesSchema>;
export type GetEmployeesDetailsInput = z.infer<typeof GetEmployeesDetailsSchema>;
