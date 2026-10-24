import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { PoolConnection } from "mysql2/promise";
import { queryRow, queryRows, withTransaction } from "../db/client.ts";
import { enqueueEmailDeliverySafely } from "../queue/email-queue.ts";
import type { ContactQueryStatus } from "../../lib/domain.ts";
import type {
  AdminQueryListInput,
  AdminQueryReplyInput,
  AdminQueryStatusUpdateInput,
} from "../validation/admin.schema.ts";
import { AdminActionError } from "./admin-errors.ts";
import { writeAuditLog } from "./write-audit-log.ts";

export type AdminQueryListItem = {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly snippet: string;
  readonly status: ContactQueryStatus;
  readonly repliedAt: Date | null;
  readonly createdAt: Date;
};

export type AdminQueryListResult = {
  readonly items: readonly AdminQueryListItem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
};

export type AdminQueryDetail = {
  readonly query: {
    readonly id: number;
    readonly name: string;
    readonly email: string;
    readonly subject: string;
    readonly message: string;
    readonly status: ContactQueryStatus;
    readonly repliedAt: Date | null;
    readonly createdAt: Date;
  };
  readonly emails: readonly AdminQueryEmail[];
};

type AdminQueryEmail = {
  readonly id: number;
  readonly templateKey: string;
  readonly status: string;
  readonly attempts: number;
  readonly createdAt: Date;
  readonly sentAt: Date | null;
  readonly lastErrorSafe: string | null;
};

type QueryListRow = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  replied_at: Date | null;
  created_at: Date;
};

type FilterSql = {
  readonly where: string;
  readonly params: readonly (string | number)[];
};

const SNIPPET_LENGTH = 160;

const buildQueryFilters = (input: AdminQueryListInput): FilterSql => {
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (input.search) {
    const searchTerm = `%${input.search}%`;
    clauses.push(
      "(name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)",
    );
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (input.status) {
    clauses.push("status = ?");
    params.push(input.status);
  }

  return {
    where: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
};

const toSnippet = (message: string): string =>
  message.length > SNIPPET_LENGTH ? `${message.slice(0, SNIPPET_LENGTH)}…` : message;

const toListItems = (rows: readonly QueryListRow[]): AdminQueryListItem[] =>
  rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    email: row.email,
    subject: row.subject,
    snippet: toSnippet(row.message),
    status: row.status as ContactQueryStatus,
    repliedAt: row.replied_at,
    createdAt: row.created_at,
  }));

export const listAdminQueries = async (
  input: AdminQueryListInput,
): Promise<AdminQueryListResult> => {
  const { where, params } = buildQueryFilters(input);
  const offset = (input.page - 1) * input.pageSize;

  const [rows, countRow] = await Promise.all([
    queryRows<QueryListRow>(
      `SELECT id, name, email, subject, message, status, replied_at, created_at
       FROM contact_queries
       ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...params, input.pageSize, offset],
    ),
    queryRow<{ total: number }>(
      `SELECT COUNT(*) AS total FROM contact_queries ${where}`,
      params,
    ),
  ]);

  return {
    items: toListItems(rows),
    total: Number(countRow?.total ?? 0),
    page: input.page,
    pageSize: input.pageSize,
  };
};

type QueryEmailRow = {
  id: number;
  template_key: string;
  status: string;
  attempts: number;
  created_at: Date;
  sent_at: Date | null;
  last_error_safe: string | null;
};

export const findAdminQueryById = async (
  queryId: number,
): Promise<AdminQueryDetail | null> => {
  const row = await queryRow<QueryListRow>(
    `SELECT id, name, email, subject, message, status, replied_at, created_at
     FROM contact_queries
     WHERE id = ?`,
    [queryId],
  );

  if (!row) {
    return null;
  }

  const emailRows = await queryRows<QueryEmailRow>(
    `SELECT id, template_key, status, attempts, created_at, sent_at, last_error_safe
     FROM email_outbox
     WHERE contact_query_id = ?
     ORDER BY id DESC`,
    [queryId],
  );

  return {
    query: {
      id: Number(row.id),
      name: row.name,
      email: row.email,
      subject: row.subject,
      message: row.message,
      status: row.status as ContactQueryStatus,
      repliedAt: row.replied_at,
      createdAt: row.created_at,
    },
    emails: emailRows.map((emailRow) => ({
      id: Number(emailRow.id),
      templateKey: emailRow.template_key,
      status: emailRow.status,
      attempts: Number(emailRow.attempts),
      createdAt: emailRow.created_at,
      sentAt: emailRow.sent_at,
      lastErrorSafe: emailRow.last_error_safe,
    })),
  };
};

type StatusUpdateInput = AdminQueryStatusUpdateInput & {
  readonly actorEmail: string;
};

type StatusUpdateResult = {
  readonly status: ContactQueryStatus;
  readonly changed: boolean;
};

type LockedQueryRow = RowDataPacket & {
  id: number;
  status: string;
  name: string;
  email: string;
  subject: string;
};

const lockQuery = async (
  transaction: PoolConnection,
  queryId: number,
): Promise<LockedQueryRow> => {
  const [rows] = await transaction.execute<LockedQueryRow[]>(
    "SELECT id, status, name, email, subject FROM contact_queries WHERE id = ? FOR UPDATE",
    [queryId],
  );

  const currentQuery = rows[0];

  if (!currentQuery) {
    throw new AdminActionError("not_found", "Query not found");
  }

  return currentQuery;
};

export const updateContactQueryStatus = async (
  input: StatusUpdateInput,
): Promise<StatusUpdateResult> =>
  withTransaction(async (transaction) => {
    const currentQuery = await lockQuery(transaction, input.queryId);

    if (currentQuery.status === input.status) {
      return { status: input.status, changed: false };
    }

    await transaction.execute(
      "UPDATE contact_queries SET status = ? WHERE id = ?",
      [input.status, input.queryId],
    );

    await writeAuditLog(transaction, {
      actorIdentifier: input.actorEmail,
      action: "contact_query.status_changed",
      entityType: "contact_query",
      entityId: String(input.queryId),
      metadata: {
        previousStatus: currentQuery.status,
        nextStatus: input.status,
      },
    });

    return { status: input.status, changed: true };
  });

type ReplyInput = AdminQueryReplyInput & {
  readonly actorEmail: string;
};

type ReplyResult = {
  readonly replied: boolean;
  readonly emailQueued: boolean;
};

export const replyToContactQuery = async (
  input: ReplyInput,
): Promise<ReplyResult> => {
  const result = await withTransaction(async (transaction) => {
    const currentQuery = await lockQuery(transaction, input.queryId);

    const [outboxResult] = await transaction.execute<ResultSetHeader>(
      `INSERT INTO email_outbox
        (registration_id, contact_query_id, recipient, template_key,
         payload_json, status)
       VALUES (NULL, ?, ?, 'contact_query_reply', ?, 'pending')`,
      [
        input.queryId,
        currentQuery.email,
        JSON.stringify({
          name: currentQuery.name,
          subject: currentQuery.subject,
          message: input.message,
        }),
      ],
    );

    await transaction.execute(
      "UPDATE contact_queries SET replied_at = UTC_TIMESTAMP(6) WHERE id = ?",
      [input.queryId],
    );

    await writeAuditLog(transaction, {
      actorIdentifier: input.actorEmail,
      action: "contact_query.replied",
      entityType: "contact_query",
      entityId: String(input.queryId),
      metadata: {
        recipient: currentQuery.email,
        outboxId: Number(outboxResult.insertId),
      },
    });

    return { outboxId: Number(outboxResult.insertId) };
  });

  await enqueueEmailDeliverySafely(result.outboxId);

  return { replied: true, emailQueued: true };
};
