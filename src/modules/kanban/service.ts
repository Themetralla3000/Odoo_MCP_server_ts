import { odooClient } from "../../core/odoo-client.js";
import { 
  UpdateProjectStateInput, 
  GetProjectStateInput, 
  GetProjectsByStateInput 
} from "./schemas.js";

export const ProjectStateService = {
  async getProjectState(args: GetProjectStateInput) {
    try {
      const fields = [
        'name',
        'state',
        'user_id',
        'partner_id',
        'date_start',
        'date'
      ];
      
      const domain = [['id', '=', args.project_id]];
      
      const records = await odooClient.execute(
        'project.project',
        'search_read',
        [domain, fields]
      );

      if (!records || records.length === 0) {
        throw new Error(`No se encontró el proyecto con ID ${args.project_id}`);
      }

      return {
        project_id: records[0].id,
        name: records[0].name,
        state: records[0].state,
        responsible: records[0].user_id,
        client: records[0].partner_id,
        start_date: records[0].date_start,
        end_date: records[0].date
      };
    } catch (error: any) {
      throw new Error(`Error obteniendo estado del proyecto ${args.project_id}: ${error.message || error}`);
    }
  },

  async updateProjectState(args: UpdateProjectStateInput) {
    try {
      await odooClient.execute(
        'project.project',
        'write',
        [[args.project_id], { state: args.state }]
      );

      return {
        success: true,
        message: `Proyecto ${args.project_id} marcado como '${args.state}'`,
        project_id: args.project_id,
        new_state: args.state
      };
    } catch (error: any) {
      throw new Error(`Error actualizando estado del proyecto ${args.project_id}: ${error.message || error}`);
    }
  },


  async getProjectsByState(args: GetProjectsByStateInput) {
    try {
      const domain: any[] = [['state', '=', args.state]];
      
      if (args.user_id) {
        domain.push(['user_id', '=', args.user_id]);
      }

      const fields = [
        'name',
        'state',
        'user_id',
        'partner_id',
        'date_start',
        'date',
        'task_count'
      ];

      const records = await odooClient.execute(
        'project.project',
        'search_read',
        [domain, fields]
      );

      if (!records || records.length === 0) {
        return {
          message: `No se encontraron proyectos con estado '${args.state}'`,
          projects: []
        };
      }

      return {
        count: records.length,
        state: args.state,
        projects: records.map((r: any) => ({
          id: r.id,
          name: r.name,
          state: r.state,
          responsible: r.user_id,
          client: r.partner_id,
          start_date: r.date_start,
          end_date: r.date,
          task_count: r.task_count
        }))
      };
    } catch (error: any) {
      throw new Error(`Error buscando proyectos por estado: ${error.message || error}`);
    }
  }
};