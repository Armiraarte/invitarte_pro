const INVITATION_CONFIG = {
  "eventLabel": "Invitacion W9JSR86LCH",
  "title": "David Jiménez & Claudia Alvarado",
  "subtitle": "NUESTRA BODA",
  "hosts": "Con la bendición de nuestros padres",
  "mainMessage": "Hay momentos en la vida que son especiales por sí solos, pero compartirlos con las personas que amamos los hace inolvidables. Te esperamos para celebrar nuestra unión.",
  "date": "2026-10-18",
  "time": "16:30",
  "venueName": "Hacienda San José",
  "venueAddress": "Km 12.5 Carretera Real del Monte, Tepotzotlán, Edo. de México",
  "venueMapsUrl": "https://maps.google.com/?q=Hacienda+San+Jose+Tepotzotlan",
  "theme": "elegant",
  "dressCode": "Formal",
  "dressCodeColor": "Rigurosa Etiqueta (Hombres de Traje Oscuro / Mujeres Vestido Largo)",
  "story": "Nos conocimos entre cafés largos, playlists compartidas y viajes improvisados. Con el tiempo descubrimos que nuestro lugar favorito siempre era donde estábamos juntos. Hoy queremos celebrar ese camino con las personas que han sido parte de nuestra historia.",
  "timeline": [
    {
      "id": "1",
      "time": "16:30",
      "title": "Ceremonia Religiosa",
      "description": "",
      "icon": "church"
    },
    {
      "id": "2",
      "time": "18:00",
      "title": "Coctel de Bienvenida",
      "description": "",
      "icon": "toast"
    },
    {
      "id": "3",
      "time": "19:00",
      "title": "Recepción & Banquete",
      "description": "",
      "icon": "calendarNote"
    },
    {
      "id": "4",
      "time": "21:30",
      "title": "Apertura de Pista & Baile",
      "description": "",
      "icon": "party"
    }
  ],
  "giftTables": [
    {
      "storeName": "Liverpool (Mesa de Regalos)",
      "notes": "Código de evento: 50920491",
      "accountNumber": ""
    },
    {
      "storeName": "Lluvia de Sobres",
      "notes": "En la recepción tendremos un buzón para sobres de obsequios en efectivo/transferencia.",
      "accountNumber": ""
    }
  ],
  "gallery": [
    {
      "id": "foto-1",
      "title": "Foto 1",
      "url": "./invitacion/propuesta.webp"
    },
    {
      "id": "foto-2",
      "title": "Foto 2",
      "url": "./invitacion/sesion1.webp"
    },
    {
      "id": "foto-3",
      "title": "Foto 3",
      "url": "./invitacion/sesion2.webp"
    }
  ],
  "specialNotes": [
    "Evento exclusivo para adultos.",
    "Te pedimos confirmar asistencia antes del 18 de septiembre de 2026.",
    "Por logística del venue, agradecemos llegar 20 minutos antes de la ceremonia."
  ],
  "recommendedStays": [
    {
      "name": "Hotel Boutique Real del Monte",
      "address": "Centro de Tepotzotlán, Edo. de México",
      "notes": "A 12 minutos de la hacienda. Pregunta por la tarifa especial para invitados."
    }
  ],
  "transportInfo": {
    "parking": "La hacienda cuenta con valet parking incluido para invitados.",
    "shuttle": "Habrá transporte de regreso al hotel sugerido a las 00:30 y 02:00 hrs.",
    "notes": "Si requieres apoyo especial de movilidad, avísanos al confirmar tu asistencia."
  },
  "photoShareUrl": "",
  "photoShareMessage": "Después del evento podrás subir tus fotos y videos a nuestra carpeta compartida.",
  "organizerContacts": [],
  "backgroundMusicUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "musicPlaylistUrl": "https://spotify.com",
  "musicRequested": true,
  "coverImage": "./invitacion/propuesta.webp",
  "colors": {
    "bg": "#f4ede3",
    "surface": "rgba(255, 252, 247, 0.9)",
    "surfaceStrong": "#fffdf9",
    "text": "#1d1a17",
    "muted": "#6d6255",
    "line": "rgba(125, 96, 53, 0.14)",
    "accent": "#b88a2e",
    "accentStrong": "#7c5615"
  },
  "rsvpPhone": "5215512345678",
  "rsvpMessage": "Aquí viven los datos de asistencia, acompañantes y mensajes finales.",
  "footerTitle": "David Jiménez & Claudia Alvarado",
  "footerCopy": "Invitacion estatica generada desde el editor para David Jiménez & Claudia Alvarado."
};
window.INVITATION_CONFIG = INVITATION_CONFIG;

const root = document.documentElement;

const asArray = function (value) {
  return Array.isArray(value) ? value : [];
};

const escapeHtml = function (value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const applyTheme = function () {
  const palette = INVITATION_CONFIG.colors || {};
  Object.keys(palette).forEach(function (key) {
    const value = palette[key];
    if (typeof value !== 'string' || value.trim() === '') return;
    const cssVar = '--' + key.replace(/[A-Z]/g, function (match) {
      return '-' + match.toLowerCase();
    });
    root.style.setProperty(cssVar, value);
  });
};

const buildEventDateIso = function () {
  const date = String(INVITATION_CONFIG.date || '').trim();
  const time = String(INVITATION_CONFIG.time || '').trim() || '00:00';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return '';
  }

  return date + 'T' + time + ':00';
};

const formatDateLabel = function () {
  const isoDate = buildEventDateIso();
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return [INVITATION_CONFIG.date, INVITATION_CONFIG.time].filter(Boolean).join(' ');
  }

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(parsed);
};

const buildWhatsAppUrl = function (phone, message) {
  const normalizedPhone = String(phone || '').replace(/[^\d]/g, '');
  const encodedMessage = encodeURIComponent(message || '');
  return normalizedPhone ? 'https://wa.me/' + normalizedPhone + '?text=' + encodedMessage : '#';
};

const setText = function (selector, value) {
  const node = document.querySelector(selector);
  if (node) {
    node.textContent = value || '';
  }
};

const setLink = function (selector, href, fallbackLabel) {
  const node = document.querySelector(selector);
  if (!(node instanceof HTMLAnchorElement)) return;

  const normalizedHref = String(href || '').trim();
  if (normalizedHref === '') {
    node.setAttribute('href', '#');
    node.setAttribute('aria-disabled', 'true');
    node.classList.add('is-disabled');
    if (fallbackLabel) {
      node.textContent = fallbackLabel;
    }
    return;
  }

  node.setAttribute('href', normalizedHref);
  node.removeAttribute('aria-disabled');
  node.classList.remove('is-disabled');
};

const renderDetails = function () {
  const list = document.querySelector('#detail-list');
  if (!list) return;

  const details = [
    INVITATION_CONFIG.date ? { label: 'Fecha', value: INVITATION_CONFIG.date } : null,
    INVITATION_CONFIG.time ? { label: 'Hora', value: INVITATION_CONFIG.time } : null,
    INVITATION_CONFIG.venueName ? { label: 'Lugar', value: INVITATION_CONFIG.venueName } : null,
    INVITATION_CONFIG.dressCode ? { label: 'Codigo de vestimenta', value: INVITATION_CONFIG.dressCode } : null,
    INVITATION_CONFIG.dressCodeColor ? { label: 'Paleta sugerida', value: INVITATION_CONFIG.dressCodeColor } : null
  ].filter(Boolean);

  list.innerHTML = details.map(function (item) {
    return '<li><span class="detail-label">' + escapeHtml(item.label) + '</span><span>' + escapeHtml(item.value) + '</span></li>';
  }).join('');
};

const renderTimeline = function () {
  const container = document.querySelector('#timeline');
  if (!container) return;

  container.innerHTML = asArray(INVITATION_CONFIG.timeline).map(function (item) {
    return '<article class="timeline-item">' +
      '<span class="timeline-time">' + escapeHtml(item.time || '') + '</span>' +
      '<h3>' + escapeHtml(item.title || '') + '</h3>' +
      '<p>' + escapeHtml(item.description || '') + '</p>' +
    '</article>';
  }).join('');
};

const renderGallery = function () {
  const container = document.querySelector('#gallery');
  if (!container) return;

  container.innerHTML = '';
  asArray(INVITATION_CONFIG.gallery).forEach(function (item, index) {
    const card = document.createElement('article');
    card.className = 'gallery-card';

    const visual = document.createElement('div');
    visual.className = 'gallery-visual';
    const rawUrl = String(item.url || '').trim();
    if (rawUrl !== '') {
      visual.classList.add('has-image');
      visual.style.backgroundImage = "url('" + rawUrl.replace(/'/g, '%27') + "')";
    }

    const copy = document.createElement('div');
    copy.className = 'gallery-copy';
    const title = document.createElement('h3');
    title.textContent = item.title || ('Foto ' + String(index + 1));
    const description = document.createElement('p');
    description.textContent = rawUrl !== ''
      ? 'Imagen lista para este bloque.'
      : 'Agrega una imagen cuando quieras reemplazar este espacio.';

    copy.appendChild(title);
    copy.appendChild(description);
    card.appendChild(visual);
    card.appendChild(copy);
    container.appendChild(card);
  });
};

const renderGiftTables = function () {
  const container = document.querySelector('#gift-list');
  if (!container) return;

  container.innerHTML = asArray(INVITATION_CONFIG.giftTables).map(function (item) {
    const lines = [item.notes || '', item.accountNumber ? 'Cuenta: ' + item.accountNumber : '', item.link || ''].filter(Boolean);
    return '<div class="stack-item"><strong>' + escapeHtml(item.storeName || 'Mesa de regalos') + '</strong><span>' + escapeHtml(lines.join(' | ')) + '</span></div>';
  }).join('');
};

const renderNotes = function () {
  const container = document.querySelector('#note-list');
  if (!container) return;

  container.innerHTML = asArray(INVITATION_CONFIG.specialNotes).map(function (note) {
    return '<div class="stack-item"><strong>Nota</strong><span>' + escapeHtml(note) + '</span></div>';
  }).join('');
};

const setupHeroPhoto = function () {
  const photo = document.querySelector('#hero-photo');
  if (!photo) return;

  const coverImage = String(INVITATION_CONFIG.coverImage || '').trim();
  if (!coverImage) return;

  photo.classList.add('has-image');
  photo.style.backgroundImage = "url('" + coverImage.replace(/'/g, '%27') + "')";
  const placeholder = photo.querySelector('.hero-photo-placeholder');
  if (placeholder) {
    placeholder.remove();
  }
};

const updateCountdown = function () {
  const countdown = document.querySelector('#countdown');
  if (!countdown) return;

  const parsedTarget = new Date(buildEventDateIso());
  const now = new Date();
  const diff = parsedTarget.getTime() - now.getTime();
  const parts = countdown.querySelectorAll('strong');

  if (Number.isNaN(parsedTarget.getTime()) || diff <= 0) {
    parts.forEach(function (node) {
      node.textContent = '00';
    });
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  [days, hours, minutes, seconds].forEach(function (value, index) {
    if (parts[index]) {
      parts[index].textContent = String(value).padStart(2, '0');
    }
  });
};

const setupAudio = function () {
  const audio = document.querySelector('#background-audio');
  const toggle = document.querySelector('#music-toggle');
  if (!(audio instanceof HTMLAudioElement) || !(toggle instanceof HTMLButtonElement)) {
    return;
  }

  const backgroundMusicUrl = String(INVITATION_CONFIG.backgroundMusicUrl || '').trim();
  if (!backgroundMusicUrl) {
    toggle.disabled = true;
    toggle.textContent = 'Sin musica';
    return;
  }

  audio.src = backgroundMusicUrl;
  let isPlaying = false;

  toggle.addEventListener('click', async function () {
    if (!isPlaying) {
      try {
        await audio.play();
        isPlaying = true;
        toggle.textContent = 'Pausar musica';
      } catch (error) {
        toggle.textContent = 'No se pudo reproducir';
      }
      return;
    }

    audio.pause();
    isPlaying = false;
    toggle.textContent = 'Activar musica';
  });
};

const boot = function () {
  applyTheme();
  document.title = INVITATION_CONFIG.title || 'Invitacion digital';

  setText('#event-label', INVITATION_CONFIG.eventLabel || 'Invitacion digital');
  setText('#event-title', INVITATION_CONFIG.title || '');
  setText('#event-hosts', INVITATION_CONFIG.hosts || INVITATION_CONFIG.subtitle || '');
  setText('#event-message', INVITATION_CONFIG.mainMessage || '');
  setText('#event-date', formatDateLabel());
  setText('#event-venue', [INVITATION_CONFIG.venueName, INVITATION_CONFIG.venueAddress].filter(Boolean).join(' | '));
  setText('#story-copy', INVITATION_CONFIG.story || '');
  setText('#footer-title', INVITATION_CONFIG.footerTitle || INVITATION_CONFIG.title || '');
  setText('#footer-copy', INVITATION_CONFIG.footerCopy || '');

  setLink('#map-link', INVITATION_CONFIG.venueMapsUrl, 'Sin ubicacion');
  setLink('#playlist-link', INVITATION_CONFIG.musicPlaylistUrl, 'Sin playlist');
  setLink('#rsvp-link', buildWhatsAppUrl(INVITATION_CONFIG.rsvpPhone, INVITATION_CONFIG.rsvpMessage), 'Sin RSVP');

  renderDetails();
  renderTimeline();
  renderGallery();
  renderGiftTables();
  renderNotes();
  setupHeroPhoto();
  setupAudio();
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
};

window.addEventListener('DOMContentLoaded', boot);

