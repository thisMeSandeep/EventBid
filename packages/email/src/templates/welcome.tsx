/** @jsxImportSource react */
import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export type WelcomeRole = "host" | "venue_rep";

export interface WelcomeData {
  name?: string;
  role?: WelcomeRole;
}

const roleCopy: Record<
  WelcomeRole,
  { label: string; intro: string; steps: string[] }
> = {
  host: {
    label: "Host",
    intro:
      "As a host, EventBid helps you describe your event once and get matching proposals from venues competing for your business.",
    steps: [
      "Create a brief describing your event type, city, dates, and requirements.",
      "Let our AI sharpen your description and flag anything venues might find unclear.",
      "Compare incoming proposals side by side and accept the one that fits best.",
    ],
  },
  venue_rep: {
    label: "Venue representative",
    intro:
      "As a venue representative, EventBid brings relevant event briefs straight to you so you can win more bookings with less outreach.",
    steps: [
      "Complete your venue profile so we can match you with the right briefs.",
      "Get notified the moment a brief matches your space and availability.",
      "Submit a proposal with your pricing and inclusions to compete for the booking.",
    ],
  },
};

export function WelcomeEmail({ name = "there", role = "host" }: WelcomeData) {
  const copy = roleCopy[role] ?? roleCopy.host;

  return (
    <Html>
      <Head />
      <Preview>Welcome to EventBid</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>Welcome to EventBid! 🎉</Heading>
          <Text style={styles.text}>Hi {name},</Text>
          <Text style={styles.text}>
            Thanks for joining EventBid. You're all set up as a{" "}
            <strong>{copy.label}</strong>.
          </Text>
          <Text style={styles.text}>{copy.intro}</Text>
          <Text style={styles.text}>Here's how to get started:</Text>
          {copy.steps.map((step, index) => (
            <Text key={index} style={styles.step}>
              {index + 1}. {step}
            </Text>
          ))}
          <Text style={styles.text}>
            We're thrilled to have you on board — here's to your next great
            event! 🥂
          </Text>
          <Text style={styles.text}>Cheers,</Text>
          <Text style={styles.text}>The EventBid Team</Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f6f7f9",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "32px",
    maxWidth: "560px",
  },
  heading: {
    color: "#111827",
    fontSize: "24px",
    lineHeight: "32px",
  },
  text: {
    color: "#374151",
    fontSize: "16px",
    lineHeight: "24px",
  },
  step: {
    color: "#374151",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "4px 0",
    paddingLeft: "8px",
  },
};
