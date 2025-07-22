(function(){
  const CACHE_KEY = "__license_status";
  const CACHE_TIME_KEY = "__license_checked_at";
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

  function setStatus(status) {
    document.body.setAttribute("data-license", status);
    if (status === "ok") {
      localStorage.setItem(CACHE_KEY, "ok");
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    }
  }

  function block(message) {
    document.head.innerHTML += `
      <style>
        body::before {
          content: "${message.replace(/"/g, '\\"')}";
          position: fixed;
          inset: 0;
          background: #fff;
          color: red;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        body *:not(script):not(#license-check) {
          display: none !important;
        }
      </style>
    `;
    document.body.style.opacity = "1";
  }

  function validateNow() {
    const el = document.querySelector('.idtema .widget-content');
    const code = el ? el.textContent.trim() : "";
    const domain = window.location.hostname;

    if (!code || code.length < 5) {
      block("❌ Lisensi tidak ditemukan.");
      return;
    }

    fetch("https://script.google.com/macros/s/AKfycbw_Urr-iGnIvQfTtJp7-gMdgXd_UKUiPIKWXA2dlLumhzTWiRRYAQnkvTCGzgbsd0Y0/exec?license="
      + encodeURIComponent(code) + "&domain=" + encodeURIComponent(domain))
      .then(r => r.text())
      .then(result => {
        if (result === "VALID") {
          setStatus("ok");
        } else {
          block("❌ Lisensi tema tidak valid.");
        }
      })
      .catch(() => {
        block("⚠️ Gagal memverifikasi lisensi.");
      });
  }

  function checkLicense() {
    const lastCheck = parseInt(localStorage.getItem(CACHE_TIME_KEY) || "0", 10);
    const now = Date.now();
    const isValid = localStorage.getItem(CACHE_KEY) === "ok";

    if (isValid && now - lastCheck < CACHE_DURATION) {
      setStatus("ok");
    } else {
      validateNow();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkLicense);
  } else {
    checkLicense();
  }
})();
