(function(global) {
  const LICENSE = document.getElementById('theme-license')?.getAttribute('data-license') || '';
  const DOMAIN = window.location.hostname || '';
  const CACHE_KEY = 'licenseCache_' + LICENSE + '_' + DOMAIN;
  const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 jam
  const TIMEOUT_MS = 8000; // 8 detik timeout validasi

  function setLicenseStatus(status) {
    document.body.setAttribute('data-license', status);
  }

  function showMessage(msg) {
    const el = document.getElementById('license-message');
    if (el) el.innerHTML = msg;
  }

  function getCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_DURATION_MS) {
        return data.response;
      } else {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
    } catch {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }

  function setCache(response) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        response: response
      }));
    } catch {}
  }

  function validateLicense(license, domain, callback) {
    if (!license || !domain) {
      callback({status: 'invalid', reason: 'missing_license_or_domain'});
      return;
    }

    let completed = false;
    const callbackName = 'jsonp_callback_' + Math.random().toString(36).substring(2,8);
    window[callbackName] = function(response) {
      if (completed) return;
      completed = true;
      clearTimeout(timeoutId);
      document.body.removeChild(script);
      delete window[callbackName];
      callback(response);
    };

    const script = document.createElement('script');
    script.src = `https://script.google.com/macros/s/AKfycbx9SHqCdrpkTyubb5gtw8vwKh4x9J9VzLUfx6Z0mSVSsPHzvXi9Y6XCOQkXr8iluWDD/exec?action=validate&license=${encodeURIComponent(license)}&domain=${encodeURIComponent(domain)}&callback=${callbackName}`;
    document.body.appendChild(script);

    const timeoutId = setTimeout(function() {
      if (completed) return;
      completed = true;
      document.body.removeChild(script);
      delete window[callbackName];
      callback(null);
    }, TIMEOUT_MS);
  }

  function runValidation() {
    setLicenseStatus('loading');  // status loading, konten dan pesan disembunyikan
    showMessage(''); // kosongkan pesan saat loading

    const cached = getCache();
    if (cached && cached.status === 'valid') {
      setLicenseStatus('ok');
      showMessage('');
      return;
    }

    validateLicense(LICENSE, DOMAIN, function(result) {
      if (result && result.status === 'valid') {
        setLicenseStatus('ok');
        setCache(result);
        showMessage('');
      } else if (cached && cached.status === 'valid') {
        setLicenseStatus('ok');
        showMessage('');
      } else {
        setLicenseStatus('invalid');
        showMessage('Validasi Gagal.<br>Mohon periksa koneksi internet Anda.');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runValidation);
  } else {
    runValidation();
  }
})(window);
