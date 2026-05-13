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

    // Resolució de user_ids → noms d'empleats
    const allUserIds: number[] = [...new Set((tasks as any[]).flatMap((t: any) => t.user_ids as number[]))];
    let employeeByUserId: Record<number, string> = {};
    if (allUserIds.length > 0) {
      const employees = await odooClient.execute(
        'hr.employee',
        'search_read',
        [[['user_id', 'in', allUserIds], ['active', '=', true]]],
        { fields: ['name', 'user_id'], limit: 100 }
      );
      for (const emp of employees as any[]) {
        if (emp.user_id) employeeByUserId[emp.user_id[0]] = emp.name;
      }
    }

    //mapping
    return tasks.map((t: any) => ({
      id: t.id,
      tarea: t.name,
      proyecto: t.project_id ? t.project_id[1] : "Sin Proyecto",
      estado: t.stage_id ? t.stage_id[1] : "Indefinido",
      user_ids: t.user_ids,
      empleados: (t.user_ids as number[]).map((uid: number) => ({
        user_id: uid,
        nombre: employeeByUserId[uid] ?? null,
      })),
      tag_ids: t.tag_ids,
      deadline: t.date_deadline || "Sin fecha"
    }));
  }
};