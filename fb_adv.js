(function(){
  var WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx9SHqCdrpkTyubb5gtw8vwKh4x9J9VzLUfx6Z0mSVSsPHzvXi9Y6XCOQkXr8iluWDD/exec"; 
  var CACHE_KEY = "license_cache";
  var CACHE_TIME = 24 * 60 * 60 * 1000; // 24 jam

  // Ambil lisensi dari widget Blogger (dashboard tata letak)
  var LICENSE_KEY = window.LICENSE_KEY || "ISI-LISENSI-DI-DASHBOARD";

  function getDomain(){
    return location.hostname.replace(/^www\./, '');
  }

  function blockSite(msg){
    document.body.innerHTML = "<div style='font-family:sans-serif;text-align:center;margin-top:50px;font-size:20px;color:red;'>" + msg + "</div>";
    document.body.style.background = "#fff";
    throw new Error("Lisensi tidak valid");
  }

  function validateLicense(){
    var cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
      try {
        var parsed = JSON.parse(cache);
        if (Date.now() - parsed.time < CACHE_TIME) {
          if (parsed.status === "valid") return true;
          if (parsed.status === "expired") blockSite("Lisensi sudah kadaluarsa");
          blockSite("Lisensi tidak valid");
        }
      } catch(e){}
    }

    var script = document.createElement("script");
    script.src = WEB_APP_URL + "?license=" + encodeURIComponent(LICENSE_KEY) + "&domain=" + encodeURIComponent(getDomain()) + "&callback=handleValidation&_=" + Date.now();
    document.body.appendChild(script);
  }

  window.handleValidation = function(res){
    localStorage.setItem(CACHE_KEY, JSON.stringify({status: res.status, time: Date.now()}));
    if (res.status === "valid") return;
    if (res.status === "expired") blockSite("Lisensi sudah kadaluarsa");
    blockSite("Lisensi tidak valid");
  };

  validateLicense();
})();
