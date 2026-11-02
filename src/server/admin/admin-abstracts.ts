import type { RowDataPacket } from "mysql2";
import type { SqlParameter } from "../db/client.ts";
import { queryRow, queryRows, withTransaction } from "../db/client.ts";
import type {
  AdminAbstractDecisionInput,
  AdminAbstractListInput,
} from "../validation/admin.schema.ts";
import type { AbstractStatus } from "../../lib/domain.ts";
import { AdminActionError } from "./admin-errors.ts";
import { writeAuditLog } from "./write-audit-log.ts";

export type AdminAbstractListItem = {
  readonly id: number;
  readonly title: string;
  readonly status: AbstractStatus;
  readonly themeName: string | null;
  readonly submittedAt: Date | null;
  readonly createdAt: Date;
  readonly registrationId: number;
  readonly reference: string;
  readonly participantName: string;
  readonly email: string;
  readonly authorCount: number;
  readonly correspondingAuthor: string | null;
  readonly hasText: boolean;
  readonly hasDocument: boolean;
};

export type AdminAbstractListResult = {
  readonly items: readonly AdminAbstractListItem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
};

export type AdminAbstractAuthor = {
  readonly id: number;
  readonly fullName: string;
  readonly email: string | null;
  readonly affiliation: string | null;
  readonly authorOrder: number;
  readonly isCorresponding: boolean;
};

export type AdminAbstractReview = {
  readonly id: number;
  readonly reviewerIdentifier: string;
  readonly decision: string;
  readonly internalComment: string | null;
  readonly participantComment: string | null;
  readonly createdAt: Date;
};

export type AdminAbstractDetail = {
  readonly id: number;
  readonly title: string;
  readonly status: AbstractStatus;
  readonly themeName: string | null;
  readonly abstractText: string | null;
  readonly document: {
    readonly originalFilename: string;
    readonly contentType: string;
    readonly sizeBytes: number;
    readonly url: string;
  } | null;
  readonly submittedAt: Date | null;
  readonly createdAt: Date;
  readonly registration: {
    readonly id: number;
    readonly reference: string;
    readonly status: string;
    readonly category: string;
    readonly wantsAbstractSubmission: boolean;
    readonly participantName: string;
    readonly email: string;
    readonly institution: string | null;
  };
  readonly authors: readonly AdminAbstractAuthor[];
  readonly reviewHistory: readonly AdminAbstractReview[];
};

export type AdminAbstractDecisionResult = {
  readonly status: AbstractStatus;
  readonly changed: boolean;
};

type FilterSql = {
  readonly where: string;
  readonly params: SqlParameter[];
};

type AbstractListRow = {
  id: number;
  title: string;
  status: string;
  theme_name: string | null;
  submitted_at: Date | null;
  created_at: Date;
  has_text: number;
  has_document: number;
  registration_id: number;
  public_reference: string;
  full_name: string;
  email_normalized: string;
  author_count: number;
  corresponding_name: string | null;
};

type AbstractDetailRow = {
  id: number;
  title: string;
  status: string;
  theme_name: string | null;
  abstract_text: string | null;
  original_filename: string | null;
  content_type: string | null;
  file_size_bytes: number | null;
  s3_object_key: string | null;
  submitted_at: Date | null;
  created_at: Date;
  registration_id: number;
  public_reference: string;
  registration_status: string;
  wants_abstract_submission: number;
  full_name: string;
  email_normalized: string;
  institution: string | null;
  category: string;
};

type AbstractAuthorRow = {
  id: number;
  full_name: string;
  email: string | null;
  affiliation: string | null;
  author_order: number;
  is_corresponding: number;
};

type AbstractReviewRow = {
  id: number;
  reviewer_identifier: string;
  decision: string;
  internal_comment: string | null;
  participant_comment: string | null;
  created_at: Date;
};

type DecisionLockRow = {
  status: string;
} & RowDataPacket;

const buildAbstractFilters = (input: AdminAbstractListInput): FilterSql => {
  const clauses: string[] = [];
  const params: SqlParameter[] = [];

  if (input.status) {
    clauses.push("a.status = ?");
    params.push(input.status);
  }

  if (input.themeId) {
    clauses.push("a.theme_id = ?");
    params.push(input.themeId);
  }

  if (input.submittedFrom) {
    clauses.push("a.submitted_at >= ?");
    params.push(`${input.submittedFrom} 00:00:00`);
  }

  if (input.submittedTo) {
    clauses.push("a.submitted_at < DATE_ADD(?, INTERVAL 1 DAY)");
    params.push(`${input.submittedTo} 00:00:00`);
  }

  return {
    where: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
};

const toListItem = (row: AbstractListRow): AdminAbstractListItem => ({
  id: Number(row.id),
  title: row.title,
  status: row.status as AbstractStatus,
  themeName: row.theme_name,
  submittedAt: row.submitted_at,
  createdAt: row.created_at,
  registrationId: Number(row.registration_id),
  reference: row.public_reference,
  participantName: row.full_name,
  email: row.email_normalized,
  authorCount: Number(row.author_count),
  correspondingAuthor: row.corresponding_name,
  hasText: Boolean(row.has_text),
  hasDocument: Boolean(row.has_document),
});

export const listAdminAbstracts = async (
  input: AdminAbstractListInput,
): Promise<AdminAbstractListResult> => {
  const { where, params } = buildAbstractFilters(input);
  const offset = (input.page - 1) * input.pageSize;

  const [rows, countRow] = await Promise.all([
    queryRows<AbstractListRow>(
      `SELECT
         a.id, a.title, a.status, a.submitted_at, a.created_at,
         a.abstract_text IS NOT NULL AS has_text,
         a.s3_object_key IS NOT NULL AS has_document,
         t.name AS theme_name,
         r.id AS registration_id, r.public_reference,
         p.full_name, p.email_normalized,
         (SELECT COUNT(*)
          FROM abstract_authors aa
          WHERE aa.abstract_id = a.id) AS author_count,
         (SELECT aa.full_name
          FROM abstract_authors aa
          WHERE aa.abstract_id = a.id AND aa.is_corresponding = 1
          ORDER BY aa.author_order ASC
          LIMIT 1) AS corresponding_name
       FROM abstract_submissions a
       JOIN registrations r ON r.id = a.registration_id
       JOIN participants p ON p.id = r.participant_id
       LEFT JOIN themes t ON t.id = a.theme_id
       ${where}
       ORDER BY COALESCE(a.submitted_at, a.created_at) DESC, a.id DESC
       LIMIT ? OFFSET ?`,
      [...params, input.pageSize, offset],
    ),
    queryRow<{ total: number }>(
      `SELECT COUNT(*) AS total
       FROM abstract_submissions a
       ${where}`,
      params,
    ),
  ]);

  return {
    items: rows.map(toListItem),
    total: Number(countRow?.total ?? 0),
    page: input.page,
    pageSize: input.pageSize,
  };
};

export const findAdminAbstractById = async (
  abstractId: number,
): Promise<AdminAbstractDetail | null> => {
  const row = await queryRow<AbstractDetailRow>(
    `SELECT
       a.id, a.title, a.status, a.abstract_text, a.original_filename,
       a.content_type, a.file_size_bytes, a.s3_object_key,
       a.submitted_at, a.created_at,
       t.name AS theme_name,
       r.id AS registration_id, r.public_reference,
       r.status AS registration_status, r.wants_abstract_submission,
       p.full_name, p.email_normalized, p.institution, p.category
     FROM abstract_submissions a
     JOIN registrations r ON r.id = a.registration_id
     JOIN participants p ON p.id = r.participant_id
     LEFT JOIN themes t ON t.id = a.theme_id
     WHERE a.id = ?`,
    [abstractId],
  );

  if (!row) {
    return null;
  }

  const [authorRows, reviewRows] = await Promise.all([
    queryRows<AbstractAuthorRow>(
      `SELECT id, full_name, email, affiliation, author_order, is_corresponding
       FROM abstract_authors
       WHERE abstract_id = ?
       ORDER BY author_order ASC`,
      [abstractId],
    ),
    queryRows<AbstractReviewRow>(
      `SELECT id, reviewer_identifier, decision, internal_comment,
              participant_comment, created_at
       FROM abstract_review_history
       WHERE abstract_id = ?
       ORDER BY id DESC`,
      [abstractId],
    ),
  ]);

  return {
    id: Number(row.id),
    title: row.title,
    status: row.status as AbstractStatus,
    themeName: row.theme_name,
    abstractText: row.abstract_text,
    document:
      row.s3_object_key && row.original_filename && row.content_type
        ? {
            originalFilename: row.original_filename,
            contentType: row.content_type,
            sizeBytes: Number(row.file_size_bytes ?? 0),
            url: row.s3_object_key,
          }
        : null,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    registration: {
      id: Number(row.registration_id),
      reference: row.public_reference,
      status: row.registration_status,
      category: row.category,
      wantsAbstractSubmission: Boolean(row.wants_abstract_submission),
      participantName: row.full_name,
      email: row.email_normalized,
      institution: row.institution,
    },
    authors: authorRows.map((author) => ({
      id: Number(author.id),
      fullName: author.full_name,
      email: author.email,
      affiliation: author.affiliation,
      authorOrder: Number(author.author_order),
      isCorresponding: Boolean(author.is_corresponding),
    })),
    reviewHistory: reviewRows.map((review) => ({
      id: Number(review.id),
      reviewerIdentifier: review.reviewer_identifier,
      decision: review.decision,
      internalComment: review.internal_comment,
      participantComment: review.participant_comment,
      createdAt: review.created_at,
    })),
  };
};

export const recordAbstractDecision = async (
  input: AdminAbstractDecisionInput,
  actorEmail: string,
): Promise<AdminAbstractDecisionResult> =>
  withTransaction(async (transaction) => {
    const [rows] = await transaction.execute<DecisionLockRow[]>(
      "SELECT status FROM abstract_submissions WHERE id = ? FOR UPDATE",
      [input.abstractId],
    );

    const current = rows[0];

    if (!current) {
      throw new AdminActionError("not_found", "Abstract not found");
    }

    await transaction.execute(
      "UPDATE abstract_submissions SET status = ? WHERE id = ?",
      [input.decision, input.abstractId],
    );

    await transaction.execute(
      `INSERT INTO abstract_review_history
         (abstract_id, reviewer_identifier, decision, internal_comment,
          participant_comment)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.abstractId,
        actorEmail,
        input.decision,
        input.internalComment ?? null,
        input.participantComment ?? null,
      ],
    );

    await writeAuditLog(transaction, {
      actorIdentifier: actorEmail,
      action: "abstract.decision_recorded",
      entityType: "abstract",
      entityId: String(input.abstractId),
      metadata: {
        previousStatus: current.status,
        nextStatus: input.decision,
      },
    });

    return {
      status: input.decision,
      changed: current.status !== input.decision,
    };
  });
