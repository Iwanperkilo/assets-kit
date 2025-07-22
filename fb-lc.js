
(function(){
  function block(message) {
    document.body.style.opacity = "1"; // pastikan terlihat saat error
    document.head.innerHTML += `
      <style>
        body::before {
          content: "${message.replace(/"/g, '\"')}";
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          inset: 0;
          background: #fff;
          color: red;
          font-size: 18px;
          z-index: 9999;
        }
        body *:not(script):not(#license-check) {
          display: none !important;
        }
      </style>
    `;
  }

  function verifyLicense() {
    var licenseElement = document.querySelector('.idtema .widget-content');
    var licenseCode = licenseElement ? licenseElement.textContent.trim() : "";
    var domain = window.location.hostname;

    if (!licenseCode || licenseCode.length < 5) {
      block("❌ Lisensi tidak ditemukan.");
      return;
    }

    var url = "https://script.google.com/macros/s/AKfycbw_Urr-iGnIvQfTtJp7-gMdgXd_UKUiPIKWXA2dlLumhzTWiRRYAQnkvTCGzgbsd0Y0/exec?license="
              + encodeURIComponent(licenseCode) + "&domain=" + encodeURIComponent(domain);

    fetch(url)
      .then(res => res.text())
      .then(result => {
        if (result === "VALID") {
          window.__LICENSE_VERIFIED__ = true;
          document.body.setAttribute("data-license", "ok");
          document.getElementById("license-check").textContent = "VALIDATED";
          document.body.style.opacity = "1";
        } else {
          block("❌ Lisensi tema tidak valid.");
        }
      })
      .catch(() => {
        block("⚠️ Gagal memverifikasi lisensi.");
      });
  }

  // Jalankan saat DOM siap
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", verifyLicense);
  } else {
    verifyLicense();
  }
})();
