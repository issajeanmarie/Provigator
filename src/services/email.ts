import { db } from "@/lib/db";
import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function formatTime(ms: number | null): string {
  if (ms === null) return "N/A";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function downEmailHtml(data: {
  projectName: string;
  clientName: string;
  url: string;
  errorMessage: string;
  responseTime: number | null;
  timestamp: Date;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0C0D0D;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0C0D0D;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#dc2626;padding:24px 32px;">
          <h1 style="margin:0;color:#fff;font-size:20px;font-weight:600;">
            ⚠ Service Down Alert
          </h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="color:#e5e5e5;font-size:16px;margin:0 0 24px;">
            A monitored project is currently <strong style="color:#ef4444;">unreachable</strong>.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#262626;border-radius:8px;padding:20px;">
            <tr><td style="padding:8px 16px;color:#a3a3a3;font-size:13px;">Project</td>
                <td style="padding:8px 16px;color:#fff;font-size:14px;font-weight:500;">${data.projectName}</td></tr>
            <tr><td style="padding:8px 16px;color:#a3a3a3;font-size:13px;">Client</td>
                <td style="padding:8px 16px;color:#fff;font-size:14px;">${data.clientName}</td></tr>
            <tr><td style="padding:8px 16px;color:#a3a3a3;font-size:13px;">URL</td>
                <td style="padding:8px 16px;"><a href="${data.url}" style="color:#C1CF16;font-size:14px;text-decoration:none;">${data.url}</a></td></tr>
            <tr><td style="padding:8px 16px;color:#a3a3a3;font-size:13px;">Error</td>
                <td style="padding:8px 16px;color:#ef4444;font-size:14px;">${data.errorMessage}</td></tr>
            <tr><td style="padding:8px 16px;color:#a3a3a3;font-size:13px;">Response Time</td>
                <td style="padding:8px 16px;color:#fff;font-size:14px;">${formatTime(data.responseTime)}</td></tr>
            <tr><td style="padding:8px 16px;color:#a3a3a3;font-size:13px;">Detected At</td>
                <td style="padding:8px 16px;color:#fff;font-size:14px;">${data.timestamp.toLocaleString()}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 32px;">
          <p style="color:#737373;font-size:12px;margin:0;border-top:1px solid #333;padding-top:16px;">
            Provigator | Awesomity Uptime Monitor
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function recoveryEmailHtml(data: {
  projectName: string;
  clientName: string;
  url: string;
  responseTime: number | null;
  timestamp: Date;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0C0D0D;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0C0D0D;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#16a34a;padding:24px 32px;">
          <h1 style="margin:0;color:#fff;font-size:20px;font-weight:600;">
            ✓ Service Recovered
          </h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="color:#e5e5e5;font-size:16px;margin:0 0 24px;">
            A previously down project is now <strong style="color:#C1CF16;">back online</strong>.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#262626;border-radius:8px;padding:20px;">
            <tr><td style="padding:8px 16px;color:#a3a3a3;font-size:13px;">Project</td>
                <td style="padding:8px 16px;color:#fff;font-size:14px;font-weight:500;">${data.projectName}</td></tr>
            <tr><td style="padding:8px 16px;color:#a3a3a3;font-size:13px;">Client</td>
                <td style="padding:8px 16px;color:#fff;font-size:14px;">${data.clientName}</td></tr>
            <tr><td style="padding:8px 16px;color:#a3a3a3;font-size:13px;">URL</td>
                <td style="padding:8px 16px;"><a href="${data.url}" style="color:#C1CF16;font-size:14px;text-decoration:none;">${data.url}</a></td></tr>
            <tr><td style="padding:8px 16px;color:#a3a3a3;font-size:13px;">Response Time</td>
                <td style="padding:8px 16px;color:#fff;font-size:14px;">${formatTime(data.responseTime)}</td></tr>
            <tr><td style="padding:8px 16px;color:#a3a3a3;font-size:13px;">Recovered At</td>
                <td style="padding:8px 16px;color:#fff;font-size:14px;">${data.timestamp.toLocaleString()}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 32px;">
          <p style="color:#737373;font-size:12px;margin:0;border-top:1px solid #333;padding-top:16px;">
            Provigator | Awesomity Uptime Monitor
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function getRecipients(): Promise<string[]> {
  const rows = await db.session.findMany({
    distinct: ["email"],
    select: { email: true },
  });
  return rows.map((r) => r.email);
}

function getSender(): string {
  // Gmail requires the From address to match the authenticated account
  const user = process.env.SMTP_USER ?? "";
  const customFrom = process.env.SMTP_FROM;
  if (customFrom) {
    // If SMTP_FROM is a display-name format like "Name <addr>", keep it only
    // when the email address inside matches SMTP_USER (works with Gmail).
    // Otherwise fall back to just SMTP_USER so Gmail doesn't reject the mail.
    const match = customFrom.match(/<([^>]+)>/);
    if (!match || match[1].toLowerCase() === user.toLowerCase()) {
      return customFrom;
    }
  }
  return `Provigator <${user}>`;
}

export async function sendDownAlert(data: {
  projectName: string;
  clientName: string;
  url: string;
  errorMessage: string;
  responseTime: number | null;
  timestamp: Date;
}) {
  const recipients = await getRecipients();
  if (recipients.length === 0) return;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP not configured, skipping down alert email");
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: getSender(),
    to: recipients.join(", "),
    subject: `🔴 DOWN: ${data.projectName} (${data.clientName})`,
    html: downEmailHtml(data),
  });
}

export async function sendRecoveryAlert(data: {
  projectName: string;
  clientName: string;
  url: string;
  responseTime: number | null;
  timestamp: Date;
}) {
  const recipients = await getRecipients();
  if (recipients.length === 0) return;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP not configured, skipping recovery alert email");
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: getSender(),
    to: recipients.join(", "),
    subject: `🟢 RECOVERED: ${data.projectName} (${data.clientName})`,
    html: recoveryEmailHtml(data),
  });
}
