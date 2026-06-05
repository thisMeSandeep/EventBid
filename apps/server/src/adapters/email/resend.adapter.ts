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

    const { error } = await this.client.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    // The Resend SDK does not throw on API rejection — it returns the error in
    // the response. Throw so the job fails, retries, and is visible in logs.
    if (error) {
      throw new Error(`Resend failed to send email: ${error.message}`);
    }
  }
}

export const email = new ResendEmailAdapter(env.RESEND_API_KEY);
