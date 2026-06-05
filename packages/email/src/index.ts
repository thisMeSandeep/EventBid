import { render } from "@react-email/render";
import { createElement } from "react";
import {
  NewBriefMatchEmail,
  type NewBriefMatchData,
} from "./templates/new-brief-match";
import {
  ProposalAcceptedEmail,
  type ProposalAcceptedData,
} from "./templates/proposal-accepted";
import {
  BriefClosedEmail,
  type BriefClosedData,
} from "./templates/brief-closed";
import {
  DeadlineReminderEmail,
  type DeadlineReminderData,
} from "./templates/deadline-reminder";
import {
  BriefExpiredEmail,
  type BriefExpiredData,
} from "./templates/brief-expired";
import { WelcomeEmail, type WelcomeData } from "./templates/welcome";

export type EmailTemplate =
  | { type: "new-brief-match"; data: NewBriefMatchData }
  | { type: "proposal-accepted"; data: ProposalAcceptedData }
  | { type: "brief-closed"; data: BriefClosedData }
  | { type: "deadline-reminder"; data: DeadlineReminderData }
  | { type: "brief-expired"; data: BriefExpiredData }
  | { type: "welcome"; data: WelcomeData };

export interface RenderedEmail {
  subject: string;
  html: string;
}

export async function renderTemplate(
  template: EmailTemplate,
): Promise<RenderedEmail> {
  switch (template.type) {
    case "new-brief-match":
      return {
        subject: "New EventBid brief match",
        html: await render(createElement(NewBriefMatchEmail, template.data)),
      };
    case "proposal-accepted":
      return {
        subject: "Your EventBid proposal was accepted",
        html: await render(createElement(ProposalAcceptedEmail, template.data)),
      };
    case "brief-closed":
      return {
        subject: "An EventBid brief has closed",
        html: await render(createElement(BriefClosedEmail, template.data)),
      };
    case "deadline-reminder":
      return {
        subject: "EventBid deadline reminder",
        html: await render(createElement(DeadlineReminderEmail, template.data)),
      };
    case "brief-expired":
      return {
        subject: "An EventBid brief expired",
        html: await render(createElement(BriefExpiredEmail, template.data)),
      };
    case "welcome":
      return {
        subject: "Welcome to EventBid",
        html: await render(createElement(WelcomeEmail, template.data)),
      };
  }
}

export type {
  BriefClosedData,
  BriefExpiredData,
  DeadlineReminderData,
  NewBriefMatchData,
  ProposalAcceptedData,
  WelcomeData,
};
export { BriefClosedEmail } from "./templates/brief-closed";
export { BriefExpiredEmail } from "./templates/brief-expired";
export { DeadlineReminderEmail } from "./templates/deadline-reminder";
export { NewBriefMatchEmail } from "./templates/new-brief-match";
export { ProposalAcceptedEmail } from "./templates/proposal-accepted";
export { WelcomeEmail } from "./templates/welcome";
