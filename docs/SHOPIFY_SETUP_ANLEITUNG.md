# Shopify-Einbindung – Schritt-für-Schritt

**Solar-Konfigurator → Shopify Shop (Theme-Warenkorb per Cart-Permalink)**

---

## Überblick

```
Kunde konfiguriert auf Vercel  →  „Warenkorb“  →  Weiterleitung zu
https://EURE-SHOP-DOMAIN/cart/...?storefront=true  →  Theme-Warenkorb
```

- **Kein** Storefront-GraphQL-Proxy mehr für den Warenkorb.
- **`window.SOLAR_SHOP_ORIGIN`** muss die Shop-Origin enthalten (siehe [index.html](../index.html)).
- Doku: [Shopify Cart permalinks](https://shopify.dev/docs/apps/checkout/cart-permalinks/create), [THEME_BRIDGE.md](THEME_BRIDGE.md), [STOREFRONT_SETUP.md](STOREFRONT_SETUP.md).

---

## Schritt 1 (von dir): `SOLAR_SHOP_ORIGIN` + Varianten

### Shop-URL

In [index.html](../index.html) `window.SOLAR_SHOP_ORIGIN` auf eure echte Shop-Origin setzen (ohne trailing slash), z. B.:

- `https://dein-shop.myshopify.com`, oder
- eure **Primary Domain**, wenn der Online Store dort läuft.

### Variant-IDs

Die Produkt-CSV von Shopify enthält keine Variant-IDs. Dafür gibt es `tools/fetch-variant-ids.js` – es nutzt die **Admin API** per **Client ID + Secret** (Dev Dashboard).

```bash
cp .env.example .env
```

In `.env` mindestens:

```env
SHOPIFY_STORE_DOMAIN=dein-shop.myshopify.com
SHOPIFY_CLIENT_ID=...
SHOPIFY_CLIENT_SECRET=...
SHOPIFY_API_VERSION=2025-01
```

**Client ID & Secret:**

1. [Dev Dashboard](https://dev.shopify.com/dashboard) → **Apps** → eure App → **Settings**
2. Client ID und Secret kopieren ([About client credentials](https://shopify.dev/docs/apps/build/authentication-authorization/client-secrets))
3. App auf **genau diesem Shop** installieren/freigeben

Dann:

```bash
node tools/fetch-variant-ids.js
```

Ausgabe: fertige `SHOPIFY_VARIANT_MAP` → in `script-new.js` (ca. Zeile 318) einfügen.

**Produktzuordnung (20 Produkte):**

| Tool-Key | Shopify Produkt | SKU |
|---|---|---|
| `Solarmodul` | Ulica Solar Black Jade-Flow 450 W | module_450 |
| `UlicaSolarBlackJadeFlow` | Ulica Solar Black Jade-Flow 500 W | module_500 |
| `SolarmodulPalette` | 36x Ulica 450W - Palette | module_36x450 |
| `UlicaSolarBlackJadeFlowPalette` | 36x Ulica 500W - Palette | module_36x500 |
| `Endklemmen` | Endklemmen - 20 Stück | uk_endklemmen |
| `Schrauben` | Schraube M10x25 - 50 Stück | uk_schraubem10 |
| `Dachhaken` | Dachhaken 3-fach verstellbar | uk_dachhaken |
| `Mittelklemmen` | Mittelklemmen - 20 Stück | uk_mitteklemme |
| `Endkappen` | Endkappen - 50 Stück | uk_endkappen |
| `Schienenverbinder` | Schienenverbinder - 10 Stück | uk_schienenverbinder |
| `Schiene_240_cm` | Schiene 240cm | uk_schiene240 |
| `Schiene_360_cm` | Schiene 360 cm | uk_schiene360 |
| `MC4_Stecker` | MC4 Stecker - 50 Steckerpaare | zubehoer_mc4stecker |
| `Solarkabel` | Solarkabel 100M | zubehoer_solarkabel |
| `Holzunterleger` | Unterlegholz für Dachhaken | zubehoer_unterlegholz |
| `Ringkabelschuhe` | Ringkabelschuhe - 100 Stück | zubehoer_kabelschuhe |
| `Erdungsband` | Erdungsband - 6M | zubehoer_erdungsband |
| `Tellerkopfschraube` | Tellerkopfschraube 8x100 | uk_tellerkopfschraube |
| `HuaweiOpti` | Huawei Smart PV Optimierer 600W | zubehoer_huaweiopti |
| `BRCOpti` | BRC M600M Optimierer | zubehoer_brcopti |

---

## Schritt 2: `script-new.js` + Minify

Nach Änderungen an `SHOPIFY_VARIANT_MAP`:

```bash
npm run minify
```

---

## Schritt 3 (von dir in Vercel): Deploy

Für den **Warenkorb** sind **keine** Storefront-Tokens auf Vercel nötig. Deploy z. B.:

```bash
vercel --prod
```

Weitere APIs (z. B. [api/pdf-export.js](../api/pdf-export.js)) können weiterhin eigene Env-Variablen benötigen.

---

## Schritt 4 (von dir): Theme / Seite

### Option A: Liquid Section

1. **Online Shop → Themes → Code bearbeiten**
2. `sections/solar-konfigurator.liquid` aus `shopify-theme/solar-konfigurator.liquid` anlegen
3. Im Theme-Editor Block hinzufügen, Vercel-URL eintragen

### Option B: Seite mit iframe

**Online Shop → Seiten → Neue Seite**, HTML:

```html
<iframe
  src="https://DEIN-VERCEL-PROJEKT.vercel.app"
  title="Solar-Konfigurator"
  style="width:100%; height:85vh; border:0; border-radius:8px;"
  loading="lazy"
></iframe>
```

### Option C: Nur Link in der Navigation zur Vercel-URL

---

## Schritt 5: Testen

1. Konfigurator öffnen → Konfiguration → „In den Warenkorb“
2. Der Tab sollte zum **Shop** wechseln (`/cart` mit Artikeln)
3. **Notiz** und ggf. **Kundentyp-Attribut** in der Warenkorb-/Bestellansicht prüfen

---

## Checkliste Go-Live

- [ ] `SOLAR_SHOP_ORIGIN` in `index.html` (Vercel-Deployment) korrekt
- [ ] Alle Variant-IDs in `SHOPIFY_VARIANT_MAP` (keine `PLACEHOLDER_`)
- [ ] `npm run minify` ausgeführt
- [ ] Theme oder Seite eingebunden
- [ ] Warenkorb-Test: Weiterleitung + Zeilen ok

---

## Häufige Fehler

| Symptom | Ursache |
|--------|---------|
| „Shopify nicht konfiguriert“ | Noch `PLACEHOLDER_` in `SHOPIFY_VARIANT_MAP` |
| „Shop-URL fehlt“ | `SOLAR_SHOP_ORIGIN` nicht gesetzt oder leer |
| Weiterleitung, aber leerer Warenkorb | Falsche Variant-IDs oder Shop-Domain |
| Passwort-Shop blockiert | Cart-Permalinks umgehen das Storefront-Passwort nicht |
| Produkt nicht gefunden (fetch-variant-ids) | Handle in `tools/fetch-variant-ids.js` ≠ Shopify-Handle |

---

## Referenz (Shopify)

- [Cart permalinks](https://shopify.dev/docs/apps/checkout/cart-permalinks/create)
- [Client credentials / Admin token](https://shopify.dev/docs/apps/build/authentication-authorization/client-secrets) (für `fetch-variant-ids.js`)
