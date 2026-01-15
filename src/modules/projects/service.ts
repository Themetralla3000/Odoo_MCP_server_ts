import { odooClient } from "../../core/odoo-client.js";

export class ProjectsService {
  
  static async getProjects(stageName?: string, limit: number = 20) {
    console.log(`Buscando proyectos. Etapa: ${stageName || "Cualquiera"}`);

   
    const domain: any[] = [];
    
    if (stageName) {
      //provar si se puede hacer asi en vez de stageId
      domain.push(["stage_id", "ilike", stageName]);
    }

    const fields = [
      "id",
      "name",
      "display_name",
      "partner_id",
      "user_id",
      "stage_id",
      //campos custom
      "x_studio_fecha_evento",
      "x_studio_fecha_evento_final",
      "x_studio_fecha_montaje",
      "x_studio_fecha_montaje_final",
      "x_studio_fecha_desmontaje_1",
      "x_studio_fecha_desmontaje_final"
    ];

    //ejecuta y crea la estructura de la request
    const results = await odooClient.execute(
      "project.project",
      "search_read",
      [domain],
      {
        fields: fields,
        offset: 0,
        limit: limit,
        order: "create_date desc"
      }
    );

    return results;
  }
}