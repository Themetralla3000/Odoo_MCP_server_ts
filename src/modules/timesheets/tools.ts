import { zodToJsonSchema } from "zod-to-json-schema";
import { TimesheetsService } from "./service.js";
import { CreateTimesheetSchema, GetTaskTimesheetsSchema, DeleteTimesheetInput } from "./schemas.js";
//TODO: fix mongodb error on client 
//el hecho de tener que hacer un fix para el cliente no es muy MCPlike de mi parte, pero de momento seguiré con ello
export const timesheetsTools = [
  {
    definition: {
      name: "timesheets_create",
      description: "Registra horas de trabajo (imputación) en una tarea específica.",
      inputSchema: (() => {
        const schema = zodToJsonSchema(CreateTimesheetSchema) as any;
        delete schema.$schema; // Fix MongoDB
        return schema;
      })(),
    },
    handler: async (args: any) => {
      const validated = CreateTimesheetSchema.parse(args);
      const newId = await TimesheetsService.createTimesheet(validated);
      
      return {
        content: [
          { 
            type: "text", 
            text: `Horas registradas correctamente. ID del registro: ${newId}. (Tarea: ${validated.task_id}, Horas: ${validated.hours})` 
          }
        ],
      };
    },
  },
  {
    definition: {
      name: "timesheets_get_by_task",
      description: "Consulta el historial de horas imputadas (timesheets) de una tarea concreta",
      inputSchema: (()=>{
        const schema = zodToJsonSchema(GetTaskTimesheetsSchema) as any;
        delete schema.$schema; //fix mongodb 
        return schema;
      })(),
    },
    handler: async (args:any) =>{
      const validated = GetTaskTimesheetsSchema.parse(args);
      const result = await TimesheetsService.getTimesheetsByTask(validated);
      return {
        content:[{
          type: "text",
          text:  JSON.stringify(result,null,2)
        }
        ]
      }
    }
  },
  {
    definition: {
      name: "timesheets_delete",
      description: "Elimina un registro de horas (timesheet) por su ID.",
      inputSchema: (() => {
        const schema = zodToJsonSchema(DeleteTimesheetInput) as any;
        delete schema.$schema;
        return schema;
      })(),
    },
    handler: async (args: any) => {
      const validated = DeleteTimesheetInput.parse(args);
      const result = await TimesheetsService.deleteTimesheetByTimesheetId(validated);
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