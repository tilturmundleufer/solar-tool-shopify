# Theme-Brücke: Shopify-Shop → Konfigurator (Vercel)

Der Konfigurator läuft auf einer **eigenen URL** (z. B. Vercel). Die Shop-Theme-Seite soll nur verlinken oder einbetten.

## Storefront-Proxy & CORS (Warenkorb)

Wenn der Konfigurator **auf einer Shopify-Seite** läuft (z. B. `https://schneider-unterkonstruktion-2.myshopify.com/pages/solar-konfigurator`) und **nicht** in einem iframe unter `*.vercel.app`, muss die API **gegen Vercel** gehen. In `index.html` ist dafür die Produktions-URL **`https://solar-tool-shopify.vercel.app/api/shopify-storefront`** eingetragen, sobald die Seite **nicht** auf `localhost`, `127.0.0.1` oder `*.vercel.app` geladen wird.

Auf **Vercel** in den Umgebungsvariablen **`SOLAR_ALLOWED_ORIGIN`** die **exakte** Origin der Shop-Seite eintragen (ggf. kommagetrennt mehrere), z. B.:

`https://schneider-unterkonstruktion-2.myshopify.com`

Ohne diesen Eintrag blockiert der Browser die Anfragen (CORS). Eigene Domain (z. B. `www.…`) zusätzlich auflisten, falls die Seite darüber erreichbar ist.

Vor dem Laden der Skripte kann man den Proxy überschreiben: `window.SOLAR_STOREFRONT_PROXY = '…';`

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
