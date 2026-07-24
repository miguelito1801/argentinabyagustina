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

async function fetchSanity(query, params = {}) {
  const search = new URLSearchParams({query, ...Object.fromEntries(Object.entries(params).map(([key, value]) => [`$${key}`, JSON.stringify(value)]))});
  const response = await fetch(`https://${SANITY.projectId}.apicdn.sanity.io/v${SANITY.apiVersion}/data/query/${SANITY.dataset}?${search}`, {headers:{Accept:'application/json'}});
  if (!response.ok) throw new Error(`Sanity request failed (${response.status})`);
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

function formatDate(value, includeTime = true) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {year:'numeric', month:'long', day:'numeric', ...(includeTime ? {hour:'numeric', minute:'2-digit'} : {})}).format(date);
}

function calendarUrl(event) {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';
  const clean = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || 'Argentina event',
    dates: `${clean(start)}/${clean(end)}`,
    details: event.summary || '',
    location: event.address || event.venue || '',
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

async function loadEvent() {
  const slug = new URLSearchParams(location.search).get('slug');
  const loading = document.getElementById('detail-loading');
  const detail = document.getElementById('detail');
  const error = document.getElementById('detail-error');
  if (!slug || slug.length > 160) { loading.hidden = true; error.hidden = false; return; }

  try {
    const query = `*[_type == "event" && slug.current == $slug && active != false][0]{title,"slug":slug.current,summary,startsAt,endsAt,venue,address,mapUrl,officialUrl,"city":city->name,"categories":categories[]->title,"coverUrl":coverImage.asset->url,"coverAlt":coverImage.alt,description[]{...,"url":asset->url},gallery[]{...,"url":asset->url}}`;
    const event = await fetchSanity(query, {slug});
    if (!event) throw new Error('Event not found');

    updateMetadata(event.title, event.summary, `https://www.argentinabyagustina.com/events/${encodeURIComponent(event.slug)}`);
    document.getElementById('detail-title').textContent = event.title;
    document.getElementById('detail-summary').textContent = event.summary || '';
    document.getElementById('detail-kicker').textContent = [event.city, ...(event.categories || [])].filter(Boolean).join(' · ') || 'Argentina';
    document.getElementById('detail-meta').textContent = `${formatDate(event.startsAt)} — ${formatDate(event.endsAt)}${event.venue ? ` · ${event.venue}` : ''}`;

    const cover = document.getElementById('detail-cover');
    const safeCover = safeExternalUrl(event.coverUrl);
    if (safeCover) { cover.src = safeCover; cover.alt = event.coverAlt || event.title; cover.hidden = false; }
    document.getElementById('detail-body').innerHTML = renderPortableText(event.description || []);

    const actions = [];
    const calendar = calendarUrl(event);
    if (calendar) actions.push(`<a class="btn btn-primary" href="${escapeHtml(calendar)}" target="_blank" rel="noopener noreferrer">Add to Google Calendar</a>`);
    for (const [url, label] of [[event.mapUrl, 'Open Map'], [event.officialUrl, 'Official Event Page']]) {
      const safeUrl = safeExternalUrl(url);
      if (safeUrl) actions.push(`<a class="btn btn-outline" href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${label}</a>`);
    }
    document.getElementById('detail-actions').innerHTML = actions.join('');

    const gallery = document.getElementById('detail-gallery');
    if (event.gallery?.length) { gallery.innerHTML = renderGallery(event.gallery); gallery.hidden = false; }
    loading.hidden = true;
    detail.hidden = false;
    bindShare({title: event.title, text: event.summary || '', url: location.href});
  } catch (loadError) {
    console.error(loadError);
    loading.hidden = true;
    error.hidden = false;
  }
}
loadEvent();
