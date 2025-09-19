<script>
(function(){
  'use strict';

  const LICENSE_SERVER = 'https://script.google.com/macros/s/AKfycbwGyTkBGR2EvEukAc3WdbmrqSyTLLOHCjRH6rHMV5bkTsY_VmaSghW_xd4Mf1m2X5Ac/exec';
  const TIMEOUT = 8000;
  const licenseElement = document.getElementById('theme-license');
  if(!licenseElement) return;

  function setStatus(status, msg=''){
    document.body.setAttribute('data-license', status);
    licenseElement.innerHTML = msg;
  }

  function getLicense(){ 
    return licenseElement.getAttribute('data-license')?.trim() || ''; 
  }

  function getDomain(){ 
    const isPreview = window.self !== window.top || 
                      (location.hostname.includes("blogger.com") && location.pathname.includes("/preview"));
    return isPreview ? "" : location.hostname;
  }

  function cacheKey(license, domain){ 
    return 'licenseCache_' + license + '_' + domain; 
  }

  function getCache(license, domain){
    try{
      const item = localStorage.getItem(cacheKey(license, domain));
      if(!item) return null;
      const parsed = JSON.parse(item);
      if(Date.now() - parsed.t < 24*60*60*1000) return parsed.r;
      localStorage.removeItem(cacheKey(license, domain));
    } catch{
      localStorage.removeItem(cacheKey(license, domain));
    }
    return null;
  }

  function setCache(license, domain, val){
    try{
      localStorage.setItem(cacheKey(license, domain), JSON.stringify({t:Date.now(), r:val}));
    } catch{}
  }

  function validate(attempt=1){
    setStatus('loading','');

    const license = getLicense();
    const domain = getDomain();
    if(domain==="") {
      setStatus('ok',''); // preview bypass
      return;
    }

    const cached = getCache(license, domain);
    if(cached==='valid'){ setStatus('ok',''); return; }

    const callbackName = 'cb_'+Math.random().toString(36).slice(2,8);
    window[callbackName] = function(res){
      cleanup();
      if(res?.status==='valid'){
        setStatus('ok','');
        setCache(license, domain, 'valid');
      } else {
        setStatus('invalid','Validasi gagal. Mohon periksa koneksi internet Anda.');
      }
    };

    const script = document.createElement('script');
    script.src = LICENSE_SERVER
      + '?action=validate&license=' + encodeURIComponent(license)
      + '&domain=' + encodeURIComponent(domain)
      + '&preview=' + (domain===""?1:0)
      + '&callback=' + callbackName;
    document.body.appendChild(script);

    const timer = setTimeout(()=>{
      cleanup();
      if(attempt < 2){
        setTimeout(()=>validate(attempt+1), 300);
      } else {
        setStatus('invalid','Validasi gagal. Mohon periksa koneksi internet Anda.');
      }
    }, TIMEOUT);

    function cleanup(){
      try{ script.remove(); } catch{}
      try{ delete window[callbackName]; } catch{}
      clearTimeout(timer);
    }
  }

  function initValidation(){
    setTimeout(validate, 100);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initValidation);
  } else {
    initValidation();
  }

})();
</script>
