// ==================== CONFIG ====================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9SHqCdrpkTyubb5gtw8vwKh4x9J9VzLUfx6Z0mSVSsPHzvXi9Y6XCOQkXr8iluWDD/exec';
const VALIDATION_TIMEOUT_MS = 5000; // time to wait for server response on first load
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours for local cache
const RECHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // re-validate every 6 hours
const BOOTSTRAP_INLINE_TOKEN = 'BT_BOOTSTRAP_V1'; // keep in both inline snippet and this file for simple integrity check

// Optional: name of meta or DOM element that contains the raw license key in theme layout
const LICENSE_SELECTOR = '#theme-license'; // the same element you used previously

// ==================== HELPERS ====================
function log() { try { console.log.apply(console, arguments); } catch (e) {} }
function warn() { try { console.warn.apply(console, arguments); } catch (e) {} }

function getLicenseFromLayout() {
  try {
    const el = document.querySelector(LICENSE_SELECTOR);
    return el ? el.getAttribute('data-license') : '';
  } catch (e) { return ''; }
}

function getDomain() { return location.hostname; }

function cacheSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}
function cacheGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; }
}

// Simple JSONP with timeout
function jsonp(url, timeoutMs, callback) {
  const callbackName = 'jsonp_cb_' + Math.random().toString(36).slice(2,9);
  const script = document.createElement('script');
  let timer = null;
  let done = false;

  window[callbackName] = function(res) {
    if (done) return; done = true;
    clearTimeout(timer);
    try { delete window[callbackName]; } catch (e) {}
    if (script.parentNode) script.parentNode.removeChild(script);
    callback(null, res);
  };

  timer = setTimeout(function() {
    if (done) return; done = true;
    try { delete window[callbackName]; } catch (e) {}
    if (script.parentNode) script.parentNode.removeChild(script);
    callback(new Error('timeout'));
  }, timeoutMs || 4000);

  script.src = url + (url.indexOf('?') === -1 ? '?' : '&') + 'callback=' + callbackName;
  script.async = true;
  document.head.appendChild(script);
}

// ==================== CORE VALIDATOR ====================
function validateLicenseRemote(rawLicense, domain, allowAutoAssign, cb) {
  if (!rawLicense) return cb(new Error('empty_license'));
  const url = APPS_SCRIPT_URL + '?action=validate&license=' + encodeURIComponent(rawLicense) + '&domain=' + encodeURIComponent(domain) + (allowAutoAssign ? '&auto=1' : '');
  jsonp(url, VALIDATION_TIMEOUT_MS, function(err, res) {
    if (err) return cb(err);
    cb(null, res);
  });
}

function cachedValidationKey(license, domain) { return 'licenseCache_' + license + '_' + domain; }

function validateWithCache(rawLicense, domain, cb) {
  const cacheKey = cachedValidationKey(rawLicense, domain);
  const cached = cacheGet(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    log('Loaded license from cache');
    return cb(null, cached.response);
  }

  validateLicenseRemote(rawLicense, domain, false, function(err, res) {
    if (err) return cb(err);
    cacheSet(cacheKey, {timestamp: Date.now(), response: res});
    cb(null, res);
  });
}

// ==================== UI LOCK / UNLOCK ====================
function showLockedMessage(msg) {
  try {
    // replace body content with a friendly message
    document.documentElement.style.visibility = 'visible';
    document.body.innerHTML = '<div style="font-family:Arial,Helvetica,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px"><div style="max-width:720px;text-align:center"><h1>Lisensi Tidak Valid</h1><p class="muted">' + (msg || 'Halaman ini memerlukan lisensi yang valid untuk menampilkan konten.') + '</p></div></div>';
  } catch (e) { warn('failed showLockedMessage', e); }
}

function revealPage() {
  // undo the hide from bootstrap
  try {
    document.documentElement.style.visibility = 'visible';
    // call theme initializer if present
    if (typeof renderTheme === 'function') {
      try { renderTheme(); } catch (e) { warn('renderTheme error', e); }
    } else if (typeof initTheme === 'function') {
      try { initTheme(); } catch (e) { warn('initTheme error', e); }
    } else {
      // Nothing to call — page HTML should already be in place; just make visible.
    }
  } catch (e) { warn('reveal error', e); }
}

// ==================== SELF INTEGRITY (simple) ====================
// This is a lightweight check: we expect the inline bootstrap to place a global token.
// If token missing or mismatched, we consider integrity failed.
function checkBootstrapIntegrity() {
  try {
    if (window.BT_BOOTSTRAP && window.BT_BOOTSTRAP === BOOTSTRAP_INLINE_TOKEN) return true;
    // also allow meta tag variant
    const m = document.querySelector('meta[name="bt-bootstrap-token"]');
    if (m && m.getAttribute('content') === BOOTSTRAP_INLINE_TOKEN) return true;
    return false;
  } catch (e) { return false; }
}

// ==================== MAIN FLOW ====================
function lockAndValidateThenReveal() {
  const rawLicense = getLicenseFromLayout();
  const domain = getDomain();

  // quick integrity check
  if (!checkBootstrapIntegrity()) {
    warn('Bootstrap integrity check failed — refusing to run');
    showLockedMessage('Integritas bootstrap tidak terverifikasi.');
    return;
  }

  // first try cached validation
  validateWithCache(rawLicense, domain, function(err, res) {
    if (err) {
      warn('Validation error', err);
      showLockedMessage('Gagal menghubungi server validasi (timeout).');
      return;
    }

    // res is expected from your Apps Script JSONP response
    // result examples: {status:'valid', licenseHash:'...', domain:'...'}
    if (res && res.status && res.status === 'valid') {
      log('License valid', res);
      revealPage();
    } else {
      warn('License not valid', res);
      showLockedMessage('Lisensi tidak valid: ' + (res && res.reason ? res.reason : 'unknown'));
    }
  });
}

// Background recheck (silent) — if recheck fails we lock the page
function schedulePeriodicRecheck() {
  setInterval(function() {
    try {
      const rawLicense = getLicenseFromLayout();
      const domain = getDomain();
      validateLicenseRemote(rawLicense, domain, false, function(err, res) {
        if (err || !res || res.status !== 'valid') {
          warn('Periodic recheck failed — locking page');
          // immediate lock
          showLockedMessage('Lisensi tidak lagi valid (pemeriksaan berkala).');
        } else {
          log('Periodic recheck ok');
        }
      });
    } catch (e) { warn('periodic check exception', e); }
  }, RECHECK_INTERVAL_MS);
}

// Hook additional checks on important user interactions
function attachInteractionChecks() {
  const events = ['click','contextmenu','keydown'];
  events.forEach(function(ev) {
    window.addEventListener(ev, function() {
      try {
        // small async check that doesn't block UX — but if invalid we lock
        const rawLicense = getLicenseFromLayout();
        const domain = getDomain();
        validateLicenseRemote(rawLicense, domain, false, function(err, res) {
          if (err) return;
          if (!res || res.status !== 'valid') {
            showLockedMessage('Lisensi tidak valid saat interaksi.');
          }
        });
      } catch (e) {}
    }, {passive:true});
  });
}

// Init: called after the external file loads. The inline bootstrap should have hidden the page.
(function initLicenseLoader() {
  try {
    // ensure page hidden by default if bootstrap exists
    // Bootstrap must set document.documentElement.style.visibility='hidden' or meta token — see inline snippet below

    // Run the fail-closed validation flow
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        lockAndValidateThenReveal();
        schedulePeriodicRecheck();
        attachInteractionChecks();
      });
    } else {
      lockAndValidateThenReveal();
      schedulePeriodicRecheck();
      attachInteractionChecks();
    }
  } catch (e) { warn('init exception', e); showLockedMessage('Inisialisasi gagal'); }
})();
