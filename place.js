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

async function fetchSanity(query) {
  const search = new URLSearchParams({
    query,
    perspective: 'published',
    returnQuery: 'false',
  });
  const endpoint = `https://${SANITY.projectId}.api.sanity.io/v${SANITY.apiVersion}/data/query/${SANITY.dataset}?${search}`;
  const response = await fetch(endpoint, {
    headers: {Accept: 'application/json'},
    cache: 'no-store',
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Sanity request failed (${response.status}): ${details}`);
  }
  return (await response.json()).result;
}

function renderMarks(text, marks = [], markDefs = []) {
  let html = escapeHtml(text || '');
  for (const mark of marks) {
    if (mark === 'strong') html = `<strong>${html}</strong>`;
    else if (mark === 'em') html = `<em>${html}</em>`;
    else {
      const definition = markDefs.find((item) => item._key === mark);
      const safeUrl = definition?._type === 'link' ? safeExternalUrl(definition.href) : '';
      if (safeUrl) html = `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${html}</a>`;
    }
  }
  return html;
}

function renderPortableText(blocks = []) {
  const output = [];
  let listType = null;
  for (const block of blocks) {
    if (block._type === 'image' && block.url) {
      if (listType) { output.push(`</${listType}>`); listType = null; }
      const safeImage = safeExternalUrl(block.url);
      if (safeImage) output.push(`<figure><img src="${escapeHtml(safeImage)}" alt="${escapeHtml(block.alt || '')}" loading="lazy" decoding="async"><figcaption>${escapeHtml(block.caption || '')}</figcaption></figure>`);
      continue;
    }
    if (block._type !== 'block') continue;
    const content = (block.children || []).map((child) => renderMarks(child.text, child.marks, block.markDefs)).join('');
    if (block.listItem) {
      const wanted = block.listItem === 'number' ? 'ol' : 'ul';
      if (listType !== wanted) { if (listType) output.push(`</${listType}>`); output.push(`<${wanted}>`); listType = wanted; }
      output.push(`<li>${content}</li>`);
      continue;
    }
    if (listType) { output.push(`</${listType}>`); listType = null; }
    const tag = ({h1:'h2', h2:'h2', h3:'h3', h4:'h4', blockquote:'blockquote'}[block.style] || 'p');
    output.push(`<${tag}>${content}</${tag}>`);
  }
  if (listType) output.push(`</${listType}>`);
  return output.join('');
}

function renderGallery(items = []) {
  return items.map((item) => {
    const safeImage = safeExternalUrl(item.url);
    return safeImage ? `<figure><img src="${escapeHtml(safeImage)}" alt="${escapeHtml(item.alt || '')}" loading="lazy" decoding="async"><figcaption>${escapeHtml(item.caption || '')}</figcaption></figure>` : '';
  }).join('');
}

function updateMetadata(title, summary, canonical) {
  document.title = `${title} | Argentina by Agustina`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = summary || 'Argentina travel recommendation by Agustina.';
  const canonicalLink = document.createElement('link');
  canonicalLink.rel = 'canonical';
  canonicalLink.href = canonical;
  document.head.appendChild(canonicalLink);
}

function bindShare(data) {
  document.getElementById('share-detail')?.addEventListener('click', async () => {
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(location.href);
        document.getElementById('share-detail').textContent = 'Link Copied!';
      }
    } catch (error) {
      if (error.name !== 'AbortError') console.error(error);
    }
  });
}

async function loadPlace() {
  const querySlug = new URLSearchParams(location.search).get('slug');
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pathSlug = pathParts[0] === 'places' ? pathParts[1] : '';
  const slug = querySlug || pathSlug;
  const loading = document.getElementById('detail-loading');
  const detail = document.getElementById('detail');
  const error = document.getElementById('detail-error');
  if (!slug || slug.length > 160) { loading.hidden = true; error.hidden = false; return; }

  try {
    const slugLiteral = JSON.stringify(decodeURIComponent(slug).trim());
    const query = `*[_type == "place" && slug.current == ${slugLiteral} && active != false][0]{name,"slug":slug.current,shortDescription,address,mapUrl,instagramUrl,websiteUrl,priceLevel,"city":city->name,"categories":categories[]->title,"coverUrl":coverImage.asset->url,"coverAlt":coverImage.alt,description[]{...,"url":asset->url},gallery[]{...,"url":asset->url}}`;
    const place = await fetchSanity(query);
    if (!place) throw new Error('Place not found');

    updateMetadata(place.name, place.shortDescription, `https://www.argentinabyagustina.com/places/${encodeURIComponent(place.slug)}`);
    document.getElementById('detail-title').textContent = place.name;
    document.getElementById('detail-summary').textContent = place.shortDescription || '';
    document.getElementById('detail-kicker').textContent = [place.city, ...(place.categories || [])].filter(Boolean).join(' · ') || 'Argentina';
    document.getElementById('detail-meta').textContent = [place.address, place.priceLevel && place.priceLevel !== 'unknown' ? place.priceLevel : ''].filter(Boolean).join(' · ');

    const cover = document.getElementById('detail-cover');
    const safeCover = safeExternalUrl(place.coverUrl);
    if (safeCover) { cover.src = safeCover; cover.alt = place.coverAlt || place.name; cover.hidden = false; }
    document.getElementById('detail-body').innerHTML = renderPortableText(place.description || []);

    const actions = [
      [place.mapUrl, 'Open in Google Maps', 'btn btn-primary'],
      [place.websiteUrl, 'Official Website', 'btn btn-outline'],
      [place.instagramUrl, 'Instagram', 'btn btn-outline'],
    ].map(([url, label, className]) => {
      const safeUrl = safeExternalUrl(url);
      return safeUrl ? `<a class="${className}" href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${label}</a>` : '';
    }).join('');
    document.getElementById('detail-actions').innerHTML = actions;

    const gallery = document.getElementById('detail-gallery');
    if (place.gallery?.length) { gallery.innerHTML = renderGallery(place.gallery); gallery.hidden = false; }
    loading.hidden = true;
    detail.hidden = false;
    bindShare({title: place.name, text: place.shortDescription || '', url: location.href});
  } catch (loadError) {
    console.error(loadError);
    loading.hidden = true;
    error.hidden = false;
  }
}
loadPlace();
