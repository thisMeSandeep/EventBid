import type { EmailTemplate } from "@eventbid/email";

export type { EmailTemplate };

export interface EmailAdapter {
  send(to: string, template: EmailTemplate): Promise<void>;
}
