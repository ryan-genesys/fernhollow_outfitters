/* Fernhollow Outfitters demo site
   Shared header and footer, demo data, Messenger helpers, and tracking hooks.
   The Genesys Messenger itself is loaded by the deployment snippet in each page's <head>. */
(function () {
  'use strict';

  function noop() {}

  /* ------------------------------------------------------------------
     1. Digital User Tracking hooks (next phase)
     Every meaningful shopper action calls track(). Today it only logs to
     the console so you can see what will be sent. Once tracking is enabled
     on the Messenger deployment, set DUT_ENABLED to true. Confirm the
     command name against the current Genesys Messenger SDK docs first.
     ------------------------------------------------------------------ */
  var DUT_ENABLED = false;

  function track(eventName, attributes) {
    var attrs = attributes || {};
    console.info('[Fernhollow track]', eventName, attrs);
    if (DUT_ENABLED && typeof window.Genesys === 'function') {
      window.Genesys('command', 'Journey.record', { eventName: eventName, customAttributes: attrs }, noop, noop);
    }
  }

  /* ------------------------------------------------------------------
     2. Messenger helpers
     openMessenger() stamps custom attributes on the conversation, then
     opens the Messenger. Architect can read entryPoint, pageTitle, and
     pagePath (Get Participant Data) to greet and route in context.
     Custom attributes apply to a new conversation; an already-active
     conversation keeps the values it started with.
     ------------------------------------------------------------------ */
  var messengerReady = false;
  if (typeof window.Genesys === 'function') {
    window.Genesys('subscribe', 'Messenger.ready', function () { messengerReady = true; });
  }

  function openMessenger(entryPoint) {
    if (typeof window.Genesys !== 'function') {
      toast('Chat isn\u2019t available right now. Call us at 1-800-555-0142.');
      return;
    }
    window.Genesys('command', 'Database.set', {
      messaging: { customAttributes: { entryPoint: entryPoint, pageTitle: document.title, pagePath: location.pathname } }
    }, noop, noop);
    window.Genesys('command', 'Messenger.open', {}, noop, noop);
    track('chat_opened', { entryPoint: entryPoint });

    if (!messengerReady) {
      toast('Connecting you to chat\u2026');
      setTimeout(function () {
        if (!messengerReady) {
          toast('Chat isn\u2019t available right now. Call us at 1-800-555-0142.');
          console.warn('[Fernhollow] Messenger did not load. Check the deployment ID, environment URL, and allowed domains, and serve the site over http(s), not file://.');
        }
      }, 6000);
    }
  }

  /* ------------------------------------------------------------------
     3. Demo data (orders match bot/orders.csv)
     ------------------------------------------------------------------ */
  var CATEGORIES = { jackets: 'Jackets', packs: 'Packs', footwear: 'Footwear', camping: 'Camping' };

  var PRODUCTS = [
    { id: 'trail-shell', name: 'Trail Shell Jacket', price: 189, cat: 'jackets', shape: 'jacket', color: '#2F6B8A', colorName: 'Lake blue', sizes: ['XS', 'S', 'M', 'L', 'XL'], badge: 'New', rating: 4.7, reviews: 312,
      blurb: 'A three-layer waterproof shell that breathes on long climbs and packs into its own chest pocket.',
      features: ['Waterproof, breathable three-layer fabric', 'Fully taped seams', 'Helmet-compatible hood', 'Packs into its chest pocket', 'Weighs 340 g in size M'] },
    { id: 'cedar-down', name: 'Cedar Down Hoodie', price: 229, cat: 'jackets', shape: 'jacket', color: '#8C3B2E', colorName: 'Cedar red', sizes: ['XS', 'S', 'M', 'L', 'XL'], rating: 4.8, reviews: 187,
      blurb: 'Responsibly sourced 700-fill down for cold, dry evenings at camp.',
      features: ['700-fill certified down', 'Water-resistant shell fabric', 'Two zip hand pockets', 'Stuffs into a 2 L sack'] },
    { id: 'switchback-35', name: 'Switchback 35L Pack', price: 149, cat: 'packs', shape: 'pack', color: '#3E5A3A', colorName: 'Moss', sizes: ['S/M', 'M/L'], badge: 'Best seller', rating: 4.6, reviews: 428,
      blurb: 'A load-carrying pack for overnights, with a ventilated back panel and an easy-access front pocket.',
      features: ['Adjustable torso length', 'Ventilated mesh back panel', 'Hydration sleeve', 'Rain cover included'] },
    { id: 'lookout-18', name: 'Lookout 18L Daypack', price: 79, cat: 'packs', shape: 'pack', color: '#C98B1E', colorName: 'Goldenrod', sizes: ['One size'], rating: 4.5, reviews: 264,
      blurb: 'Light enough for town, tough enough for a summit push.',
      features: ['Padded laptop sleeve', 'Two side water bottle pockets', 'Reflective trim'] },
    { id: 'basalt-mid', name: 'Basalt Mid Hiking Boot', price: 165, cat: 'footwear', shape: 'boot', color: '#5A4632', colorName: 'Bark', sizes: ['7', '8', '9', '10', '11', '12'], rating: 4.6, reviews: 351,
      blurb: 'A waterproof mid boot with a grippy sole for wet roots and loose rock.',
      features: ['Waterproof membrane', 'Lugged rubber outsole', 'Cushioned midsole', 'Runs true to size'] },
    { id: 'tidepool-sock', name: 'Tidepool Merino Sock', price: 24, cat: 'footwear', shape: 'sock', color: '#6B5B95', colorName: 'Dusk', sizes: ['S', 'M', 'L'], rating: 4.9, reviews: 902,
      blurb: 'Midweight merino socks that stay warm when wet and don\u2019t hold odor.',
      features: ['Merino wool blend', 'Cushioned heel and toe', 'Lifetime guarantee'] },
    { id: 'hollow-2p', name: 'Hollow 2P Tent', price: 349, cat: 'camping', shape: 'tent', color: '#4F7A5A', colorName: 'Fir', sizes: ['2-person'], rating: 4.7, reviews: 143,
      blurb: 'A freestanding two-person tent with two doors and a fly that holds up to Pacific storms.',
      features: ['Freestanding, one-pole hub design', 'Two doors and two vestibules', 'Weighs 1.6 kg packed'] },
    { id: 'steel-canteen', name: 'Steel Canteen 1L', price: 32, cat: 'camping', shape: 'bottle', color: '#6E767E', colorName: 'Slate', sizes: ['1 L'], rating: 4.8, reviews: 512,
      blurb: 'A double-wall steel bottle that keeps water cold for a full day on the trail.',
      features: ['Double-wall vacuum insulation', 'Leakproof cap', 'Dishwasher safe'] }
  ];

  var ORDERS = [
    { orderNumber: 'FH-100245', email: 'alex.rivera@example.com', status: 'Shipped', carrier: 'UPS', trackingNumber: '1Z4F8E190310427781', statusDetail: 'Arriving Tuesday, October 27.', items: 'Trail Shell Jacket (M)', returnEligible: 'No' },
    { orderNumber: 'FH-100318', email: 'priya.shah@example.com', status: 'Processing', carrier: '', trackingNumber: '', statusDetail: 'We\u2019re packing your order. It ships within 1 business day.', items: 'Switchback 35L Pack (M/L)', returnEligible: 'No' },
    { orderNumber: 'FH-100422', email: 'sam.okafor@example.com', status: 'Delivered', carrier: 'USPS', trackingNumber: '9400111202555842761234', statusDetail: 'Delivered Thursday, October 15.', items: 'Basalt Mid Hiking Boot (10)', returnEligible: 'Yes' },
    { orderNumber: 'FH-100517', email: 'jordan.lee@example.com', status: 'Delayed', carrier: 'FedEx', trackingNumber: '771234567890', statusDetail: 'Delayed in transit. It was due Tuesday, October 20.', items: 'Hollow 2P Tent', returnEligible: 'No' },
    { orderNumber: 'FH-100609', email: 'casey.nguyen@example.com', status: 'Delivered', carrier: 'UPS', trackingNumber: '1Z4F8E190398765432', statusDetail: 'Delivered Monday, August 3.', items: 'Cedar Down Hoodie (S)', returnEligible: 'No' }
  ];

  var CART = [{ id: 'trail-shell', size: 'M', qty: 1 }, { id: 'tidepool-sock', size: 'M', qty: 2 }];
  var cartCount = CART.reduce(function (n, i) { return n + i.qty; }, 0);

  /* ------------------------------------------------------------------
     4. Small helpers
     ------------------------------------------------------------------ */
  var SHAPES = {
    jacket: '<path d="M44 18 60 24 76 18 98 30 108 92 93 94 84 58V104H36V58L27 94 12 92 22 30Z"/><path d="M44 18Q60 6 76 18L60 24Z" opacity=".7"/><path d="M60 26V104" stroke="#fff" stroke-opacity=".5" stroke-width="2.5"/>',
    pack: '<path d="M48 32V22a12 12 0 0 1 24 0v10" fill="none" stroke="currentColor" stroke-width="5"/><rect x="32" y="30" width="56" height="74" rx="16"/><path d="M38 42Q60 22 82 42V52H38Z" opacity=".7"/><rect x="44" y="64" width="32" height="26" rx="6" fill="#fff" fill-opacity=".25"/>',
    boot: '<path d="M36 20H66V66L92 76Q102 80 102 90V96H36Z"/><rect x="32" y="96" width="74" height="10" rx="4" opacity=".7"/><path d="M48 32H62M48 42H62M48 52H62" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>',
    sock: '<path d="M46 16H74V70Q74 74 77 76L94 88Q102 94 98 102Q94 110 84 106L54 92Q46 88 46 78Z"/><rect x="44" y="16" width="32" height="12" rx="3" opacity=".7"/>',
    tent: '<path d="M60 26V16" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M12 100 60 26 108 100Z"/><path d="M50 100 60 64 70 100Z" fill="#fff" fill-opacity=".3"/>',
    bottle: '<rect x="48" y="16" width="24" height="20" rx="5" opacity=".75"/><rect x="40" y="34" width="40" height="72" rx="12"/><rect x="40" y="56" width="40" height="18" fill="#fff" fill-opacity=".25"/>'
  };
  function svg(shape) {
    return '<svg viewBox="0 0 120 120" fill="currentColor" aria-hidden="true">' + (SHAPES[shape] || '') + '</svg>';
  }
  function money(n) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }); }
  function param(name) { return new URLSearchParams(location.search).get(name); }
  function find(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }

  var toastEl, toastTimer;
  function toast(message) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 3800);
  }

  /* ------------------------------------------------------------------
     5. Header and footer
     ------------------------------------------------------------------ */
  var LOGO = '<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><path d="M2 27 12 11l5 8 4-5 9 13Z" fill="currentColor"/><circle cx="24" cy="7" r="3.2" fill="#F2C230"/></svg>';
  var BAG = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 13H6Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';

  function renderChrome() {
    var page = document.body.getAttribute('data-page');
    var nav = [['shop.html', 'Shop', 'shop'], ['order-status.html', 'Order status', 'order-status'], ['returns.html', 'Returns', 'returns'], ['help.html', 'Help', 'help']];
    var header = document.getElementById('site-header');
    if (header) {
      header.innerHTML =
        '<div class="demo-bar"><div class="wrap">Demo site. Fernhollow Outfitters is a fictional store built to showcase Genesys Cloud Web Messaging.<a href="demo-guide.html">Open the demo guide</a></div></div>' +
        '<div class="wrap head-row">' +
          '<a class="logo" href="index.html" aria-label="Fernhollow Outfitters home">' + LOGO + '<span>Fernhollow</span></a>' +
          '<nav class="main-nav" aria-label="Main">' + nav.map(function (n) {
            return '<a href="' + n[0] + '"' + (n[2] === page ? ' aria-current="page"' : '') + '>' + n[1] + '</a>';
          }).join('') + '</nav>' +
          '<a class="cart-link" href="cart.html" id="cart-link">' + BAG + '<span class="count" id="cart-count" aria-hidden="true"></span></a>' +
        '</div>';
      updateCount();
    }
    var footer = document.getElementById('site-footer');
    if (footer) {
      footer.innerHTML =
        '<div class="wrap foot-grid">' +
          '<div class="foot-brand"><a class="logo" href="index.html">' + LOGO + '<span>Fernhollow</span></a><p>Gear for the wet side of the mountains, from Portland, Oregon.</p></div>' +
          '<div><h2>Shop</h2><ul>' + Object.keys(CATEGORIES).map(function (k) { return '<li><a href="shop.html?cat=' + k + '">' + CATEGORIES[k] + '</a></li>'; }).join('') + '</ul></div>' +
          '<div><h2>Help</h2><ul><li><a href="order-status.html">Order status</a></li><li><a href="returns.html">Returns and exchanges</a></li><li><a href="help.html">Help center</a></li><li><button class="link" type="button" data-open-messenger="footer">Chat with us</button></li></ul></div>' +
          '<div><h2>Contact</h2><ul><li>1-800-555-0142</li><li>Phone: Mon to Fri, 7 am to 7 pm PT</li><li>Chat: 7 am to 9 pm PT, Fern any time</li></ul></div>' +
        '</div>' +
        '<div class="wrap fine">\u00A9 2026 Fernhollow Outfitters, a fictional company. Demo environment for Genesys Cloud Web Messaging.</div>';
    }
  }
  function updateCount() {
    var c = document.getElementById('cart-count');
    var l = document.getElementById('cart-link');
    if (c) c.textContent = cartCount;
    if (l) l.setAttribute('aria-label', 'Cart, ' + cartCount + ' items');
  }

  /* ------------------------------------------------------------------
     6. Page renderers
     ------------------------------------------------------------------ */
  function card(p) {
    return '<a class="card" href="product.html?id=' + p.id + '" style="--c:' + p.color + '">' +
      '<div class="art">' + (p.badge ? '<span class="badge">' + p.badge + '</span>' : '') + svg(p.shape) + '</div>' +
      '<div class="card-body"><h3>' + p.name + '</h3><p class="price">' + money(p.price) + '</p><p class="swatch">' + p.colorName + '</p></div></a>';
  }

  function renderGrids() {
    document.querySelectorAll('[data-product-grid]').forEach(function (grid) {
      var list = PRODUCTS.slice();
      var related = grid.getAttribute('data-related');
      var cat = grid.hasAttribute('data-from-url') ? param('cat') : grid.getAttribute('data-category');
      if (related) {
        var base = find(related);
        list = list.filter(function (p) { return p.id !== related; })
          .sort(function (a, b) { return (b.cat === base.cat) - (a.cat === base.cat); });
      } else if (cat && CATEGORIES[cat]) {
        list = list.filter(function (p) { return p.cat === cat; });
      }
      var limit = parseInt(grid.getAttribute('data-limit'), 10);
      if (limit) list = list.slice(0, limit);
      grid.innerHTML = list.map(card).join('');
    });
  }

  function renderIcons() {
    document.querySelectorAll('[data-icon]').forEach(function (el) { el.innerHTML = svg(el.getAttribute('data-icon')); });
  }

  function renderShop() {
    var chips = document.getElementById('shop-chips');
    if (!chips) return;
    var cat = param('cat');
    var valid = cat && CATEGORIES[cat];
    var options = [['', 'All gear']].concat(Object.keys(CATEGORIES).map(function (k) { return [k, CATEGORIES[k]]; }));
    chips.innerHTML = options.map(function (o) {
      var current = valid ? o[0] === cat : !o[0];
      return '<a class="chip" href="shop.html' + (o[0] ? '?cat=' + o[0] : '') + '"' + (current ? ' aria-current="true"' : '') + '>' + o[1] + '</a>';
    }).join('');
    if (valid) {
      document.getElementById('shop-title').textContent = CATEGORIES[cat];
      document.title = CATEGORIES[cat] + ' | Fernhollow Outfitters';
    }
    track('category_viewed', { category: valid ? cat : 'all' });
  }

  function renderProduct() {
    var root = document.getElementById('product-root');
    if (!root) return;
    var p = find(param('id') || 'trail-shell');
    if (!p) {
      root.innerHTML = '<div class="page-head"><h1>We couldn\u2019t find that product</h1><p>It may have sold out or moved. <a href="shop.html">Browse all gear</a>.</p></div>';
      return;
    }
    document.title = p.name + ' | Fernhollow Outfitters';
    var single = p.sizes.length === 1;
    root.innerHTML =
      '<nav class="crumbs" aria-label="Breadcrumb"><a href="shop.html">Shop</a> / <a href="shop.html?cat=' + p.cat + '">' + CATEGORIES[p.cat] + '</a> / ' + p.name + '</nav>' +
      '<div class="pdp">' +
        '<div class="art" style="--c:' + p.color + '">' + (p.badge ? '<span class="badge">' + p.badge + '</span>' : '') + svg(p.shape) + '</div>' +
        '<div class="pdp-info">' +
          '<h1>' + p.name + '</h1>' +
          '<p class="price big">' + money(p.price) + '</p>' +
          '<p class="meta">Rated ' + p.rating + ' out of 5 by ' + p.reviews + ' customers</p>' +
          '<p class="blurb">' + p.blurb + '</p>' +
          '<fieldset class="sizes"><legend>' + (single ? 'Size' : 'Choose a size') + '</legend><div class="size-opts">' +
            p.sizes.map(function (s) {
              return '<label><input type="radio" name="size" value="' + s + '"' + (single ? ' checked' : '') + '><span>' + s + '</span></label>';
            }).join('') +
          '</div><p class="field-error" role="alert" hidden>Choose a size to add this to your cart.</p></fieldset>' +
          '<button class="btn primary wide" type="button" data-add-to-cart="' + p.id + '">Add to cart</button>' +
          '<div class="pdp-help"><p><strong>Not sure about fit?</strong> Our gear specialists can help you choose.</p><button class="link" type="button" data-open-messenger="product-question">Chat with a specialist</button></div>' +
          '<details open><summary>Features</summary><ul>' + p.features.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul></details>' +
          '<details><summary>Shipping and returns</summary><p>Free shipping on orders over $75. Free returns on unused gear within 60 days of delivery.</p></details>' +
        '</div>' +
      '</div>' +
      '<section class="section" aria-labelledby="related-title"><div class="sec-head"><h2 id="related-title">You might also like</h2></div><div class="grid" data-product-grid data-related="' + p.id + '" data-limit="4"></div></section>';
    track('product_viewed', { productId: p.id, productName: p.name, category: p.cat, price: p.price });
  }

  function addToCart(btn) {
    var p = find(btn.getAttribute('data-add-to-cart'));
    var info = btn.closest('.pdp-info');
    var chosen = info.querySelector('input[name="size"]:checked');
    var err = info.querySelector('.field-error');
    if (!chosen) {
      err.hidden = false;
      info.querySelector('input[name="size"]').focus();
      return;
    }
    err.hidden = true;
    cartCount += 1;
    updateCount();
    toast('Added ' + p.name + ' (' + chosen.value + ') to your cart.');
    track('added_to_cart', { productId: p.id, productName: p.name, size: chosen.value, price: p.price });
  }

  function renderCart() {
    var root = document.getElementById('cart-root');
    if (!root) return;
    var subtotal = 0;
    var items = CART.map(function (i) {
      var p = find(i.id);
      var line = p.price * i.qty;
      subtotal += line;
      return '<li class="cart-item">' +
        '<a class="art" href="product.html?id=' + p.id + '" style="--c:' + p.color + '" aria-label="' + p.name + '">' + svg(p.shape) + '</a>' +
        '<div><h3><a href="product.html?id=' + p.id + '">' + p.name + '</a></h3><p class="meta">' + p.colorName + ', size ' + i.size + '</p><p class="meta">Quantity ' + i.qty + '</p></div>' +
        '<p class="line-price">' + money(line) + '</p></li>';
    }).join('');
    root.innerHTML =
      '<ul class="cart-items">' + items + '</ul>' +
      '<aside class="summary" aria-labelledby="summary-title"><h2 id="summary-title">Order summary</h2>' +
        '<dl><dt>Subtotal</dt><dd>' + money(subtotal) + '</dd><dt>Shipping</dt><dd>Free</dd><dt>Estimated tax</dt><dd>At checkout</dd>' +
        '<dt class="total">Total</dt><dd class="total">' + money(subtotal) + '</dd></dl>' +
        '<button class="btn primary wide" type="button" data-checkout>Check out</button>' +
        '<p class="aside-help">Questions about sizing or delivery? <button class="link" type="button" data-open-messenger="cart-help">Chat with us</button></p>' +
      '</aside>';
    track('cart_viewed', { itemCount: CART.length, cartValue: subtotal });
  }

  function normalizeOrder(value) {
    var v = String(value).toUpperCase().replace(/\s/g, '');
    var m = v.match(/^FH-?(\d{6})$/);
    return m ? 'FH-' + m[1] : v;
  }

  function orderCard(o) {
    var extra = '';
    if (o.status === 'Delayed') {
      extra = '<div class="notice"><p><strong>Sorry, this order is running late.</strong> Chat with us and we\u2019ll find out what\u2019s happening.</p><button class="btn primary" type="button" data-open-messenger="order-delayed">Chat with support</button></div>';
    } else if (o.status === 'Delivered' && o.returnEligible === 'Yes') {
      extra = '<p class="aside-help">Not quite right? <a href="returns.html">Start a return</a>.</p>';
    } else if (o.status === 'Delivered') {
      extra = '<p class="aside-help">This order is past our 60-day return window. <button class="link" type="button" data-open-messenger="return-outside-window">Chat with us</button> about repairs or warranty.</p>';
    }
    return '<div class="result"><p class="meta">Order ' + o.orderNumber + '</p>' +
      '<span class="status-pill ' + o.status.toLowerCase() + '">' + o.status + '</span>' +
      '<p>' + o.statusDetail + '</p>' +
      '<dl><dt>Items</dt><dd>' + o.items + '</dd>' +
        (o.carrier ? '<dt>Carrier</dt><dd>' + o.carrier + '</dd><dt>Tracking</dt><dd>' + o.trackingNumber + '</dd>' : '') +
      '</dl>' + extra + '</div>';
  }

  function initOrderForm() {
    var form = document.getElementById('order-form');
    if (!form) return;
    var out = document.getElementById('order-result');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var num = normalizeOrder(form.elements.order.value);
      var email = form.elements.email.value.trim().toLowerCase();
      if (!num || !email) {
        out.innerHTML = '<p class="error">Enter your order number and email to check an order.</p>';
        return;
      }
      var o = ORDERS.filter(function (x) { return x.orderNumber === num && x.email === email; })[0];
      track('order_lookup', { orderNumber: num, found: !!o, status: o ? o.status : null });
      out.innerHTML = o ? orderCard(o)
        : '<p class="error">We couldn\u2019t find an order with that number and email. Check your confirmation email, or chat with Fern for help.</p>';
    });
  }

  /* ------------------------------------------------------------------
     7. Wire up
     ------------------------------------------------------------------ */
  toastEl = document.createElement('div');
  toastEl.className = 'toast';
  toastEl.setAttribute('role', 'status');
  toastEl.hidden = true;
  document.body.appendChild(toastEl);

  renderChrome();
  renderShop();
  renderProduct();
  renderCart();
  renderGrids();
  renderIcons();
  initOrderForm();

  var pageEvents = { 'order-status': 'order_status_viewed', returns: 'return_policy_viewed', help: 'help_viewed' };
  var pageEvent = pageEvents[document.body.getAttribute('data-page')];
  if (pageEvent) track(pageEvent, {});

  document.addEventListener('click', function (e) {
    var m = e.target.closest('[data-open-messenger]');
    if (m) { e.preventDefault(); openMessenger(m.getAttribute('data-open-messenger')); return; }
    var a = e.target.closest('[data-add-to-cart]');
    if (a) { addToCart(a); return; }
    if (e.target.closest('[data-checkout]')) {
      track('checkout_started', { cartValue: CART.reduce(function (n, i) { return n + find(i.id).price * i.qty; }, 0) });
      toast('Checkout is turned off on this demo site.');
    }
  });

  window.Fernhollow = { track: track, openMessenger: openMessenger };
})();
