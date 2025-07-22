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
    const licenseElement = document.querySelector('.idtema .widget-content');
    const licenseCode = licenseElement ? licenseElement.textContent.trim() : "";
    const domain = window.location.hostname;

    if (!licenseCode || licenseCode.length < 5) {
      block("❌ Lisensi tidak ditemukan.");
      return;
    }

    const cacheKey = "license_" + domain;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "{}");
    const now = Date.now();

    // Jika hasil valid masih berlaku 1 hari (86400000 ms)
    if (cached.code === licenseCode && cached.status === "VALID" && (now - cached.timestamp) < 86400000) {
      applyValidState();
      return;
    }

    const url = "https://script.google.com/macros/s/AKfycbw_Urr-iGnIvQfTtJp7-gMdgXd_UKUiPIKWXA2dlLumhzTWiRRYAQnkvTCGzgbsd0Y0/exec" +
                "?license=" + encodeURIComponent(licenseCode) +
                "&domain=" + encodeURIComponent(domain);

    fetch(url)
      .then(res => res.text())
      .then(result => {
        if (result === "VALID") {
          localStorage.setItem(cacheKey, JSON.stringify({
            code: licenseCode,
            status: "VALID",
            timestamp: now
          }));
          applyValidState();
        } else {
          block("❌ Lisensi tema tidak valid.");
        }
      })
      .catch(() => {
        block("⚠️ Gagal memverifikasi lisensi.");
      });
  }

  function applyValidState() {
    window.__LICENSE_VERIFIED__ = true;
    document.body.setAttribute("data-license", "ok");
    var el = document.getElementById("license-check");
    if (el) el.textContent = "VALIDATED";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", verifyLicense);
  } else {
    verifyLicense();
  }
})();
