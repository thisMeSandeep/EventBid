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

export interface BriefClosedData {
  venueName?: string;
  briefTitle?: string;
  eventType?: string;
}

export function BriefClosedEmail({
  venueName = "there",
  briefTitle = "the event brief",
  eventType = "event",
}: BriefClosedData) {
  return (
    <Html>
      <Head />
      <Preview>An EventBid brief has closed</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>Brief closed</Heading>
          <Text style={styles.text}>Hi {venueName},</Text>
          <Text style={styles.text}>
            {briefTitle} for a {eventType} has closed because the host accepted
            another proposal.
          </Text>
          <Text style={styles.text}>
            Thanks for participating. New matching briefs will continue to
            appear as hosts post them.
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
