// Ambil lisensi dari widget Tata Letak
function getLicenseFromLayout() {
  const el = document.getElementById('theme-license');
  return el ? el.getAttribute('data-license') : '';
}

(function(global) {
  function validateLicense(license, domain, callback) {
    if (!license || !domain) {
      console.warn('License atau domain tidak ditemukan. Validasi dibatalkan.');
      callback({status:'invalid', reason:'missing_license_or_domain'});
      return;
    }

    // ... (kode caching sama seperti sebelumnya) ...

    const callbackName = 'jsonp_callback_' + Math.random().toString(36).substring(2, 8);
    window[callbackName] = function(response) {
      delete window[callbackName];
      // Pastikan elemen script ada sebelum dihapus
      const script = document.getElementById(callbackName + '_script');
      if (script) {
        document.body.removeChild(script);
      }
      
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        response: response
      }));

      callback(response);
    };

    const script = document.createElement('script');
    script.id = callbackName + '_script'; // Tambahkan ID untuk referensi
    // Ganti URL ini dengan URL Web App Anda
    script.src = `https://script.google.com/macros/s/AKfycbx.../exec?action=validate&license=${encodeURIComponent(license)}&domain=${encodeURIComponent(domain)}&callback=${callbackName}`;
    document.body.appendChild(script);

    // Set timeout untuk mendeteksi jika loading terlalu lama
    setTimeout(() => {
      if (window[callbackName]) {
        console.error('Validasi lisensi gagal, timeout. Periksa URL Apps Script.');
        callback({status:'error', reason:'timeout_or_network_error'});
      }
    }, 10000); // 10 detik timeout
  }

  global.validateLicense = validateLicense;

})(window);

// Jalankan validasi otomatis
document.addEventListener('DOMContentLoaded', function() {
  const userLicense = getLicenseFromLayout();
  const userDomain = window.location.hostname;

  console.log('Lisensi yang ditemukan:', userLicense);
  console.log('Domain saat ini:', userDomain);

  // Tambahkan pemeriksaan di sini
  if (!userLicense || !userDomain) {
    console.warn('Lisensi atau domain tidak ditemukan. Menampilkan pesan error.');
    document.body.innerHTML = '<h1>Lisensi Tidak Ditemukan</h1><p>Pastikan lisensi telah dimasukkan dengan benar.</p>';
    return; // Berhenti jika data tidak lengkap
  }

  validateLicense(userLicense, userDomain, function(result) {
    if (result.status === 'valid') {
      console.log('Lisensi valid:', result);
      // Lanjutkan dengan menampilkan konten tema
    } else {
      console.warn('Lisensi tidak valid:', result.reason);
      document.body.innerHTML = `<h1>Lisensi Tidak Valid</h1><p>Alasan: ${result.reason}</p>`;
    }
  });
});
