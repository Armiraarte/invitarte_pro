const INVITATION_CONFIG = {
  eventLabel: "Invitacion digital",
  title: "Nombre 1 & Nombre 2",
  subtitle: "Una celebracion lista para editar y subir",
  hosts: "Con la bendicion de nuestras familias",
  mainMessage:
    "Esta invitacion esta hecha con HTML, CSS y JS plano para que puedas editarla directamente y subirla sin instalar ni construir nada.",
  date: "2026-10-18",
  time: "16:30",
  venueName: "Hacienda San Jose, Tepotzotlan",
  venueAddress: "Km 12.5 Carretera Real del Monte, Tepotzotlan, Edo. de Mexico",
  venueMapsUrl: "https://maps.google.com/?q=Hacienda+San+Jose+Tepotzotlan",
  theme: "elegant",
  dressCode: "formal",
  dressCodeColor: "Negro, champagne y dorado suave",
  story:
    "Edita este bloque para contar la historia, el concepto del evento o cualquier mensaje importante para tus invitados.",
  timeline: [
    { id: "ceremonia", time: "16:30", title: "Ceremonia", description: "Capilla principal", icon: "church" },
    { id: "coctel", time: "18:00", title: "Coctel", description: "Jardin central", icon: "toast" },
    { id: "cena", time: "19:30", title: "Cena", description: "Salon principal", icon: "calendar" },
    { id: "fiesta", time: "21:30", title: "Fiesta", description: "Pista abierta hasta cerrar", icon: "party" },
  ],
  giftTables: [
    {
      storeName: "Mesa de regalos",
      notes: "Liverpool o Amazon",
    },
    {
      storeName: "Transferencia",
      accountNumber: "CLABE 0000 0000 0000 0000",
      notes: "Agrega aqui la cuenta o instrucciones",
    },
  ],
  gallery: [
    {
      id: "foto-1",
      title: "Foto 1",
      url: "",
    },
    {
      id: "foto-2",
      title: "Foto 2",
      url: "",
    },
    {
      id: "foto-3",
      title: "Foto 3",
      url: "",
    },
  ],
  specialNotes: [
    "Evento exclusivo para adultos.",
    "Favor de confirmar antes del 18 de septiembre.",
    "Llega con 20 minutos de anticipacion.",
  ],
  recommendedStays: [],
  transportInfo: {
    notes: "",
  },
  photoShareUrl: "",
  photoShareMessage: "",
  organizerContacts: [],
  backgroundMusicUrl: "",
  musicPlaylistUrl: "https://open.spotify.com/",
  musicRequested: false,
  coverImage: "",
  colors: {
    bg: "#f4ede3",
    surface: "rgba(255, 252, 247, 0.9)",
    surfaceStrong: "#fffdf9",
    text: "#1d1a17",
    muted: "#6d6255",
    line: "rgba(125, 96, 53, 0.14)",
    accent: "#b88a2e",
    accentStrong: "#7c5615",
  },
  rsvpPhone: "5215512345678",
  rsvpMessage: "Hola, quiero confirmar mi asistencia al evento de Nombre 1 y Nombre 2.",
  footerTitle: "Lista para copiar, editar y publicar",
  footerCopy:
    "Puedes editar index.html, styles.css y script.js directamente. Luego sube la carpeta o el ZIP del proyecto sin pasar por npm ni build.",
};

const root = document.documentElement;
window.INVITATION_CONFIG = INVITATION_CONFIG;

const asArray = (value) => (Array.isArray(value) ? value : []);

const applyTheme = () => {
  const palette = INVITATION_CONFIG.colors ?? {};
  Object.entries(palette).forEach(([key, value]) => {
    if (typeof value !== "string" || value.trim() === "") return;
    const cssVar = `--${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`;
    root.style.setProperty(cssVar, value);
  });
};

const buildEventDateIso = () => {
  const date = String(INVITATION_CONFIG.date ?? "").trim();
  const time = String(INVITATION_CONFIG.time ?? "").trim() || "00:00";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "";
  }

  return `${date}T${time}:00`;
};

const formatDateLabel = () => {
  const isoDate = buildEventDateIso();
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return [INVITATION_CONFIG.date, INVITATION_CONFIG.time].filter(Boolean).join(" ");
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(parsed);
};

const buildWhatsAppUrl = (phone, message) => {
  const normalizedPhone = String(phone || "").replace(/[^\d]/g, "");
  const encodedMessage = encodeURIComponent(message || "");
  return normalizedPhone
    ? `https://wa.me/${normalizedPhone}?text=${encodedMessage}`
    : "#";
};

const setText = (selector, value) => {
  const node = document.querySelector(selector);
  if (node) {
    node.textContent = value ?? "";
  }
};

const setLink = (selector, href, fallbackLabel) => {
  const node = document.querySelector(selector);
  if (!(node instanceof HTMLAnchorElement)) return;

  const normalizedHref = String(href ?? "").trim();
  if (normalizedHref === "") {
    node.setAttribute("href", "#");
    node.setAttribute("aria-disabled", "true");
    node.classList.add("is-disabled");
    if (fallbackLabel) {
      node.textContent = fallbackLabel;
    }
    return;
  }

  node.setAttribute("href", normalizedHref);
  node.removeAttribute("aria-disabled");
  node.classList.remove("is-disabled");
};

const renderDetails = () => {
  const list = document.querySelector("#detail-list");
  if (!list) return;

  const details = [
    INVITATION_CONFIG.date ? { label: "Fecha", value: INVITATION_CONFIG.date } : null,
    INVITATION_CONFIG.time ? { label: "Hora", value: INVITATION_CONFIG.time } : null,
    INVITATION_CONFIG.venueName ? { label: "Lugar", value: INVITATION_CONFIG.venueName } : null,
    INVITATION_CONFIG.dressCode ? { label: "Codigo de vestimenta", value: INVITATION_CONFIG.dressCode } : null,
    INVITATION_CONFIG.dressCodeColor ? { label: "Paleta sugerida", value: INVITATION_CONFIG.dressCodeColor } : null,
  ].filter(Boolean);

  list.innerHTML = details
    .map(
      (item) => `
        <li>
          <span class="detail-label">${item.label}</span>
          <span>${item.value}</span>
        </li>
      `
    )
    .join("");
};

const renderTimeline = () => {
  const container = document.querySelector("#timeline");
  if (!container) return;

  container.innerHTML = asArray(INVITATION_CONFIG.timeline)
    .map(
      (item) => `
        <article class="timeline-item">
          <span class="timeline-time">${item.time ?? ""}</span>
          <h3>${item.title ?? ""}</h3>
          <p>${item.description ?? ""}</p>
        </article>
      `
    )
    .join("");
};

const renderGallery = () => {
  const container = document.querySelector("#gallery");
  if (!container) return;

  container.innerHTML = asArray(INVITATION_CONFIG.gallery)
    .map((item, index) => {
      const rawUrl = String(item.url ?? "").trim();
      const hasImage = rawUrl !== "";
      const visualStyle = hasImage ? `style="background-image:url('${rawUrl}');"` : "";
      const description = hasImage
        ? "Reemplaza esta imagen por la foto final que quieras mostrar."
        : `Agrega una imagen como ./invitacion/foto-${index + 1}.jpg`;

      return `
        <article class="gallery-card">
          <div class="gallery-visual ${hasImage ? "has-image" : ""}" ${visualStyle}></div>
          <div class="gallery-copy">
            <h3>${item.title ?? `Foto ${index + 1}`}</h3>
            <p>${description}</p>
          </div>
        </article>
      `;
    })
    .join("");
};

const renderGiftTables = () => {
  const container = document.querySelector("#gift-list");
  if (!container) return;

  container.innerHTML = asArray(INVITATION_CONFIG.giftTables)
    .map((item) => {
      const lines = [
        item.notes ?? "",
        item.accountNumber ? `Cuenta: ${item.accountNumber}` : "",
        item.link ?? "",
      ].filter(Boolean);

      return `
        <div class="stack-item">
          <strong>${item.storeName ?? "Mesa de regalos"}</strong>
          <span>${lines.join(" · ")}</span>
        </div>
      `;
    })
    .join("");
};

const renderNotes = () => {
  const container = document.querySelector("#note-list");
  if (!container) return;

  container.innerHTML = asArray(INVITATION_CONFIG.specialNotes)
    .map(
      (note) => `
        <div class="stack-item">
          <strong>Nota</strong>
          <span>${note}</span>
        </div>
      `
    )
    .join("");
};

const setupHeroPhoto = () => {
  const photo = document.querySelector("#hero-photo");
  if (!photo) return;

  const coverImage = String(INVITATION_CONFIG.coverImage ?? "").trim();
  if (!coverImage) return;

  photo.classList.add("has-image");
  photo.style.backgroundImage = `url('${coverImage}')`;
  const placeholder = photo.querySelector(".hero-photo-placeholder");
  if (placeholder) {
    placeholder.remove();
  }
};

const updateCountdown = () => {
  const countdown = document.querySelector("#countdown");
  if (!countdown) return;

  const parsedTarget = new Date(buildEventDateIso());
  const now = new Date();
  const diff = parsedTarget.getTime() - now.getTime();

  if (Number.isNaN(parsedTarget.getTime()) || diff <= 0) {
    countdown.querySelectorAll("strong").forEach((node) => {
      node.textContent = "00";
    });
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  [days, hours, minutes, seconds].forEach((value, index) => {
    const node = countdown.querySelectorAll("strong")[index];
    if (node) {
      node.textContent = String(value).padStart(2, "0");
    }
  });
};

const setupAudio = () => {
  const audio = document.querySelector("#background-audio");
  const toggle = document.querySelector("#music-toggle");
  if (!(audio instanceof HTMLAudioElement) || !(toggle instanceof HTMLButtonElement)) {
    return;
  }

  const backgroundMusicUrl = String(INVITATION_CONFIG.backgroundMusicUrl ?? "").trim();
  if (!backgroundMusicUrl) {
    toggle.disabled = true;
    toggle.textContent = "Sin musica";
    return;
  }

  audio.src = backgroundMusicUrl;
  let isPlaying = false;

  toggle.addEventListener("click", async () => {
    if (!isPlaying) {
      try {
        await audio.play();
        isPlaying = true;
        toggle.textContent = "Pausar musica";
      } catch {
        toggle.textContent = "No se pudo reproducir";
      }
      return;
    }

    audio.pause();
    isPlaying = false;
    toggle.textContent = "Activar musica";
  });
};

const boot = () => {
  applyTheme();
  document.title = INVITATION_CONFIG.title || "Invitacion digital";

  setText("#event-label", INVITATION_CONFIG.eventLabel || "Invitacion digital");
  setText("#event-title", INVITATION_CONFIG.title || "");
  setText("#event-hosts", INVITATION_CONFIG.hosts || INVITATION_CONFIG.subtitle || "");
  setText("#event-message", INVITATION_CONFIG.mainMessage || "");
  setText("#event-date", formatDateLabel());
  setText(
    "#event-venue",
    [INVITATION_CONFIG.venueName, INVITATION_CONFIG.venueAddress].filter(Boolean).join(" | ")
  );
  setText("#story-copy", INVITATION_CONFIG.story || "");
  setText("#footer-title", INVITATION_CONFIG.footerTitle || INVITATION_CONFIG.title || "");
  setText("#footer-copy", INVITATION_CONFIG.footerCopy || "");

  setLink("#map-link", INVITATION_CONFIG.venueMapsUrl, "Sin ubicacion");
  setLink("#playlist-link", INVITATION_CONFIG.musicPlaylistUrl, "Sin playlist");
  setLink(
    "#rsvp-link",
    buildWhatsAppUrl(INVITATION_CONFIG.rsvpPhone, INVITATION_CONFIG.rsvpMessage),
    "Sin RSVP"
  );

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

window.addEventListener("DOMContentLoaded", boot);
