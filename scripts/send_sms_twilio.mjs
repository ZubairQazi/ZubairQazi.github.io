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
 *     TWILIO_FROM=+15550001234                          # Used if no Messaging Service
 *     TWILIO_MESSAGING_SERVICE_SID=MGxxx               # Optional: enables RCS + auto SMS fallback
 *
 * Usage:
 *   node scripts/send_sms_twilio.mjs --dry-run                        # Print messages, don't send
 *   node scripts/send_sms_twilio.mjs --dry-run --to=+12223334444      # Preview one number
 *   node scripts/send_sms_twilio.mjs --confirm --to=+12223334444      # Test send to one number
 *   node scripts/send_sms_twilio.mjs --confirm                        # Send to everyone
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

// --to=+12223334444,+15556667777  (comma-separated, for test sends)
const toArg = args.find(a => a.startsWith('--to='));
const filterTo = toArg
  ? new Set(toArg.slice(5).split(',').map(n => n.trim()).filter(Boolean))
  : null;

if (!isDryRun && !isConfirm) {
  console.error('Usage:\n  node send_sms_twilio.mjs --dry-run              (preview all)\n  node send_sms_twilio.mjs --dry-run --to=+1xxx   (preview one)\n  node send_sms_twilio.mjs --confirm --to=+1xxx   (test send)\n  node send_sms_twilio.mjs --confirm              (send all)');
  process.exit(1);
}

// ── Validate Twilio env vars ─────────────────────────────────────────
const ACCOUNT_SID          = env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN           = env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER          = env.TWILIO_FROM;
const MESSAGING_SERVICE_SID = env.TWILIO_MESSAGING_SERVICE_SID; // optional — enables RCS

if (!isDryRun) {
  if (!ACCOUNT_SID || !AUTH_TOKEN || (!FROM_NUMBER && !MESSAGING_SERVICE_SID)) {
    console.error(
      'Missing required env vars:\n' +
      '  TWILIO_ACCOUNT_SID\n' +
      '  TWILIO_AUTH_TOKEN\n' +
      '  TWILIO_FROM  (or TWILIO_MESSAGING_SERVICE_SID for RCS)\n' +
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
  const token = new URL(row.rsvp_link).searchParams.get('t') ?? row.rsvp_link;
  return (
    `بِسْمِ ٱللَّٰهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\n` +
    `The Usman and Qazi families request the pleasure of your company at the wedding festivities of\n\n` +
    `Maryam Usman and Zubair Qazi\n\n` +
    `In San Diego, California\n\n` +
    `Please RSVP by March 30th. (RSVP Code: ${token})\n` +
    `To RSVP, please visit zubairqazi.com/maryam/ and enter your RSVP code.\n\n` +
    `We look forward to celebrating these special moments with you. ♡`
  );
}

// ── Throttle helper ──────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  let rows = await readSmsCsv();
  if (rows.length === 0) {
    console.error('No rows in sms.csv. Run generate_tokens.mjs first.');
    process.exit(1);
  }

  // Apply --to filter if provided
  if (filterTo) {
    const all = rows.length;
    rows = rows.filter(r => filterTo.has(r.phone_e164));
    if (rows.length === 0) {
      console.error(`--to filter matched 0 of ${all} numbers. Check the phone number(s) match sms.csv exactly (E.164 format, e.g. +12223334444).`);
      process.exit(1);
    }
    console.log(`\n🎯  Filtered to ${rows.length} of ${all} recipients\n`);
  }

  const mode = MESSAGING_SERVICE_SID ? 'RCS (via Messaging Service, SMS fallback)' : 'SMS';
  console.log(`\n📱  ${rows.length} messages to send  [${mode}]\n`);

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
      const msgParams = {
        body: msg,
        to:   row.phone_e164,
        ...(MESSAGING_SERVICE_SID
          ? { messagingServiceSid: MESSAGING_SERVICE_SID }
          : { from: FROM_NUMBER }),
      };
      const result = await twilio.messages.create(msgParams);
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
