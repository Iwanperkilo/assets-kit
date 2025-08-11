(function() {
    var LICENSE_KEY = document.getElementById("license-widget")?.textContent?.trim() || "";
    var DOMAIN = location.hostname.replace(/^www\./, "");
    var CACHE_KEY = "license_cache_" + DOMAIN;
    var CACHE_TIME = 24 * 60 * 60 * 1000; // 24 jam

    function blockSite(msg) {
        document.body.innerHTML = `
            <div style="font-family:sans-serif;text-align:center;padding:50px;">
                <h1>❌ Lisensi Tidak Valid</h1>
                <p>${msg}</p>
            </div>
        `;
        document.body.style.background = "#fff";
        document.body.style.color = "#000";
        throw new Error("Lisensi tidak valid — akses diblokir");
    }

    function handleValidation(response) {
        if (response.status === "valid") {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                status: "valid",
                timestamp: Date.now()
            }));
            console.log("✅ Lisensi valid");
        } else {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                status: "invalid",
                timestamp: Date.now()
            }));
            blockSite("Kode lisensi tidak valid atau domain tidak cocok.");
        }
    }

    // Cek cache
    var cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
        try {
            var parsed = JSON.parse(cache);
            if (Date.now() - parsed.timestamp < CACHE_TIME) {
                if (parsed.status === "invalid") {
                    blockSite("Kode lisensi tidak valid (cache).");
                }
                console.log("ℹ️ Menggunakan cache validasi");
                return;
            }
        } catch(e) {}
    }

    // Validasi via JSONP
    var script = document.createElement("script");
    script.src = "https://script.google.com/macros/s/AKfycbx9SHqCdrpkTyubb5gtw8vwKh4x9J9VzLUfx6Z0mSVSsPHzvXi9Y6XCOQkXr8iluWDD/exec" +
                 "?license=" + encodeURIComponent(LICENSE_KEY) +
                 "&domain=" + encodeURIComponent(DOMAIN) +
                 "&callback=handleValidation";
    document.body.appendChild(script);
    window.handleValidation = handleValidation;
})();
