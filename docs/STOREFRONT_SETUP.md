# Shopify-Warenkorb (Solar-Tool) – Cart-Permalink

Der Konfigurator befüllt den **Online-Store-Warenkorb** über einen **Cart-Permalink** (kein Storefront-API-Proxy, kein separates Headless-Cart-`localStorage`).

Offizielle Doku: [Create cart permalinks](https://shopify.dev/docs/apps/checkout/cart-permalinks/create)

## Was ihr konfigurieren müsst

### 1. `window.SOLAR_SHOP_ORIGIN` (Pflicht)

- **Origin ohne** abschließenden Slash, z. B. `https://mein-shop.myshopify.com` oder die **Primary Domain** des Shops.
- In **[index.html](../index.html)** den Platzhalter `https://DEIN-SHOP.myshopify.com` ersetzen.
- Muss mit der Domain übereinstimmen, unter der euer **Theme-Warenkorb** und `/cart` für Kunden funktionieren.

### 2. Varianten-IDs in `script-new.js`

In [script-new.js](../script-new.js) die Map **`SHOPIFY_VARIANT_MAP`** mit **numerischen** Shopify-Variant-IDs füllen (keine `PLACEHOLDER_*`). Pro Tool-Produkt gibt es je eine ID für Privat- und Firmenkunden:

```js
Solarmodul: segmentVariant('PRIVATE_VARIANT_ID', 'BUSINESS_VARIANT_ID')
```

Der erste Wert wird für `private`, der zweite für `business` verwendet. Wenn beide Werte identisch sind, landen beide Segmente im selben Shopify-Artikel.

Hilfsskript: `tools/fetch-variant-ids.js` (Admin API, siehe [SHOPIFY_SETUP_ANLEITUNG.md](SHOPIFY_SETUP_ANLEITUNG.md)).

### 3. VAT-Segment (automatisch)

Im Shopify-iframe kommt der Kundentyp nicht mehr aus einem eigenen Solartool-Switch, sondern aus der Theme-API:

- Primär: `window.customerVatContext.getSegment()` auf der Shopify-Parent-Seite, per `postMessage` an das iframe gespiegelt.
- Fallbacks: same-origin `customerVatContext`, danach `localStorage.uk_vat_customer_segment`, danach der alte `solarTool_customerType`, danach `private`.

Damit gelten dieselben Regeln wie im Theme: Firmenkunden mit gesetzter Company werden immer `business`; eingeloggte Kunden ohne Firma bleiben `private`.

### 4. Query-Parameter (automatisch)

Das Tool hängt u. a. an:

- `storefront=true` – Ziel ist der **Theme-Warenkorb**, nicht direkt der Checkout.
- `note=…` – Kurztext mit Stücklisten-Übersicht (Solar-Konfigurator).
- `attributes[customer_type]=private|business` – Segment aus der Theme-Logik.
- `properties=…` – Base64-URL-kodierte Line-Item-Properties für die erste Permalink-Zeile, u. a. `_vat_segment`, `_vat_tags`, `_productKey`.

Shopify unterstützt Cart-Permalink-Properties nur für das erste Produkt. Deshalb wählt das Tool die korrekte Privat-/Gewerbe-Ware über die Variant-ID; die Properties dienen als zusätzliche Theme-/Cart-Information.

## Lokale Entwicklung

- Statischer Serve (`npm run serve` / `npx serve`) reicht für den Warenkorb **ohne** Server-API zum Cart.
- **`SOLAR_SHOP_ORIGIN`** muss eine **erreichbare** Shop-URL sein; bei passwortgeschütztem Shop ggf. erst nach Passwort-Eingabe testen.

## Optional: Storefront-Tokens nur für Hilfs-Tools

Ein **Headless-Storefront-Token** wird für den **Warenkorb dieses Projekts nicht mehr** benötigt. Optional weiterhin für `tools/create-storefront-token.js` oder andere Experimente – siehe [.env.example](../.env.example).

## Test

1. `SOLAR_SHOP_ORIGIN` und `SHOPIFY_VARIANT_MAP` setzen.
2. Konfigurator öffnen → „In den Warenkorb“.
3. Im Theme zwischen Privat/Gewerbe wechseln und prüfen, dass der Warenkorb die jeweilige Variant-ID erhält.
4. Browser sollte auf **`/cart`** des Shops wechseln; Zeilen, erste Line-Item-Properties und Notiz prüfen.
