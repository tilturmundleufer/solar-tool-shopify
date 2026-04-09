# Theme-Brücke: Shopify-Shop → Konfigurator (Vercel)

Der Konfigurator liegt typischerweise auf **Vercel** (`*.vercel.app`). Die **Shopify-Section** (`shopify-theme/solar-konfigurator.liquid`) steuert die **Einbindung** (iframe oder Link). Der **Theme-Warenkorb** wird über **Cart-Permalinks** befüllt, sobald der Kunde im Konfigurator auf „In den Warenkorb“ tippt.

Referenz: [Shopify: Create cart permalinks](https://shopify.dev/docs/apps/checkout/cart-permalinks/create)

---

## Ablauf (iframe oder Vercel-Tab)

1. Kunde konfiguriert auf **Vercel-Origin**.
2. Beim Hinzufügen baut das Tool eine URL der Form  
   `https://EURE-SHOP-DOMAIN/cart/{variantId}:{qty},…?storefront=true&note=…&attributes[customer_type]=…`
3. **`window.top.location.assign(url)`** – der **gesamte Browser-Tab** wechselt zum Shop; der **Online-Store-Warenkorb** (Theme `/cart`, Mini-Cart) enthält die Zeilen.

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
| **iframe** | Konfigurator eingebettet; „Warenkorb“ **verlässt** die Shop-Seite und öffnet den **Shop-Warenkorb** im selben Tab (Top-Navigation). |
| **Button / Link** | Nutzer arbeiten auf Vercel; bei „Warenkorb“ ebenfalls **Weiterleitung** zur Shop-`/cart`-URL (gleiches Permalink-Verhalten). |

---

## Grenzen & Hinweise

- **Storefront-Passwort:** Cart-Permalinks **umgehen** das Shop-Passwort nicht (Shopify-Limitierung).
- **Sehr lange Konfigurationen:** Die URL enthält alle Varianten:mengen plus eine kompakte **Notiz** (`note`); bei extrem vielen Zeilen kann die URL-Länge zum Browser-Limit werden (selten).
- **Line Item Properties:** Shopify erlaubt im Permalink nur eingeschränkt Properties auf der **ersten** Zeile; das Tool legt stattdessen eine **Bestellnotiz** mit Stücklisten-Kurztext an.

Weitere Einrichtung: [STOREFRONT_SETUP.md](STOREFRONT_SETUP.md) (Warenkorb per Permalink + Varianten).
