#!/usr/bin/env node
/**
 * send_sms_twilio.mjs
 * ─────────────────────────────────────────────────────────────────
 * Reads scripts/sms.csv and sends unique RSVP links via Twilio SMS.
 *
 * Prerequisites:
 *   npm install twilio (or npx with inline require)
 *   Set environment variables:
 *     TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *     TWILIO_AUTH_TOKEN=your_auth_token
 *     TWILIO_FROM=+15550001234
 *
 * Usage:
 *   node scripts/send_sms_twilio.mjs --dry-run          # Print messages, don't send
 *   node scripts/send_sms_twilio.mjs --confirm          # Actually send (requires confirm flag)
 *
 * ⚠️  sms.csv contains raw tokens → DO NOT COMMIT (already in .gitignore)
 */

import { createReadStream, existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { argv, env } from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Parse CLI args ───────────────────────────────────────────────────
const args = argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isConfirm = args.includes('--confirm');

if (!isDryRun && !isConfirm) {
  console.error('Usage:\n  node send_sms_twilio.mjs --dry-run   (preview only)\n  node send_sms_twilio.mjs --confirm  (actually send)');
  process.exit(1);
}

// ── Validate Twilio env vars ─────────────────────────────────────────
const ACCOUNT_SID = env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN  = env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER = env.TWILIO_FROM;

if (!isDryRun) {
  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM_NUMBER) {
    console.error(
      'Missing required env vars:\n' +
      '  TWILIO_ACCOUNT_SID\n' +
      '  TWILIO_AUTH_TOKEN\n' +
      '  TWILIO_FROM\n' +
      'Set them before running:\n' +
      '  export TWILIO_ACCOUNT_SID=ACxxx ...'
    );
    process.exit(1);
  }
}

// ── Read sms.csv ─────────────────────────────────────────────────────
const smsPath = path.join(__dirname, 'sms.csv');
if (!existsSync(smsPath)) {
  console.error(`sms.csv not found at ${smsPath}.\nRun generate_tokens.mjs first.`);
  process.exit(1);
}

/** Parse a CSV line respecting double-quoted fields. */
function parseCsvLine(line) {
  const fields = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { fields.push(field.trim()); field = ''; }
      else { field += ch; }
    }
  }
  fields.push(field.trim());
  return fields;
}

async function readSmsCsv() {
  const rows = [];
  const rl = createInterface({ input: createReadStream(smsPath), crlfDelay: Infinity });
  let isFirst = true;
  for await (const line of rl) {
    if (!line.trim()) continue;
    if (isFirst) { isFirst = false; continue; }
    const [phone_e164, household_label, rsvp_link] = parseCsvLine(line);
    if (!phone_e164 || !rsvp_link) continue;
    rows.push({ phone_e164, household_label, rsvp_link });
  }
  return rows;
}

// ── SMS message template ─────────────────────────────────────────────
function buildMessage(row) {
  return (
    `You're invited to Zubair & Maryam's wedding! 🌸\n` +
    `June 11–13, 2026 · San Diego, CA\n` +
    `Please RSVP here: ${row.rsvp_link}\n` +
    `One link per household — reply STOP to opt out.`
  );
}

// ── Throttle helper ──────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  const rows = await readSmsCsv();
  if (rows.length === 0) {
    console.error('No rows in sms.csv. Run generate_tokens.mjs first.');
    process.exit(1);
  }

  console.log(`\n📱  ${rows.length} messages to send\n`);

  if (isDryRun) {
    console.log('── DRY RUN (no messages will be sent) ─────────────────\n');
    rows.forEach((row, i) => {
      console.log(`[${i + 1}/${rows.length}] TO: ${row.phone_e164}`);
      console.log(`  ${buildMessage(row).replace(/\n/g, '\n  ')}\n`);
    });
    console.log('── End dry run. Use --confirm to send for real. ────────\n');
    return;
  }

  // Live send
  console.log('── LIVE SEND ───────────────────────────────────────────\n');

  // Dynamically import twilio (must be installed: npm install twilio)
  let twilio;
  try {
    const { default: Twilio } = await import('twilio');
    twilio = Twilio(ACCOUNT_SID, AUTH_TOKEN);
  } catch {
    console.error(
      'Twilio SDK not found.\nInstall it first:\n  cd scripts && npm init -y && npm install twilio'
    );
    process.exit(1);
  }

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const msg = buildMessage(row);

    process.stdout.write(`[${i + 1}/${rows.length}] ${row.phone_e164}  ${row.household_label}… `);

    try {
      const result = await twilio.messages.create({
        body: msg,
        from: FROM_NUMBER,
        to:   row.phone_e164,
      });
      console.log(`✅ ${result.sid}`);
      sent++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
    }

    // Throttle ~1 msg/sec (Twilio free tier safe)
    if (i < rows.length - 1) await sleep(1100);
  }

  console.log(`\n── Done: ${sent} sent, ${failed} failed ─────────────────\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
