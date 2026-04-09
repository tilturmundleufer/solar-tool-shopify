# Theme-Brücke: Shopify-Shop → Konfigurator (Vercel)

Der Konfigurator liegt typischerweise auf **Vercel** (`*.vercel.app`). Die **Shopify-Section** (`shopify-theme/solar-konfigurator.liquid`) steuert die **Einbindung** (iframe oder Link). Der **Theme-Warenkorb** wird über **Cart-Permalinks** befüllt, sobald der Kunde im Konfigurator auf „In den Warenkorb“ tippt.

Referenz: [Shopify: Create cart permalinks](https://shopify.dev/docs/apps/checkout/cart-permalinks/create)

---

## Ablauf (iframe oder Vercel-Tab)

1. Kunde konfiguriert auf **Vercel-Origin**.
2. Beim Hinzufügen baut das Tool eine URL der Form  
   `https://EURE-SHOP-DOMAIN/cart/{variantId}:{qty},…?storefront=true&note=…&attributes[customer_type]=…`
3. **Navigation:**
   - **iframe:** Shopify setzt `frame-ancestors 'none'` – die Cart-Seite darf **nicht** im iframe geladen werden. Der Konfigurator sendet deshalb **`postMessage`** (`type: solar:cartRedirect`, `url`) an die **Shop-Seite**; die Section `solar-konfigurator.liquid` enthält einen Listener und setzt `window.location.href` (ganzer Tab zum Warenkorb). Zusätzlich wird `window.top.location` versucht, falls der Browser es erlaubt.
   - **Voller Tab auf Vercel** (kein iframe): direkt `window.location.href = url`.

`storefront=true` sorgt dafür, dass Kunden im **Theme-Warenkorb** landen (nicht direkt im Checkout).

---

## Pflicht: `window.SOLAR_SHOP_ORIGIN`

- Wert: **Origin ohne Slash**, z. B. `https://dein-shop.myshopify.com` oder eure **Primary Domain**.
- In **[index.html](../index.html)** setzen (Standard-Platzhalter `DEIN-SHOP` ersetzen).
- **iframe:** Die Vercel-Seite muss dieselbe Origin kennen. Wenn ihr im Theme **kein** dupliziertes `index.html` nutzt, reicht die Konfiguration auf Vercel. Wenn ihr Skripte im Theme injiziert, dort **vor** dem iframe identisch setzen:

```html
<script>window.SOLAR_SHOP_ORIGIN = 'https://dein-shop.myshopify.com';</script>
```

---

## Anzeige-Modus der Section

| Modus | Verhalten |
|-------|-----------|
| **iframe** | Konfigurator eingebettet; „Warenkorb“ per **postMessage** + Parent-Navigation zum **Shop-Warenkorb** (aktuelle `solar-konfigurator.liquid` im Theme erforderlich). |
| **Button / Link** | Nutzer arbeiten auf Vercel; bei „Warenkorb“ ebenfalls **Weiterleitung** zur Shop-`/cart`-URL (gleiches Permalink-Verhalten). |

---

## Grenzen & Hinweise

- **Storefront-Passwort:** Cart-Permalinks **umgehen** das Shop-Passwort nicht (Shopify-Limitierung).
- **Sehr lange Konfigurationen:** Die URL enthält alle Varianten:mengen plus eine kompakte **Notiz** (`note`); bei extrem vielen Zeilen kann die URL-Länge zum Browser-Limit werden (selten).
- **Line Item Properties:** Shopify erlaubt im Permalink nur eingeschränkt Properties auf der **ersten** Zeile; das Tool legt stattdessen eine **Bestellnotiz** mit Stücklisten-Kurztext an.

Weitere Einrichtung: [STOREFRONT_SETUP.md](STOREFRONT_SETUP.md) (Warenkorb per Permalink + Varianten).
