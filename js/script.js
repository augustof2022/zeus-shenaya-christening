/* ============================================================
   CHRISTENING SITE SETTINGS
   Edit ONLY this block to update the whole site.
   Everything else reads from here.
   ============================================================ */
const CONFIG = {
  /* Event date and time (Christening day).
     Format: YYYY-MM-DDTHH:MM:SS+08:00 (PH time) */
  eventISO: '2026-10-11T10:00:00+08:00',

  church: {
    name: 'St. Andrew the Apostle Parish Church',
    address: 'Poblacion, Norzagaray, Bulacan',
    callTime: '10:00 AM',
    mapUrl: 'https://maps.app.goo.gl/HVtfSKbYDGWxvS72A',
  },

  reception: {
    name: 'Guilalas-Mendoza Residence',
    address: 'Norzagaray-San Jose Road, Partida, Norzagaray, Bulacan',
    mapUrl: 'https://maps.app.goo.gl/KYdGKBsYCBm3Y1eX6',
  },

  rsvp: {
    endpoint: '',     // optional: Google Apps Script or Formspree URL
    messengerUrl: '', // optional: e.g. 'https://m.me/your.username'
  },
};
/* ============================================================
   No need to edit below this line.
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const EVENT_DATE = new Date(CONFIG.eventISO);

/* ---------- toast (little popup messages) ---------- */
let toastTimer;
function toast(msg) {
  const el = $('[data-toast]');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

/* ---------- date text (hero pill + details card) ---------- */
function fillDates() {
  const long = EVENT_DATE.toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Asia/Manila',
  });
  const short = EVENT_DATE.toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Asia/Manila',
  });
  const time = EVENT_DATE.toLocaleTimeString('en-PH', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila',
  });
  // hero pill stays short so it never wraps; details card gets the full date
  $$('[data-event-date]').forEach(el => { el.textContent = short + ' | ' + time; });
  $$('[data-event-date-long]').forEach(el => { el.textContent = long + ' at ' + time; });
}

/* ---------- add to calendar links ---------- */
function calendarLink() {
  const start = EVENT_DATE;
  const end = new Date(EVENT_DATE.getTime() + 4 * 60 * 60 * 1000); // ~4 hours of celebration
  const stamp = d => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const details = [
    'Call time: ' + CONFIG.church.callTime,
    'Ceremony: ' + CONFIG.church.name + ', ' + CONFIG.church.address,
    'Map: ' + CONFIG.church.mapUrl,
    CONFIG.reception.name ? 'Reception: ' + CONFIG.reception.name + ' ' + CONFIG.reception.mapUrl : '',
  ].filter(Boolean).join('\n');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: "Zeus & Shenaya's Christening",
    dates: stamp(start) + '/' + stamp(end),
    details: details,
    location: CONFIG.church.name + ', ' + CONFIG.church.address,
  });
  return 'https://calendar.google.com/calendar/render?' + params;
}
function fillCalendar() {
  $$('[data-add-calendar]').forEach(a => { a.href = calendarLink(); });
}

/* ---------- reception card ---------- */
function fillReception() {
  const r = CONFIG.reception;
  const nameEl = $('[data-reception-name]');
  const addrEl = $('[data-reception-address]');
  const mapEl = $('[data-reception-map]');
  if (r.name) {
    nameEl.textContent = r.name;
    addrEl.textContent = r.address || '';
  } else {
    nameEl.textContent = 'Venue to be announced';
    addrEl.textContent = 'Details coming soon';
  }
  if (r.mapUrl && mapEl) {
    mapEl.href = r.mapUrl;
    mapEl.hidden = false;
  }
}

/* ---------- messenger RSVP fallback ---------- */
function fillMessenger() {
  const a = $('[data-messenger]');
  if (a && CONFIG.rsvp.messengerUrl) {
    a.href = CONFIG.rsvp.messengerUrl;
    a.hidden = false;
  }
}

/* ---------- countdown ---------- */
function startCountdown() {
  const wrap = $('.countdown');
  const done = $('[data-cd-done]');
  if (!wrap) return;
  const cells = {
    days: $('[data-cd="days"]'),
    hours: $('[data-cd="hours"]'),
    minutes: $('[data-cd="minutes"]'),
    seconds: $('[data-cd="seconds"]'),
  };
  const pad = n => String(n).padStart(2, '0');
  function setCell(el, val) {
    if (el.textContent !== val) {
      el.textContent = val;
      el.classList.remove('tick');
      void el.offsetWidth; // restart the pop animation
      el.classList.add('tick');
    }
  }
  function update() {
    const diff = EVENT_DATE.getTime() - Date.now();
    if (diff <= 0) {
      wrap.hidden = true;
      if (done) done.hidden = false;
      clearInterval(timer);
      return;
    }
    const s = Math.floor(diff / 1000);
    setCell(cells.days, String(Math.floor(s / 86400)));
    setCell(cells.hours, pad(Math.floor(s / 3600) % 24));
    setCell(cells.minutes, pad(Math.floor(s / 60) % 60));
    setCell(cells.seconds, pad(s % 60));
  }
  update();
  const timer = setInterval(update, 1000);
}

/* ---------- scroll reveal (gentle fade up) ---------- */
function initReveals() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ---------- seamless background scenes ---------- */
function initScenes() {
  const bg = $('.bg');
  if (!bg) return;
  const scenes = $$('.scene', bg);
  function activate(name) {
    scenes.forEach(s => s.classList.toggle('is-active', s.classList.contains('scene-' + name)));
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) activate(e.target.dataset.scene);
    });
  }, { rootMargin: '-48% 0px -48% 0px', threshold: 0 });
  $$('[data-scene]').forEach(el => io.observe(el));
}

/* ---------- sticky RSVP bar ---------- */
function initStickyCta() {
  const bar = $('[data-sticky]');
  const hero = $('.hero');
  const rsvpSection = $('#rsvp');
  if (!bar || !hero || !rsvpSection) return;
  let rsvpVisible = false;

  function update() {
    const past = window.scrollY > hero.offsetHeight * 0.75;
    bar.classList.toggle('show', past && !rsvpVisible);
  }

  new IntersectionObserver(entries => {
    rsvpVisible = entries[0].isIntersecting;
    update();
  }, { threshold: 0.08 }).observe(rsvpSection);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    }
  }, { passive: true });
  update();
}

/* ---------- share buttons ---------- */
function initShare() {
  $$('[data-share]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const data = {
        title: "Zeus & Shenaya's Christening",
        text: "You're invited to the Christening of Zeus Kyaire and Shenaya Iris! Tap for details:",
        url: location.href,
      };
      if (navigator.share) {
        try { await navigator.share(data); } catch (e) { /* guest cancelled, no problem */ }
      } else {
        try {
          await navigator.clipboard.writeText(location.href);
          toast('Link copied! Paste it anywhere to share.');
        } catch (e) {
          toast('Copy the link from your address bar to share.');
        }
      }
    });
  });
}

/* ---------- RSVP form ---------- */
function initRsvp() {
  const form = $('#rsvp-form');
  if (!form) return;
  const confirmCard = $('[data-confirm]');
  const nameInput = form.querySelector('[name="name"]');
  const guestsSel = form.querySelector('[name="guests"]');
  const msgInput = form.querySelector('[name="message"]');
  const btn = $('[data-submit]', form);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.classList.add('error');
      nameInput.focus();
      setTimeout(() => nameInput.classList.remove('error'), 1200);
      toast('Please add your name so we know who is coming.');
      return;
    }
    const payload = {
      name: name,
      guests: guestsSel.value,
      message: msgInput.value.trim(),
      sentAt: new Date().toISOString(),
    };
    btn.disabled = true;
    btn.textContent = 'Sending...';

    if (CONFIG.rsvp.endpoint) {
      try {
        // text/plain + no-cors avoids preflight issues with Apps Script web apps
        await fetch(CONFIG.rsvp.endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        showConfirm();
      } catch (err) {
        resetBtn();
        toast('No internet connection. Please try again.');
      }
    } else if (CONFIG.rsvp.messengerUrl) {
      toast('Opening Messenger so you can send your RSVP...');
      window.open(CONFIG.rsvp.messengerUrl, '_blank', 'noopener');
      showConfirm();
    } else {
      resetBtn();
      toast('RSVP is not set up yet. Please message the family directly.');
    }

    function showConfirm() {
      $('[data-confirm-name]').textContent = name.split(' ')[0];
      form.hidden = true;
      confirmCard.hidden = false;
      confirmCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    function resetBtn() {
      btn.disabled = false;
      btn.textContent = 'Confirm Attendance';
    }
  });
}

/* ---------- image auto-detector (tries each name until one loads) ---------- */
function probeImage(candidates, onFound) {
  (function tryNext(i) {
    if (i >= candidates.length) return; // none found, the design still looks great without it
    const img = new Image();
    img.onload = () => onFound(candidates[i]);
    img.onerror = () => tryNext(i + 1);
    img.src = candidates[i];
  })(0);
}

/* ---------- optional fluff texture (accepts png, jpg, jpeg, webp) ---------- */
function initTexture() {
  const layer = $('.texture-photo');
  if (!layer) return;
  probeImage([
    'assets/texture-fluff.png',
    'assets/texture-fluff.jpg',
    'assets/texture-fluff.jpeg',
    'assets/texture-fluff.webp',
    'assets/texture-fluff.PNG',
    'assets/texture-fluff.JPG',
  ], src => { layer.style.backgroundImage = 'url("' + src + '")'; });
}

/* ---------- hero photo background (hero-photo first, else the duo photo) ---------- */
function initHeroPhoto() {
  const layer = $('.hero-photo');
  if (!layer) return;
  probeImage([
    'assets/hero-photo.jpg',
    'assets/hero-photo.png',
    'assets/hero-photo.jpeg',
    'assets/hero-photo.webp',
    'assets/photo-duo.jpg',
    'assets/photo-duo.png',
  ], src => {
    layer.style.backgroundImage = 'url("' + src + '")';
    layer.classList.add('show');
  });
}

/* ---------- boot ---------- */
fillDates();
initTexture();
initHeroPhoto();
fillCalendar();
fillReception();
fillMessenger();
startCountdown();
initReveals();
initScenes();
initStickyCta();
initShare();
initRsvp();