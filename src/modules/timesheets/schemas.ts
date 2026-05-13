import { z } from "zod";

export const CreateTimesheetSchema = z.object({
  task_id: z.number().describe("El ID numérico de la tarea donde imputar horas."),
  description: z.string().describe("Descripción del trabajo realizado."),
  hours: z.number().describe("Cantidad de horas (en decimal, ej: 1.5 para 1h 30m)."),
  date: z.string().optional().describe("Fecha en formato YYYY-MM-DD. Si se omite, usa hoy."),
  employee_id: z.number().optional().describe("ID del empleado (hr.employee) que realizó el trabajo. Preferible a user_id para empleados sin usuario de Odoo."),
  user_id: z.number().optional().describe("ID del usuario (res.users). Usar employee_id cuando sea posible.")
});

export type CreateTimesheetInput = z.infer<typeof CreateTimesheetSchema>;

export const GetTaskTimesheetsSchema = z.object({
  task_id: z.number().describe("ID numérico de la tarea en Odoo para consultar sus imputaciones"),
});

export type GetTaskTimesheetsInput = z.infer<typeof GetTaskTimesheetsSchema>;

export const DeleteTimesheetInput = z.object({
  timesheet_id: z.number().describe("ID del registro de timesheet a eliminar")
});

export type DeleteTimesheetInput = z.infer<typeof DeleteTimesheetInput>;