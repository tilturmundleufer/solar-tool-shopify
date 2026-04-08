# Shopify Storefront API (Solar-Tool) – nachhaltige Einrichtung

Der Konfigurator spricht die Storefront API nur über **`api/shopify-storefront.js`** (Vercel) an. Tokens liegen **nur** in den Server-Umgebungsvariablen.

## Empfohlen: Headless-Kanal + privater Storefront-Token

Offiziell und für Custom Storefronts gedacht, unabhängig von der Abschaffung neuer „Legacy“-Custom-Apps ab 2026.

1. Im **Shopify Admin** den Vertriebskanal **[Headless](https://apps.shopify.com/headless)** installieren (App Store).
2. Im Kanal **Storefront anlegen** (oder bestehendes wählen).
3. Unter **Storefront API permissions** alle Scopes setzen, die ihr braucht, z. B.:
   - Produktlisten / Varianten
   - **Cart:** `unauthenticated_read_cart`, `unauthenticated_write_cart` (Bezeichnungen in der UI können leicht abweichen)
   - ggf. Checkout, falls ihr die älteren Checkout-Mutationen nutzt
4. Den **Private access token** kopieren und **nur serverseitig** verwenden (nie im Browser).

Referenz: [Getting started with the Storefront API](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started), [Storefront API authentication](https://shopify.dev/docs/api/usage/authentication#access-tokens-for-the-storefront-api).

## Umgebungsvariablen (Vercel / lokal)

| Variable | Beschreibung |
|----------|----------------|
| `SHOPIFY_STORE_DOMAIN` | z. B. `mein-shop.myshopify.com` (ohne `https://`) |
| **`SHOPIFY_STOREFRONT_PRIVATE_TOKEN`** | **Empfohlen:** privater Token aus dem Headless-Kanal |
| `SHOPIFY_STOREFRONT_API_VERSION` | z. B. `2025-01` oder `2024-10` (mit euren GraphQL-Mutationen testen) |
| `SOLAR_ALLOWED_ORIGIN` | Optional: erlaubte Browser-Origin für CORS (z. B. Shop-URL mit `https://`) |

Der Proxy setzt bei privatem Token automatisch:

- `Shopify-Storefront-Private-Token`
- `Shopify-Storefront-Buyer-IP` (aus `X-Forwarded-For` / `X-Real-IP` von Vercel)

## Alternative: Öffentlicher Storefront-Token (Legacy)

Falls ihr weiter einen **öffentlichen** Storefront-Access-Token nutzt (z. B. früher aus einer Custom App oder per Admin-Mutation `storefrontAccessTokenCreate`):

- Nur **`SHOPIFY_STOREFRONT_ACCESS_TOKEN`** setzen ( **`SHOPIFY_STOREFRONT_PRIVATE_TOKEN` leer lassen** ).
- Der Proxy verwendet dann `X-Shopify-Storefront-Access-Token`.

Siehe [storefrontAccessTokenCreate](https://shopify.dev/docs/api/admin-graphql/latest/mutations/storefrontAccessTokenCreate) (benötigt installierte App + Admin-Zugang, z. B. Client Credentials für die Admin API – [About client credentials](https://shopify.dev/docs/apps/build/authentication-authorization/client-secrets)).

## Lokale Entwicklung

1. `.env` oder `.env.local` aus [.env.example](../.env.example) befüllen (`SHOPIFY_STORE_DOMAIN`, privater oder öffentlicher Storefront-Token).
2. **`vercel dev`** im Projektroot ausführen (Vercel CLI installiert). So sind **`/api/shopify-storefront`** und die statischen Dateien unter derselben Origin erreichbar.
3. **Nicht** nur `npx serve` / reines statisches Hosting: Dann liefert `/api/shopify-storefront` **404** – der Warenkorb kann nicht befüllt werden.
4. **`SOLAR_ALLOWED_ORIGIN`**: Für lokale Tests die Origin eintragen, z. B. `http://localhost:3000` (Port wie bei `vercel dev`). Mehrere Origins **kommagetrennt**, z. B. `http://localhost:3000,https://dein-shop.myshopify.com`, sonst schlägt der **CORS-Preflight** fehl, wenn der Konfigurator von einer anderen Domain aus eingebunden ist.

### Konfigurator im Shopify-Theme (Online Store)

- `window.SOLAR_STOREFRONT_PROXY` darf **nicht** nur `/api/…` sein, wenn die Seite auf **eurer Shop-Domain** läuft – dort existiert euer Vercel-API-Route nicht. Stattdessen die **volle URL** setzen, z. B. `https://euer-projekt.vercel.app/api/shopify-storefront`.
- Dieselbe Origin (Shop-URL, ggf. `www`) muss in **`SOLAR_ALLOWED_ORIGIN`** (kommagetrennt) stehen.

### Hinweis: Headless-Warenkorb vs. Theme-Warenkorb

Die Storefront API legt einen **eigenen Cart** an (Checkout-URL). Der **Mini-Warenkorb im Theme** zeigt ihn **nicht automatisch**, solange ihr ihn nicht mit der Storefront-Cart-ID oder einem Redirect zu `checkoutUrl` verbindet. Zum Testen: nach erfolgreichem Hinzufügen in den **Netzwerk-Tab** schauen oder im Admin unter **Bestellungen / Warenkörbe** prüfen, je nach Setup.

## Varianten-IDs

In [script-new.js](../script-new.js) `SHOPIFY_VARIANT_MAP` mit numerischen Variant-IDs oder GIDs (Normalisierung in `shopifyStorefrontCart.js`). Platzhalter `PLACEHOLDER_*` entfernen.

## Proxy-URL im Frontend

Standard: `window.SOLAR_STOREFRONT_PROXY = '/api/shopify-storefront'`.

## Test

Konfigurator öffnen → Warenkorb befüllen → im Admin **Warenkörbe** prüfen oder `cart.checkoutUrl` aus der API testen.
