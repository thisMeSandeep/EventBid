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

export interface BriefExpiredData {
  recipientName?: string;
  briefTitle?: string;
}

export function BriefExpiredEmail({
  recipientName = "there",
  briefTitle = "the event brief",
}: BriefExpiredData) {
  return (
    <Html>
      <Head />
      <Preview>An EventBid brief expired</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>Brief expired</Heading>
          <Text style={styles.text}>Hi {recipientName},</Text>
          <Text style={styles.text}>
            {briefTitle} has expired because its deadline passed.
          </Text>
          <Text style={styles.text}>
            No further proposals can be submitted for this brief.
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
