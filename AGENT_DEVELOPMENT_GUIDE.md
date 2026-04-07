# 🤖 Agent Development Guide - Solar Tool

## 📋 Critical Development Rules

### ⚠️ **MANDATORY: Single File Management**

**ALWAYS** work with the main JavaScript file:
- `script-new.js` (Development version - readable, commented)
- `script-new.min.js` (Production version - minified, optimized)

### 🔄 Development Workflow

#### When Making JavaScript Changes:

1. **Primary Edit**: Make changes to `script-new.js`
2. **Minification**: Generate updated `script-new.min.js` 
3. **Verification**: Ensure both files are functionally identical

#### File Relationship:
```
script-new.js (~7k lines) ──minify──> script-new.min.js (1 line)
     ↓                                     ↓
Development Environment            Production Environment
```

### 🛠️ Required Actions for Every JS Modification:

#### Step 1: Edit script-new.js
- Make all changes to the readable `script-new.js` file
- Maintain proper formatting and comments
- Test functionality in development

#### Step 2: Update script-new.min.js
After editing `script-new.js`, you MUST:

```bash
# Use terser for minification
npx terser script-new.js -o script-new.min.js -c -m
npx terser shopifyStorefrontCart.js -o shopifyStorefrontCart.min.js -c -m
```

#### Step 3: Verify Both Files
- ✅ `script-new.js` / `shopifyStorefrontCart.js` lesbar
- ✅ `*.min.js` minifiziert und funktional identisch
- ✅ Dateien synchron (Funktionsparität)

### 🎯 Key Components:

The following major components must exist in the file:

1. **Constants & Configuration**
   - `VE` object (Verpackungseinheiten)
   - `PRICE_MAP` object
   - Product mappings (`PRODUCT_MAP`, `PRODUCT_NAME_MAP`)
   - `SHOPIFY_VARIANT_MAP` - Shopify Variant-IDs
   - `SHOPIFY_STORE_DOMAIN` - Shop-Domain

2. **Core Classes**
   - `CalculationManager` - Background calculations
   - `PriceCache` - Price management
   - `SmartConfigParser` - Configuration parsing
   - `BulkSelector` - Bulk selection functionality
   - `SolarGrid` - Main grid management

3. **Key Functions**
   - Grid manipulation (add/remove rows/columns)
   - Part calculations
   - Shopify Cart management (`addToShopifyCart`, `addAllToShopifyCart`)
   - Customer type management (`getStoredCustomerType`, `setCustomerType`)
   - Configuration save/load

### 🚨 Common Mistakes to Avoid:

❌ **DON'T:**
- Edit only `script-new.js` without updating `script-new.min.js`
- Edit only `script-new.min.js` without updating `script-new.js`
- Leave files out of sync
- Forget to test both versions
- Use Platzhalter-IDs in production

✅ **DO:**
- Always update both files
- Maintain functional parity
- Test in both dev and prod contexts
- Replace Platzhalter-IDs with real Shopify Variant-IDs before going live

### 🔍 Verification Checklist:

Before completing any JavaScript modification:

- [ ] `script-new.js` has been updated with changes
- [ ] `script-new.min.js` has been regenerated
- [ ] Both files contain the same functionality
- [ ] No syntax errors in either file
- [ ] All major classes and functions are present

### 📁 Project Structure:

```
solar-tool/
├── script-new.js       ← Development version (EDIT THIS)
├── script-new.min.js   ← Production version (REGENERATE FROM script-new.js)
├── calculation-worker.js
├── index.html
├── style.css           ← Enthält auch Smart-Config-Styles
└── README.md
```

### 🎯 Environment Usage:

- **Development/Testing**: nutzt `script-new.js`
- **Production**: nutzt `script-new.min.js`
- **Beide müssen identisch funktionieren**

### 🔧 Minification Command:

```bash
npx terser script-new.js -o script-new.min.js -c -m
```

### 📝 Change Log Template:

When making changes, document:
```markdown
## Changes Made - [Date]
- Modified: [specific functions/classes]
- Files Updated: script-new.js ✅, script-new.min.js ✅
- Testing: [brief description]
- Doc Update: README.md ✅, SOLAR_TOOL_DOCUMENTATION.md ✅
```

---

## 🧭 Cursor-Workflow (verbindlich)

1) Kontextaufnahme (parallel lesen): `SOLAR_TOOL_DOCUMENTATION.md`, `SMART_CONFIG_EXAMPLES.md`, `script-new.js`, `index.html`.

2) TODOs in Cursor anlegen: Analyse → Implementierung → Minify → Doku → Git.

3) Implementierungsregeln:
- Änderungen ausschließlich in `script-new.js`; niemals direkt nur `script-new.min.js` editieren.
- Webflow-Produktformulare: Alle `form[data-node-type="commerce-add-to-cart-form"]` global unsichtbar setzen.
- Logging: In Produktion `console.log`, `console.info`, `console.debug` global zu No-Ops machen; `console.warn/error` behalten.

4) Minify strikt mit terser: `npx terser script-new.js -o script-new.min.js -c -m` und `npx terser shopifyStorefrontCart.js -o shopifyStorefrontCart.min.js -c -m`.

5) Git-Regeln (Dateien getrennt committen):
```bash
git add script-new.js
git commit -m "<Änderungsbeschreibung>"
git add script-new.min.js
git commit -m "Regenerate script-new.min.js"
git add <.md-Dateien>
git commit -m "Docs: <Hinweis>"
git push origin main
```

6) Vor-Abschluss-Checks:
- [ ] Smart-Config-Patterns weiter funktionsfähig
- [ ] Shopify-Integration korrekt (SHOPIFY_VARIANT_MAP)
- [ ] Keine neuen Linterfehler
- [ ] Doku aktualisiert

## 🚀 Quick Reference Commands:

```bash
# Check file sizes
ls -lh script-new.js script-new.min.js

# Minify with terser
npx terser script-new.js -o script-new.min.js -c -m

# Verify syntax
node -c script-new.js
node -c script-new.min.js
```

---

**Remember: Der Dev/Prod-Prozess funktioniert nur, wenn BEIDE Dateien synchron sind!**

---

## 📚 Dokumentationspflege (Pflicht für Agents)

- Aktualisiere bei jeder Code-Änderung die relevanten `.md`-Dateien.
- Prüfe und pflege insbesondere:
  - Smart-Config-Befehle
  - Zusatzprodukte/Checkboxen
  - UI-Texte/Placeholders
  - Shopify-Integration (Variant-IDs)
- Halte `AGENT_PROMPT_TEMPLATE.md` auf Stand.

### Preisberechnung

- Verwende `getPackPriceForQuantity(productKey, requiredPieces)` für alle Preisberechnungen.
- Staffeldefinitionen stehen in `TIER_PRICING`.

## Tests (Kundentyp)
- LocalStorage leeren → Seite lädt
- Auswahl „Privatkunde" → Preise = Netto
- Auswahl „Firmenkunde" → Preise = Bruttopreise (×1,19)

## Shopify-Integration

### Konfiguration
1. Echte Variant-IDs in `SHOPIFY_VARIANT_MAP` eintragen
2. `SHOPIFY_STORE_DOMAIN` aktualisieren
3. Minifizieren und testen

### Funktionen
- `addToShopifyCart(productKey, quantity)` - Einzelprodukt
- `addAllToShopifyCart(parts)` - Bulk-Add
- `isShopifyConfigured()` - Prüft ob echte IDs vorhanden

## Changes Made - [2026-01-26]
- Modified: Shopify-Migration abgeschlossen, Foxy.io-Fallback entfernt
- Files Updated: script-new.js ✅
- Integration: Kundentyp-Management direkt in script-new.js integriert
- Removed: fullpage-cart.*, customer-type-popup.*, cms-search.*, script.js
