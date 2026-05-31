import { renderTemplate } from "@eventbid/email";
import { Resend } from "resend";
import { env } from "../../lib/env";
import type { EmailAdapter, EmailTemplate } from "./email.adapter.interface";

export class ResendEmailAdapter implements EmailAdapter {
  private readonly client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(to: string, template: EmailTemplate): Promise<void> {
    const { subject, html } = await renderTemplate(template);

    await this.client.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  }
}

export const email = new ResendEmailAdapter(env.RESEND_API_KEY);
