#!/usr/bin/env python3
import csv, os
from collections import defaultdict

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
seen = {}
with open(os.path.join(SCRIPTS_DIR, 'guests.csv')) as f:
    for row in csv.DictReader(f):
        h = row['household_label'].strip()
        p = row['phone_e164'].strip()
        s = row['source_list'].strip()
        key = (h, p) if p else (h, '')
        seen[key] = s

lines = []
for (h, p), s in sorted(seen.items()):
    safe_h = h.replace("'", "''")
    safe_s = s.replace("'", "''")
    if p:
        safe_p = p.replace("'", "''")
        lines.append(f"UPDATE invites SET source_list = '{safe_s}' WHERE household_label = '{safe_h}' AND phone_e164 = '{safe_p}';")
    else:
        lines.append(f"UPDATE invites SET source_list = '{safe_s}' WHERE household_label = '{safe_h}';")

print('\n'.join(lines))
