# 🌞 Solar-Tool - Vollständige Dokumentation

## 📋 Überblick

Das Solar-Tool ist eine Web-Anwendung zur einfachen Konfiguration und Bestellung von Solaranlagen-Komponenten. Es ermöglicht Nutzern, bereits geplante Solarkonfigurationen digital nachzubauen und die benötigten Teile direkt zu bestellen.

---

## 👥 Zielgruppe & Anwendungskontext

### **Hauptnutzer:**
- **Planer** - Professionelle Solarplaner
- **Endkunden** - Privatpersonen mit Solarprojekten  
- **Solarteure** - Installateure und Fachbetriebe

### **Nutzerprofil:**
- ✅ Fachkräfte mit technischem Verständnis
- ⚠️ Meist ältere Nutzer (potentiell weniger digital-affin)
- 📋 Haben bereits fertige Konfiguration auf Papier/Dokument

### **Typischer Workflow:**
1. **Vorbereitung:** Nutzer hat Solarkonfiguration bereits geplant (Zettel/Dokument)
2. **Digitalisierung:** Konfiguration im Solar-Tool nachbauen
3. **Optimierung:** Grid-Layout und Komponenten anpassen
4. **Bestellung:** Teile in Warenkorb legen und bestellen
5. **Installation:** Erhaltene Teile für Montage verwenden

---

## 🛠️ Hauptfunktionen

### Desktop-Schnellstart (Intro)
- Beim Start auf Desktop-Rechnern erscheint ein kurzes Intro mit den wichtigsten Bedienhinweisen, sofern weder Cache-Daten noch URL‑Konfigurationen vorhanden sind.
- Es wird bei jedem Start ohne Cache angezeigt (z. B. Inkognito-Modus, gelöschter Speicher oder abgelaufener 24h‑Cache).
- Schließen über × oder Klick außerhalb des Fensters.
- Auf mobilen Geräten erscheint dieses Intro nicht (dort gibt es bereits einen separaten Mobile-Hinweis).

### **1. Grid-Konfiguration**
- **Zweck:** Nachbau der geplanten Modul-Anordnung
- **Standard:** 5×5 Grid (kann sich nach Datenauswertung ändern)
- **Flexibilität:** Beliebige Größen durch +/- Buttons
- **Orientierung:** Horizontal/Vertikal (beeinflusst Schienenlängen)

### **2. Smart Config Interface**
- **Funktion:** Schnelle Konfiguration durch Texteingabe
- **Beispiele:** 
  - `5x4 mit module, ohne mc4`
  - `20 module ohne kabel`
  - `3 reihen mit 6 modulen, ohne holz`
  - `zufällig`, `in reihen`, `in spalten`
  - `kompakt`, `mit lücken`, `1 reihe abstand`, `doppelter abstand`
  - `alles außer holz`, `ohne zubehör`, `nur module und mc4`, `mit allem`
- **Unterstützt:** Leerzeichen und Bindestriche (`ohne kabel`, `ohne-kabel`)

### **3. Komponenten-Auswahl (Checkboxes)**
- **Module:** ✅ Standard aktiviert - Solarmodule
- **MC4-Stecker:** Steckverbinder für Module
- **Solarkabel:** Verkabelung der Anlage  
- **Holzunterleger:** Montagehilfen für Holzdächer
- **Quetschkabelschuhe:** Zusatzprodukt (100 Stück/VE)
- **Erdungsband:** Zusatzprodukt; Längenlogik mit VE = 600 cm; Anzeige der Gesamtlänge in der Summary
- **Ulica-Modul:** Optional zusätzliches Modul zur Stückliste

**Logik:** Checkbox aktiviert = Nutzer möchte Komponente dazukaufen
**Deaktiviert:** Nutzer hat Komponente bereits vorrätig

#### Anzeige der Zusatzprodukte (Übersicht vs. Detail)
- In der Konfigurations-Übersicht werden Zusatzprodukte identisch zur Produktliste in der Detailansicht gerendert: links die Paketanzahl (×), darunter die VE-Angabe.
- Es wird keine in Klammern stehende „echte" Stückzahl zwischen Name und Preis angezeigt, da sie für Zusatzprodukte nicht berechnet wird.
- Einheitliche VE-Anzeigen:
  - MC4 Stecker: 50 Stück je Paket (Paketanzahl = ⌈Module/30⌉)
  - Solarkabel: 100 m
  - Unterlegholz für Dachhaken: 50 Stück
  - Quetschkabelschuhe: 100 Stück
  - Erdungsband: 600 cm; in der Detailansicht wird zusätzlich die berechnete Gesamtlänge angezeigt

### **4. Multi-Konfiguration**
- **Zweck:** Mehrere separate Projekte verwalten
- **Nicht für:** Vergleiche, sondern getrennte Bestellungen
- **Speicherung:** Konfigurationen bleiben erhalten

---

## 🔧 Technische Architektur

### **Frontend:**
- **HTML/CSS/JavaScript** - Responsive Web-App
- **Grid-System** - Dynamische Modul-Anordnung
- **Smart Parser** - Intelligente Texteingabe-Verarbeitung
- **Web Worker** - Background-Berechnungen
- **PDF-Erstellung** - Dynamische A4-Seiten via `html2canvas` + `jsPDF` (Template in `#pdf-root`)

### **Backend-Integration:**
- **Shopify Online Store** – Warenkorb per **Cart-Permalink** (GET auf `/cart/{variant}:{qty},…` mit `storefront=true`); im **iframe** `postMessage` an die Shop-Seite + Listener in `solar-konfigurator.liquid` (Shopify blockt Einbettung per `frame-ancestors`), sonst `window.location` / `top`.
- **Konfiguration im Client:** `window.SOLAR_SHOP_ORIGIN` (in `index.html`), keine Storefront-GraphQL-Route mehr.
- **Webhook (kompakt)** - Übertragung nur essenzieller Daten (siehe unten)

### **Warenkorb-Ablauf (Cart-Permalink)**
- Permalink inkl. `storefront=true` (Theme-Warenkorb), optional `note` (Stücklisten-Kurztext) und `attributes[customer_type]`.
- Varianten über `SHOPIFY_VARIANT_MAP` (numerische Variant-ID).
- Einrichtung: siehe `docs/STOREFRONT_SETUP.md`, `docs/THEME_BRIDGE.md` und `README.md`.

### **Shopify Konfiguration:**
- `SHOPIFY_VARIANT_MAP` enthält die Shopify Variant-IDs für alle Produkte.
- `SOLAR_SHOP_ORIGIN` muss zur erreichbaren Shop-Domain passen.
- Bei fehlender Konfiguration (Platzhalter-IDs oder fehlende Origin) zeigt das Tool entsprechende Fehlermeldungen.

### **Zusätzliche Integrationen:**
- **Webhook-Analytics** - Nutzungsauswertung für Optimierungen
- **Keine ERP-Anbindung** (noch nicht, geplant für Zukunft)

### **Datenfluss:**
```
Planung (Papier) → Solar-Tool (App) → Cart-Permalink → Theme-Warenkorb / Checkout → Bestellung → Installation
                              ↓
                         Webhook Analytics → Optimierungen
```

### 📦 Webhook-Payload (kompakt)
- Ziel: kleinere Payloads, schnellere Übertragung, geringere Kosten in Integrations-Tools.
- Es werden nur essenzielle Felder gesendet; große Binärdaten (z. B. Grid-Bild/Base64) entfallen.

Beispiel:
```json
{
  "sessionId": "session_abcd123",
  "timestamp": "2025-08-25T10:00:00.000Z",
  "config": {
    "cols": 6,
    "rows": 4,
    "cellWidth": 60,
    "cellHeight": 60,
    "orientation": "horizontal"
  },
  "selection": {
    "selectedCount": 12,
    "selectedCoords": [[0,0],[1,0],[2,0]]
  },
  "productQuantities": {
    "Solarmodul": 12,
    "Endklemmen": 24
  },
  "totalPrice": 1234.56,
  "meta": {
    "configIndex": 0,
    "configName": "Sued-Dach",
    "totalConfigsInSession": 2
  }
}
```

Hinweise:
- `productQuantities` enthält nur Produkte mit Menge > 0.
- `selection.selectedCoords` ist optional nutzbar zur externen Bildgenerierung.
- Keine Einbettung von `gridImage` (Base64) mehr.

### 🖼️ Bildgenerierung nach Webhook (Empfehlungen)
- Make.com: HTTP Trigger → Code (JS) baut HTML-Grid → Screenshot via Browserless/Apify → URL/Base64 speichern.
- Alternativ Cloudinary: Koordinaten als Overlays (Sprite/Tile) zusammensetzen → transformierte PNG-URL.
- Alternativ QuickChart: Heatmap/Matrix rendern über API (für einfache Visualisierung ausreichend).
- Vorteil: Bilder on-demand generieren und cachen; keine großen Payloads im Browser.

### ✅ Tests (Webhook)
- Content-Type `application/json` und Response `2xx` prüfen.
- Sicherstellen, dass `gridImage` nicht gesendet wird.
- Prüfen, dass nur Produkte > 0 in `productQuantities` enthalten sind.
- `selection.selectedCount` stimmt mit `selectedCoords.length` überein.

### 📓 Changelog
- 2026-04-09: **Cart-Permalink only.** Warenkorb ausschließlich über Shopify Cart-Permalinks + `window.top`-Weiterleitung; Storefront-API-Proxy und `shopifyStorefrontCart.js` entfernt. Siehe `docs/STOREFRONT_SETUP.md`, `docs/THEME_BRIDGE.md`.
- 2026-03-25: **Headless / Storefront API.** Warenkorb über GraphQL (`shopifyStorefrontCart.js`) und Vercel-Proxy `api/shopify-storefront.js`; kein Ajax `cart/add.js` mehr. PDF-Bibliotheken (jsPDF/html2canvas) erst bei PDF-Export nachgeladen. Siehe `docs/STOREFRONT_SETUP.md`, `docs/THEME_BRIDGE.md`.
- 2026-01-26: **Shopify-Migration abgeschlossen.** Vollständige Umstellung auf Shopify Cart API. Foxy.io-Fallback entfernt. Kundentyp-Management in `script-new.js` integriert. Veraltete Dateien (fullpage-cart, customer-type-popup, cms-search) entfernt.
- 2025-10-08: Fix: „Gesamte Auswahl in den Warenkorb" ergänzt jetzt die Tellerkopfschrauben korrekt (global = 2× Dachhaken). PDF: Optimierer (Huawei/BRC) erscheinen auf der Zusatzprodukte-Seite; Menge aus UI (`opti-qty`).
- 2025-08-30: Schienenverbinder-Logik korrigiert (Produktliste): pro Reihe jetzt Verbinder = Anzahl der Schienen − 2.
- 2025-08-25: Webhook-Payload verschlankt (ohne Bilddaten), hinzugefügt: `selection`-Metadaten und kompaktes `productQuantities`.
- 2025-09-13: Kundentyp-Logik (Privat/Firma). Privatkunden Nettopreise, Firmenkunden Bruttopreise (×1,19).
- 2025-09-15: Ulica‑Module in 36er‑Paletten gebündelt.

---

## 📊 Geschäftslogik

### **Verpackungseinheiten (VE):**
```javascript
VE = {
  Endklemmen: 100,
  Schrauben: 100, 
  Dachhaken: 20,
  Mittelklemmen: 100,
  Endkappen: 50,
  Schienenverbinder: 50,
  Schiene_240_cm: 8,
  Schiene_360_cm: 8,
  Solarmodul: 1,
  SolarmodulPalette: 36,
  UlicaSolarBlackJadeFlowPalette: 36,
  MC4_Stecker: 1,
  Solarkabel: 1,
  Holzunterleger: 50,
  Quetschkabelschuhe: 100
}
```

### **Preislogik:**
- Automatische VE-Berechnung
- Rundung auf nächste Verpackungseinheit
- Orientierungsabhängige Schienenlängen
- Zusatzprodukte: Quetschkabelschuhe pauschal 1 VE; Erdungsband nach berechneter Länge (auf 600 cm aufrunden)
- Schienenverbinder: pro Reihe = Gesamtanzahl der Schienenstücke (beide Schienen) − 2
- Kundentyp-Logik: Privatkunden sehen Nettopreise, Firmenkunden Bruttopreise (19% MwSt). Die Kalkulation nutzt `getPackPriceForQuantity()` mit MwSt-Aufschlag via `applyVatIfBusiness()`.
- Palettenpreise: Für Paletten werden die Shop‑VE‑Preise genutzt (keine Stück‑Staffel). Netto/Brutto‑Produkt wird automatisch je Kundentyp gewählt.

### **Kundentyp-Management (integriert in script-new.js)**
- Funktionalität direkt in `script-new.js` integriert
- Verhalten:
  - Kundentyp (Privat/Gewerbe) wird in `localStorage.solarTool_customerType` gespeichert
  - Buttons mit `data-customer-type` Attribut steuern die Auswahl
  - Preise passen sich automatisch dem Kundentyp an
  - URL-Parameter `?kundentyp=privat` oder `?kundentyp=firma` werden unterstützt

### **Warenkorb (Shopify)**
- Warenkorb-Logik vollständig über Shopify Cart API
- Produkte werden via `SHOPIFY_VARIANT_MAP` identifiziert
- Kundentyp wird als Cart-Attribut übergeben

### **Analytics-Nutzung:**
- **Zweck:** Tool-Optimierung basierend auf Nutzerverhalten
- **Beispiel:** Kleinere VEs wenn Nutzer häufig minimal über VE bestellen
- **Daten:** Konfigurationen, Bestellmengen, Nutzungsmuster

---

## 🎯 Entwicklungsrichtlinien

### **Benutzerfreundlichkeit:**
- **Einfache Bedienung** für weniger digital-affine Nutzer
- **Klare Visualisierung** des Grid-Layouts
- **Fehlertolerante Eingabe** (Smart Config)
- **Sofortiges Feedback** bei Änderungen

### **Code-Struktur:**
- **Hauptdatei:** `script-new.js` (Dev) + `script-new.min.js` (Prod)
- **Background-Worker:** `calculation-worker.js` für Performance bei großen Berechnungen
- **Modulare Klassen:** SmartConfigParser, CalculationManager, SolarGrid, etc.
- **Integriert:** Kundentyp-Management (Privat/Gewerbe), Shopify Cart API

### **Qualitätssicherung:**
- **Minifizierung:** Nach Änderungen `npx terser script-new.js -o script-new.min.js -c -m` ausführen
- **Umfassende Tests** für Smart Config Patterns
- **Responsive Design** für verschiedene Geräte

---

## 🚀 Aktuelle Features

### **Smart Config Patterns:**
- **Grid-Größen:** `5x4`, `6x3`, `8x2`
- **Modul-Anzahl:** `20 module`, `24 modulen`
- **Layout & Abstand:** `kompakt`, `mit lücken`, `1 reihe abstand`, `zufällig`
- **Checkbox-Logik:** `mit mc4`, `ohne kabel`, `alles außer holz`, `nur module`
- **Ulica-Module:** `ulica 500`, `black jade flow 450`
- **Konfiguration speichern/benennen:** `speichern`, `speichern als "Dach Nord"`
- **Neue Konfiguration:** `neue konfiguration`, `config neu`, `new config`
- **Alle Konfigurationen löschen / Neustart:** `alle konfigurationen löschen`, `von vorne beginnen`, `reset all`
- **Reihen-Konfiguration:** `3 reihen mit 5 modulen`
- **Orientierung:** `vertikal`, `horizontal`
- **Checkbox-Steuerung:** `mit/ohne module/mc4/kabel/holz`
- **Zusatzprodukte:** `quetschkabelschuhe`, `erdungsband`, `ulica module`
- **Kombinationen:** `und`, `,` für mehrere Optionen

Hinweis: Der Verteilungsmodus `gleichmäßig` ist deaktiviert. Bitte verwenden Sie präzise Angaben wie `X reihen mit Y modulen` oder `N module in M reihen`.

### **Interaktive Features:**
- **Drag & Drop** - Bereichsauswahl durch Ziehen
  - Beim Ziehen außerhalb des Grids bleibt die Vorschau aktiv und klemmt auf die nächstliegende Rand‑Zelle.
  - Beim Loslassen außerhalb des Grids wird die aktuell sichtbare Auswahl übernommen (Commit außerhalb möglich).
- **Shift+Click** - Rechteck-Selektion
- **Bulk-Modus** - Effiziente Mehrfachauswahl
- **Live-Preview** - Sofortige Kostenberechnung
- **Smart-Config-Quick-Input** - Vorschlagsliste mit klickbaren Beispielen

### **PDF-Ausgabe:**
- Erste Seite: Titel + Datum, Abschnitt "Projekt" mit neuer zweispaltiger Kundendaten-Sektion
  - Linke Spalte: Eingabefelder (Linien) für Name, Firma, Adresse, Telefon, E‑Mail
  - Rechte Spalte: "Weitere Informationen:" mit mehreren Linien für längere Texte
- Grid-Übersicht mit Bild der aktuellen Konfiguration
- Produktliste auf separater Seite, Zusatzprodukte ggf. auf eigener Sammelseite

---

## 📈 Zukünftige Entwicklung

### **Geplante Features:**
- **ERP-Integration** - Anbindung an Warenwirtschaftssysteme
- **Erweiterte Analytics** - Detailliertere Nutzungsauswertung
- **Mobile Optimierung** - Bessere Tablet/Smartphone-Unterstützung

### **Optimierungspotential:**
- **VE-Anpassungen** basierend auf Bestellverhalten
- **Standard-Grid-Größe** nach Datenauswertung
- **Neue Smart Config Patterns** je nach Nutzerfeedback

---

## 🔍 Debugging & Support

### **Häufige Probleme:**
- **Smart Config erkennt "ohne" nicht:** Prüfe Hyphen-Unterstützung (`ohne-kabel`)
- **Smart Config erkennt neue Begriffe nicht:** Prüfe Regex in `SmartConfigParser.patterns`
- **Checkbox-Zustand inkorrekt:** Vergleiche parseCheckboxCombinations Logik
- **Performance-Issues:** Prüfe Web Worker Funktionalität
- **Shopify-Fehler:** Prüfe `SHOPIFY_VARIANT_MAP` auf gültige Variant-IDs

### **Entwickler-Tools:**
- **Console-Logging** für Smart Config und Shopify Debugging
- **Test-Dateien** für isolierte Feature-Tests

---

## 📝 Wichtige Code-Bereiche

### **Smart Config Parser**
- Hauptlogik für Texteingabe-Verarbeitung
- Regex-Patterns für verschiedene Eingabeformate
- Checkbox-Kombinationen und Grid-Berechnungen

### **Grid Management** (`SolarGrid` Klasse)
- Dynamische Grid-Erstellung und -Manipulation
- Benutzerinteraktionen (Click, Drag, Keyboard)
- Auswahl-Logik und Visualisierung

### **Calculation Engine** (`CalculationManager`)
- Background-Berechnungen via Web Worker
- Fallback für synchrone Berechnungen
- Performance-Optimierung für große Grids

### **Shopify Integration**
- `addToShopifyCart()` / `addAllToShopifyCart()` – bauen Cart-Permalink und `redirectToShopifyCartPermalink()` (`window.top`)
- `getSolarShopOrigin()` / `buildShopifyCartPermalinkUrl()` – in `script-new.js`
- `SHOPIFY_VARIANT_MAP` – Mapping von Produkt-Keys zu numerischen Variant-IDs

---

*Diese Dokumentation wird kontinuierlich aktualisiert basierend auf Nutzerfeedback und Entwicklungsfortschritt.*

---

## 📚 Dokumentationspflege (für alle Agents)

- Bei jeder Änderung an Smart Config, Checkboxen, Zusatzprodukten oder UI: relevante `.md`-Dateien aktualisieren (`README`, `SMART_CONFIG_EXAMPLES`, `PLACEHOLDER_EXAMPLES`, `AGENT_PROMPT_TEMPLATE`).
- Änderungen an Architektur/State-Handling in `ARCHITECTURE_GUIDELINES` dokumentieren.
- Dev/Prod-Regeln in `AGENT_DEVELOPMENT_GUIDE` aktuell halten.

## Staffelpreis-Logik (Kurz)

- Quelle: `script-new.js` → `TIER_PRICING` (pro Produkt Liste aus `{ minPieces, pricePerPiece | packPrice }`).
- Berechnung: `getPackPriceForQuantity(productKey, requiredPieces)` ermittelt den wirksamen Preis je VE.
- Verwendung: Alle Preisstellen rufen nun diese Funktion auf (PDF, Sidebar-Listen, Snapshots, Zusatzprodukte).

## Testhinweise

- Schwellen überschreiten/unterschreiten und prüfen, dass Preise live wechseln.
- Beispiele:
  - 40× `Schiene_240_cm` → 11,59 € pro Stück (VE=1).
  - 300× `Mittelklemmen` → 0,95 € pro Stück, VE=50 → Packpreis 47,50 €.
  - 36× `Solarmodul` → 55,90 € pro Stück.
  - Kundentyp: LocalStorage löschen, Seite laden. „Privatkunde" → Nettopreise. „Firmenkunde" → Bruttopreise (×1,19).
