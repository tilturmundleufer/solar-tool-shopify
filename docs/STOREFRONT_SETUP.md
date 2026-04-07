# Shopify Custom App + Storefront API (Solar-Tool Headless)

## 1. App im Shopify Admin

1. **Einstellungen → Apps und Vertriebskanäle → App-Entwicklung → App erstellen**
2. **Custom App** (oder Development Store App)
3. Unter **Konfiguration**:
   - **Storefront API** aktivieren
   - Berechtigungen: mindestens **unauthenticated_read** für Cart und Checkout-relevante Ressourcen (je nach Shopify-Version: `unauthenticated_read_product_listings`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts` – **genaue Scopes** in der aktuellen Admin-Oberfläche wählen; für Cart: `unauthenticated_read_cart`, `unauthenticated_write_cart` wo verfügbar)

4. **Storefront API-Token** erstellen und kopieren (nur einmal sichtbar).

## 2. Umgebungsvariablen (Vercel)

- `SHOPIFY_STORE_DOMAIN` – z. B. `mein-shop.myshopify.com`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` – der aus Schritt 1
- `SHOPIFY_STOREFRONT_API_VERSION` – z. B. `2024-10` (mit der GraphQL-Abfrage in `shopifyStorefrontCart.js` testen)

Lokal: `.env` aus `.env.example` kopieren und `vercel dev` nutzen.

## 3. Produktvarianten

In [script-new.js](../script-new.js) `SHOPIFY_VARIANT_MAP` mit **numerischen Variant-IDs** aus dem Shopify-Admin (oder GID – wird in `shopifyStorefrontCart.js` normalisiert). Platzhalter `PLACEHOLDER_*` entfernen.

## 4. Proxy-URL

Standard: `window.SOLAR_STOREFRONT_PROXY = '/api/shopify-storefront'` (Vercel).

Anderes Backend: Proxy-URL setzen, die POST `{ query, variables }` an `https://{shop}/api/{version}/graphql.json` mit Header `X-Shopify-Storefront-Access-Token` weiterleitet.

## 5. Test

- Konfigurator öffnen → Artikel in den Warenkorb → in der Shopify-Admin-**Vorschau** des Warenkorbs prüfen oder Checkout-URL aus der API-Antwort (`cart.checkoutUrl`).
