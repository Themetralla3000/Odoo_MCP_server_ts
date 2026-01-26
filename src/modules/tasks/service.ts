import { odooClient } from "../../core/odoo-client.js";
import { SearchTasksInput } from "./schemas.js";

export const TasksService = {
  async searchTasks(args: SearchTasksInput) {

    const domain: any[] = [];

    if (args.keyword) {
      domain.push('|', 
        ['name', 'ilike', args.keyword],
        ['description', 'ilike', args.keyword]
      );
    }
    //elementos para la busqueda
    if (args.project) domain.push(['project_id.name', 'ilike', args.project]);
    if (args.assignee) domain.push(['user_ids.name', 'ilike', args.assignee]);
    if (args.tag) domain.push(['tag_ids.name', 'ilike', args.tag]);
    //ejecutar consulta
    const tasks = await odooClient.execute(
      'project.task',
      'search_read',
      [domain],
      { 
        fields: ['id', 'name', 'project_id', 'user_ids', 'stage_id', 'tag_ids', 'date_deadline'], 
        limit: args.limit 
      }
    );

    //mapping
    return tasks.map((t: any) => ({
      id: t.id,
      tarea: t.name,
      proyecto: t.project_id ? t.project_id[1] : "Sin Proyecto",
      estado: t.stage_id ? t.stage_id[1] : "Indefinido",
      user_ids: t.user_ids, 
      tag_ids: t.tag_ids,      
      deadline: t.date_deadline || "Sin fecha"
    }));
  }
};