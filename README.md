# Provigator — Awesomity Uptime Monitor

A production-ready internal uptime monitoring dashboard built for Awesomity. Monitor client websites and projects, receive email alerts when services go down, and track uptime history.

## Tech Stack

- **Next.js 16** (App Router, Server Actions, Route Handlers)
- **TypeScript**
- **TailwindCSS 4**
- **Prisma 7** with SQLite
- **Playwright** for screenshot capture
- **Nodemailer** for SMTP email alerts
- **Jose** for JWT session management
- **Zod** for validation
- **next-themes** for dark/light mode

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browser (for screenshots)
npx playwright install chromium

# Generate Prisma client
npx prisma generate

# Create database and push schema
npx prisma db push

# Copy environment variables
cp .env.example .env
```

### Environment Variables

Edit `.env` with your configuration:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `JWT_SECRET` | Secret for JWT signing | Must change in production |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username/email | — |
| `SMTP_PASS` | SMTP password/app password | — |
| `SMTP_FROM` | Sender email address | `Provigator <monitor@awesomity.rw>` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |
| `CRON_SECRET` | Secret for cron endpoint auth | Must change in production |

### Running

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Authentication

- Only `@awesomity.rw` emails are authorized
- Password: `123Login!`
- Example login: `john@awesomity.rw` / `123Login!`

## Features

- **Dashboard** — View all monitored projects with status, response time, and screenshots
- **Project Management** — Add, edit, and delete projects with validation
- **Screenshot Capture** — Automatic full-page screenshots via Playwright
- **Uptime Monitoring** — Automatic checks with retry logic and error classification
- **Email Alerts** — Branded HTML email notifications on status changes
- **Search & Filter** — Find projects by name, client, URL, or status
- **Dark/Light Mode** — Full theme support with Awesomity brand colors
- **Mobile Responsive** — Works on all screen sizes

## Monitoring

The monitoring system checks all projects automatically. To trigger monitoring:

### Manual Trigger

```bash
curl http://localhost:3000/api/cron -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Automated (Cron Job)

Set up a cron job to hit the endpoint every minute:

```bash
# crontab -e
* * * * * curl -s http://localhost:3000/api/cron -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### External Cron Services

You can also use services like [cron-job.org](https://cron-job.org), [EasyCron](https://www.easycron.com), or Vercel Cron Jobs.

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/         # Login page
│   ├── (dashboard)/
│   │   ├── dashboard/        # Main dashboard
│   │   └── projects/         # Project CRUD pages
│   └── api/
│       ├── cron/             # Monitoring cron endpoint
│       └── monitor/          # Status API
├── actions/                  # Server Actions
├── components/
│   ├── dashboard/            # Dashboard-specific components
│   ├── forms/                # Form components
│   └── ui/                   # Reusable UI components
├── generated/prisma/         # Prisma generated client
├── lib/                      # Utilities, auth, validation
├── services/                 # Core services (monitoring, email, screenshots)
└── types/                    # TypeScript types
```

## Brand Colors

| Color | Hex |
|-------|-----|
| Accent | `#C1CF16` |
| Dark | `#0C0D0D` |
| White | `#FFFFFF` |
