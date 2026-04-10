# Graph Report - .  (2026-04-10)

## Corpus Check
- Corpus is ~46,832 words - fits in a single context window. You may not need a graph.

## Summary
- 442 nodes · 1112 edges · 19 communities detected
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `I` - 132 edges
2. `SolarGrid` - 132 edges
3. `e` - 31 edges
4. `SolarPDFGenerator` - 24 edges
5. `x` - 17 edges
6. `BulkSelector` - 17 edges
7. `CalculationManager` - 10 edges
8. `s()` - 8 edges
9. `CacheManager` - 7 edges
10. `getPackPriceForQuantity()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `solar-modul.jpeg (Modultextur im Grid)` --conceptually_related_to--> `SOLAR_TOOL_DOCUMENTATION – Architektur & Features`  [INFERRED]
  solar-modul.jpeg → SOLAR_TOOL_DOCUMENTATION.md
- `calculation-worker.js – BOM Web Worker` --conceptually_related_to--> `SOLAR_TOOL_DOCUMENTATION – Architektur & Features`  [INFERRED]
  calculation-worker.js → SOLAR_TOOL_DOCUMENTATION.md
- `fetch-variant-ids.js – Admin API → VARIANT_MAP` --implements--> `SHOPIFY_SETUP_ANLEITUNG`  [INFERRED]
  tools/fetch-variant-ids.js → docs/SHOPIFY_SETUP_ANLEITUNG.md
- `SOLAR_TOOL_DOCUMENTATION – Architektur & Features` --cites--> `THEME_BRIDGE – iframe postMessage & Cart`  [INFERRED]
  SOLAR_TOOL_DOCUMENTATION.md → docs/THEME_BRIDGE.md
- `README – Projektüberblick & Deploy` --references--> `SOLAR_TOOL_DOCUMENTATION – Architektur & Features`  [EXTRACTED]
  README.md → SOLAR_TOOL_DOCUMENTATION.md

## Communities

### Community 0 - "SolarGrid & Raster-UI"
Cohesion: 0.05
Nodes (1): SolarGrid

### Community 1 - "Warenkorb & Artikel-Queues"
Cohesion: 0.07
Nodes (1): I

### Community 2 - "Shopify Permalink & Kern-Logik"
Cohesion: 0.09
Nodes (18): buildShopifyCartPermalinkUrl(), buildSolarBomNoteForPermalink(), CacheManager, getSolarShopOrigin(), getStoredCustomerType(), isBusinessCustomer(), isPrivateCustomer(), isShopifyConfigured() (+10 more)

### Community 3 - "PDF-Generator & Layout"
Cohesion: 0.12
Nodes (3): e, l(), s()

### Community 4 - "Preise, VE & Rabattstufen"
Cohesion: 0.12
Nodes (5): ensureSolarPdfLibs(), getPackPriceForQuantity(), getPriceFromCache(), SolarPDFGenerator, waitForImages()

### Community 5 - "Minified Bundle (script-new.min)"
Cohesion: 0.14
Nodes (13): a(), b(), c(), d(), f(), g(), h(), k() (+5 more)

### Community 6 - "Grid aufbauen & Liste"
Cohesion: 0.2
Nodes (0): 

### Community 7 - "CalculationManager Worker-Bridge"
Cohesion: 0.11
Nodes (1): CalculationManager

### Community 8 - "Bulk-Auswahl Geometrie"
Cohesion: 0.19
Nodes (1): x

### Community 9 - "Multi-Config Persistenz"
Cohesion: 0.36
Nodes (0): 

### Community 10 - "BulkSelector Klasse"
Cohesion: 0.21
Nodes (1): BulkSelector

### Community 11 - "Konfig-Liste bearbeiten"
Cohesion: 0.19
Nodes (1): n()

### Community 12 - "BOM-Paletten & Erdungsband"
Cohesion: 0.18
Nodes (0): 

### Community 13 - "calculation-worker.js"
Cohesion: 0.33
Nodes (10): analyzeFieldForErdungsband(), assignErdungsbandLength(), calculateErdungsband(), calculateExtendedParts(), calculateMultipleConfigs(), calculateParts(), calculateTotalCost(), checkLeftFieldsErdungsband() (+2 more)

### Community 14 - "Spalten/Zeilen erweitern"
Cohesion: 0.36
Nodes (0): 

### Community 15 - "Docs, Theme-Bridge & Assets"
Cohesion: 0.22
Nodes (10): solar-modul.jpeg (Modultextur im Grid), calculation-worker.js – BOM Web Worker, fetch-variant-ids.js – Admin API → VARIANT_MAP, solar:cartRedirect – Warenkorb außerhalb iframe, solar:iframeHeight – dynamische iframe-Höhe, README – Projektüberblick & Deploy, SHOPIFY_SETUP_ANLEITUNG, SOLAR_TOOL_DOCUMENTATION – Architektur & Features (+2 more)

### Community 16 - "fetch-variant-ids Admin"
Cohesion: 0.83
Nodes (3): fetchVariantId(), getAccessToken(), main()

### Community 17 - "PDF API (pdf-export)"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "PDF API Pfad-Duplikat"
Cohesion: 1.0
Nodes (1): api/pdf-export.js

## Knowledge Gaps
- **6 isolated node(s):** `solar-modul.jpeg (Modultextur im Grid)`, `README – Projektüberblick & Deploy`, `STOREFRONT_SETUP – SOLAR_SHOP_ORIGIN & Permalink`, `calculation-worker.js – BOM Web Worker`, `fetch-variant-ids.js – Admin API → VARIANT_MAP` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `PDF API (pdf-export)`** (1 nodes): `pdf-export.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PDF API Pfad-Duplikat`** (1 nodes): `api/pdf-export.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SolarGrid` connect `SolarGrid & Raster-UI` to `Shopify Permalink & Kern-Logik`, `Preise, VE & Rabattstufen`, `CalculationManager Worker-Bridge`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **Why does `I` connect `Warenkorb & Artikel-Queues` to `PDF-Generator & Layout`, `Minified Bundle (script-new.min)`, `Grid aufbauen & Liste`, `Multi-Config Persistenz`, `Konfig-Liste bearbeiten`, `BOM-Paletten & Erdungsband`, `Spalten/Zeilen erweitern`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Why does `e` connect `PDF-Generator & Layout` to `Konfig-Liste bearbeiten`, `Minified Bundle (script-new.min)`, `Grid aufbauen & Liste`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `solar-modul.jpeg (Modultextur im Grid)`, `README – Projektüberblick & Deploy`, `STOREFRONT_SETUP – SOLAR_SHOP_ORIGIN & Permalink` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SolarGrid & Raster-UI` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Warenkorb & Artikel-Queues` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Shopify Permalink & Kern-Logik` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._