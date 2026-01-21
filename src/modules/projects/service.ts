import { odooClient } from "../../core/odoo-client.js";

export class ProjectsService {
  //funcion para mapear el stage name a stage id
  private static resolveStageId(stageName: string): number | null{

    const cleanName = stageName.toLowerCase().replace(/\s+/g,"");

    const map: Record<string,number> = {
      // ID 5: Todo
      "todo": 5,
      "togo": 5, // typo común

      // ID 6: Doing
      "doing": 6,
      "haciendo": 6,
      "proceso": 6,

      // ID 7: Done
      "done": 7,
      "hecho": 7,
      "acabado": 7,

      // ID 8: Pendiente de cierre
      "pendientedecierre": 8,
      "pendiente": 8, // Alias corto
      "cierre": 8     // Alias corto
    };
      return map[cleanName] || null;
  }


  static async getProjects(stageName?: string, limit: number = 20) {
    console.log(`Buscando proyectos. Etapa: ${stageName || "Cualquiera"}`);

   
    const domain: any[] = [];
    
    if (stageName) {
      const stageId = this.resolveStageId(stageName);
      if(stageId){
        domain.push(["stage_id","=",stageId]);
      }
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