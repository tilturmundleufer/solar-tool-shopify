# Theme-Brücke: Shopify-Shop → Konfigurator (Vercel)

Der Konfigurator läuft auf einer **eigenen URL** (z. B. Vercel). Die Shop-Theme-Seite soll nur verlinken oder einbetten.

## Warenkorb im Theme (Mini-Cart)

Wenn die Konfigurator-JavaScripte auf einer **Shopify-Seite** unter **`*.myshopify.com`** laufen (gleiche Origin wie der Shop), fügt `shopifyStorefrontCart.js` Produkte per **`/cart/add.js`** hinzu – der **Theme-Warenkorb** aktualisiert sich wie bei normalem „In den Warenkorb“.

- **Custom Domain** (z. B. `www.…`): vor `shopifyStorefrontCart.js` setzen:  
  `window.SOLAR_USE_THEME_CART = true;`
- **Nur** Storefront API (Headless-Cart, kein Theme-Warenkorb):  
  `window.SOLAR_USE_THEME_CART = false;`
- **iframe** mit Vercel-URL: Origin ist Vercel → es wird die Storefront API genutzt; der Shop-Mini-Cart bleibt leer. Konfigurator besser **direkt** im Theme (ohne iframe) oder per Link öffnen.

## Storefront-Proxy & CORS (nur Headless-Modus)

Wenn die Seite **nicht** `*.myshopify.com` ist (oder `SOLAR_USE_THEME_CART === false`), geht der Warenkorb über den **Vercel-Proxy** zur Storefront API. Dann muss `SOLAR_STOREFRONT_PROXY` die volle Vercel-URL sein (siehe `index.html`) und auf Vercel **`SOLAR_ALLOWED_ORIGIN`** die Origin der Seite enthalten, z. B.:

`https://schneider-unterkonstruktion-2.myshopify.com`

Vor dem Laden der Skripte: `window.SOLAR_STOREFRONT_PROXY = '…';`

## Variante A: Link (empfohlen, einfach)

In **Onlineshop → Seiten** eine Seite „Konfigurator“ anlegen, Inhalt:

```html
<p><a href="https://DEIN-VERCEL-PROJEKT.vercel.app" class="button">Zum Solar-Konfigurator</a></p>
```

## Variante B: Liquid-Snippet (Theme-Code)

`sections/solar-konfigurator-cta.liquid`:

```liquid
<section class="solar-konfigurator-cta page-width">
  <h2>{{ section.settings.heading }}</h2>
  <a href="{{ section.settings.konfigurator_url }}" class="button" target="_blank" rel="noopener">
    {{ section.settings.label }}
  </a>
</section>
{% schema %}
{
  "name": "Konfigurator CTA",
  "settings": [
    { "type": "text", "id": "heading", "label": "Überschrift", "default": "Solaranlage planen" },
    { "type": "url", "id": "konfigurator_url", "label": "Konfigurator-URL" },
    { "type": "text", "id": "label", "label": "Button-Text", "default": "Zum Konfigurator" }
  ],
  "presets": [{ "name": "Konfigurator CTA" }]
}
{% endschema %}
```

## Variante C: iframe (optional)

```html
<iframe
  src="https://DEIN-VERCEL-PROJEKT.vercel.app"
  title="Solar-Konfigurator"
  style="width:100%;min-height:80vh;border:0;"
  loading="lazy"
></iframe>
```

**Hinweis:** `postMessage` nur nötig, wenn der Shop die Rückkehr zum Warenkorb steuern soll; der Warenkorb über Storefront API ist **unabhängig** von der Domain des Theme.
