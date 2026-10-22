import type { ResultSetHeader } from "mysql2";
import type { PoolConnection } from "mysql2/promise";
import mysql from "mysql2/promise";
import { parseDatabaseUrl } from "./database-url.ts";
import { getAppEnv, requireAppEnv } from "../config/env.ts";

const DEFAULT_CONNECTION_LIMIT = 10;

export type SqlParameter = string | number | bigint | boolean | Date | Buffer | null;

let sharedPool: mysql.Pool | undefined;

const buildPool = (): mysql.Pool => {
  const { DATABASE_URL } = requireAppEnv(["DATABASE_URL"]);
  const { DB_CONNECTION_LIMIT } = getAppEnv();

  return mysql.createPool({
    ...parseDatabaseUrl(DATABASE_URL),
    waitForConnections: true,
    connectionLimit: DB_CONNECTION_LIMIT ?? DEFAULT_CONNECTION_LIMIT,
    timezone: "Z",
    charset: "utf8mb4",
  });
};

export const getDbPool = (): mysql.Pool => {
  sharedPool ??= buildPool();
  return sharedPool;
};

export const queryRows = async <TRow>(
  sql: string,
  params: readonly SqlParameter[] = [],
): Promise<TRow[]> => {
  const [result] = await getDbPool().execute(sql, [...params]);

  if (!Array.isArray(result)) {
    throw new Error("queryRows expects a SELECT statement");
  }

  // Single boundary where driver rows become application types.
  return result as unknown as TRow[];
};

export const queryRow = async <TRow>(
  sql: string,
  params: readonly SqlParameter[] = [],
): Promise<TRow | null> => {
  const rows = await queryRows<TRow>(sql, params);
  return rows[0] ?? null;
};

export const executeStatement = async (
  sql: string,
  params: readonly SqlParameter[] = [],
): Promise<ResultSetHeader> => {
  const [result] = await getDbPool().execute<ResultSetHeader>(sql, [...params]);
  return result;
};

export const withTransaction = async <TResult>(
  work: (transaction: PoolConnection) => Promise<TResult>,
): Promise<TResult> => {
  const transaction = await getDbPool().getConnection();

  try {
    await transaction.beginTransaction();
    const result = await work(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    transaction.release();
  }
};
