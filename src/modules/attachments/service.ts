import fs from "fs";
import os from "os";
import path from "path";
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

      return records.map((record: any) => {
        const { datas, ...metadata } = record;

        if (!datas) {
          return { ...metadata, file_path: null };
        }

        const fileName = `odoo_${record.id}_${record.name}`;
        const filePath = path.join(os.tmpdir(), fileName);
        fs.writeFileSync(filePath, Buffer.from(datas, "base64"));

        return { ...metadata, file_path: filePath };
      });
    } catch (error: any) {
      throw new Error(`Error retrieving attachments for task ${args.task_id}: ${error.message || error}`);
    }
  },
};
