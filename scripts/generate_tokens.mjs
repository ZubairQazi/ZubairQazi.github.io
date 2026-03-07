#!/usr/bin/env node
/**
 * generate_tokens.mjs
 * ────────────────────────────────────────────────────────────────
 * Reads a guest CSV and produces:
 *   scripts/import.csv  — safe to import into D1 (contains token_hash, no raw token)
 *   scripts/sms.csv     — GITIGNORED, contains phone + raw RSVP link for Twilio
 *
 * Input CSV format (one row per guest):
 *   household_label,phone_e164,guest_name
 *   "Smith Family",+15551234567,Alice Smith
 *   "Smith Family",+15551234567,Bob Smith
 *   "Jones Family",+15559876543,Carol Jones
 *
 * Multiple rows with the same phone_e164 are grouped into ONE household invite.
 *
 * Usage:
 *   node scripts/generate_tokens.mjs --input=scripts/guests.csv --base-url=https://yourdomain.github.io
 *
 * ⚠️  sms.csv contains raw tokens → DO NOT COMMIT (already in .gitignore)
 */

import { createHash, randomBytes } from 'node:crypto';
import { createReadStream, writeFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { argv } from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Parse CLI args ──────────────────────────────────────────────────
function parseArgs() {
  const args = {};
  argv.slice(2).forEach(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    args[k] = v;
  });
  return args;
}

const { input, 'base-url': baseUrl = 'https://YOURUSERNAME.github.io' } = parseArgs();

if (!input) {
  console.error('Usage: node generate_tokens.mjs --input=scripts/guests.csv --base-url=https://...');
  process.exit(1);
}

const inputPath = path.resolve(__dirname, '..', input);
if (!existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

// ── Token helpers ────────────────────────────────────────────────────

/** Generate a 20-byte cryptographically random token encoded as base64url. */
function generateToken() {
  return randomBytes(20)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** SHA-256 hex of a string. */
function sha256Hex(input) {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

// ── CSV parsing (manual, no deps) ───────────────────────────────────

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

// ── Read input CSV ────────────────────────────────────────────────────

async function readGuestCsv(filePath) {
  const rows = [];
  const rl = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });
  let isFirst = true;

  for await (const line of rl) {
    if (!line.trim()) continue;
    if (isFirst) { isFirst = false; continue; } // skip header

    const [household_label, phone_e164, guest_name, events_raw, source_list] = parseCsvLine(line);
    if (!household_label || !phone_e164 || !guest_name) {
      console.warn(`  ⚠️  Skipping malformed row: ${line}`);
      continue;
    }
    // Normalise events: pipe-sep in CSV → comma-sep internally; default to all three
    const events = (events_raw ?? '')
      .split('|')
      .map(s => s.trim())
      .filter(s => ['mehndi', 'shaadi', 'walima'].includes(s))
      .join(',') || 'mehndi,shaadi,walima';
    rows.push({ household_label, phone_e164, guest_name, events, source_list: (source_list ?? '').trim() });
  }
  return rows;
}

// ── Group guests by phone (one invite per household) ─────────────────

function groupByPhone(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = row.phone_e164;
    if (!map.has(key)) {
      map.set(key, {
        household_label: row.household_label,
        phone_e164:      row.phone_e164,
        source_list:     row.source_list,
        guests:          [],  // [{ name, events }]
      });
    }
    map.get(key).guests.push({ name: row.guest_name, events: row.events });
  }
  return Array.from(map.values());
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n📋  Reading guests from: ${inputPath}`);
  const rows = await readGuestCsv(inputPath);
  if (rows.length === 0) {
    console.error('No valid rows found in input CSV.');
    process.exit(1);
  }

  const households = groupByPhone(rows);
  console.log(`👨‍👩‍👧  ${rows.length} guests → ${households.length} households\n`);

  // ── Generate tokens for each household
  const importRows = []; // for D1
  const smsRows    = []; // for Twilio (GITIGNORED)

  for (const hh of households) {
    const rawToken  = generateToken();
    const tokenHash = sha256Hex(rawToken);
    const rsvpLink  = `${baseUrl.replace(/\/$/, '')}/rsvp/?t=${rawToken}`;

    importRows.push({
      token_hash:      tokenHash,
      household_label: hh.household_label,
      phone_e164:      hh.phone_e164,
      source_list:     hh.source_list,
      // Encode as "Name:events1,events2|Name2:events3" for import_to_d1.mjs
      guests:          hh.guests.map(g => `${g.name}:${g.events}`).join('|'),
    });

    smsRows.push({
      phone_e164:      hh.phone_e164,
      household_label: hh.household_label,
      rsvp_link:       rsvpLink,
    });

    // Log to console (no raw token here)
    console.log(`  ✅  ${hh.household_label.padEnd(30)} ${hh.phone_e164}  (${hh.guests.length} guest${hh.guests.length > 1 ? 's' : ''})`);
  }

  // ── Write import.csv (safe — no raw tokens)
  const importPath = path.join(__dirname, 'import.csv');
  const importHeader = 'token_hash,household_label,phone_e164,source_list,guests';
  const importLines  = importRows.map(r =>
    [r.token_hash, csvField(r.household_label), r.phone_e164, csvField(r.source_list), csvField(r.guests)].join(',')
  );
  writeFileSync(importPath, [importHeader, ...importLines].join('\n') + '\n', 'utf8');
  console.log(`\n💾  import.csv written → ${importPath}`);

  // ── Write sms.csv (GITIGNORED)
  const smsPath   = path.join(__dirname, 'sms.csv');
  const smsHeader = 'phone_e164,household_label,rsvp_link';
  const smsLines  = smsRows.map(r =>
    [r.phone_e164, csvField(r.household_label), r.rsvp_link].join(',')
  );
  writeFileSync(smsPath, [smsHeader, ...smsLines].join('\n') + '\n', 'utf8');
  console.log(`📱  sms.csv written   → ${smsPath}  ⚠️  GITIGNORED — do not commit!\n`);

  console.log('Next steps:');
  console.log('  1. node scripts/import_to_d1.mjs');
  console.log('  2. node scripts/send_sms_twilio.mjs --dry-run');
  console.log('  3. node scripts/send_sms_twilio.mjs --confirm\n');
}

/** Wrap a CSV field in double quotes, escaping internal quotes. */
function csvField(s) {
  return `"${String(s).replace(/"/g, '""')}"`;
}

main().catch(err => { console.error(err); process.exit(1); });
