(function() {
    // Ambil lisensi dari elemen Blogger Layout
    var LICENSE_KEY = document.getElementById("license-widget")?.textContent?.trim() || "";
    var DOMAIN = location.hostname.replace(/^www\./, "");
    var CACHE_KEY = "license_cache_" + DOMAIN;
    var CACHE_TIME = 24 * 60 * 60 * 1000; // 24 jam

    // Fungsi untuk memproses hasil validasi
    function handleValidation(response) {
        if (response.status === "valid") {
            console.log("✅ Lisensi valid untuk domain ini");
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                status: "valid",
                timestamp: Date.now()
            }));
        } else {
            console.warn("❌ Lisensi tidak valid atau domain tidak cocok");
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                status: "invalid",
                timestamp: Date.now()
            }));
            // Jika invalid, bisa redirect atau menampilkan pesan
            // window.location.href = "/license-error.html";
        }
    }

    // Cek cache
    var cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
        try {
            var parsed = JSON.parse(cache);
            if (Date.now() - parsed.timestamp < CACHE_TIME) {
                console.log("ℹ️ Menggunakan hasil validasi dari cache");
                if (parsed.status === "invalid") {
                    console.warn("❌ Lisensi invalid (cache)");
                }
                return; // Tidak perlu request lagi
            }
        } catch(e) {
            console.error("Cache corrupt:", e);
        }
    }

    // Validasi via JSONP
    var script = document.createElement("script");
    script.src = "https://script.google.com/macros/s/AKfycbx9SHqCdrpkTyubb5gtw8vwKh4x9J9VzLUfx6Z0mSVSsPHzvXi9Y6XCOQkXr8iluWDD/exec" +
                 "?license=" + encodeURIComponent(LICENSE_KEY) +
                 "&domain=" + encodeURIComponent(DOMAIN) +
                 "&callback=handleValidation";
    document.body.appendChild(script);

    // Bikin global callback untuk JSONP
    window.handleValidation = handleValidation;
})();
