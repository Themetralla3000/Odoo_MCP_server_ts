import { odooClient } from "../../core/odoo-client.js";
import { CreateTimesheetInput, DeleteTimesheetInput, GetTaskTimesheetsInput } from "./schemas.js";

export const TimesheetsService = {
  //escribir una linea de reporte de horas en una tarea
  async createTimesheet(args: CreateTimesheetInput) {
    
    const payload: any = {
      task_id: args.task_id,
      name: args.description,
      unit_amount: args.hours,
    };

    //si hay fecha la ponemos (default odoo pone la de hoy)
    if (args.date) {
      payload.date = args.date;
    }
    
    //no he comprobado que pasa si no le paso user
    if (args.user_id) {
        payload.user_id = args.user_id;
    }

    try {
      // account.analytics es el modelo para las imputaciones de horas
      const newId = await odooClient.execute(
        'account.analytic.line', 
        'create', 
        [payload]
      );

      return newId;
    } catch (error: any) {
      throw new Error(`No se pudo imputar horas: ${error.message || error}`);
    }
  },
  //buscar el timesheet concreto de una task
  async getTimesheetsByTask(args: GetTaskTimesheetsInput ){
    try {
      //campos a buscar
      const fields = [
        'date',        
        'user_id',      
        'name',         
        'unit_amount'   
      ];
      //dominio: que coincida el task id
      const domain = [['task_id', '=', args.task_id]];
      //ejecutar consulta
      const records = await odooClient.execute(
        'account.analytic.line',
        'search_read',           
        [domain, fields]         
      );

      //case no encontrado
      if (!records || records.length === 0) {
        return `No se encontraron horas imputadas para la tarea ID ${args.task_id}.`;
      }

      return records;

    } catch (error: any) {
      throw new Error(`Error consultando timesheets de la tarea ${args.task_id}: ${error.message || error}`);
    
  }
},

async deleteTimesheetByTimesheetId(args: DeleteTimesheetInput) {
  try {
    const exists = await odooClient.execute(
      'account.analytic.line',
      'search',
      [[['id', '=', args.timesheet_id]]]
    );

    if (!exists || exists.length === 0) {
      throw new Error(`No se encontró el timesheet con ID ${args.timesheet_id}`);
    }

    const result = await odooClient.execute(
      'account.analytic.line',
      'unlink',
      [args.timesheet_id]
    );

    return {
      success: true,
      message: `Timesheet ${args.timesheet_id} eliminado correctamente`,
      deleted_id: args.timesheet_id
    };
  } catch (error: any) {
    throw new Error(`Error al eliminar timesheet ${args.timesheet_id}: ${error.message || error}`);
  }
}
}