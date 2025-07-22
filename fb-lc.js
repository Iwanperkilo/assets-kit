(function(){
  function block(message) {
    document.body.style.opacity = "1"; // tampilkan body saat error
    document.head.innerHTML += `
      <style>
        body::before {
          content: "${message.replace(/"/g, '\\"')}";
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

  function verifyLicense(licenseCode) {
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
          const el = document.getElementById("license-check");
          if (el) el.textContent = "VALIDATED";
          document.body.style.opacity = "1";
        } else {
          block("❌ Lisensi tema tidak valid.");
        }
      })
      .catch(() => {
        block("⚠️ Gagal memverifikasi lisensi.");
      });
  }

  function waitForLicenseElement() {
    const tryGet = () => {
      const el = document.querySelector('.idtema .widget-content');
      if (el && el.textContent.trim().length > 0) {
        verifyLicense(el.textContent.trim());
      } else {
        setTimeout(tryGet, 100);
      }
    };
    tryGet();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForLicenseElement);
  } else {
    waitForLicenseElement();
  }
})();
