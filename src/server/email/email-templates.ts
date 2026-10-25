import { z } from "zod";
import { ABSTRACT_DECISIONS } from "../../lib/domain.ts";
import { EVENT_CONFIG } from "../../lib/event-config.ts";
import { trimmedText } from "../validation/common.schema.ts";

const accessPathSchema = z
  .string()
  .regex(/^\/access\/[A-Za-z0-9_-]{43}$/, "Invalid access path");

const registrationReceivedPayloadSchema = z.object({
  participantName: trimmedText(1, 200),
  registrationReference: trimmedText(1, 32),
  accessPath: accessPathSchema,
});

const abstractDecisionPayloadSchema = z
  .object({
    participantName: trimmedText(1, 200),
    abstractTitle: trimmedText(1, 300),
    decision: z.enum(ABSTRACT_DECISIONS),
    message: trimmedText(1, 2000).optional(),
    accessPath: accessPathSchema,
  })
  .refine(
    (input) => input.decision === "accepted" || input.message !== undefined,
    { message: "A message is required for revision and rejection emails", path: ["message"] },
  );

const paymentDecisionPayloadSchema = z
  .object({
    participantName: trimmedText(1, 200),
    registrationReference: trimmedText(1, 32),
    decision: z.enum(["verified", "rejected"]),
    message: trimmedText(1, 2000).optional(),
    accessPath: accessPathSchema,
  })
  .refine((input) => input.decision === "verified" || input.message !== undefined, {
    message: "A message is required for payment rejection emails",
    path: ["message"],
  });

const registrationStatusPayloadSchema = z.object({
  participantName: trimmedText(1, 200),
  registrationReference: trimmedText(1, 32),
  status: z.enum(["confirmed", "cancelled"]),
  message: trimmedText(1, 2000).optional(),
  accessPath: accessPathSchema,
});

const contactQueryReceivedPayloadSchema = z.object({
  name: trimmedText(1, 200),
  subject: trimmedText(1, 300),
});

const contactQueryReplyPayloadSchema = z.object({
  name: trimmedText(1, 200),
  subject: trimmedText(1, 300),
  message: trimmedText(1, 4000),
});

type RenderedEmail = {
  readonly subject: string;
  readonly html: string;
  readonly text: string;
};

type EmailTemplateContext = {
  readonly baseUrl: string;
};

type EmailTemplateDefinition = {
  readonly render: (
    payload: unknown,
    context: EmailTemplateContext,
  ) => RenderedEmail;
  readonly redactsPayloadAfterSend: boolean;
};

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);

const escapeMultilineHtml = (value: string): string =>
  escapeHtml(value).replace(/\n/g, "<br />");

const buildAccessUrl = (baseUrl: string, accessPath: string): string =>
  `${baseUrl.replace(/\/+$/, "")}${accessPath}`;

const renderHtmlEmail = (
  heading: string,
  paragraphHtml: readonly string[],
): string => `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2933;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border-radius:8px;padding:24px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#52606d;">${escapeHtml(EVENT_CONFIG.name)}</p>
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">${escapeHtml(heading)}</h1>
        ${paragraphHtml
          .map(
            (paragraph) =>
              `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;">${paragraph}</p>`,
          )
          .join("\n        ")}
      </div>
      <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#7b8794;">${escapeHtml(EVENT_CONFIG.institution)} · ${escapeHtml(EVENT_CONFIG.department)}</p>
    </div>
  </body>
</html>`;

const renderTextEmail = (heading: string, lines: readonly string[]): string =>
  [
    EVENT_CONFIG.name,
    "",
    heading,
    "",
    ...lines.flatMap((line) => [line, ""]),
    `${EVENT_CONFIG.institution} · ${EVENT_CONFIG.department}`,
  ].join("\n");

const renderAccessLinkHtml = (accessUrl: string): string =>
  `<a href="${escapeHtml(accessUrl)}" style="display:inline-block;margin:6px 0 10px;padding:13px 28px;background-color:#245a91;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">View your registration</a><span style="display:block;font-size:12px;color:#7b8794;">Keep this private link to yourself.</span>`;

const renderMessageHtml = (message: string): string =>
  `<strong>Message from the organizers:</strong><br />${escapeMultilineHtml(message)}`;

const registrationReceivedTemplate = (
  payload: unknown,
  context: EmailTemplateContext,
): RenderedEmail => {
  const input = registrationReceivedPayloadSchema.parse(payload);
  const accessUrl = buildAccessUrl(context.baseUrl, input.accessPath);
  const heading = "Registration received";

  return {
    subject: `[${EVENT_CONFIG.name}] Registration received — ${input.registrationReference}`,
    html: renderHtmlEmail(heading, [
      `Hi ${escapeHtml(input.participantName)},`,
      `We received your registration. Your reference is <strong>${escapeHtml(input.registrationReference)}</strong>.`,
      renderAccessLinkHtml(accessUrl),
    ]),
    text: renderTextEmail(heading, [
      `Hi ${input.participantName},`,
      `We received your registration. Your reference is ${input.registrationReference}.`,
      `View your registration: ${accessUrl}`,
      "Keep this private link to yourself.",
    ]),
  };
};

const abstractDecisionTemplate = (
  payload: unknown,
  context: EmailTemplateContext,
): RenderedEmail => {
  const input = abstractDecisionPayloadSchema.parse(payload);
  const accessUrl = buildAccessUrl(context.baseUrl, input.accessPath);

  const decisionContent = {
    revision_requested: {
      heading: "Revision requested for your abstract",
      summary: `The organizers reviewed your abstract "${input.abstractTitle}" and requested changes.`,
    },
    accepted: {
      heading: "Your abstract has been accepted",
      summary: `The organizers accepted your abstract "${input.abstractTitle}".`,
    },
    rejected: {
      heading: "Update on your abstract submission",
      summary: `The organizers reviewed your abstract "${input.abstractTitle}".`,
    },
  }[input.decision];

  const messageLines = input.message
    ? [`Message from the organizers:`, input.message]
    : [];

  return {
    subject: `[${EVENT_CONFIG.name}] ${decisionContent.heading}`,
    html: renderHtmlEmail(decisionContent.heading, [
      `Hi ${escapeHtml(input.participantName)},`,
      escapeHtml(decisionContent.summary),
      ...(input.message ? [renderMessageHtml(input.message)] : []),
      renderAccessLinkHtml(accessUrl),
    ]),
    text: renderTextEmail(decisionContent.heading, [
      `Hi ${input.participantName},`,
      decisionContent.summary,
      ...messageLines,
      `View your registration: ${accessUrl}`,
    ]),
  };
};

const paymentDecisionTemplate = (
  payload: unknown,
  context: EmailTemplateContext,
): RenderedEmail => {
  const input = paymentDecisionPayloadSchema.parse(payload);
  const accessUrl = buildAccessUrl(context.baseUrl, input.accessPath);

  const decisionContent = {
    verified: {
      heading: "Payment verified",
      summary: `We verified the payment for registration ${input.registrationReference}.`,
    },
    rejected: {
      heading: "Payment could not be verified",
      summary: `We could not verify the payment submitted for registration ${input.registrationReference}.`,
    },
  }[input.decision];

  return {
    subject: `[${EVENT_CONFIG.name}] ${decisionContent.heading}`,
    html: renderHtmlEmail(decisionContent.heading, [
      `Hi ${escapeHtml(input.participantName)},`,
      escapeHtml(decisionContent.summary),
      ...(input.message ? [renderMessageHtml(input.message)] : []),
      renderAccessLinkHtml(accessUrl),
    ]),
    text: renderTextEmail(decisionContent.heading, [
      `Hi ${input.participantName},`,
      decisionContent.summary,
      ...(input.message
        ? ["Message from the organizers:", input.message]
        : []),
      `View your registration: ${accessUrl}`,
    ]),
  };
};

const registrationStatusTemplate = (
  payload: unknown,
  context: EmailTemplateContext,
): RenderedEmail => {
  const input = registrationStatusPayloadSchema.parse(payload);
  const accessUrl = buildAccessUrl(context.baseUrl, input.accessPath);

  const statusContent = {
    confirmed: {
      heading: "Your registration is confirmed",
      summary: `Registration ${input.registrationReference} is confirmed.`,
    },
    cancelled: {
      heading: "Your registration has been cancelled",
      summary: `Registration ${input.registrationReference} has been cancelled.`,
    },
  }[input.status];

  return {
    subject: `[${EVENT_CONFIG.name}] ${statusContent.heading}`,
    html: renderHtmlEmail(statusContent.heading, [
      `Hi ${escapeHtml(input.participantName)},`,
      escapeHtml(statusContent.summary),
      ...(input.message ? [renderMessageHtml(input.message)] : []),
      renderAccessLinkHtml(accessUrl),
    ]),
    text: renderTextEmail(statusContent.heading, [
      `Hi ${input.participantName},`,
      statusContent.summary,
      ...(input.message
        ? ["Message from the organizers:", input.message]
        : []),
      `View your registration: ${accessUrl}`,
    ]),
  };
};

const contactQueryReceivedTemplate = (
  payload: unknown,
): RenderedEmail => {
  const input = contactQueryReceivedPayloadSchema.parse(payload);
  const heading = "We received your query";

  return {
    subject: `[${EVENT_CONFIG.name}] We received your query`,
    html: renderHtmlEmail(heading, [
      `Hi ${escapeHtml(input.name)},`,
      `Thanks for getting in touch about <strong>${escapeHtml(input.subject)}</strong>.`,
      "We have received your query and will contact you soon.",
      escapeHtml(
        "If your question is urgent, mention it in a follow-up reply to this email.",
      ),
    ]),
    text: renderTextEmail(heading, [
      `Hi ${input.name},`,
      `Thanks for getting in touch about "${input.subject}".`,
      "We have received your query and will contact you soon.",
      "If your question is urgent, mention it in a follow-up reply to this email.",
    ]),
  };
};

const contactQueryReplyTemplate = (
  payload: unknown,
): RenderedEmail => {
  const input = contactQueryReplyPayloadSchema.parse(payload);
  const heading = "Reply to your query";

  return {
    subject: `[${EVENT_CONFIG.name}] Re: ${input.subject}`,
    html: renderHtmlEmail(heading, [
      `Hi ${escapeHtml(input.name)},`,
      `This is a reply to your query <strong>${escapeHtml(input.subject)}</strong>.`,
      renderMessageHtml(input.message),
    ]),
    text: renderTextEmail(heading, [
      `Hi ${input.name},`,
      `This is a reply to your query "${input.subject}".`,
      "Message from the organizers:",
      input.message,
    ]),
  };
};

const EMAIL_TEMPLATES = {
  registration_received: {
    render: registrationReceivedTemplate,
    redactsPayloadAfterSend: true,
  },
  abstract_decision: {
    render: abstractDecisionTemplate,
    redactsPayloadAfterSend: true,
  },
  payment_decision: {
    render: paymentDecisionTemplate,
    redactsPayloadAfterSend: true,
  },
  registration_status: {
    render: registrationStatusTemplate,
    redactsPayloadAfterSend: true,
  },
  contact_query_received: {
    render: contactQueryReceivedTemplate,
    redactsPayloadAfterSend: true,
  },
  contact_query_reply: {
    render: contactQueryReplyTemplate,
    redactsPayloadAfterSend: true,
  },
} satisfies Record<string, EmailTemplateDefinition>;

export type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES;

export const renderEmailTemplate = (
  templateKey: string,
  payload: unknown,
  context: EmailTemplateContext,
): RenderedEmail => {
  const emailTemplate = EMAIL_TEMPLATES[templateKey as EmailTemplateKey];

  if (!emailTemplate) {
    throw new Error(`Unknown email template key: ${templateKey}`);
  }

  return emailTemplate.render(payload, context);
};

export const templateRedactsPayloadAfterSend = (
  templateKey: string,
): boolean =>
  EMAIL_TEMPLATES[templateKey as EmailTemplateKey]?.redactsPayloadAfterSend ??
  false;
