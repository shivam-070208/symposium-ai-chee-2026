import type { PoolConnection } from "mysql2/promise";

type AuditLogEntry = {
  readonly actorIdentifier: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export const writeAuditLog = async (
  transaction: PoolConnection,
  entry: AuditLogEntry,
): Promise<void> => {
  await transaction.execute(
    `INSERT INTO audit_logs
      (actor_type, actor_identifier, action, entity_type, entity_id, safe_metadata_json)
     VALUES ('env_admin', ?, ?, ?, ?, ?)`,
    [
      entry.actorIdentifier,
      entry.action,
      entry.entityType,
      entry.entityId,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
    ],
  );
};
