#!/usr/bin/env node

import { stringify } from "csv-stringify";

const kuttUrl = process.env.KUTT_URL?.replace(/\/$/, '')
const kuttToken = process.env.KUTT_TOKEN
const migrateAll = process.env.MIGRATE_ALL?.toLocaleLowerCase() === 'true'

if (!kuttUrl || !kuttToken) {
  process.stderr.write('\x1b[31mPlease set KUTT_URL and KUTT_TOKEN.\x1b[0m\n');
  process.stderr.write(`
Migrate your short URLs from kutt to snapp.

You can set KUTT_URL and KUTT_TOKEN in your environment.
And you can set MIGRATE_ALL=true to migrate all short URLs (ADMIN only).

Example:
KUTT_URL=https://kutt.it \\
KUTT_TOKEN=your-kutt-token \\
MIGRATE_ALL=true \\
npx kutt-to-snapp > kutt.csv


    `)
  process.exit(1);
}

if (await fetch(`${kuttUrl}/api/v2/health`).then(res => res.ok)) {
  process.stderr.write('\x1b[32mkutt is healthy\x1b[0m\n');
} else {
  process.stderr.write(`\x1b[31mkutt is not healthy\x1b[0m, please check kutt url. (${kuttUrl}/api/v2/health)\n`);
  process.exit(1);
}

const stringifier = stringify({
  columns: ['shortcode', 'original_url', 'secret', 'max_usages', 'notes', 'expiration', 'disabled', 'hit', 'created'],
  delimiter: ',',
  header: true,
})

stringifier.pipe(process.stdout);

let offset = 0;

while (true) {
  const { data } = await fetch(`${kuttUrl}/api/v2/links?all=${migrateAll.toString()}&skip=${offset}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': kuttToken,
    },
  }).then(res => res.json())

  if (data.length === 0) {
    break;
  }

  for (const [idx, item] of data.entries()) {
    const {
      id,
      address,
      banned,
      created_at,
      updated_at,
      password,
      description,
      expire_in,
      target,
      visit_count,
      domain,
      link
    } = item;

    const snapp = {
      "shortcode": address,
      "original_url": target,
      "secret": password === false ? null : password, // Just to be strong
      "max_usages": -1,
      "notes": description,
      "expiration": expire_in,
      "disabled": banned,
      "hit": visit_count,
      "created": created_at,
    };

    stringifier.write([
      snapp.shortcode,
      snapp.original_url,
      snapp.secret,
      snapp.max_usages,
      snapp.notes,
      snapp.expiration,
      snapp.disabled,
      snapp.hit,
      snapp.created
    ]);

    process.stderr.write(`\r${offset + idx + 1} / ${offset + data.length}`);
  }

  offset += data.length;
};

stringifier.end();

process.stderr.write('\n');

process.stderr.write(`\x1b[32mDone.\x1b[0m ${offset} urls migrated\n`);

process.exit(0);
