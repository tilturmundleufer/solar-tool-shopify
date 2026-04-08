#!/usr/bin/env node
/**
 * create-storefront-token.js
 * ─────────────────────────────────────────────────────────────
 * Erstellt einen Shopify Storefront API Access Token über die
 * Admin API (Client Credentials Grant) und gibt ihn aus.
 *
 * Ausführen:
 *   node tools/create-storefront-token.js
 * ─────────────────────────────────────────────────────────────
 */

const fs   = require('fs');
const path = require('path');

// .env laden
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('='); if (i < 0) continue;
    const k = t.slice(0, i).trim(), v = t.slice(i + 1).trim();
    if (k && !(k in process.env)) process.env[k] = v;
  }
}

const STORE_DOMAIN  = process.env.SHOPIFY_STORE_DOMAIN;
const CLIENT_ID     = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const API_VERSION   = process.env.SHOPIFY_API_VERSION || '2025-01';

async function getAdminToken() {
  const res = await fetch(`https://${STORE_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: 'client_credentials' }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error('Admin Token fehlgeschlagen: ' + JSON.stringify(json));
  return json.access_token;
}

async function main() {
  console.log('🔑  Hole Admin Access Token ...');
  const adminToken = await getAdminToken();
  console.log('✅  Admin Token erhalten\n');

  // Vorhandene Storefront Tokens abrufen
  console.log('🔍  Prüfe vorhandene Storefront Tokens ...');
  const listRes = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/storefront_access_tokens.json`, {
    headers: { 'X-Shopify-Access-Token': adminToken },
  });
  const listJson = await listRes.json();
  const existing = listJson?.storefront_access_tokens || [];

  if (existing.length > 0) {
    console.log(`\n✅  Es gibt bereits ${existing.length} Storefront Token(s):\n`);
    for (const t of existing) {
      console.log(`  Titel:        ${t.title}`);
      console.log(`  Access Token: ${t.access_token}`);
      console.log(`  Erstellt:     ${t.created_at}`);
      console.log(`  Scopes:       ${t.access_scope}`);
      console.log('');
    }
    console.log('👉  Kopiere den "Access Token" oben und trage ihn in .env ein:');
    console.log(`    SHOPIFY_STOREFRONT_ACCESS_TOKEN=${existing[0].access_token}\n`);
    return;
  }

  // Neuen Token erstellen
  console.log('➕  Kein Token vorhanden – erstelle neuen Storefront Token ...\n');
  const createRes = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/storefront_access_tokens.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': adminToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      storefront_access_token: { title: 'Solar Konfigurator Vercel' }
    }),
  });
  const createJson = await createRes.json();
  const token = createJson?.storefront_access_token;

  if (!token) {
    console.error('❌  Fehler beim Erstellen:', JSON.stringify(createJson, null, 2));
    process.exit(1);
  }

  console.log('🎉  Storefront Token erfolgreich erstellt!\n');
  console.log(`  Access Token: ${token.access_token}`);
  console.log(`  Titel:        ${token.title}`);
  console.log('');
  console.log('👉  Trage diesen Token in deine .env und in Vercel ein:');
  console.log(`    SHOPIFY_STOREFRONT_ACCESS_TOKEN=${token.access_token}`);
}

main().catch(err => { console.error('💥', err.message); process.exit(1); });
