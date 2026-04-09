# Shopify-Warenkorb (Solar-Tool) – Cart-Permalink

Der Konfigurator befüllt den **Online-Store-Warenkorb** über einen **Cart-Permalink** (kein Storefront-API-Proxy, kein separates Headless-Cart-`localStorage`).

Offizielle Doku: [Create cart permalinks](https://shopify.dev/docs/apps/checkout/cart-permalinks/create)

## Was ihr konfigurieren müsst

### 1. `window.SOLAR_SHOP_ORIGIN` (Pflicht)

- **Origin ohne** abschließenden Slash, z. B. `https://mein-shop.myshopify.com` oder die **Primary Domain** des Shops.
- In **[index.html](../index.html)** den Platzhalter `https://DEIN-SHOP.myshopify.com` ersetzen.
- Muss mit der Domain übereinstimmen, unter der euer **Theme-Warenkorb** und `/cart` für Kunden funktionieren.

### 2. Varianten-IDs in `script-new.js`

In [script-new.js](../script-new.js) die Map **`SHOPIFY_VARIANT_MAP`** mit **numerischen** Shopify-Variant-IDs füllen (keine `PLACEHOLDER_*`).

Hilfsskript: `tools/fetch-variant-ids.js` (Admin API, siehe [SHOPIFY_SETUP_ANLEITUNG.md](SHOPIFY_SETUP_ANLEITUNG.md)).

### 3. Query-Parameter (automatisch)

Das Tool hängt u. a. an:

- `storefront=true` – Ziel ist der **Theme-Warenkorb**, nicht direkt der Checkout.
- `note=…` – Kurztext mit Stücklisten-Übersicht (Solar-Konfigurator).
- `attributes[customer_type]=private|business` – wenn im Tool ein Kundentyp gewählt wurde.

## Lokale Entwicklung

- Statischer Serve (`npm run serve` / `npx serve`) reicht für den Warenkorb **ohne** Server-API zum Cart.
- **`SOLAR_SHOP_ORIGIN`** muss eine **erreichbare** Shop-URL sein; bei passwortgeschütztem Shop ggf. erst nach Passwort-Eingabe testen.

## Optional: Storefront-Tokens nur für Hilfs-Tools

Ein **Headless-Storefront-Token** wird für den **Warenkorb dieses Projekts nicht mehr** benötigt. Optional weiterhin für `tools/create-storefront-token.js` oder andere Experimente – siehe [.env.example](../.env.example).

## Test

1. `SOLAR_SHOP_ORIGIN` und `SHOPIFY_VARIANT_MAP` setzen.
2. Konfigurator öffnen → „In den Warenkorb“.
3. Browser sollte auf **`/cart`** des Shops wechseln; Zeilen und Notiz prüfen.
