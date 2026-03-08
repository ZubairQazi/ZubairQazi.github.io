#!/usr/bin/env node
/**
 * export_master.mjs
 * Produces master_list.csv — one row per phone/invite with:
 *   household_label, phone_e164, guests, source_list, rsvp_code, rsvp_link, sms_text
 */

import { createReadStream, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

async function readCsv(filePath) {
  const rows = [];
  const rl = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });
  let headers = null;
  for await (const line of rl) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    if (!headers) { headers = cols; continue; }
    const row = {};
    headers.forEach((h, i) => row[h] = cols[i] ?? '');
    rows.push(row);
  }
  return rows;
}

function csvField(val) {
  const s = String(val ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"` : s;
}

function buildMessage(rsvpLink, token) {
  return (
    `بِسْمِ ٱللَّٰهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\n` +
    `The Usman and Qazi families request the pleasure of your company at the wedding festivities of\n\n` +
    `Maryam Usman and Zubair Qazi\n\n` +
    `In San Diego, California\n\n` +
    `Please RSVP by March 30th. (RSVP Code: ${token})\n` +
    `To RSVP, please visit: ${rsvpLink}\n\n` +
    `We look forward to celebrating these special moments with you. ♡`
  );
}

async function main() {
  const guestsPath = path.join(__dirname, 'guests.csv');
  const smsPath    = path.join(__dirname, 'sms.csv');
  const outPath    = path.join(__dirname, 'master_list.csv');

  const guestRows = await readCsv(guestsPath);
  const smsRows   = await readCsv(smsPath);

  // Build phone → sms row map
  const smsMap = new Map();
  for (const r of smsRows) {
    smsMap.set(r.phone_e164, r);
  }

  // Group guests by phone
  const byPhone = new Map();
  for (const g of guestRows) {
    const phone = g.phone_e164;
    if (!phone) continue;
    if (!byPhone.has(phone)) {
      byPhone.set(phone, { household_label: g.household_label, phone_e164: phone, source_list: g.source_list, guests: [] });
    }
    byPhone.get(phone).guests.push(g.guest_name);
  }

  const headers = ['household_label', 'phone_e164', 'guests', 'source_list', 'rsvp_code', 'rsvp_link', 'sms_text'];
  const lines = [headers.join(',')];

  for (const [phone, hh] of byPhone) {
    const sms = smsMap.get(phone);
    const rsvpLink = sms?.rsvp_link ?? '';
    const token    = rsvpLink ? (new URL(rsvpLink).searchParams.get('t') ?? '') : '';
    const smsText  = rsvpLink ? buildMessage(rsvpLink, token) : '';

    lines.push([
      csvField(hh.household_label),
      csvField(hh.phone_e164),
      csvField(hh.guests.join(', ')),
      csvField(hh.source_list),
      csvField(token),
      csvField(rsvpLink),
      csvField(smsText),
    ].join(','));
  }

  writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
  console.log(`✅  Written ${lines.length - 1} rows to ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
