(function(){
  const block = (msg) => {
    document.body.setAttribute("data-license", "blocked");
    document.body.innerHTML = `
      <div style="padding:3rem;text-align:center;color:red;font-size:18px;background:#fff">
        ${msg}
      </div>`;
  };

  const showLoading = () => {
    document.body.setAttribute("data-license", "checking");
  };

  const applyValidState = () => {
    window.__LICENSE_VERIFIED__ = true;
    document.body.setAttribute("data-license", "ok");
    const el = document.getElementById("license-check");
    if (el) el.textContent = "VALIDATED";
  };

  const verifyLicense = () => {
    showLoading();
    const licenseElement = document.querySelector('.idtema .widget-content');
    const licenseCode = licenseElement ? licenseElement.textContent.trim() : "";
    const domain = location.hostname;
    if (!licenseCode || licenseCode.length < 5) {
      block("❌ Lisensi tidak ditemukan.");
      return;
    }

    const cacheKey = "license_" + domain;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "{}");
    const now = Date.now();

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
          block("❌ Lisensi tidak valid.");
        }
      })
      .catch(() => {
        block("⚠️ Gagal memverifikasi lisensi.");
      });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", verifyLicense);
  } else {
    verifyLicense();
  }
})();
