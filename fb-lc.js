(function(){
  function block(message) {
    document.head.innerHTML += `
      <style>
        html::before {
          content: "${message.replace(/"/g, '\\"')}";
          display: block;
          background: #fff;
          color: red;
          font-size: 18px;
          padding: 3rem;
          text-align: center;
        }
        body > * {
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
          var el = document.getElementById("license-check");
          if (el) el.textContent = "VALIDATED";
        } else {
          block("❌ Lisensi tema tidak valid.");
        }
      })
      .catch(() => {
        block("⚠️ Gagal memverifikasi lisensi.");
      });
  }

  // Jalankan setelah DOM siap
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", verifyLicense);
  } else {
    verifyLicense();
  }
})();
