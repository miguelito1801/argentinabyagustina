const SANITY = {projectId: 'brjqcwkq', dataset: 'production', apiVersion: '2025-02-19'};

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
}

function safeExternalUrl(value = '') {
  try {
    const url = new URL(String(value), window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {year:'numeric', month:'long', day:'numeric'}).format(date);
}

async function fetchSanity(query, params = {}) {
  const search = new URLSearchParams({query, ...Object.fromEntries(Object.entries(params).map(([k,v]) => [`$${k}`, JSON.stringify(v)]))});
  const endpoint = `https://${SANITY.projectId}.apicdn.sanity.io/v${SANITY.apiVersion}/data/query/${SANITY.dataset}?${search}`;
  const response = await fetch(endpoint, {headers:{Accept:'application/json'}});
  if (!response.ok) throw new Error(`Sanity request failed (${response.status})`);
  return (await response.json()).result;
}

function renderMarks(text, marks = [], markDefs = []) {
  let html = escapeHtml(text || '');
  for (const mark of marks) {
    if (mark === 'strong') html = `<strong>${html}</strong>`;
    else if (mark === 'em') html = `<em>${html}</em>`;
    else if (mark === 'underline') html = `<u>${html}</u>`;
    else {
      const def = markDefs.find((item) => item._key === mark);
      if (def?._type === 'link' && def.href) {
        const safeUrl = safeExternalUrl(def.href);
        if (safeUrl) html = `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${html}</a>`;
      }
    }
  }
  return html;
}

function renderPortableText(blocks = []) {
  const out = [];
  let listType = null;
  for (const block of blocks) {
    if (block._type === 'image' && block.url) {
      if (listType) { out.push(`</${listType}>`); listType = null; }
      const safeImage = safeExternalUrl(block.url);
      if (safeImage) out.push(`<figure><img src="${escapeHtml(safeImage)}" alt="${escapeHtml(block.alt || '')}" loading="lazy" decoding="async"><figcaption>${escapeHtml(block.caption || '')}</figcaption></figure>`);
      continue;
    }
    if (block._type !== 'block') continue;
    const content = (block.children || []).map((child) => renderMarks(child.text, child.marks, block.markDefs)).join('');
    if (block.listItem) {
      const wanted = block.listItem === 'number' ? 'ol' : 'ul';
      if (listType !== wanted) { if (listType) out.push(`</${listType}>`); out.push(`<${wanted}>`); listType = wanted; }
      out.push(`<li>${content}</li>`);
      continue;
    }
    if (listType) { out.push(`</${listType}>`); listType = null; }
    const tag = ({h1:'h2', h2:'h2', h3:'h3', h4:'h4', blockquote:'blockquote'}[block.style] || 'p');
    out.push(`<${tag}>${content}</${tag}>`);
  }
  if (listType) out.push(`</${listType}>`);
  return out.join('');
}

function updateMetadata(article) {
  document.title = `${article.title} | Argentina by Agustina`;
  document.querySelector('meta[name="description"]').content = article.summary || 'Argentina travel guide by Agustina.';
  const canonical = document.createElement('link');
  canonical.rel = 'canonical';
  canonical.href = `https://www.argentinabyagustina.com/articles/${encodeURIComponent(article.slug)}`;
  document.head.appendChild(canonical);
}

async function loadArticle() {
  const slug = new URLSearchParams(location.search).get('slug');
  const loading = document.getElementById('article-loading');
  const detail = document.getElementById('article-detail');
  const error = document.getElementById('article-error');
  if (!slug) { loading.hidden = true; error.hidden = false; return; }
  try {
    const query = `*[_type == "article" && slug.current == $slug][0]{title, "slug": slug.current, summary, publishedAt, "city": city->name, "categories": categories[]->title, "coverUrl": coverImage.asset->url, "coverAlt": coverImage.alt, body[]{..., "url": asset->url}, gallery[]{..., "url": asset->url}}`;
    const article = await fetchSanity(query, {slug});
    if (!article) throw new Error('Article not found');
    updateMetadata(article);
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-summary').textContent = article.summary || '';
    document.getElementById('article-kicker').textContent = [article.city, ...(article.categories || [])].filter(Boolean).join(' · ') || 'Argentina';
    document.getElementById('article-meta').textContent = article.publishedAt ? `Published ${formatDate(article.publishedAt)}` : '';
    const cover = document.getElementById('article-cover');
    const safeCover = safeExternalUrl(article.coverUrl);
    if (safeCover) { cover.src = safeCover; cover.alt = article.coverAlt || article.title; cover.hidden = false; }
    document.getElementById('article-body').innerHTML = renderPortableText(article.body || []);
    const gallery = document.getElementById('article-gallery');
    if (article.gallery?.length) {
      gallery.innerHTML = article.gallery.map((image) => {
        const safeImage = safeExternalUrl(image.url);
        return safeImage ? `<figure><img src="${escapeHtml(safeImage)}" alt="${escapeHtml(image.alt || '')}" loading="lazy" decoding="async"><figcaption>${escapeHtml(image.caption || '')}</figcaption></figure>` : '';
      }).join('');
      gallery.hidden = false;
    }
    loading.hidden = true;
    detail.hidden = false;
    document.getElementById('share-article').addEventListener('click', async () => {
      const data = {title: article.title, text: article.summary || '', url: location.href};
      try {
        if (navigator.share) await navigator.share(data);
        else { await navigator.clipboard.writeText(location.href); document.getElementById('share-article').textContent = 'Link Copied!'; }
      } catch (e) { if (e.name !== 'AbortError') console.error(e); }
    });
  } catch (e) {
    console.error(e); loading.hidden = true; error.hidden = false;
  }
}
loadArticle();
