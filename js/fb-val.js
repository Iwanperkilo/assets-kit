(function(){
  'use strict';

  const _0x1a = atob("aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvc y9BS2Z5Y2J3Vmg yQzdHRUxDdTVTYlZsVGN aOVo5RFVJWUxq T3JUU1VqbGt3bFhlT196WW5zdm9zT3BZQUhjUWNZeXZhcmxBZVU zTmc vZXhlYw==".replace(/\s+/g,""));
  const _0x1b = 8000;

  function _0xa9(){
    const el=document.getElementById('t-lcs');
    if(!el) return;

    function _0xb1(st,msg=''){
      document.body.setAttribute('data-license',st);
      const tSel=el.getAttribute('data-msg');
      const mEl=tSel?document.querySelector(tSel):el;
      if(mEl){ mEl.innerHTML=msg; }
    }

    function _0xb2(){ return el.getAttribute('data-val')?.trim()||''; }
    function _0xb3(){
      const isPrev=window.self!==window.top || 
        (location.hostname.includes("blogger.com") && location.pathname.includes("/preview"));
      return isPrev? "" : location.hostname;
    }
    function _0xb4(l,d){ return 'licenseCache_'+l+'_'+d; }
    function _0xb5(l,d){
      try{
        const it=localStorage.getItem(_0xb4(l,d));
        if(!it) return null;
        const p=JSON.parse(it);
        if(Date.now()-p.t < 864e5) return p.r;
        localStorage.removeItem(_0xb4(l,d));
      }catch{ localStorage.removeItem(_0xb4(l,d)); }
      return null;
    }
    function _0xb6(l,d,v){
      try{ localStorage.setItem(_0xb4(l,d), JSON.stringify({t:Date.now(),r:v})); }catch{}
    }

    function _0xb7(at=1){
      _0xb1('loading','');
      const l=_0xb2(), d=_0xb3();
      if(d===""){ _0xb1('ok',''); return; }
      const c=_0xb5(l,d);
      if(c==='valid'){ _0xb1('ok',''); return; }
      const cb='cb_'+Math.random().toString(36).slice(2,8);
      window[cb]=function(r){
        _0xb9();
        if(r?.status==='valid'){
          _0xb1('ok',''); _0xb6(l,d,'valid');
        } else {
          _0xb1('invalid','Validasi gagal. Mohon periksa koneksi internet Anda.');
        }
      };
      const sc=document.createElement('script');
      sc.src=_0x1a+'?action=validate&license='+encodeURIComponent(l)+'&domain='+encodeURIComponent(d)+'&preview='+(d===""?1:0)+'&callback='+cb;
      document.body.appendChild(sc);
      const tm=setTimeout(()=>{
        _0xb9();
        if(at<2){ setTimeout(()=>_0xb7(at+1),300); }
        else{ _0xb1('invalid','Validasi gagal. Mohon periksa koneksi internet Anda.'); }
      },_0x1b);
      function _0xb9(){
        try{ sc.remove(); }catch{}
        try{ delete window[cb]; }catch{}
        clearTimeout(tm);
      }
    }
    setTimeout(_0xb7,100);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',_0xa9);
  } else { _0xa9(); }

})();
