(function(){
  const license = 'LSC-8Y6JK-1Q2WE'; // ganti dengan kode lisensi yang kamu tes
  const domain  = window.location.hostname;
  const webAppURL = 'https://script.google.com/macros/s/AKfycbx9SHqCdrpkTyubb5gtw8vwKh4x9J9VzLUfx6Z0mSVSsPHzvXi9Y6XCOQkXr8iluWDD/exec'; // ganti dengan URL Web App milikmu

  // Buat nama callback unik
  const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());

  // Buat fungsi callback global
  window[callbackName] = function(response) {
    console.log('Respon dari server:', response);
    if (response.status === 'valid') {
      console.log('✅ Lisensi valid untuk domain ini.');
    } else {
      console.error('❌ Lisensi tidak valid.', response.reason || '');
    }
    // Bersihkan script tag setelah selesai
    document.body.removeChild(script);
    delete window[callbackName];
  };

  // Buat request JSONP
  const script = document.createElement('script');
  script.src = `${webAppURL}?action=validate&license=${encodeURIComponent(license)}&domain=${encodeURIComponent(domain)}&callback=${callbackName}`;
  document.body.appendChild(script);
})();
