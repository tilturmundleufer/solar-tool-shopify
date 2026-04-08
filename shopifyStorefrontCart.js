/**
 * Shopify Warenkorb – zwei Modi:
 * 1) Online Store (Theme): POST /cart/add.js – derselbe Warenkorb wie Mini-Cart im Theme (nur same-origin, z. B. *.myshopify.com).
 * 2) Storefront API (GraphQL): über Vercel-Proxy – eigener Headless-Cart (z. B. auf *.vercel.app oder wenn SOLAR_USE_THEME_CART === false).
 *
 * window.SOLAR_STOREFRONT_PROXY – nur für Modus 2.
 * window.SOLAR_USE_THEME_CART – true erzwingt Theme-Warenkorb, false erzwingt Storefront (z. B. Custom-Domain-Shop: true setzen).
 * @see docs/STOREFRONT_SETUP.md, docs/THEME_BRIDGE.md
 */
(function (global) {
  'use strict';

  var CART_KEY = 'solar_shopify_storefront_cart_id';

  function getProxyUrl() {
    return global.SOLAR_STOREFRONT_PROXY || '/api/shopify-storefront';
  }

  /** Theme-/Liquid-Shops: Warenkorb des Online Stores nutzen (Mini-Cart funktioniert). */
  function shouldUseOnlineStoreCart() {
    if (global.SOLAR_USE_THEME_CART === true) return true;
    if (global.SOLAR_USE_THEME_CART === false) return false;
    var h = global.location && global.location.hostname ? global.location.hostname : '';
    if (!h || h === 'localhost' || h === '127.0.0.1' || h.endsWith('.vercel.app')) return false;
    if (/\.myshopify\.com$/i.test(h)) return true;
    return false;
  }

  function shopifyRoutesRoot() {
    if (global.Shopify && global.Shopify.routes && typeof global.Shopify.routes.root === 'string') {
      var r = global.Shopify.routes.root;
      return r.slice(-1) === '/' ? r : r + '/';
    }
    return '/';
  }

  function themeCartUrl(resource) {
    var root = shopifyRoutesRoot();
    resource = String(resource).replace(/^\//, '');
    return root + resource;
  }

  function toVariantNumericId(id) {
    if (id == null || id === '') return 0;
    var s = String(id).trim();
    var num = s.replace(/\D/g, '');
    return num ? parseInt(num, 10) : 0;
  }

  function toVariantGid(id) {
    if (id == null || id === '') return null;
    var s = String(id).trim();
    if (s.indexOf('gid://') === 0) return s;
    var num = s.replace(/\D/g, '');
    if (!num) return null;
    return 'gid://shopify/ProductVariant/' + num;
  }

  async function addLineItemsAjaxCart(items, options) {
    var bodyItems = [];
    items.forEach(function (it) {
      var vid = toVariantNumericId(it.id);
      if (!vid) return;
      var props = {};
      if (it.properties) {
        Object.keys(it.properties).forEach(function (k) {
          props[k] = String(it.properties[k]);
        });
      }
      var line = { id: vid, quantity: Math.max(1, parseInt(it.quantity, 10) || 1) };
      if (Object.keys(props).length) line.properties = props;
      bodyItems.push(line);
    });

    if (!bodyItems.length) {
      return { ok: false, reason: 'no_lines' };
    }

    var r = await fetch(themeCartUrl('cart/add.js'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: bodyItems }),
    });
    var json = await r.json().catch(function () {
      return {};
    });
    if (!r.ok) {
      var msg = json.description || json.message || json.error || 'cart/add.js HTTP ' + r.status;
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }

    var ct = options && options.customerType;
    if (ct) {
      try {
        await fetch(themeCartUrl('cart/update.js'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ attributes: { customer_type: String(ct) } }),
        });
      } catch (_) {}
    }

    try {
      var cr = await fetch(themeCartUrl('cart.js'));
      if (cr.ok) {
        var cart = await cr.json();
        try {
          document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: cart } }));
        } catch (_) {}
        try {
          document.documentElement.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));
        } catch (_) {}
        return { ok: true, cart: cart };
      }
    } catch (_) {}

    return { ok: true, cart: json };
  }

  async function graphql(query, variables) {
    var url = getProxyUrl();
    var res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: query, variables: variables || {} }),
    });
    var json = await res.json().catch(function () {
      return {};
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(
          'Storefront-Proxy nicht gefunden (404). Lokal: Projekt mit `vercel dev` starten (nicht nur `serve`). ' +
            'Im Shopify-Theme: window.SOLAR_STOREFRONT_PROXY auf die volle URL eures Deployments setzen, z. B. https://…vercel.app/api/shopify-storefront'
        );
      }
      var hint = json.hint ? ' ' + json.hint : '';
      throw new Error((json.error || json.message || 'Storefront HTTP ' + res.status) + hint);
    }
    if (json.errors && json.errors.length) {
      var msg = json.errors.map(function (e) {
        return e.message;
      }).join('; ');
      throw new Error(msg);
    }
    return json;
  }

  function getCartId() {
    try {
      return localStorage.getItem(CART_KEY);
    } catch (_) {
      return null;
    }
  }

  function setCartId(id) {
    try {
      if (id) localStorage.setItem(CART_KEY, id);
      else localStorage.removeItem(CART_KEY);
    } catch (_) {}
  }

  function cartUserErrors(payload) {
    var errs = [];
    if (payload && payload.userErrors && payload.userErrors.length) {
      payload.userErrors.forEach(function (e) {
        errs.push(e.message || String(e));
      });
    }
    return errs.join('; ') || null;
  }

  var MUTATION_CREATE = [
    'mutation cartCreate($input: CartInput!) {',
    '  cartCreate(input: $input) {',
    '    cart { id checkoutUrl }',
    '    userErrors { field message }',
    '  }',
    '}',
  ].join('\n');

  var MUTATION_LINES_ADD = [
    'mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {',
    '  cartLinesAdd(cartId: $cartId, lines: $lines) {',
    '    cart { id checkoutUrl }',
    '    userErrors { field message }',
    '  }',
    '}',
  ].join('\n');

  var MUTATION_ATTRS = [
    'mutation cartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {',
    '  cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {',
    '    cart { id checkoutUrl }',
    '    userErrors { field message }',
    '  }',
    '}',
  ].join('\n');

  async function updateAttributes(cartId, attributes) {
    if (!cartId || !attributes || !attributes.length) return null;
    var data = await graphql(MUTATION_ATTRS, {
      cartId: cartId,
      attributes: attributes,
    });
    var p = data.data && data.data.cartAttributesUpdate;
    var err = cartUserErrors(p);
    if (err) throw new Error(err);
    return p && p.cart;
  }

  async function addLineItemsStorefront(items, options) {
    var lines = [];
    items.forEach(function (it) {
      var gid = toVariantGid(it.id);
      if (!gid) return;
      var attrs = [];
      if (it.properties) {
        Object.keys(it.properties).forEach(function (k) {
          attrs.push({ key: String(k), value: String(it.properties[k]) });
        });
      }
      lines.push({
        merchandiseId: gid,
        quantity: Math.max(1, parseInt(it.quantity, 10) || 1),
        attributes: attrs.length ? attrs : undefined,
      });
    });

    if (!lines.length) {
      return { ok: false, reason: 'no_lines' };
    }

    var attrs = [];
    if (options && options.customerType) {
      attrs.push({ key: 'customer_type', value: String(options.customerType) });
    }

    var cartId = getCartId();
    var cart;
    var data;

    if (cartId) {
      data = await graphql(MUTATION_LINES_ADD, { cartId: cartId, lines: lines });
      var addPayload = data.data && data.data.cartLinesAdd;
      var addErr = cartUserErrors(addPayload);
      if (addErr && /not found|does not exist|invalid/i.test(addErr)) {
        setCartId(null);
        cartId = null;
      } else if (addErr) {
        throw new Error(addErr);
      } else {
        cart = addPayload && addPayload.cart;
        if (cart && cart.id) setCartId(cart.id);
        if (cart && attrs.length) {
          await updateAttributes(cart.id, attrs);
        }
      }
    }

    if (!cartId || !cart) {
      data = await graphql(MUTATION_CREATE, {
        input: {
          lines: lines,
          attributes: attrs.length ? attrs : undefined,
        },
      });
      var createPayload = data.data && data.data.cartCreate;
      var createErr = cartUserErrors(createPayload);
      if (createErr) throw new Error(createErr);
      cart = createPayload && createPayload.cart;
      if (cart && cart.id) setCartId(cart.id);
    }

    return { ok: true, cart: cart };
  }

  /**
   * @param {Array<{id: string, quantity: number, properties?: object}>} items - id = numerische Variant-ID oder GID
   * @param {{ customerType?: string }} options
   */
  async function addLineItems(items, options) {
    if (shouldUseOnlineStoreCart()) {
      return addLineItemsAjaxCart(items, options);
    }
    return addLineItemsStorefront(items, options);
  }

  async function addSingle(variantId, quantity, properties, getCustomerType) {
    var ct = typeof getCustomerType === 'function' ? getCustomerType() : null;
    return addLineItems(
      [{ id: variantId, quantity: quantity, properties: properties }],
      { customerType: ct || undefined }
    );
  }

  global.solarShopifyStorefront = {
    graphql: graphql,
    toVariantGid: toVariantGid,
    toVariantNumericId: toVariantNumericId,
    shouldUseOnlineStoreCart: shouldUseOnlineStoreCart,
    getCartId: getCartId,
    setCartId: setCartId,
    clearStoredCart: function () {
      setCartId(null);
    },
    addLineItems: addLineItems,
    addSingle: addSingle,
  };
})(typeof window !== 'undefined' ? window : globalThis);
