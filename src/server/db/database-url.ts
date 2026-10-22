// Pure module: the migration runner imports it with Node's native TypeScript support.

export type DatabaseConnectionParts = {
  readonly host: string;
  readonly port: number;
  readonly user: string;
  readonly password: string;
  readonly database: string;
};

export const parseDatabaseUrl = (databaseUrl: string): DatabaseConnectionParts => {
  const parsedUrl = new URL(databaseUrl);

  if (parsedUrl.protocol !== "mysql:") {
    throw new Error("DATABASE_URL must use the mysql:// scheme");
  }

  const database = decodeURIComponent(parsedUrl.pathname.replace(/^\//, ""));

  if (!parsedUrl.hostname || !database) {
    throw new Error("DATABASE_URL must include a host and a database name");
  }

  return {
    host: parsedUrl.hostname,
    port: parsedUrl.port ? Number(parsedUrl.port) : 3306,
    user: decodeURIComponent(parsedUrl.username),
    password: decodeURIComponent(parsedUrl.password),
    database,
  };
};
