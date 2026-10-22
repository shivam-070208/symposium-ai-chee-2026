/**
 * Applies ./migrations/*.sql in filename order and records checksums in
 * schema_migrations. Migrations are local-only (never committed); applied
 * files must never be edited. MySQL DDL commits implicitly, so a failed file
 * is fixed forward with a new migration.
 */

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { RowDataPacket } from "mysql2";
import mysql from "mysql2/promise";
import { parseDatabaseUrl } from "./database-url.ts";

const migrationsDirectory = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "migrations",
);

type AppliedMigrationRow = RowDataPacket & {
  version: string;
  checksum: string;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Provide it via .env.local or the environment before running migrations.",
  );
}

const connection = await mysql.createConnection({
  ...parseDatabaseUrl(databaseUrl),
  multipleStatements: true, // local, trusted migration files only
  timezone: "Z",
  charset: "utf8mb4",
});

const ensureSchemaMigrationsTable = async (): Promise<void> => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(191) NOT NULL,
      checksum CHAR(64) NOT NULL,
      applied_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      execution_ms INT UNSIGNED NOT NULL,
      PRIMARY KEY (version)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);
};

const listMigrationFiles = async (): Promise<string[]> => {
  const directoryEntries = await readdir(migrationsDirectory);
  return directoryEntries.filter((fileName) => fileName.endsWith(".sql")).sort();
};

const readAppliedMigrations = async (): Promise<Map<string, string>> => {
  const [rows] = await connection.query<AppliedMigrationRow[]>(
    "SELECT version, checksum FROM schema_migrations",
  );
  return new Map(rows.map((row) => [row.version, row.checksum]));
};

const applyMigration = async (fileName: string): Promise<void> => {
  const filePath = path.join(migrationsDirectory, fileName);
  const sqlText = await readFile(filePath, "utf8");
  const checksum = createHash("sha256").update(sqlText).digest("hex");

  const startedAt = performance.now();
  await connection.query(sqlText);
  const executionMs = Math.round(performance.now() - startedAt);

  await connection.execute(
    "INSERT INTO schema_migrations (version, checksum, execution_ms) VALUES (?, ?, ?)",
    [fileName, checksum, executionMs],
  );

  console.log(`applied  ${fileName} (${executionMs} ms)`);
};

const runMigrations = async (): Promise<void> => {
  await ensureSchemaMigrationsTable();

  const migrationFiles = await listMigrationFiles();
  const appliedMigrations = await readAppliedMigrations();

  const missingLocalFiles = [...appliedMigrations.keys()].filter(
    (version) => !migrationFiles.includes(version),
  );

  if (missingLocalFiles.length > 0) {
    throw new Error(
      `Applied migrations are missing locally: ${missingLocalFiles.join(", ")}. Restore the exact migration bundle before continuing.`,
    );
  }

  let appliedCount = 0;

  for (const fileName of migrationFiles) {
    const recordedChecksum = appliedMigrations.get(fileName);

    if (recordedChecksum === undefined) {
      await applyMigration(fileName);
      appliedCount += 1;
      continue;
    }

    const currentChecksum = createHash("sha256")
      .update(await readFile(path.join(migrationsDirectory, fileName), "utf8"))
      .digest("hex");

    if (currentChecksum !== recordedChecksum) {
      throw new Error(
        `Migration ${fileName} changed after it was applied. Never edit applied migrations — add a new one instead.`,
      );
    }
  }

  if (appliedCount === 0) {
    console.log(`up to date (${migrationFiles.length} migrations, all applied)`);
  } else {
    console.log(`done (${appliedCount} applied, ${migrationFiles.length} total)`);
  }
};

try {
  await runMigrations();
} catch (error) {
  console.error("migration failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await connection.end();
}
