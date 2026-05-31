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

export interface NewBriefMatchData {
  venueName?: string;
  eventType?: string;
  city?: string;
  eventDate?: string;
  briefTitle?: string;
}

export function NewBriefMatchEmail({
  venueName = "there",
  eventType = "event",
  city = "your area",
  eventDate = "the requested date",
  briefTitle = "a new event brief",
}: NewBriefMatchData) {
  return (
    <Html>
      <Head />
      <Preview>New EventBid brief match</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>New brief match</Heading>
          <Text style={styles.text}>Hi {venueName},</Text>
          <Text style={styles.text}>
            You matched with {briefTitle} for a {eventType} in {city} on{" "}
            {eventDate}.
          </Text>
          <Text style={styles.text}>
            Review the brief and send a proposal if it is a good fit.
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
