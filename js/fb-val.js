(function(){'use strict';const q1='https://script.google.com/macros/s/AKfycbwVh2C7GELCu5SbVlTcZ9Z9DUIYLjOrTSUjlkwlXeO_zYnsvosOpYAHcQcYvarlAeU3Ng/exec';const q2=8000;function z0(){const el=document.getElementById('t-lcs');if(!el)return;function u1(state,txt=''){document.body.setAttribute('data-license',state);const sel=el.getAttribute('data-msg');const tgt=sel?document.querySelector(sel):el;if(tgt){tgt.innerHTML=txt}}
function u2(){return el.getAttribute('data-val')?.trim()||''}
function u3(){const isPrev=window.self!==window.top||(location.hostname.includes('blogger.com')&&location.pathname.includes('/preview'));return isPrev?'':location.hostname}
function k1(a,b){return'k_'+a+'_'+b}
function k2(a,b){try{const v=localStorage.getItem(k1(a,b));if(!v)return null;const j=JSON.parse(v);if(Date.now()-j.t<86400000)return j.r;localStorage.removeItem(k1(a,b))}catch{localStorage.removeItem(k1(a,b))}
return null}
function k3(a,b,c){try{localStorage.setItem(k1(a,b),JSON.stringify({t:Date.now(),r:c}))}catch{}}
function run(n=1){u1('loading','');const a=u2();const b=u3();if(b===''){u1('ok','');return}
const c=k2(a,b);if(c==='valid'){u1('ok','');return}
const fn='f'+Math.random().toString(36).slice(2,8);window[fn]=function(res){cleanup();if(res?.status==='valid'){u1('ok','');k3(a,b,'valid')}else{u1('invalid','Validasi gagal. Mohon periksa koneksi internet Anda.')}};const s=document.createElement('script');s.src=q1+'?action=validate&license='+encodeURIComponent(a)+'&domain='+encodeURIComponent(b)+'&preview='+(b===''?1:0)+'&callback='+fn;document.body.appendChild(s);const t=setTimeout(()=>{cleanup();if(n<2){setTimeout(()=>run(n+1),300)}else{u1('invalid','Validasi gagal. Mohon periksa koneksi internet Anda.')}},q2);function cleanup(){try{s.remove()}catch{}
try{delete window[fn]}catch{}
clearTimeout(t)}}
setTimeout(run,100)}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',z0)}else{z0()}})()
