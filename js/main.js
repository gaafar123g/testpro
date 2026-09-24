/* منطق الموقع: اللغة، السلايدر، الأنيميشن، النوافذ */
(function(){
const D = SITE_DATA;
let lang = (function(){try{return localStorage.getItem('dmp_lang')||'ar'}catch(e){return 'ar'}})();
function tr(path){const obj=D.t[lang];return path.split('.').reduce((o,k)=>o&&o[k],obj)||'';}

function renderNav(){
  const items = D.nav[lang];
  document.getElementById('mobileNav').innerHTML = items.map(i=>`<a href="#${i.id}">${i.label}</a>`).join('');
}

function renderHero(){
  const slides = D.t[lang].hero.slides;
  const bgs = D.heroBgs;
  document.getElementById('heroSlider').innerHTML = `
   ${slides.map((s,i)=>`<div class="slide ${i===0?'active':''}"><div class="slide-bg" style="background-image:url('${bgs[i]}')"></div><div class="container slide-content"><h1>${s.h}</h1><p>${s.p}</p><a class="btn btn-gold" target="_blank" href="https://wa.me/966547727535">${s.cta}</a></div></div>`).join('')}
   <div class="hero-arrows"><button id="heroPrev">‹</button><button id="heroNext">›</button></div>
   <div class="dots" id="heroDots">${slides.map((_,i)=>`<span data-i="${i}" class="${i===0?'active':''}"></span>`).join('')}</div>`;
  let cur=0; const slideEls=[...document.querySelectorAll('.slide')]; const dotEls=[...document.querySelectorAll('#heroDots span')];
  function go(n){cur=(n+slideEls.length)%slideEls.length; slideEls.forEach((s,i)=>s.classList.toggle('active',i===cur)); dotEls.forEach((d,i)=>d.classList.toggle('active',i===cur));}
  document.getElementById('heroNext').onclick=()=>go(cur+1);
  document.getElementById('heroPrev').onclick=()=>go(cur-1);
  dotEls.forEach(d=>d.onclick=()=>go(+d.dataset.i));
  clearInterval(window._heroTimer); window._heroTimer=setInterval(()=>go(cur+1),5500);
}

function renderCounters(){
  document.getElementById('counters').innerHTML = D.counters.map(c=>`<div class="counter-card"><b data-target="${c.n}">0</b><span>${D.t[lang].counters[c.key]}</span></div>`).join('');
  const els=[...document.querySelectorAll('.counter-card b')];
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){animateCount(e.target);io.unobserve(e.target);}})});
  els.forEach(e=>io.observe(e));
}
function animateCount(el){
  const target=+el.dataset.target; let cur=0; const step=Math.max(1,Math.round(target/40));
  const t=setInterval(()=>{cur+=step; if(cur>=target){cur=target;clearInterval(t);} el.textContent=cur+'+';},30);
}

const svcImg = i => 'img/services/svc-'+String(i+1).padStart(2,'0')+'.svg';
function renderCards(containerId, arr, type){
  const textArr = type==='why' ? D.t[lang].whyItems : D.t[lang].services;
  document.getElementById(containerId).innerHTML = arr.map((item,i)=>{
    const d = textArr[i];
    if(type==='why') return `<div class="card reveal"><div class="num">${item.num}</div><h3>${d.h}</h3><p>${d.p}</p></div>`;
    if(type==='services') return `<div class="card reveal svc-card" data-i="${i}" tabindex="0" role="button"><div class="svc-img"><img src="${svcImg(i)}" alt="${d.h}" width="800" height="520" loading="lazy"></div><div class="svc-body"><h3>${d.h}</h3><p>${d.p}</p><span class="more">${tr('svcUI.more')} ${lang==='ar'?'←':'→'}</span></div></div>`;
  }).join('');
  if(type==='services'){document.querySelectorAll('.svc-card').forEach(c=>{c.onclick=()=>openServiceModal(+c.dataset.i);c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openServiceModal(+c.dataset.i);}};});}
}

function openServiceModal(i){
  const s = D.t[lang].services[i];
  document.getElementById('mIco').innerHTML = `<img src="${svcImg(i)}" alt="${s.h}" width="800" height="520">`;
  document.getElementById('mTitle').textContent = s.h;
  document.getElementById('mDetail').textContent = s.detail;
  document.getElementById('mCta').textContent = tr('svcUI.cta');
  document.getElementById('svcModal').classList.add('open');
}
function closeServiceModal(){document.getElementById('svcModal').classList.remove('open');}

function renderTimeline(){
  document.getElementById('timeline').innerHTML = D.t[lang].process.steps.map((s,i)=>`<div class="tl-step reveal"><div class="n">${i+1}</div><b>${s}</b></div>`).join('');
}

function renderPackages(){
  document.getElementById('pkgGrid').innerHTML = D.t[lang].pkg.items.map((p,i)=>`<div class="card pkg reveal ${i===2?'feat':''}">${i===2?`<span class="badge">${tr('pkg.popular')}</span>`:''}<h3>${p.title}</h3><ul>${p.list.map(l=>`<li>✓ ${l}</li>`).join('')}</ul><p style="color:var(--gold);font-weight:700">${tr('pkg.priceNote')}</p><a class="btn btn-outline" style="margin-top:10px;width:100%;text-align:center" target="_blank" href="https://wa.me/966547727535">${tr('pkg.cta')}</a></div>`).join('');
}

let pfFilterState='all', pfPos=0;
function renderPortfolio(){
  const cats = D.t[lang].pf.cats;
  document.getElementById('pfFilters').innerHTML = cats.map((c,i)=>`<button data-k="${D.pfCatKeys[i]}" class="${D.pfCatKeys[i]===pfFilterState?'active':''}">${c}</button>`).join('');
  document.querySelectorAll('#pfFilters button').forEach(b=>b.onclick=()=>{pfFilterState=b.dataset.k; pfPos=0; renderPortfolio();});
  const items = D.portfolio.filter(p=>pfFilterState==='all'||p.cat===pfFilterState);
  document.getElementById('pfTrack').innerHTML = items.map((p)=>{
    const d=D.t[lang].pf.items[p.idx];
    return `<div class="pf-item reveal"><img src="img/${p.img}.webp" alt="${d.n}" loading="lazy"><div class="cap"><b>${d.n}</b><span>${d.s}</span></div></div>`;
  }).join('');
  const track=document.getElementById('pfTrack');
  const step=280;
  function move(dir){
    const max=Math.max(0, items.length*step - track.parentElement.offsetWidth);
    pfPos=Math.min(max, Math.max(0, pfPos+dir*step));
    track.style.transform = `translateX(${(lang==='ar'?1:-1)*pfPos}px)`;
  }
  document.getElementById('pfNext').onclick=()=>move(1);
  document.getElementById('pfPrev').onclick=()=>move(-1);
  observeReveal();
}

function renderPartners(){
  const logos=[...D.partners,...D.partners];
  document.getElementById('partnersTrack').innerHTML = logos.map(p=>`<span>${p}</span>`).join('');
}

let testiIdx=0;
function renderTesti(){
  const items = D.t[lang].testi.items;
  function draw(){
    const it=items[testiIdx];
    document.getElementById('testiWrap').innerHTML = `<div class="testi-card"><div class="stars">★★★★★</div><p class="quote">"${it.q}"</p><b>${it.n}</b><span>${it.r}</span></div><div class="testi-nav"><button id="tPrev">‹</button><button id="tNext">›</button></div>`;
    document.getElementById('tPrev').onclick=()=>{testiIdx=(testiIdx-1+items.length)%items.length;draw();};
    document.getElementById('tNext').onclick=()=>{testiIdx=(testiIdx+1)%items.length;draw();};
  }
  draw();
}

function renderFaq(){
  document.getElementById('faqList').innerHTML = D.t[lang].faq.items.map(f=>`<details class="faq-item reveal"><summary>${f.q}</summary><div class="a">${f.a}</div></details>`).join('');
  const all=[...document.querySelectorAll('#faqList details')];
  all.forEach(d=>d.addEventListener('toggle',()=>{if(d.open){all.forEach(o=>{if(o!==d)o.open=false;});}}));
}

const ICONS = {
  fb:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8.5V6.9c0-.7.4-1 1.1-1H17V2.2h-2.6C11.6 2.2 10 3.9 10 6.5v2H7v3.7h3V22h4v-9.8h2.8l.5-3.7H14z"/></svg>',
  ig:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
  sc:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c-3.1 0-5.2 2.3-5.2 5.2v2c-.6.3-1.4.3-2.2.4.4.9 1.2 1.2 2 1.4-.3 1.1-1.2 2.1-2.6 2.7.6.6 1.7.7 2.6.8.2.6.5 1.1 1.1 1.1.9 0 1.6-.6 2.6-.6.8 0 1.2.6 1.7.6h.2c.5 0 .9-.6 1.7-.6 1 0 1.7.6 2.6.6.6 0 .9-.5 1.1-1.1.9-.1 2-.2 2.6-.8-1.4-.6-2.3-1.6-2.6-2.7.8-.2 1.6-.5 2-1.4-.8-.1-1.6-.1-2.2-.4v-2c0-2.9-2.1-5.2-5.2-5.2z"/></svg>',
  tt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 3v10.2a4 4 0 1 1-4-4"/><path d="M15.5 3c.3 2.6 1.9 4.3 4.5 4.5"/></svg>'
};
function renderSocial(){
  const html = D.social.map(s=>`<a href="${s.url}" target="_blank" rel="noopener" title="${s.name}" aria-label="${s.name}">${ICONS[s.key]}</a>`).join('');
  document.getElementById('socialRow').innerHTML = html;
  document.getElementById('footSocial').innerHTML = html;
}

function renderSelect(){
  const opts = D.t[lang].services.map(s=>s.h);
  document.getElementById('f_service').innerHTML = `<option value="">${tr('contact.f_service')}</option>` + D.t[lang].services.map((s,i)=>`<option>${s.h}</option>`).join('');
}

function renderFooter(){
  document.getElementById('footLinks').innerHTML = D.nav[lang].map(i=>`<li><a href="#${i.id}">${i.label}</a></li>`).join('');
  document.getElementById('footServices').innerHTML = D.t[lang].footer.servicesList.map(s=>`<li>${s}</li>`).join('');
}

function applyStatic(){
  document.querySelectorAll('[data-t]').forEach(el=>{el.textContent=tr(el.dataset.t);});
  document.querySelectorAll('[data-ph]').forEach(el=>{el.placeholder=tr(el.dataset.ph);});
  document.title = tr('meta.title');
  document.getElementById('metaDesc').setAttribute('content', tr('meta.desc'));
  document.getElementById('langBtn').textContent = lang==='ar' ? 'English' : 'العربية';
}

function assignDirs(){
  const vw=innerWidth, mid=vw/2, seen=new Map();
  document.querySelectorAll('.reveal:not(.in)').forEach((el,i)=>{
    el.classList.remove('from-l','from-r');
    const r=el.getBoundingClientRect(), c=r.left+r.width/2;
    if(r.width>vw*.6) el.classList.add(i%2?'from-r':'from-l');
    else if(c<mid-vw*.08) el.classList.add('from-l');
    else if(c>mid+vw*.08) el.classList.add('from-r');
    const k=seen.get(el.parentNode)||0; seen.set(el.parentNode,k+1);
    el.style.transitionDelay=((k%4)*.08)+'s';
  });
}
let revealIO;
function observeReveal(){
  assignDirs();
  if(revealIO) revealIO.disconnect();
  revealIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');revealIO.unobserve(e.target);}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.reveal:not(.in)').forEach(el=>revealIO.observe(el));
}
let rsT; addEventListener('resize',()=>{clearTimeout(rsT);rsT=setTimeout(assignDirs,200);});

function renderAll(){
  document.documentElement.lang = lang;
  document.documentElement.dir = lang==='ar' ? 'rtl' : 'ltr';
  applyStatic();
  renderNav(); renderHero(); renderCounters();
  renderCards('whyGrid', D.why, 'why');
  renderCards('servicesGrid', D.services, 'services');
  renderTimeline(); renderPackages(); renderPortfolio(); renderPartners(); renderTesti(); renderFaq();
  renderSocial(); renderSelect(); renderFooter();
  observeReveal();
}

document.getElementById('langBtn').onclick = ()=>{
  lang = lang==='ar' ? 'en' : 'ar';
  try{localStorage.setItem('dmp_lang', lang);}catch(e){}
  setMenu(false);
  renderAll();
};
const burger=document.getElementById('hamburger'), drawer=document.getElementById('mobileNav');
function setMenu(open){drawer.classList.toggle('open',open);burger.classList.toggle('open',open);burger.setAttribute('aria-expanded',open);}
burger.onclick = e=>{e.stopPropagation();setMenu(!drawer.classList.contains('open'));};
document.addEventListener('click', e=>{
  if(e.target.closest('.mobile-nav a')||!e.target.closest('.mobile-nav')) setMenu(false);
});

document.getElementById('contactForm').addEventListener('submit', function(e){
  e.preventDefault();
  const name=document.getElementById('f_name').value.trim();
  const phone=document.getElementById('f_phone').value.trim();
  const service=document.getElementById('f_service').value;
  const msg=document.getElementById('f_msg').value.trim();
  const waText = encodeURIComponent(`${tr('contact.waLead')}\n${tr('contact.f_name')}: ${name}\n${tr('contact.f_phone')}: ${phone}\n${tr('contact.f_service')}: ${service}\n${msg}`);
  document.getElementById('formMsg').textContent = tr('contact.success');
  window.open('https://wa.me/966547727535?text='+waText, '_blank');
  this.reset();
});

const toTop=document.getElementById('toTop');
window.addEventListener('scroll', ()=>{
  document.querySelector('header').style.boxShadow = window.scrollY>10 ? '0 6px 20px rgba(0,0,0,.35)':'none';
  toTop.classList.toggle('show', window.scrollY>500);
},{passive:true});
toTop.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});

document.getElementById('svcClose').onclick = closeServiceModal;
document.getElementById('svcModal').addEventListener('click', e=>{if(e.target.id==='svcModal') closeServiceModal();});
document.addEventListener('keydown', e=>{if(e.key==='Escape'){closeServiceModal();setMenu(false);}});

renderAll();

setTimeout(()=>{document.getElementById('loader').classList.add('hide');}, 2000);
})();
