/**
 * @fileoverview Enhanced license validation script with 24-hour cache.
 * Uses JSONP for compatibility with standard Apps Script deployments.
 */

// --- CONFIGURATION ---
const SCRIPT_URL = 'https://script.google.com/macros/s/...'
const CACHE_KEY = 'license-validation-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// --- CORE VALIDATION FUNCTION ---
function validateLicense(license) {
  return new Promise((resolve) => {
    if (!license) {
      console.error('Validation aborted: No license key provided.');
      return resolve(false);
    }
    const currentDomain = window.location.hostname;

    try {
      const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cachedData && cachedData.license === license && cachedData.domain === currentDomain && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
        console.log('License validation: Using cached result. Status:', cachedData.valid);
        return resolve(cachedData.valid);
      }
    } catch (e) {
      console.error('Error reading from cache:', e);
    }

    console.log('License validation: No valid cache found. Contacting server...');

    const callbackName = 'jsonpCallback_' + Date.now();
    const url = `${SCRIPT_URL}?action=validate&license=${encodeURIComponent(license)}&domain=${encodeURIComponent(currentDomain)}&callback=${callbackName}`;

    const script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script);

    window[callbackName] = (response) => {
      document.head.removeChild(script);
      delete window[callbackName];
      
      const isValid = response && response.status === 'valid';
      try {
        const cache = { license, domain: currentDomain, valid: isValid, timestamp: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch (e) {
        console.error('Error writing to cache:', e);
      }
      console.log(`License validation: Result from server is ${isValid}. Cached.`);
      resolve(isValid);
    };

    // Add a timeout for robustness (Fail-closed)
    setTimeout(() => {
      if (window[callbackName]) {
        console.error('License validation: Server request timed out. Fail-closed applied.');
        document.head.removeChild(script);
        delete window[callbackName];
        resolve(false);
      }
    }, 10000); // 10-second timeout
  });
}

// --- USAGE EXAMPLE ---
document.addEventListener('DOMContentLoaded', () => {
  const licenseInput = document.getElementById('product-license-key');
  const licenseKey = licenseInput ? licenseInput.value : '';

  const statusElement = document.getElementById('license-status');
  if (statusElement) statusElement.textContent = 'Validating license...';

  validateLicense(licenseKey)
    .then(isValid => {
      if (isValid) {
        console.log('License is valid! ✅');
        if (statusElement) statusElement.textContent = 'License is valid! ✅';
      } else {
        console.error('License is NOT valid! ❌');
        if (statusElement) statusElement.textContent = 'License is NOT valid! ❌';
      }
    });
});
