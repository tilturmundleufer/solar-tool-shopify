/**
 * Shopify Storefront API (GraphQL) – Warenkorb über Vercel-Proxy.
 * Erwartet window.SOLAR_STOREFRONT_PROXY (z. B. '/api/shopify-storefront').
 * @see docs/STOREFRONT_SETUP.md
 */
(function (global) {
  'use strict';

  var CART_KEY = 'solar_shopify_storefront_cart_id';

  function getProxyUrl() {
    return global.SOLAR_STOREFRONT_PROXY || '/api/shopify-storefront';
  }

  function toVariantGid(id) {
    if (id == null || id === '') return null;
    var s = String(id).trim();
    if (s.indexOf('gid://') === 0) return s;
    var num = s.replace(/\D/g, '');
    if (!num) return null;
    return 'gid://shopify/ProductVariant/' + num;
  }

  async function graphql(query, variables) {
    var url = getProxyUrl();
    var r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: query, variables: variables || {} }),
    });
    var json = await r.json().catch(function () {
      return {};
    });
    if (!r.ok) {
      throw new Error(json.error || json.message || 'Storefront HTTP ' + r.status);
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

  /**
   * @param {Array<{id: string, quantity: number, properties?: object}>} items - id = numerische Variant-ID oder GID
   * @param {{ customerType?: string }} options
   */
  async function addLineItems(items, options) {
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
    getCartId: getCartId,
    setCartId: setCartId,
    clearStoredCart: function () {
      setCartId(null);
    },
    addLineItems: addLineItems,
    addSingle: addSingle,
  };
})(typeof window !== 'undefined' ? window : globalThis);
