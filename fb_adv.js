// Ambil lisensi dari widget Tata Letak

function getLicenseFromLayout() {

  const el = document.getElementById('theme-license');

  return el ? el.getAttribute('data-license') : '';

}



(function(global) {

  function validateLicense(license, domain, callback) {

    if (!license || !domain) {

      console.warn('License dan domain harus diisi');

      callback({status:'invalid', reason:'missing_license_or_domain'});

      return;

    }



    const cacheKey = 'licenseCache_' + license + '_' + domain;

    const cacheExpiryMs = 24 * 60 * 60 * 1000; // 24 jam

    const cached = localStorage.getItem(cacheKey);



    if (cached) {

      try {

        const data = JSON.parse(cached);

        if (Date.now() - data.timestamp < cacheExpiryMs) {

          console.log('License loaded from cache');

          callback(data.response);

          return;

        } else {

          localStorage.removeItem(cacheKey);

        }

      } catch {

        localStorage.removeItem(cacheKey);

      }

    }



    const callbackName = 'jsonp_callback_' + Math.random().toString(36).substring(2, 8);

    window[callbackName] = function(response) {

      delete window[callbackName];

      document.body.removeChild(script);



      localStorage.setItem(cacheKey, JSON.stringify({

        timestamp: Date.now(),

        response: response

      }));



      callback(response);

    };



    const script = document.createElement('script');

    script.src = `https://script.google.com/macros/s/AKfycbx9SHqCdrpkTyubb5gtw8vwKh4x9J9VzLUfx6Z0mSVSsPHzvXi9Y6XCOQkXr8iluWDD/exec?action=validate&license=${encodeURIComponent(license)}&domain=${encodeURIComponent(domain)}&callback=${callbackName}`;

    document.body.appendChild(script);

  }



  global.validateLicense = validateLicense;



})(window);



// Jalankan validasi otomatis

document.addEventListener('DOMContentLoaded', function() {

  const userLicense = getLicenseFromLayout();

  const userDomain = window.location.hostname;



  validateLicense(userLicense, userDomain, function(result) {

    if (result.status === 'valid') {

      console.log('License valid:', result);

    } else {

      console.warn('License invalid:', result.reason);

      document.body.innerHTML = '<h1>Lisensi Tidak Valid</h1>';

    }

  });

});
