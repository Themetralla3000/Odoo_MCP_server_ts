import { odooClient } from "../../core/odoo-client.js";
import { AttachmentGetInput } from "./schemas.js";

export const AttachmentsService = {
  async getByTask(args: AttachmentGetInput) {
    try {
      const domain = [
        ['res_model', '=', 'project.task'],
        ['res_id', '=', args.task_id],
      ];
      const fields = ['id', 'name', 'mimetype', 'datas', 'file_size'];

      const records = await odooClient.execute(
        'ir.attachment',
        'search_read',
        [domain, fields]
      );

      if (!records || records.length === 0) {
        return `No attachments found for task ID ${args.task_id}.`;
      }

      return records;
    } catch (error: any) {
      throw new Error(`Error retrieving attachments for task ${args.task_id}: ${error.message || error}`);
    }
  },
};
