# Shopify-Einbindung – Schritt-für-Schritt

**Solar-Konfigurator → Shopify Shop (z. B. Schneider Unterkonstruktion)**

---

## Überblick

```
Kunde konfiguriert   →   Vercel-App   →   Shopify Storefront API   →   Warenkorb im Shop
```

Storefront-Zugangsdaten liegen **nur auf dem Server** (Vercel-Umgebungsvariablen), nie im Browser.

**Empfohlener, nachhaltiger Weg:** [Headless](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started)-Vertriebskanal im Shopify Admin + **private access token**. Damit seid ihr unabhängig von der Einstellung neuer „Legacy“-Custom-Apps ab 2026 (siehe [Shopify-Doku](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/generate-app-access-tokens-admin)).

---

## Schritt 1 (von dir im Shopify Admin): Headless + privater Storefront-Token

1. Shopify Admin öffnen (Owner- oder Staff-Konto mit Berechtigung für Apps/Kanäle).
2. Im [Shopify App Store](https://apps.shopify.com/headless) die App **Headless** installieren.
3. Kanal **Headless** öffnen → **Storefront erstellen** (oder bestehendes wählen).
4. **Storefront API permissions** bearbeiten und alles aktivieren, was ihr braucht:
   - Produkt-/Listing-Zugriff für Varianten im Warenkorb
   - **Warenkorb (Cart):** Lese- und Schreibrechte (`unauthenticated_read_cart` / `unauthenticated_write_cart` o. ä., je nach UI-Bezeichnung)
   - ggf. weitere Scopes, falls Checkout-Felder aus der älteren API genutzt werden
5. Den **Private access token** anzeigen und **einmal sicher kopieren** (Passwort-Manager, nicht in Git committen).

> **Öffentlichen** Token aus demselben Screen braucht ihr für dieses Projekt **nicht** – der Vercel-Proxy nutzt den **privaten** Token mit den von Shopify vorgesehenen Headern (`Shopify-Storefront-Private-Token` + Käufer-IP). Technische Details: [docs/STOREFRONT_SETUP.md](STOREFRONT_SETUP.md).

**Alternative (nur falls nötig):** Öffentlicher Storefront-Token oder Token aus `storefrontAccessTokenCreate` – dann in Vercel nur `SHOPIFY_STOREFRONT_ACCESS_TOKEN` setzen (siehe [STOREFRONT_SETUP.md](STOREFRONT_SETUP.md) Abschnitt „Legacy“).

---

## Schritt 2 (lokal, von dir): `.env` für das Variant-ID-Script

Die Produkt-CSV von Shopify enthält keine Variant-IDs. Dafür gibt es `tools/fetch-variant-ids.js` – es nutzt die **Admin API** per **Client ID + Secret** (Dev Dashboard), nicht den Storefront-Token.

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

**Client ID & Secret** (von dir):

1. [Dev Dashboard](https://dev.shopify.com/dashboard) → **Apps** → eure App → **Settings**  
2. Client ID und Secret kopieren ([About client credentials](https://shopify.dev/docs/apps/build/authentication-authorization/client-secrets)).  
3. App auf **genau diesem Shop** installieren/freigeben, sonst schlägt der Token-Request fehl.

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

## Schritt 3 (lokal): `script-new.js` + Minify

Domain und `SHOPIFY_VARIANT_MAP` setzen, dann:

```bash
npm run minify
```

---

## Schritt 4 (von dir in Vercel): Umgebungsvariablen + Deploy

Im Vercel-Dashboard → Projekt → **Settings → Environment Variables**:

| Variable | Wert |
|----------|------|
| `SHOPIFY_STORE_DOMAIN` | `dein-shop.myshopify.com` |
| **`SHOPIFY_STOREFRONT_PRIVATE_TOKEN`** | Private Token aus Schritt 1 |
| `SHOPIFY_STOREFRONT_API_VERSION` | z. B. `2025-01` (mit API testen) |
| `SOLAR_ALLOWED_ORIGIN` | Origin eures Konfigurators, z. B. `https://dein-shop.myshopify.com` wenn der iframe von dort lädt – **exakt** die Origin aus dem Browser |

**Legacy:** Statt privatem Token nur `SHOPIFY_STOREFRONT_ACCESS_TOKEN` setzen, `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` leer lassen.

Deploy z. B.:

```bash
vercel --prod
```

---

## Schritt 5 (von dir): Theme / Seite

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

## Schritt 6: Testen

1. Konfigurator öffnen → Konfiguration → „In den Warenkorb“
2. Admin: **Aufträge → Warenkörbe** prüfen
3. Optional: `checkoutUrl` aus der API im Browser testen

---

## Checkliste Go-Live

- [ ] Headless-Storefront angelegt, **private** Token in Vercel gesetzt
- [ ] `SHOPIFY_STORE_DOMAIN` in `script-new.js` korrekt
- [ ] Alle Variant-IDs in `SHOPIFY_VARIANT_MAP` (keine `PLACEHOLDER_`)
- [ ] `npm run minify` ausgeführt
- [ ] `SOLAR_ALLOWED_ORIGIN` passt zur tatsächlichen iframe-/Seiten-Origin
- [ ] Theme oder Seite eingebunden
- [ ] Warenkorb-Test ok

---

## Häufige Fehler

| Symptom | Ursache |
|--------|---------|
| „Shopify nicht konfiguriert“ | Noch `PLACEHOLDER_` in `SHOPIFY_VARIANT_MAP` |
| CORS | `SOLAR_ALLOWED_ORIGIN` falsch oder fehlt |
| Produkt nicht gefunden | Handle in `tools/fetch-variant-ids.js` ≠ Shopify-Handle |
| 401 / Access denied Storefront | Falscher Token-Typ: Admin-Token (`shpat_` für Admin API) ist **nicht** der Storefront-Token; bei privatem Token prüfen, ob wirklich „Private access“ aus Headless kopiert wurde |
| Throttling / merkwürdige Limits | Ohne privatem Token und ohne Buyer-IP kann Shopify Traffic schlechter zuordnen – mit aktuellem Proxy + privatem Token wird IP aus Vercel-`X-Forwarded-For` gesetzt |

---

## Referenz (Shopify)

- [Getting started – Storefront API](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started)
- [Storefront API authentication](https://shopify.dev/docs/api/usage/authentication#access-tokens-for-the-storefront-api)
- [Client credentials / Admin token](https://shopify.dev/docs/apps/build/authentication-authorization/client-secrets) (nur für Admin-Aufrufe, z. B. Variant-ID-Script)
