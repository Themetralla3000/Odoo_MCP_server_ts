import { zodToJsonSchema } from "zod-to-json-schema";
import { AttachmentsService } from "./service.js";
import { AttachmentGetSchema } from "./schemas.js";

export const attachmentsTools = [
  {
    definition: {
      name: "attachments_get",
      description: "Retrieves the file attachments (PDFs, images, etc.) linked to an Odoo task by its task_id. Returns file metadata and base64-encoded content.",
      inputSchema: (() => {
        const schema = zodToJsonSchema(AttachmentGetSchema) as any;
        delete schema.$schema; // Fix MongoDB
        return schema;
      })(),
    },
    handler: async (args: any) => {
      const validated = AttachmentGetSchema.parse(args);
      const result = await AttachmentsService.getByTask(validated);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },
];
