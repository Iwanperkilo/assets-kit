(function(){
  "use strict";
  // ============== KONFIG ==============
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbx9SHqCdrpkTyubb5gtw8vwKh4x9J9VzLUfx6Z0mSVSsPHzvXi9Y6XCOQkXr8iluWDD/exec";
  const TIMEOUT_MS = 8000;
  // ====================================

  function setStatus(s){ document.body.setAttribute("data-license", s); }

  function getLicense(){
    return document.getElementById("theme-license")?.getAttribute("data-license")?.trim() || "";
  }

  function jsonp(url, cb){
    let done=false;
    const cbName = "cb_"+Math.random().toString(36).slice(2,8);
    window[cbName] = function(res){ if(done) return; done=true; cleanup(); cb(res); };
    const s = document.createElement("script");
    const timer = setTimeout(function(){ if(done) return; done=true; cleanup(); cb(null); }, TIMEOUT_MS);
    function cleanup(){ try{s.remove();}catch(e){} try{delete window[cbName];}catch(e){} clearTimeout(timer); }
    s.src = url + (url.includes("?")?"&":"?") + "callback="+encodeURIComponent(cbName);
    document.body.appendChild(s);
  }

  function validate(license, domain, cb){
    if(!license || !domain){ cb({status:"invalid", reason:"missing"}); return; }
    const url = `${ENDPOINT}?action=validate&license=${encodeURIComponent(license)}&domain=${encodeURIComponent(domain)}`;
    jsonp(url, cb);
  }

  // Jalankan segera
  (function main(){
    const license = getLicense();
    const domain  = location.hostname || "";
    validate(license, domain, function(res){
      if(res && res.status === "valid"){
        setStatus("ok");
      }else{
        // biarkan kunci default tetap aktif
        // (tidak menimpa 'invalid' supaya fail-closed)
      }
    });
  })();

  // Watchdog anti-bypass (eksternal juga mengawasi)
  setInterval(function(){
    if(document.body.getAttribute("data-license") !== "ok"){
      document.body.setAttribute("data-license", "invalid");
    }
  }, 1500);

})();
