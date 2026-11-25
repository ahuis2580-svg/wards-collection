const BAG_KEY = 'wardsBag';
let bag = [];
try { bag = JSON.parse(localStorage.getItem(BAG_KEY) || '[]'); if (!Array.isArray(bag)) bag = []; } catch (error) { bag = []; }
let wardsProducts = [];

const SITE_BASE = '/wards-collection/';
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));

function updateBagCount() {
  const count = bag.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  document.querySelectorAll('.bag-count,#bagCount').forEach(element => { element.textContent = count; });
}

function saveBag() {
  localStorage.setItem(BAG_KEY, JSON.stringify(bag));
  updateBagCount();
  renderBag();
}

function addToBag(product) {
  const existing = bag.find(item => item.id === product.id);
  if (existing) existing.qty = (existing.qty || 1) + 1;
  else bag.push({ id: product.id, name: product.name, cat: product.cat, img: product.img, qty: 1 });
  saveBag();
  openBag();
}

function changeQty(id, difference) {
  const item = bag.find(entry => entry.id === id);
  if (!item) return;
  item.qty = (item.qty || 1) + difference;
  if (item.qty < 1) bag = bag.filter(entry => entry.id !== id);
  saveBag();
}

function removeFromBag(id) {
  bag = bag.filter(entry => entry.id !== id);
  saveBag();
}

async function loadProducts() {
  try {
    const response = await fetch(SITE_BASE + 'products.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load products.json');
    wardsProducts = await response.json();
    if (!Array.isArray(wardsProducts)) wardsProducts = [];
    return wardsProducts;
  } catch (error) {
    console.error('Could not load Wards Collection products:', error);
    wardsProducts = [];
    return wardsProducts;
  }
}

function productCard(product) {
  return `<article class="product-card">
    <a href="${SITE_BASE}product.html?id=${encodeURIComponent(product.id)}">
      <img src="${SITE_BASE}${escapeHtml(product.img)}" alt="${escapeHtml(product.name)}" loading="lazy">
      <div class="product-info">
        <p class="product-category">${escapeHtml(product.cat || '')}</p>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.desc || '')}</p>
      </div>
    </a>
    <div class="product-actions">
      <button class="add-bag-btn" data-add="${escapeHtml(product.id)}">Add to Bag</button>
      <a class="view-btn" href="${SITE_BASE}product.html?id=${encodeURIComponent(product.id)}">View</a>
    </div>
  </article>`;
}

function renderProducts(container, items) {
  if (!container) return;
  container.innerHTML = items.map(productCard).join('');
  container.querySelectorAll('[data-add]').forEach(button => {
    button.onclick = () => {
      const product = wardsProducts.find(entry => entry.id === button.dataset.add);
      if (product) addToBag(product);
    };
  });
}

function buildShell() {
  const header = document.querySelector('[data-site-header]');
  if (header) {
    header.innerHTML = `<div class="topbar">FREE UK DELIVERY ON ORDERS OVER £75 · TIMELESS MODEST FASHION, DESIGNED IN THE UK</div>
      <div class="site-header">
        <button class="menu-button" aria-label="Open menu" data-menu>☰</button>
        <a class="logo" href="${SITE_BASE}" aria-label="Wards Collection home">
          <span class="logo-mark">W</span><span class="logo-type">WARDS<small>COLLECTION</small></span>
        </a>
        <nav class="main-nav" aria-label="Main navigation">
          <a href="${SITE_BASE}">Home</a><a href="${SITE_BASE}shop.html">Shop All</a><a href="${SITE_BASE}timeless.html">Timeless</a><a href="${SITE_BASE}new-arrivals.html">New Arrivals</a><a href="${SITE_BASE}collections.html">Collections</a><a href="${SITE_BASE}lookbook.html">Lookbook</a><a href="${SITE_BASE}about.html">About</a><a href="${SITE_BASE}contact.html">Contact</a>
        </nav>
        <button class="bag-button" data-bag-open aria-label="Open shopping bag">Bag <span class="bag-count" id="bagCount">0</span></button>
      </div>
      <nav class="mobile-drawer" data-mobile-nav aria-label="Mobile navigation">
        <a href="${SITE_BASE}">Home</a><a href="${SITE_BASE}shop.html">Shop All</a><a href="${SITE_BASE}timeless.html">Timeless</a><a href="${SITE_BASE}new-arrivals.html">New Arrivals</a><a href="${SITE_BASE}collections.html">Collections</a><a href="${SITE_BASE}lookbook.html">Lookbook</a><a href="${SITE_BASE}about.html">About</a><a href="${SITE_BASE}contact.html">Contact</a><a href="${SITE_BASE}size-guide.html">Size Guide</a><a href="${SITE_BASE}delivery-returns.html">Delivery &amp; Returns</a><a href="${SITE_BASE}faq.html">FAQs</a>
      </nav>`;
  }

  const footer = document.querySelector('[data-site-footer]');
  if (footer) {
    footer.innerHTML = `<footer class="site-footer"><div class="footer-grid">
      <div><h3>WARDS COLLECTION</h3><p>Timeless modest fashion, designed in the UK.</p><a class="footer-email" href="mailto:wardsugc@gmail.com">Email Us: wardsugc@gmail.com</a></div>
      <div><h3>Shop</h3><a href="${SITE_BASE}shop.html">Shop All</a><a href="${SITE_BASE}timeless.html">Timeless Collection</a><a href="${SITE_BASE}new-arrivals.html">New Arrivals</a><a href="${SITE_BASE}size-guide.html">Size Guide</a></div>
      <div><h3>Help</h3><a href="${SITE_BASE}delivery-returns.html">Delivery &amp; Returns</a><a href="${SITE_BASE}faq.html">FAQs</a><a href="${SITE_BASE}contact.html">Contact</a><a href="${SITE_BASE}privacy.html">Privacy Policy</a><a href="${SITE_BASE}terms.html">Terms &amp; Conditions</a><a href="${SITE_BASE}sitemap.html">Sitemap</a></div>
      </div><div class="footer-bottom">© 2026 Wards Collection · Store preview · Live checkout not yet connected.</div></footer>`;
  }

  let bagRoot = document.getElementById('bagRoot');
  if (!bagRoot) {
    bagRoot = document.createElement('div');
    bagRoot.id = 'bagRoot';
    document.body.appendChild(bagRoot);
  }
  bagRoot.innerHTML = `<div class="drawer-backdrop" data-bag-backdrop></div>
    <aside class="bag-drawer" aria-label="Shopping bag">
      <div class="baghead"><h2>Your Bag</h2><button class="bag-close" data-bag-close aria-label="Close bag">×</button></div>
      <div class="bag-items" id="bagItems"></div>
      <div class="bagfoot"><p>Prices, stock and delivery charges will be confirmed before an order is accepted. Live payment is not connected.</p><button id="availabilityBtn" class="btn dark">Request availability</button></div>
    </aside>`;
}

function renderBag() {
  const element = document.getElementById('bagItems');
  if (!element) return;
  if (!bag.length) { element.innerHTML = '<p>Your bag is empty.</p>'; return; }
  element.innerHTML = bag.map(item => `<article class="bag-item">
      <img src="${SITE_BASE}${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}">
      <div><h3>${escapeHtml(item.name)}</h3>
        <div class="qty-controls"><button data-minus="${escapeHtml(item.id)}" aria-label="Decrease quantity">−</button><span>${item.qty || 1}</span><button data-plus="${escapeHtml(item.id)}" aria-label="Increase quantity">+</button></div>
        <button class="remove-btn" data-remove="${escapeHtml(item.id)}">Remove</button>
      </div>
    </article>`).join('');
  element.querySelectorAll('[data-minus]').forEach(button => button.onclick = () => changeQty(button.dataset.minus, -1));
  element.querySelectorAll('[data-plus]').forEach(button => button.onclick = () => changeQty(button.dataset.plus, 1));
  element.querySelectorAll('[data-remove]').forEach(button => button.onclick = () => removeFromBag(button.dataset.remove));
}

function openBag() { document.querySelector('.bag-drawer')?.classList.add('open'); document.querySelector('.drawer-backdrop')?.classList.add('open'); }
function closeBag() { document.querySelector('.bag-drawer')?.classList.remove('open'); document.querySelector('.drawer-backdrop')?.classList.remove('open'); }

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.onsubmit = event => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = 'Wards Collection enquiry: ' + (data.get('subject') || 'General enquiry');
    const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message') || ''}`;
    window.location.href = `mailto:wardsugc@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
}

async function initShop() {
  const container = document.getElementById('products');
  if (!container) return;
  await loadProducts();
  const category = document.getElementById('categoryFilter');
  const search = document.getElementById('search');
  const apply = () => {
    const selectedCategory = category?.value || 'All';
    const term = (search?.value || '').toLowerCase().trim();
    const items = wardsProducts.filter(product =>
      (selectedCategory === 'All' || product.cat === selectedCategory) &&
      (!term || [product.name, product.cat, product.desc, ...(product.colors || [])].join(' ').toLowerCase().includes(term))
    );
    renderProducts(container, items);
  };
  category?.addEventListener('change', apply);
  search?.addEventListener('input', apply);
  apply();
}

async function initHome() {
  const container = document.getElementById('homeProducts');
  if (!container) return;
  await loadProducts();
  renderProducts(container, wardsProducts.slice(0, 4));
}

async function initCollections() {
  const container = document.getElementById('collectionProducts');
  if (!container) return;
  await loadProducts();
  const mode = container.dataset.collection || 'all';
  const items = mode === 'timeless' || mode === 'wider'
    ? wardsProducts.filter(product => product.cat === 'Wide Tops')
    : mode === 'new'
      ? wardsProducts.filter(product => product.cat === 'Longer Styles')
      : wardsProducts;
  renderProducts(container, items);
}

async function initProduct() {
  const container = document.getElementById('productDetail');
  if (!container) return;
  await loadProducts();
  const id = new URLSearchParams(location.search).get('id');
  const product = wardsProducts.find(entry => entry.id === id) || wardsProducts[0];
  if (!product) { container.textContent = 'Product not found.'; return; }
  document.title = `${product.name} | Wards Collection`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = product.desc || `${product.name} from Wards Collection.`;
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = `${location.origin}${SITE_BASE}product.html?id=${encodeURIComponent(product.id)}`;
  container.innerHTML = `<img src="${SITE_BASE}${escapeHtml(product.img)}" alt="${escapeHtml(product.name)}">
    <div class="detail-copy"><span class="eyebrow">${escapeHtml(product.cat)}</span><h1>${escapeHtml(product.name)}</h1><p>${escapeHtml(product.desc || '')}</p>
      <div class="detail-meta"><div><strong>Colours</strong>${(product.colors || []).map(escapeHtml).join(', ')}</div><div><strong>Sizes</strong>${(product.sizes || []).join(', ')}</div><div><strong>Reference</strong>${escapeHtml(product.id)}</div></div>
      <button class="btn dark" id="detailAdd">Add to Bag</button><p><small>Price and availability to be confirmed.</small></p>
    </div>`;
  document.getElementById('detailAdd').onclick = () => addToBag(product);
}

document.addEventListener('DOMContentLoaded', () => {
  buildShell();
  updateBagCount();
  renderBag();
  document.querySelector('[data-menu]')?.addEventListener('click', () => document.querySelector('[data-mobile-nav]')?.classList.toggle('open'));
  document.querySelector('[data-bag-open]')?.addEventListener('click', openBag);
  document.querySelector('[data-bag-close]')?.addEventListener('click', closeBag);
  document.querySelector('[data-bag-backdrop]')?.addEventListener('click', closeBag);
  document.getElementById('availabilityBtn')?.addEventListener('click', () => {
    window.location.href = 'mailto:wardsugc@gmail.com?subject=' + encodeURIComponent('Wards Collection availability enquiry') + '&body=' + encodeURIComponent('Please confirm availability:\n\n' + bag.map(item => `${item.name} (${item.id}) x ${item.qty || 1}`).join('\n'));
  });
  initContactForm();
  initShop();
  initHome();
  initCollections();
  initProduct();
});
