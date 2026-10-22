This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Local database and migrations

Schema changes are hand-written SQL migrations in `src/server/db/migrations/`,
applied with `mysql2` (no ORM). The folder is **gitignored by project policy**
and must never be committed — a fresh clone does not contain the schema; the
exact migration bundle is delivered privately.

```bash
# Start MySQL 8 locally
docker run -d --name aichee-mysql --restart unless-stopped \
  -e MYSQL_ROOT_PASSWORD=<dev-root-password> \
  -e MYSQL_DATABASE=aichee2026_symposium \
  -e MYSQL_USER=aichee_app \
  -e MYSQL_PASSWORD=<dev-app-password> \
  -p 127.0.0.1:3306:3306 \
  -v aichee-mysql-data:/var/lib/mysql \
  mysql:8 --character-set-server=utf8mb4 --collation-server=utf8mb4_0900_ai_ci

# Point .env.local at it, then apply migrations (idempotent)
DATABASE_URL=mysql://aichee_app:<dev-app-password>@127.0.0.1:3306/aichee2026_symposium
npm run db:migrate
```

The runner records SHA-256 checksums in `schema_migrations` and refuses to run
if an applied migration was edited or is missing locally.

## Background email worker (BullMQ)

Emails are never sent inside a database transaction. The business transaction
writes an `email_outbox` row, then a BullMQ job is queued with its ID; a separate
worker renders the template, sends it over SMTP, and updates the outbox row.
Failures retry with exponential backoff (5 attempts), and a sent row has its
payload redacted because it may contain a private access link.

```bash
# Redis
docker run -d --name aichee-redis --restart unless-stopped \
  -p 127.0.0.1:6379:6379 -v aichee-redis-data:/data \
  redis:7 redis-server --appendonly yes

# Optional local mail capture (SMTP 1025, web UI http://127.0.0.1:8025)
docker run -d --name aichee-mailpit --restart unless-stopped \
  -p 127.0.0.1:1025:1025 -p 127.0.0.1:8025:8025 axllent/mailpit

# In a second terminal, keep the worker running
npm run worker:email
```

The worker is a separate long-running Node process — `npm run dev` alone does
not deliver email. Set `REDIS_URL`, `EMAIL_SMTP_URL`, `EMAIL_FROM_ADDRESS` and
`EMAIL_FROM_NAME` in `.env.local`. Any SMTP provider works; an API-based
provider can be added later behind `src/server/email/email-transport.ts`.
