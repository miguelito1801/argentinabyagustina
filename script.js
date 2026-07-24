const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');

function closeMenu() {
  if (!menuToggle || !navLinks) return;
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  document.body.classList.remove('menu-open');
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', isOpen);
  });
  navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
}

window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

let revealObserver;
function observeReveals(root = document) {
  const elements = root.querySelectorAll('.reveal:not(.active)');
  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('active'));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -70px', threshold: 0.08 });
  }
  elements.forEach((element) => revealObserver.observe(element));
}
observeReveals();

const year = document.getElementById('current-year');
if (year) year.textContent = String(new Date().getFullYear());

const pageUrl = document.getElementById('page-url');
if (pageUrl) pageUrl.value = window.location.href;

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
if (contactForm && formStatus) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    formStatus.textContent = '';
    formStatus.className = 'form-status';
    try {
      const response = await fetch(contactForm.action, {
        method: 'POST', body: new FormData(contactForm), headers: { Accept: 'application/json' }
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'The message could not be sent.');
      contactForm.reset();
      if (pageUrl) pageUrl.value = window.location.href;
      formStatus.textContent = 'Thank you! Your message was sent successfully. Agustina will be in touch soon.';
      formStatus.classList.add('success');
    } catch (error) {
      formStatus.textContent = 'Sorry, the message could not be sent. Please try again or contact Agustina through WhatsApp.';
      formStatus.classList.add('error');
      console.error(error);
    } finally {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  });
}

const newsletterForm = document.getElementById('newsletter-form');
const newsletterStatus = document.getElementById('newsletter-status');
if (newsletterForm && newsletterStatus) {
  const button = newsletterForm.querySelector('button[type="submit"]');
  newsletterForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!newsletterForm.checkValidity()) { newsletterForm.reportValidity(); return; }
    const original = button.textContent;
    button.textContent = 'Joining...';
    button.disabled = true;
    newsletterStatus.textContent = '';
    try {
      const response = await fetch(newsletterForm.action, {method: 'POST', body: new FormData(newsletterForm), headers: {Accept: 'application/json'}});
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Subscription failed.');
      newsletterForm.reset();
      newsletterStatus.textContent = 'Welcome! Your email was added successfully.';
      newsletterStatus.className = 'form-status success';
    } catch (error) {
      newsletterStatus.textContent = 'Sorry, we could not add your email. Please try again.';
      newsletterStatus.className = 'form-status error';
      console.error(error);
    } finally {
      button.textContent = original;
      button.disabled = false;
    }
  });
}

// Sanity CMS public connection. The dataset remains read-only from the website.
const SANITY = {
  projectId: 'brjqcwkq',
  dataset: 'production',
  apiVersion: '2025-02-19',
};

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function safeExternalUrl(value = '') {
  try {
    const url = new URL(String(value), window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

function detailHref(type, slug) {
  const encoded = encodeURIComponent(slug);
  return ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? `${type.slice(0, -1)}.html?slug=${encoded}`
    : `/${type}/${encoded}`;
}

function setGridState(grid, message, isError = false) {
  if (!grid) return;
  grid.classList.remove('is-loading');
  grid.setAttribute('aria-busy', 'false');
  grid.innerHTML = `<div class="cms-empty${isError ? ' cms-error' : ''}"><p>${escapeHtml(message)}</p>${isError ? '<a href="#contact">Contact Agustina directly →</a>' : ''}</div>`;
}

function formatDate(value, includeTime = false) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    ...(includeTime ? { hour: 'numeric', minute: '2-digit' } : {})
  }).format(date);
}

async function fetchSanity(query) {
  const endpoint = `https://${SANITY.projectId}.apicdn.sanity.io/v${SANITY.apiVersion}/data/query/${SANITY.dataset}?query=${encodeURIComponent(query)}`;
  const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Sanity request failed (${response.status})`);
  const payload = await response.json();
  return payload.result;
}

function renderPlaces(places) {
  const grid = document.getElementById('places-grid');
  if (!grid) return;
  if (!places?.length) { setGridState(grid, 'Agustina’s recommendations will appear here soon.'); return; }
  grid.classList.remove('is-loading'); grid.setAttribute('aria-busy', 'false');
  grid.innerHTML = places.map((place) => `
    <article class="cms-card reveal" data-content-type="places" data-category="${escapeHtml(normalizeSearch(place.category || 'All'))}">
      ${place.imageUrl ? `<img class="cms-card-image" src="${escapeHtml(place.imageUrl)}" alt="${escapeHtml(place.imageAlt || place.name)}" loading="lazy" decoding="async">` : ''}
      <div class="cms-card-body">
        <span class="cms-card-kicker">${escapeHtml(place.city || 'Argentina')}${place.category ? ` · ${escapeHtml(place.category)}` : ''}</span>
        <h3>${escapeHtml(place.name)}</h3>
        <p>${escapeHtml(place.shortDescription || '')}</p>
        ${place.address ? `<div class="cms-card-meta">${escapeHtml(place.address)}</div>` : ''}
        ${place.slug ? `<a class="cms-card-link" href="${detailHref('places', place.slug)}">View Details →</a>` : safeExternalUrl(place.mapUrl) ? `<a class="cms-card-link" href="${escapeHtml(safeExternalUrl(place.mapUrl))}" target="_blank" rel="noopener noreferrer">View on Google Maps →</a>` : ''}
      </div>
    </article>`).join('');
  observeReveals(grid);
}

function renderEvents(events) {
  const grid = document.getElementById('events-grid');
  if (!grid) return;
  if (!events?.length) { setGridState(grid, 'New events will appear here as soon as they are published.'); return; }
  grid.classList.remove('is-loading'); grid.setAttribute('aria-busy', 'false');
  grid.innerHTML = events.map((event) => `
    <article class="cms-card reveal" data-content-type="events" data-category="events">
      ${event.imageUrl ? `<img class="cms-card-image" src="${escapeHtml(event.imageUrl)}" alt="${escapeHtml(event.imageAlt || event.title)}" loading="lazy" decoding="async">` : ''}
      <div class="cms-card-body">
        <span class="cms-card-kicker">${escapeHtml(event.city || 'Argentina')}</span>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.summary || '')}</p>
        <div class="cms-card-meta">${escapeHtml(formatDate(event.startsAt, true))}${event.venue ? ` · ${escapeHtml(event.venue)}` : ''}</div>
        ${event.slug ? `<a class="cms-card-link" href="${detailHref('events', event.slug)}">View Event →</a>` : safeExternalUrl(event.officialUrl) ? `<a class="cms-card-link" href="${escapeHtml(safeExternalUrl(event.officialUrl))}" target="_blank" rel="noopener noreferrer">Event information →</a>` : ''}
      </div>
    </article>`).join('');
  observeReveals(grid);
}

function renderReviews(reviews) {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;
  if (!reviews?.length) { setGridState(grid, 'Approved traveler reviews will appear here soon.'); return; }
  grid.classList.remove('is-loading'); grid.setAttribute('aria-busy', 'false');
  grid.innerHTML = reviews.map((review) => {
    const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
    return `<article class="review-card reveal">
      <div class="stars" aria-label="${rating} out of 5 stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div>
      <h3>“${escapeHtml(review.comment.length > 54 ? `${review.comment.slice(0, 51)}…` : review.comment)}”</h3>
      <p>${escapeHtml(review.comment)}</p>
      <span>— ${escapeHtml(review.name)}, ${escapeHtml(review.country)}</span>
    </article>`;
  }).join('');
  observeReveals(grid);
}

function renderArticles(articles) {
  const grid = document.getElementById('articles-grid');
  if (!grid) return;
  if (!articles?.length) { setGridState(grid, 'Agustina’s first local stories are coming soon.'); return; }
  grid.classList.remove('is-loading'); grid.setAttribute('aria-busy', 'false');
  grid.innerHTML = articles.map((article) => `
    <article class="article-card reveal" data-content-type="articles" data-category="${escapeHtml(normalizeSearch(article.category || 'Articles'))}">
      <div class="article-image dynamic-image" role="img" aria-label="${escapeHtml(article.imageAlt || article.title)}"${article.imageUrl ? ` style="background-image:url('${escapeHtml(article.imageUrl)}')"` : ''}></div>
      <div class="article-body">
        <span>${escapeHtml(article.city || article.category || 'Argentina')}</span>
        <h3>${escapeHtml(article.title)}</h3>
        <p class="article-summary">${escapeHtml(article.summary || '')}</p>
        ${article.publishedAt ? `<small>${escapeHtml(formatDate(article.publishedAt))}</small>` : ''}
        ${article.slug ? `<a class="article-read-link" href="${detailHref('articles', article.slug)}" aria-label="Read ${escapeHtml(article.title)}">Read Article →</a>` : ''}
      </div>
    </article>`).join('');
  observeReveals(grid);
}

function applySettings(settings) {
  if (!settings) return;
  if (settings.siteTitle) {
    document.querySelectorAll('[data-site-title]').forEach((element) => { element.textContent = settings.siteTitle; });
  }
  if (settings.heroTitle) {
    const title = document.getElementById('hero-title');
    if (title) title.textContent = settings.heroTitle;
  }
  if (settings.heroSubtitle) {
    const subtitle = document.getElementById('hero-subtitle');
    if (subtitle) subtitle.textContent = settings.heroSubtitle;
  }
  if (settings.seoDescription) {
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = settings.seoDescription;
  }
  if (settings.email) {
    document.querySelectorAll('[data-email-link]').forEach((link) => { link.href = `mailto:${settings.email}`; });
    document.querySelectorAll('[data-email-button]').forEach((link) => {
      link.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(settings.email)}`;
    });
    document.querySelectorAll('[data-email-text]').forEach((element) => { element.textContent = settings.email; });
  }
  if (settings.instagramUrl) {
    document.querySelectorAll('[data-instagram-link]').forEach((link) => { const url = safeExternalUrl(settings.instagramUrl); if (url) { link.href = url; link.hidden = false; } });
  }
  if (settings.calendlyUrl) {
    document.querySelectorAll('[data-calendly-link]').forEach((link) => { const url = safeExternalUrl(settings.calendlyUrl); if (url) link.href = url; });
  }
  if (settings.whatsappNumber) {
    const message = encodeURIComponent("Hello Agustina, I'd like help planning my Argentina experience.");
    document.querySelectorAll('[data-whatsapp-link]').forEach((link) => { link.href = `https://wa.me/${settings.whatsappNumber}?text=${message}`; });
    document.querySelectorAll('[data-whatsapp-text]').forEach((element) => { element.textContent = `+${settings.whatsappNumber}`; });
  }
}

async function loadCmsContent() {
  const query = `{
    "settings": *[_type == "websiteSettings"][0]{siteTitle, heroTitle, heroSubtitle, email, whatsappNumber, instagramUrl, calendlyUrl, seoDescription},
    "articles": *[_type == "article"] | order(featured desc, publishedAt desc)[0...6]{title, "slug": slug.current, summary, publishedAt, "city": city->name, "category": categories[0]->title, "imageUrl": coverImage.asset->url, "imageAlt": coverImage.alt},
    "places": *[_type == "place" && active != false] | order(featured desc, name asc)[0...12]{name, "slug": slug.current, shortDescription, address, mapUrl, "city": city->name, "category": categories[0]->title, "imageUrl": coverImage.asset->url, "imageAlt": coverImage.alt},
    "events": *[_type == "event" && active != false && endsAt >= now()] | order(featured desc, startsAt asc)[0...12]{title, "slug": slug.current, summary, startsAt, endsAt, venue, mapUrl, officialUrl, "city": city->name, "imageUrl": coverImage.asset->url, "imageAlt": coverImage.alt},
    "reviews": *[_type == "review" && status == "approved"] | order(featured desc, submittedAt desc)[0...6]{name, country, rating, comment}
  }`;
  try {
    const data = await fetchSanity(query);
    applySettings(data.settings);
    renderPlaces(data.places);
    renderEvents(data.events);
    renderReviews(data.reviews);
    renderArticles(data.articles);
  } catch (error) {
    console.error('CMS content could not be loaded.', error);
    setGridState(document.getElementById('places-grid'), 'Recommendations could not be loaded right now.', true);
    setGridState(document.getElementById('events-grid'), 'Events could not be loaded right now.', true);
    setGridState(document.getElementById('reviews-grid'), 'Reviews could not be loaded right now.', true);
    setGridState(document.getElementById('articles-grid'), 'Articles could not be loaded right now.', true);
  }
}

let cmsCollections = {places: [], events: [], articles: []};

function normalizeSearch(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function buildFilterChips() {
  const container = document.getElementById('filter-chips');
  if (!container) return;
  const categories = new Set();
  document.querySelectorAll('[data-category]').forEach((card) => {
    const raw = card.getAttribute('data-category');
    if (raw && !['all', 'events', 'articles'].includes(raw)) categories.add(raw);
  });
  [...categories].sort().forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-chip';
    button.dataset.filter = category;
    button.setAttribute('aria-pressed', 'false');
    button.textContent = category.replace(/\b\w/g, (letter) => letter.toUpperCase());
    container.appendChild(button);
  });
}

function setupContentSearch() {
  const input = document.getElementById('content-search');
  const type = document.getElementById('content-type');
  const status = document.getElementById('search-status');
  const helpLink = document.getElementById('search-help-link');
  const chipContainer = document.getElementById('filter-chips');
  if (!input || !type) return;
  let activeCategory = 'all';

  const run = () => {
    const term = normalizeSearch(input.value.trim());
    const selected = type.value;
    const cards = [...document.querySelectorAll('[data-content-type]')];
    let total = 0;
    cards.forEach((card) => {
      const matchesType = selected === 'all' || card.dataset.contentType === selected;
      const matchesText = !term || normalizeSearch(card.textContent).includes(term);
      const matchesCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
      card.hidden = !(matchesType && matchesText && matchesCategory);
      if (!card.hidden) total += 1;
    });
    const filtering = Boolean(term || selected !== 'all' || activeCategory !== 'all');
    if (status) status.textContent = filtering ? `${total} result${total === 1 ? '' : 's'} found.` : '';
    if (helpLink) helpLink.hidden = !(filtering && total === 0);
  };

  input.addEventListener('input', run);
  type.addEventListener('change', run);
  chipContainer?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    activeCategory = button.dataset.filter;
    chipContainer.querySelectorAll('[data-filter]').forEach((chip) => {
      const active = chip === button;
      chip.classList.toggle('active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
    run();
  });
}

loadCmsContent().then(() => {
  buildFilterChips();
  setupContentSearch();
});

// V6 — public review form. New reviews are stored as "pending" and never appear
// publicly until Agustina changes their moderation status to "approved" in Sanity.
const reviewModal = document.getElementById('review-modal');
const openReviewModalButton = document.getElementById('open-review-modal');
const reviewForm = document.getElementById('review-form');
const reviewFormStatus = document.getElementById('review-form-status');
let reviewModalLastFocus = null;

function openReviewModal() {
  if (!reviewModal) return;
  reviewModalLastFocus = document.activeElement;
  reviewModal.classList.add('open');
  reviewModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  const startedAt = document.getElementById('review-form-started-at'); if (startedAt) startedAt.value = String(Date.now());
  setTimeout(() => reviewModal.querySelector('input[name="name"]')?.focus(), 0);
}

function closeReviewModal() {
  if (!reviewModal) return;
  reviewModal.classList.remove('open');
  reviewModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  reviewModalLastFocus?.focus?.();
}

openReviewModalButton?.addEventListener('click', openReviewModal);
reviewModal?.querySelectorAll('[data-close-review-modal]').forEach((element) => element.addEventListener('click', closeReviewModal));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && reviewModal?.classList.contains('open')) closeReviewModal();
});

if (reviewForm && reviewFormStatus) {
  const submitButton = reviewForm.querySelector('button[type="submit"]');
  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!reviewForm.checkValidity()) { reviewForm.reportValidity(); return; }

    const data = Object.fromEntries(new FormData(reviewForm).entries());
    const isLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const endpoint = '/api/reviews';
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    reviewFormStatus.textContent = '';
    reviewFormStatus.className = 'form-status';

    try {
      if (isLocalPreview) {
        throw new Error('The review form must be tested on the deployed Vercel website. Live Server cannot run the secure /api/reviews function.');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify(data),
      });

      const responseText = await response.text();
      let result = {};
      if (responseText) {
        try { result = JSON.parse(responseText); }
        catch { throw new Error('The review service returned an invalid response. Please try again later.'); }
      }

      if (!response.ok || !result.success) throw new Error(result.message || 'The review could not be sent.');
      reviewForm.reset();
      reviewFormStatus.textContent = 'Thank you! Your review was sent to Agustina and is awaiting approval.';
      reviewFormStatus.classList.add('success');
      setTimeout(closeReviewModal, 2600);
    } catch (error) {
      reviewFormStatus.textContent = error.message || 'Sorry, the review could not be sent. Please try again.';
      reviewFormStatus.classList.add('error');
      console.error(error);
    } finally {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  });
}
