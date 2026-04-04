/**
 * Not Your Grandma's Cellar, LLC — main.js
 * Author: GitHub/1800downed
 *
 * Sections:
 *   1. Sticky header shadow
 *   2. Mobile nav toggle
 *   3. Nav close on link click (mobile)
 *   4. Scroll reveal (IntersectionObserver)
 *   5. Footer year
 *   6. Pre-order form
 *        a. Fulfillment select — show/hide address block
 *        b. Field validation with inline errors
 *        c. Live validation (clears on input, re-checks on blur)
 *        d. Formspree fetch submission
 *        e. Loading / success / error state management
 *        f. Focus management after submit
 *
 * ENDPOINT:
 *   Formspree form ID: xgoppawj
 *   Endpoint: https://formspree.io/f/xgoppawj
 *   To swap backend later: change FORMSPREE_ID here and
 *   update <form action> in index.html. Nothing else changes.
 */

'use strict';

/* ── ENDPOINT ─────────────────────────────────────────────────────── */
const FORMSPREE_ID = 'xgoppawj';
const FORM_ENDPOINT = `https://formspree.io/f/${FORMSPREE_ID}`;


document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. STICKY HEADER ───────────────────────────────────────────── */
  const header = document.querySelector('.site-header');
  if (header) {
    const tick = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }


  /* ── 2. MOBILE NAV TOGGLE ───────────────────────────────────────── */
  const toggle  = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      navMenu.classList.toggle('is-open', !open);
    });

    /* ── 3. CLOSE ON LINK CLICK ───────────────────────────────────── */
    navMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
      });
    });
  }


  /* ── 4. SCROLL REVEAL ───────────────────────────────────────────── */
  const targets = document.querySelectorAll(
    '.product-card, .about__media, .about__copy, .order__intro, .order-form, .contact__info, .contact__map, .shipping-bar, .limited-header'
  );

  targets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.10, rootMargin: '0px 0px -32px 0px' }
    );
    targets.forEach(el => io.observe(el));
  } else {
    targets.forEach(el => el.classList.add('is-visible'));
  }


  /* ── 5. FOOTER YEAR ─────────────────────────────────────────────── */
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();


  /* ── 6. PRE-ORDER FORM ──────────────────────────────────────────── */
  const form        = document.getElementById('orderForm');
  const submitBtn   = document.getElementById('submitBtn');
  const successEl   = document.getElementById('formSuccess');
  const errorEl     = document.getElementById('formError');
  const fulfillSel  = document.getElementById('f-fulfillment');
  const addressBlock = document.getElementById('addressBlock');
  const addressInput = document.getElementById('f-address');

  if (!form) return;


  /* ── 6a. FULFILLMENT SELECT — ADDRESS BLOCK TOGGLE ────────────────
     Show shipping address field when USPS is chosen.
     Hide it (and clear required) when local pickup is chosen.
     Formspree will include or omit the field accordingly.
  ─────────────────────────────────────────────────────────────────── */
  function updateAddressBlock() {
    if (!fulfillSel || !addressBlock || !addressInput) return;

    const isPickup = fulfillSel.value.toLowerCase().includes('pickup');

    if (isPickup) {
      addressBlock.classList.add('is-hidden');
      addressInput.removeAttribute('required');
      addressInput.removeAttribute('aria-required');
      addressInput.value = '';
      clearError('f-address');
    } else {
      addressBlock.classList.remove('is-hidden');
      /* Only mark required if USPS ship option is explicitly selected */
      if (fulfillSel.value !== '') {
        addressInput.setAttribute('required', '');
        addressInput.setAttribute('aria-required', 'true');
      }
    }
  }

  if (fulfillSel) {
    fulfillSel.addEventListener('change', updateAddressBlock);
    updateAddressBlock(); /* run on load */
  }


  /* ── 6b. VALIDATION RULES ─────────────────────────────────────────
     test(value) returns true on pass, or an error string on fail.
     Address rule is conditional on fulfillment selection.
  ─────────────────────────────────────────────────────────────────── */
  const RULES = [
    {
      id:   'f-name',
      test: v => v.trim().length >= 2 || 'Please enter your full name.',
    },
    {
      id:   'f-email',
      test: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Please enter a valid email address.',
    },
    {
      id:   'f-fulfillment',
      test: v => v !== '' || 'Please select a fulfillment method.',
    },
    {
      id:   'f-order',
      test: v => v.trim().length >= 10 || 'Please describe your order (at least 10 characters).',
    },
    {
      id:   'f-address',
      /* Only validate when the field is visible (USPS shipping selected) */
      test: v => {
        if (!addressInput || addressInput.hasAttribute('required') === false) return true;
        return v.trim().length >= 8 || 'Please enter a complete shipping address.';
      },
    },
  ];

  const fieldOf  = id => document.getElementById(id)?.closest('.field') ?? null;

  function applyError(id, msg) {
    const el = document.getElementById(id);
    const fc = fieldOf(id);
    if (!el || !fc) return;
    el.classList.add('is-invalid');
    el.setAttribute('aria-invalid', 'true');
    const span = fc.querySelector('.field__error');
    if (span) span.textContent = msg;
  }

  function clearError(id) {
    const el = document.getElementById(id);
    const fc = fieldOf(id);
    if (!el || !fc) return;
    el.classList.remove('is-invalid');
    el.removeAttribute('aria-invalid');
    const span = fc.querySelector('.field__error');
    if (span) span.textContent = '';
  }

  function validate() {
    let firstId = null, pass = true;
    RULES.forEach(({ id, test }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const r = test(el.value);
      if (r !== true) {
        applyError(id, r);
        if (!firstId) firstId = id;
        pass = false;
      } else {
        clearError(id);
      }
    });
    if (firstId) document.getElementById(firstId)?.focus();
    return pass;
  }

  /* ── 6c. LIVE VALIDATION ──────────────────────────────────────────
     Clears error as user types; re-checks on blur.
  ─────────────────────────────────────────────────────────────────── */
  RULES.forEach(({ id, test }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input',  () => clearError(id));
    el.addEventListener('change', () => clearError(id));
    el.addEventListener('blur',   () => { const r = test(el.value); if (r !== true) applyError(id, r); });
  });


  /* ── 6d-f. SUBMIT ─────────────────────────────────────────────────
     Fetch to Formspree with JSON accept header per their Ajax guide.
     Manages loading spinner, success banner, error banner states.
  ─────────────────────────────────────────────────────────────────── */
  function setLoading(on) {
    const lbl = submitBtn.querySelector('.btn__label');
    const spn = submitBtn.querySelector('.btn__spinner');
    submitBtn.disabled = on;
    if (lbl) lbl.textContent = on ? 'Sending...' : 'Submit Order';
    if (spn) spn.hidden = !on;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    successEl.hidden = true;
    errorEl.hidden   = true;

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method:  'POST',
        body:    new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        form.reset();
        updateAddressBlock(); /* restore address block state after reset */
        successEl.hidden = false;
        successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        successEl.focus();
      } else {
        console.error('[NYGC] Formspree error:', await res.json().catch(() => ({})));
        errorEl.hidden = false;
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        errorEl.focus();
      }
    } catch (err) {
      console.error('[NYGC] Network error:', err);
      errorEl.hidden = false;
      errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      errorEl.focus();
    } finally {
      setLoading(false);
    }
  });

}); /* end DOMContentLoaded */
