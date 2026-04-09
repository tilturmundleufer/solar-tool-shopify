# 🌞 Solar-Tool

Eine Web-Anwendung zur einfachen Konfiguration und Bestellung von Solaranlagen-Komponenten.

## 📁 Dateistruktur

- `script-new.js` - Hauptdatei mit allen Funktionen (inkl. Kundentyp-Management, Shopify-Integration)
- `script-new.min.js` - Minifizierte Produktionsversion
- `api/pdf-export.js` - Platzhalter für optionales Server-PDF
- `calculation-worker.js` - Web Worker für Background-Berechnungen
- `style.css` - Styling
- `index.html` - Hauptseite
- `docs/STOREFRONT_SETUP.md` - Warenkorb per Cart-Permalink + Varianten
- `docs/THEME_BRIDGE.md` - Link/iframe vom Shopify-Theme zur App

## 🛒 Shopify-Integration (Cart-Permalink → Theme-Warenkorb)

Nach „In den Warenkorb“ leitet das Tool per **`window.top.location`** zu einer **Shopify Cart-Permalink-URL** weiter (`/cart/{variant}:{qty},…?storefront=true` …). Es gibt **keinen** separaten Headless-Cart mehr. Siehe [Shopify: Cart permalinks](https://shopify.dev/docs/apps/checkout/cart-permalinks/create).

### Konfiguration

1. **`window.SOLAR_SHOP_ORIGIN`** in [index.html](index.html) (Shop-Origin ohne Slash)
2. **Variant-IDs** in `script-new.js` → `SHOPIFY_VARIANT_MAP` (numerische IDs)
3. **Minifizieren:** `npm run minify` oder `npx terser script-new.js -o script-new.min.js -c -m`
4. Details: [docs/STOREFRONT_SETUP.md](docs/STOREFRONT_SETUP.md), [docs/SHOPIFY_SETUP_ANLEITUNG.md](docs/SHOPIFY_SETUP_ANLEITUNG.md)

### Funktionen

- `addToShopifyCart` / `addAllToShopifyCart` bauen den Permalink und leiten zum Shop um
- Kundentyp als Cart-Attribut `attributes[customer_type]`; Stückliste als `note`

### Vercel-Deploy

- Root-Verzeichnis verbinden, deployen (für den Warenkorb sind keine Storefront-Tokens nötig).
- Theme: Link oder iframe zum Konfigurator – [docs/THEME_BRIDGE.md](docs/THEME_BRIDGE.md)

## 📚 Dokumentation

### **Für Entwickler & Agents:**
- **[📖 Vollständige Dokumentation](SOLAR_TOOL_DOCUMENTATION.md)** - Alles über das Tool, Zielgruppe, Features & Architektur
- **[🤖 Agent Prompt Template](AGENT_PROMPT_TEMPLATE.md)** - Universal-Prompt für zukünftige AI-Entwicklung
- **[⚙️ Development Guide](AGENT_DEVELOPMENT_GUIDE.md)** - Kritische Entwicklungsregeln

### ⚠️ Dokumentationspflege (für alle Agents)
- Halte bei jeder Code-Änderung die relevanten `.md`-Dateien aktuell
- Prüfe insbesondere: neue/umbenannte Checkboxen, zusätzliche Produkte, Smart-Config-Kommandos, UI-Verhalten

### **Feature-Details:**
- **[🧠 Smart Config Examples](SMART_CONFIG_EXAMPLES.md)** - Alle unterstützten Eingabeformate
- **[💬 Placeholder Examples](PLACEHOLDER_EXAMPLES.md)** - UI-Beispiele und Varianten

## 🚀 Quick Start für Agents

```bash
# 1. Lies die Dokumentation
cat SOLAR_TOOL_DOCUMENTATION.md

# 2. Bei Code-Änderungen:
# - Bearbeite script-new.js
# - Minifiziere: npx terser script-new.js -o script-new.min.js -c -m
```

## ✅ Arbeitsweise in Cursor (verbindlicher Workflow)

1) Kontext lesen (parallel): `SOLAR_TOOL_DOCUMENTATION.md`, `AGENT_DEVELOPMENT_GUIDE.md`, `SMART_CONFIG_EXAMPLES.md`, relevante Dateien (`script-new.js`, `index.html`).

2) Aufgaben strukturieren: In Cursor eine TODO-Liste anlegen (Analyse, Implementierung, Minify, Doku, Git).

3) Änderungen implementieren:
- Änderungen ausschließlich in `script-new.js` vornehmen.
- Webflow-Produktforms: Immer alle `form[data-node-type="commerce-add-to-cart-form"]` global verstecken (UI-Konflikte vermeiden).
- Logging: In Produktion `console.log/info/debug` stummschalten, `warn/error` beibehalten.

4) Minifizierung:
```bash
npx terser script-new.js -o script-new.min.js -c -m
```

5) Git-Konventionen (separat, kein Kombi-Commit):
```bash
git add script-new.js
git commit -m "<präzise Änderung in script-new.js>"
git add script-new.min.js
git commit -m "Regenerate script-new.min.js"
git add <.md-Dateien>
git commit -m "Docs: <kurzer Hinweis>"
git push origin main
```

6) Checkliste vor Push:
- [ ] `script-new.js` bearbeitet, keine linter errors
- [ ] `script-new.min.js` via terser regeneriert
- [ ] Doku-Updates in `.md` gepflegt
- [ ] Smart-Config-Patterns unverändert/erweitert getestet

## 🎯 Hauptfunktionen

- **Grid-Konfiguration** - Visuelle Modul-Anordnung
- **Smart Config** - Intelligente Texteingabe (u. a. `5x4 ohne kabel`, `zufällig`, `kompakt`, `mit lücken`)
- **Multi-Projekte** - Mehrere Konfigurationen parallel
- **Shopify Integration** - Direkter Warenkorb-Export via Shopify Cart API
- **Analytics** - Nutzungsauswertung für Optimierungen
- **Zusatzprodukte** - Quetschkabelschuhe, Erdungsband (inkl. Längenlogik/VE)
- **Kundentyp-Management** - Privat/Gewerbe mit automatischer Preisanpassung
- **Desktop-Intro** - Kurzes Schnellstart-Popup beim ersten Desktop-Start

---

**Zielgruppe:** Planer, Endkunden, Solarteure  
**Zweck:** Geplante Solarkonfigurationen → digitaler Nachbau → Bestellung  

## 🧾 PDF-Ausgabe – Kundendaten-Sektion

- In der `pdf-projekt`-Sektion befindet sich eine zweispaltige Kundendaten-Fläche:
  - Links: Linienfelder für Name, Firma, Adresse, Telefon, E‑Mail
  - Rechte Spalte: "Weitere Informationen:" mit mehreren Zeilen für längere Texte
- Dynamische Erzeugung in `script-new.js` (Klasse `SolarPDFGenerator`)
- Bei JS-Änderungen immer minifizieren: `npx terser script-new.js -o script-new.min.js -c -m`
