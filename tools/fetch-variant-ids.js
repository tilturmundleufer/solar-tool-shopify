#!/usr/bin/env node
// .env automatisch laden (synchron, kein dotenv nötig)
const fs   = require('fs');
const path = require('path');
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (k && !(k in process.env)) process.env[k] = v;
  }
}
/**
 * fetch-variant-ids.js
 * ────────────────────────────────────────────────────────────────
 * Holt alle Shopify Variant-IDs und gibt die fertige
 * SHOPIFY_VARIANT_MAP für script-new.js aus.
 *
 * NEU ab 2026: Shopify gibt keine Tokens mehr im UI aus.
 * Stattdessen: Client ID + Secret → Access Token (Client Credentials Grant).
 *
 * Voraussetzung:
 *   1. .env mit SHOPIFY_STORE_DOMAIN, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET
 *   2. App muss auf dem Shop installiert sein (s.u.)
 *   3. Node >= 18
 *
 * Ausführen:
 *   node tools/fetch-variant-ids.js
 * ────────────────────────────────────────────────────────────────
 */

const STORE_DOMAIN    = process.env.SHOPIFY_STORE_DOMAIN    || 'DEIN-SHOP.myshopify.com';
const CLIENT_ID       = process.env.SHOPIFY_CLIENT_ID       || '';
const CLIENT_SECRET   = process.env.SHOPIFY_CLIENT_SECRET   || '';
const API_VERSION     = process.env.SHOPIFY_API_VERSION     || '2025-01';

// Mapping: Tool-Key → Shopify Produkt-Handle
const PRODUCT_HANDLE_MAP = {
  Solarmodul:                    'ulica-solar-black-jade-flow-450-w',
  UlicaSolarBlackJadeFlow:       'ulica-solar-black-jade-flow-500-w',
  SolarmodulPalette:             '36x-ulica-solar-black-jade-flow-450-w-palette',
  UlicaSolarBlackJadeFlowPalette:'36x-ulica-solar-black-jade-flow-500-w-palette',
  Endklemmen:                    'endklemmen-50-stuck',
  Schrauben:                     'schraube-m10x25-100-stuck-inkl-muttern',
  Dachhaken:                     'dachhaken-3-fach-verstellbar-20-stuck',
  Mittelklemmen:                 'mittelklemmen-50-stuck',
  Endkappen:                     'endkappen-50-stuck',
  Schienenverbinder:             'schienenverbinder-50-stuck',
  Schiene_240_cm:                'schiene-240cm',
  Schiene_360_cm:                'schiene-360-cm',
  MC4_Stecker:                   'mc4-stecker-50-steckerpaare',
  Solarkabel:                    'solarkabel-100m',
  Holzunterleger:                'unterlegholz-fur-dachhacken-50-stuck',
  Ringkabelschuhe:               'ringkabelschuhe-100-stuck',
  Erdungsband:                   'erdungsband-6m',
  Tellerkopfschraube:            'tellerkopfschraube-8x100-100-stuck',
  HuaweiOpti:                    'huawei-smart-pv-optimierer-600w',
  BRCOpti:                       'brc-m600m-optimierer',
};

// ── Schritt 1: Access Token via Client Credentials Grant holen ───
async function getAccessToken() {
  const url = `https://${STORE_DOMAIN}/admin/oauth/access_token`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type:    'client_credentials',
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(
      `Token-Exchange fehlgeschlagen (${res.status}): ${JSON.stringify(json)}\n` +
      `  → Prüfe: Ist die App auf dem Shop installiert? Sind Client ID + Secret korrekt?`
    );
  }
  return json.access_token;
}

// ── Schritt 2: Produkt per Handle via Admin REST API holen ───────
async function fetchVariantId(handle, adminToken) {
  const url = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/products.json?handle=${handle}&fields=id,title,variants`;
  const res = await fetch(url, {
    headers: { 'X-Shopify-Access-Token': adminToken },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const product = json?.products?.[0];
  if (!product) return null;
  const variant = product.variants?.[0];
  return {
    numericId: String(variant?.id),
    title:     product.title,
    sku:       variant?.sku,
    price:     variant?.price,
  };
}

async function main() {
  // Validierung
  if (STORE_DOMAIN.includes('DEIN-SHOP')) {
    console.error('❌  SHOPIFY_STORE_DOMAIN fehlt in .env\n'); process.exit(1);
  }
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error(`❌  SHOPIFY_CLIENT_ID oder SHOPIFY_CLIENT_SECRET fehlt in .env!

  Beide findest du im Shopify Partners Dashboard:
    dev.shopify.com/dashboard → Apps → Solar Konfigurator → Settings → Credentials
    → Client ID  kopieren
    → Secret     kopieren (Auge-Icon klicken zum Anzeigen)

  Wichtig: Die App muss auf deinem Shop installiert sein!
  → Im Partners Dashboard: Apps → Solar Konfigurator → "Test on development store"
    oder direkt: https://DEIN-SHOP.myshopify.com/admin/oauth/authorize?client_id=${CLIENT_ID}&scope=read_products&redirect_uri=https://shopify.dev/apps/default-app-home/api/auth
`);
    process.exit(1);
  }

  console.log(`🔑  Hole Access Token via Client Credentials Grant ...`);
  let adminToken;
  try {
    adminToken = await getAccessToken();
    console.log(`✅  Access Token erhalten\n`);
  } catch (err) {
    console.error(`\n❌  ${err.message}\n`);
    process.exit(1);
  }

  console.log(`🔍  Hole Variant-IDs von ${STORE_DOMAIN} ...\n`);

  const results = {};
  const errors  = [];

  for (const [key, handle] of Object.entries(PRODUCT_HANDLE_MAP)) {
    try {
      process.stdout.write(`  ⏳  ${key.padEnd(42)} `);
      const data = await fetchVariantId(handle, adminToken);
      if (!data) {
        console.log(`❌  Nicht gefunden (handle: ${handle})`);
        errors.push({ key, handle, error: 'Produkt nicht gefunden' });
      } else {
        console.log(`✅  ${data.numericId}   (${data.title}, ${data.price}€)`);
        results[key] = data.numericId;
      }
    } catch (err) {
      console.log(`❌  ${err.message}`);
      errors.push({ key, handle, error: err.message });
    }
  }

  // ── Fertige Map ausgeben ──────────────────────────────────────
  const v = (key) => results[key] || 'FEHLER_NICHT_GEFUNDEN';
  console.log('\n' + '═'.repeat(68));
  console.log('📋  SHOPIFY_VARIANT_MAP – in script-new.js ~Zeile 318 einfügen:');
  console.log('═'.repeat(68));
  console.log(`
    const SHOPIFY_VARIANT_MAP = {
      // ── Module und Paletten ───────────────────────────────────
      Solarmodul:                    '${v('Solarmodul')}',
      UlicaSolarBlackJadeFlow:       '${v('UlicaSolarBlackJadeFlow')}',
      SolarmodulPalette:             '${v('SolarmodulPalette')}',
      UlicaSolarBlackJadeFlowPalette:'${v('UlicaSolarBlackJadeFlowPalette')}',
      // ── Montagesystem ─────────────────────────────────────────
      Endklemmen:                    '${v('Endklemmen')}',
      Schrauben:                     '${v('Schrauben')}',
      Dachhaken:                     '${v('Dachhaken')}',
      Mittelklemmen:                 '${v('Mittelklemmen')}',
      Endkappen:                     '${v('Endkappen')}',
      Schienenverbinder:             '${v('Schienenverbinder')}',
      Schiene_240_cm:                '${v('Schiene_240_cm')}',
      Schiene_360_cm:                '${v('Schiene_360_cm')}',
      // ── Zusatzprodukte ────────────────────────────────────────
      MC4_Stecker:                   '${v('MC4_Stecker')}',
      Solarkabel:                    '${v('Solarkabel')}',
      Holzunterleger:                '${v('Holzunterleger')}',
      Ringkabelschuhe:               '${v('Ringkabelschuhe')}',
      Erdungsband:                   '${v('Erdungsband')}',
      Tellerkopfschraube:            '${v('Tellerkopfschraube')}',
      // ── Optimierer ────────────────────────────────────────────
      HuaweiOpti:                    '${v('HuaweiOpti')}',
      BRCOpti:                       '${v('BRCOpti')}',
    };`);

  if (errors.length > 0) {
    console.log('\n⚠️   Nicht gefunden:', errors.map(e => e.key).join(', '));
  } else {
    console.log('\n🎉  Alle 20 IDs gefunden! Nächste Schritte:');
    console.log('    1. Obige Map in script-new.js eintragen');
    console.log('    2. npm run minify');
    console.log('    3. vercel --prod');
  }
}

main().catch(err => { console.error('💥', err.message); process.exit(1); });
