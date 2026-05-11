import { odooClient } from "../../core/odoo-client.js";
import { SearchEmployeesInput, GetEmployeesDetailsInput } from "./schemas.js";

export const EmployeesService = {
  async searchEmployees(args: SearchEmployeesInput) {
    const domain: any[] = [['active', '=', true]];

    if (args.query) {
      domain.push(['name', 'ilike', args.query]);
    }
    if (args.department) {
      domain.push(['department_id.name', 'ilike', args.department]);
    }
    if (args.user_ids && args.user_ids.length > 0) {
      domain.push(['user_id', 'in', args.user_ids]);
    }

    const employees = await odooClient.execute(
      'hr.employee',
      'search_read',
      [domain],
      {
        fields: ['id', 'name', 'job_title', 'department_id', 'work_email', 'user_id'],
        limit: args.limit,
      }
    );

    return employees;
  },

  async getEmployeesDetails(ids: number[]) {
    if (ids.length === 0) return [];

    const employees = await odooClient.execute(
      'hr.employee',
      'search_read',
      [
        [['id', 'in', ids]],
        ['id', 'name', 'job_title', 'department_id', 'work_email', 'user_id'],
      ]
    );

    return employees;
  },
};
