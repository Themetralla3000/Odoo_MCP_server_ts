import { zodToJsonSchema } from "zod-to-json-schema";
import { EmployeesService } from "./service.js";
import { SearchEmployeesSchema, GetEmployeesDetailsSchema } from "./schemas.js";

export const employeesTools = [
  {
    definition: {
      name: "employees_search",
      description: "Busca empleados (hr.employee) en Odoo por nombre o departamento. Úsalo para obtener el ID de empleado necesario al imputar horas.",
      inputSchema: (() => {
        const schema = zodToJsonSchema(SearchEmployeesSchema) as any;
        delete schema.$schema;
        return schema;
      })(),
    },
    handler: async (args: any) => {
      const validated = SearchEmployeesSchema.parse(args);
      const results = await EmployeesService.searchEmployees(validated);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    },
  },

  {
    definition: {
      name: "employees_get_details",
      description: "Obtiene los detalles de una lista de empleados por sus IDs. Incluye si tienen usuario de Odoo asociado (campo user_id).",
      inputSchema: (() => {
        const schema = zodToJsonSchema(GetEmployeesDetailsSchema) as any;
        delete schema.$schema;
        return schema;
      })(),
    },
    handler: async (args: any) => {
      const { ids } = GetEmployeesDetailsSchema.parse(args);
      const results = await EmployeesService.getEmployeesDetails(ids);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    },
  },
];
