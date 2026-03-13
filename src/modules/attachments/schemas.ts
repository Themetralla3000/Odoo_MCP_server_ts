import { z } from "zod";

export const AttachmentGetSchema = z.object({
  task_id: z.number().describe("The numeric ID of the Odoo task whose attachments to retrieve."),
});

export type AttachmentGetInput = z.infer<typeof AttachmentGetSchema>;
