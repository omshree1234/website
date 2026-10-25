/* ============================================================
   OMSHREE INDUSTRIES SERVICE — script.js
   Multi-Page: Intersection Observer · Mobile Nav · FAQ · Form
   ============================================================ */
'use strict';

/* ─── INTEGRATIONS: SUPABASE & GOOGLE ANALYTICS ─────────── */
const SUPABASE_CONFIG = {
  url: 'https://kfistbmxnwfochkfwana.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaXN0Ym14bndmb2Noa2Z3YW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MDIwOTksImV4cCI6MjEwODQ3ODA5OX0.Xn87A8IcWshl-rCBnZ8wqG4w9mz4V4TUbAb18uL-7Fw',
  table: 'enquiries'
};

// Safe wrapper for Google Analytics (GA4) custom events
function trackEvent(eventName, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNav();
  initScrollReveal();
  initSmoothScroll();
  initContactForm();
  initFaqAccordion();
  initMarquee();
  initVisitingCard();
  initClickTracking();
});

function initClickTracking() {
  document.querySelectorAll('a[href^="tel:"]').forEach(el => {
    el.addEventListener('click', () => trackEvent('contact_phone_click', { event_category: 'Lead', phone: el.href }));
  });
  document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
    el.addEventListener('click', () => trackEvent('contact_whatsapp_click', { event_category: 'Lead', link: el.href }));
  });
}

/* ─── STICKY HEADER ─────────────────────────────────────── */
function initStickyHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  // If page has no full-height hero, keep solid always
  const hasHero = document.getElementById('hero');
  if (!hasHero) header.classList.add('header-solid');

  const onScroll = () => {
    if (window.scrollY > 60) header.classList.add('scrolled');
    else if (hasHero) header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─── MOBILE NAV DRAWER ─────────────────────────────────── */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const navOverlay = document.getElementById('nav-overlay');
  if (!hamburger || !mobileNav) return;

  const openNav = () => {
    hamburger.classList.add('active');
    mobileNav.classList.add('open');
    navOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => navOverlay.classList.add('visible'));
  };
  const closeNav = () => {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('open');
    navOverlay.classList.remove('visible');
    document.body.style.overflow = '';
    setTimeout(() => { navOverlay.style.display = 'none'; }, 350);
  };

  hamburger.addEventListener('click', () => mobileNav.classList.contains('open') ? closeNav() : openNav());
  navOverlay.addEventListener('click', closeNav);
  document.querySelectorAll('.mobile-nav a').forEach(l => l.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
}

/* ─── SCROLL REVEAL ─────────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -70px 0px', threshold: 0.10 });
  els.forEach(el => observer.observe(el));
}

/* ─── SMOOTH SCROLL ─────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = document.getElementById('header')?.offsetHeight || 80;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerH - 16, behavior: 'smooth' });
    });
  });
}

/* ─── FAQ ACCORDION ─────────────────────────────────────── */
function initFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      // Open current if was closed
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ─── MARQUEE (duplicate items for seamless loop) ───────── */
function initMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  const clone = track.cloneNode(true);
  track.parentElement.appendChild(clone);
}

/* ─── CONTACT FORM ──────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('enquiry-form');
  const formContainer = document.getElementById('form-container');
  const successMsg = document.getElementById('form-success');
  const submitBtn = document.getElementById('form-submit-btn');
  if (!form) return;

  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => { if (input.classList.contains('input-error')) validateField(input); });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let isValid = true;
    inputs.forEach(i => { if (!validateField(i)) isValid = false; });
    if (!isValid) { shakeForm(); return; }
    setSubmitLoading(submitBtn, true);

    const formData = new FormData(form);
    const payload = {
      name: formData.get('name') || '',
      company: formData.get('company') || '',
      phone: formData.get('phone') || '',
      email: formData.get('email') || '',
      service: formData.get('service_required') || '',
      urgency: formData.get('urgency') || '',
      location: formData.get('location') || '',
      requirement: formData.get('message') || '',
      submitted_at: new Date().toISOString()
    };

    let submittedSuccessfully = false;

    // 1. Supabase REST API (Instant DB Storage)
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
      try {
        const endpoint = `${SUPABASE_CONFIG.url.replace(/\/$/, '')}/rest/v1/${SUPABASE_CONFIG.table}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_CONFIG.anonKey,
            'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) submittedSuccessfully = true;
      } catch (err) {
        console.warn('Supabase submission failed:', err);
      }
    }

    // 2. Web3Forms fallback if access key is set
    const accessKey = formData.get('access_key');
    if (!submittedSuccessfully && accessKey && accessKey !== 'YOUR_WEB3FORMS_ACCESS_KEY_HERE') {
      try {
        const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) submittedSuccessfully = true;
      } catch (err) {
        console.warn('Web3Forms submission failed:', err);
      }
    }

    // 3. Local demo fallback if integrations are pending configuration
    if (!SUPABASE_CONFIG.url && (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY_HERE')) {
      submittedSuccessfully = true;
    }

    if (submittedSuccessfully) {
      trackEvent('generate_lead', {
        event_category: 'Contact',
        event_label: payload.service || 'General Enquiry',
        value: 1
      });
      formContainer.style.opacity = '0';
      formContainer.style.transform = 'translateY(20px)';
      formContainer.style.transition = 'all 0.4s ease';
      setTimeout(() => {
        formContainer.style.display = 'none';
        successMsg.style.display = 'block';
        successMsg.style.opacity = '0';
        requestAnimationFrame(() => {
          successMsg.style.transition = 'all 0.4s ease';
          successMsg.style.opacity = '1';
        });
      }, 400);
      form.reset();
    } else {
      showToast('⚠️ Submission failed. Please call +91 9545318160 directly.');
      setSubmitLoading(submitBtn, false);
    }
  });
}

function validateField(input) {
  const val = input.value.trim();
  let ok = true;
  input.classList.remove('input-error', 'input-valid');
  if (input.hasAttribute('required') && !val) ok = false;
  else if (input.type === 'email' && val) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  else if (input.type === 'tel' && val) ok = /^[\d\s\+\-\(\)]{7,15}$/.test(val);
  input.classList.add(ok ? 'input-valid' : 'input-error');
  return ok;
}

function setSubmitLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading ? '<span class="btn-spinner"></span> Sending...' : '🚀 Send Enquiry';
  btn.style.opacity = loading ? '0.8' : '1';
}

function shakeForm() {
  const f = document.getElementById('enquiry-form');
  f.classList.add('form-shake');
  setTimeout(() => f.classList.remove('form-shake'), 600);
}

function showToast(msg) {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast-notification';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 5000);
}

/* ─── DIGITAL VISITING CARD MODAL & DOWNLOAD & SHARE ─────── */
function initVisitingCard() {
  const trigger = document.getElementById('vcard-trigger');
  const modal = document.getElementById('vcard-modal');
  const closeBtn = document.getElementById('vcard-modal-close');
  const shareBtn = document.getElementById('vcard-share-btn');

  if (trigger && modal) {
    const openModal = () => {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    };

    trigger.addEventListener('click', openModal);
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal();
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  // Robust blob-based download handling
  const downloadBtns = document.querySelectorAll('a[download*="visiting_card"], a[download*="Visiting_Card"], #vcard-download-btn');
  downloadBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch('visiting_card.jpg');
        if (!res.ok) throw new Error('File not accessible');
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'Omshree_Industries_Service_Visiting_Card.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
        showToast('📥 Visiting card downloaded successfully!');
        trackEvent('download_visiting_card', { event_category: 'Downloads', file: 'visiting_card.jpg' });
      } catch (err) {
        // Fallback to direct navigation / download attribute
        window.open('visiting_card.jpg', '_blank');
      }
    });
  });

  const getCardShareUrl = () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      return 'https://omshree-industries-service.vercel.app/contact.html#digital-card';
    }
    return window.location.href.split('#')[0] + '#digital-card';
  };

  const waBtn = document.getElementById('vcard-wa-btn');
  if (waBtn) {
    const cardUrl = getCardShareUrl();
    const waText = `Omshree Industries Service — Industrial machines repair, CNC/VMC maintenance & skilled manpower in Pune & PCMC. Phone: +91 9545318160. ${cardUrl}`;
    waBtn.href = `https://wa.me/?text=${encodeURIComponent(waText)}`;
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const cardUrl = getCardShareUrl();
      const shareData = {
        title: 'Omshree Industries Service — Digital Visiting Card',
        text: 'Omshree Industries Service — Industrial machines repair, CNC/VMC maintenance & skilled manpower in Pune & PCMC. Phone: +91 9545318160.',
        url: cardUrl
      };
      trackEvent('share_visiting_card', { event_category: 'Engagement', platform: 'WebShare/Clipboard' });
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          // user cancelled or share failed
        }
      } else {
        try {
          await navigator.clipboard.writeText(shareData.url);
          showToast('📋 Visiting card link copied to clipboard!');
        } catch {
          showToast('Direct contact: +91 9545318160');
        }
      }
    });
  }
}

/* ─── RUNTIME STYLE INJECTIONS ──────────────────────────── */
const s = document.createElement('style');
s.textContent = `
  .input-error { border-color: #C0392B !important; box-shadow: 0 0 0 3px rgba(192,57,43,0.15) !important; }
  .input-valid { border-color: rgba(37,211,102,0.5) !important; }
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
  .form-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97); }
  .btn-spinner { display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; vertical-align:middle; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .toast-notification { position:fixed; bottom:100px; right:32px; background:#2E3440; color:#FFF8E7; padding:16px 24px; border-radius:8px; font-size:0.9rem; box-shadow:0 10px 40px rgba(0,0,0,0.4); z-index:9999; opacity:0; transform:translateY(20px); transition:all 0.35s ease; border-left:3px solid #C0392B; max-width:340px; }
`;
document.head.appendChild(s);
