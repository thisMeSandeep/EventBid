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

export interface DeadlineReminderData {
  recipientName?: string;
  briefTitle?: string;
  deadline?: string;
}

export function DeadlineReminderEmail({
  recipientName = "there",
  briefTitle = "your event brief",
  deadline = "soon",
}: DeadlineReminderData) {
  return (
    <Html>
      <Head />
      <Preview>EventBid deadline reminder</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>Deadline reminder</Heading>
          <Text style={styles.text}>Hi {recipientName},</Text>
          <Text style={styles.text}>
            The deadline for {briefTitle} is {deadline}.
          </Text>
          <Text style={styles.text}>
            Review pending proposals before the brief closes.
          </Text>
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
};
