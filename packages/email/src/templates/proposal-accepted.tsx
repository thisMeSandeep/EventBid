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

export interface ProposalAcceptedData {
  venueName?: string;
  briefTitle?: string;
  hostName?: string;
  eventDate?: string;
}

export function ProposalAcceptedEmail({
  venueName = "there",
  briefTitle = "the event brief",
  hostName = "the host",
  eventDate = "the event date",
}: ProposalAcceptedData) {
  return (
    <Html>
      <Head />
      <Preview>Your EventBid proposal was accepted</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>Proposal accepted</Heading>
          <Text style={styles.text}>Hi {venueName},</Text>
          <Text style={styles.text}>
            {hostName} accepted your proposal for {briefTitle}. The event is
            scheduled for {eventDate}.
          </Text>
          <Text style={styles.text}>
            The deal is now locked. Follow up with the host to finalize details.
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
