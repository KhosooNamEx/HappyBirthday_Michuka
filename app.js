// Mobile fireworks clear + viewport sizing + mic resume on touch
const cfg = window.BDAY_CONFIG;
const canvas = document.getElementById('cake');
const ctx = canvas.getContext('2d');
const relightBtn = document.getElementById('relight');
const micStatus = document.getElementById('mic-status');
const gallerySection = document.getElementById('gallery');
const hint = document.getElementById('reveal-hint');
const dovesLayer = document.getElementById('doves-layer');
const fwCanvas = document.getElementById('fireworks');
const fwCtx = fwCanvas.getContext('2d', { alpha: true });

let candles = 5;
let flame = 1.0;
let analyser, data, audioCtx;
let revealed = false;

// Size fireworks canvas for mobile viewports
function sizeFireworks(){
  const vv = window.visualViewport;
  const cssW = Math.ceil((vv ? vv.width : window.innerWidth));
  const cssH = Math.ceil((vv ? vv.height : window.innerHeight));
  const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
  fwCanvas.style.width  = cssW + 'px';
  fwCanvas.style.height = cssH + 'px';
  fwCanvas.width  = Math.floor(cssW * dpr);
  fwCanvas.height = Math.floor(cssH * dpr);
  fwCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
const _resize = () => requestAnimationFrame(sizeFireworks);
window.addEventListener('resize', _resize, {passive:true});
window.addEventListener('orientationchange', _resize, {passive:true});
if (window.visualViewport){
  visualViewport.addEventListener('resize', _resize, {passive:true});
  visualViewport.addEventListener('scroll', _resize, {passive:true});
}
sizeFireworks();

function spawnDoves(){
  const count = 6;
  for(let i=0;i<count;i++){
    const d = document.createElement('div');
    d.className = 'dove';
    d.style.top = `${10 + i*12 + (Math.random()*6-3)}vh`;
    d.style.animationDuration = `${24 + Math.random()*10}s`;
    d.style.animationDelay = `${Math.random()*-20}s`;
    const img = document.createElement('img');
    img.src = 'assets/dove.svg';
    img.alt = 'flying dove';
    d.appendChild(img);
    dovesLayer.appendChild(d);
  }
}

function drawCake(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const cx = canvas.width/2, cy = canvas.height/2 + 40;
  ctx.fillStyle = '#e6ebff'; ctx.beginPath(); ctx.ellipse(cx, cy+70, 260, 26, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fde3da'; ctx.fillRect(cx-220, cy-40, 440, 130);
  ctx.fillStyle = '#e2bdb3'; ctx.fillRect(cx-220, cy-40, 440, 22);
  ctx.fillStyle = '#fff8fd'; ctx.fillRect(cx-230, cy-64, 460, 34);
  for(let i=0;i<12;i++){ const x=cx-210+i*38; ctx.beginPath(); ctx.moveTo(x,cy-30); ctx.quadraticCurveTo(x+8,cy-10,x-4,cy-5); ctx.lineTo(x-4,cy-30); ctx.fill(); }
  const spacing = 440/(candles+1); let allOut = flame <= 0.02;
  for(let i=0;i<candles;i++){
    const x = cx - 220 + spacing*(i+1);
    ctx.fillStyle = '#9ad0ff'; ctx.fillRect(x-6, cy-60, 12, 36);
    ctx.fillStyle = '#333'; ctx.fillRect(x-1, cy-66, 2, 8);
    if(flame>0){
      const f = flame * (0.9 + Math.random()*0.2);
      const grad = ctx.createRadialGradient(x, cy-78, 2, x, cy-78, 14*f);
      grad.addColorStop(0,'rgba(255,240,150,0.95)'); grad.addColorStop(1,'rgba(255,120,60,0)');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, cy-78, 14*f, 0, Math.PI*2); ctx.fill();
      allOut = false;
    }
  }
  if(allOut && !revealed){ revealed = true; revealGallery(); startFireworks(); }
  requestAnimationFrame(drawCake);
}

function rms(buf){ let s=0; for(let i=0;i<buf.length;i++){ s += buf[i]*buf[i]; } return Math.sqrt(s/buf.length); }

async function enableMic(){
  try{
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const resume = () => { if (audioCtx.state !== 'running') audioCtx.resume(); };
    document.addEventListener('touchstart', resume, {once:true, passive:true});
    document.addEventListener('click', resume, {once:true, passive:true});
    const src = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    data = new Float32Array(analyser.fftSize);
    src.connect(analyser);
    micStatus.innerHTML = 'Microphone: <strong>on</strong>';
    listen();
  }catch(e){ micStatus.innerHTML = 'Microphone: <strong>blocked</strong> — tap the cake to blow.'; }
}

function listen(){
  if(!analyser) return;
  analyser.getFloatTimeDomainData(data);
  const level = rms(data);
  if(level > 0.08){ flame = Math.max(0, flame - 0.12); }
  requestAnimationFrame(listen);
}
canvas.addEventListener('click', ()=>{ flame = Math.max(0, flame - 0.2); });

relightBtn.addEventListener('click', ()=>{
  flame = 1.0; revealed = false;
  gallerySection.classList.add('hidden');
  hint.classList.add('hidden');
  stopFireworks();
  forceClearFireworks(); // strong clear for mobile
  window.scrollTo({top: 0, behavior: 'smooth'});
});

window.addEventListener('load', ()=>{ enableMic(); drawCake(); spawnDoves(); });

// ------- Gallery + read-only wishes -------
const memRoot = document.getElementById('memories');

async function loadWishes(){
  try{
    const res = await fetch('assets/wishes.xml', {cache:'no-store'});
    if(res.ok){
      const xml = await res.text();
      const dom = new DOMParser().parseFromString(xml, 'text/xml');
      const nodes = Array.from(dom.querySelectorAll('wish'));
      return nodes.map((n, i)=> ({
        index: parseInt(n.getAttribute('index') ?? i, 10),
        who: (n.querySelector('who')?.textContent || '').trim(),
        msg: (n.querySelector('msg')?.textContent || '').trim()
      }));
    }
  }catch(e){}
  try{
    const res = await fetch('assets/wishes.txt', {cache:'no-store'});
    if(res.ok){
      const t = await res.text();
      return t.split(/\r?\n/).filter(Boolean).map((line, i)=>{
        const [who, msg] = line.split('|');
        return { index: i, who: (who||'').trim(), msg: (msg||'').trim() };
      });
    }
  }catch(e){}
  return [];
}

function cardTemplate(idx, src, left, wish){
  const sideA = left ? 'mem-img' : 'mem-wish';
  const sideB = left ? 'mem-wish' : 'mem-img';
  const wishHTML = `<div class="wish-text">${(wish?.msg || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div><div class="who">${wish?.who ? '— ' + wish.who : ''}</div>`;
  return `<article class="mem-card" data-idx="${idx}"><div class="${sideA}">${ left ? `<img src="${src}" alt="memory ${idx+1}">` : wishHTML }</div><div class="${sideB}">${ left ? wishHTML : `<img src="${src}" alt="memory ${idx+1}">` }</div></article>`;
}

async function buildMemories(){
  memRoot.innerHTML = '';
  const wishes = await loadWishes();
  const arr = cfg.PHOTOS.slice(0,10);
  arr.forEach((src, i)=>{
    const leftImage = i % 2 === 0;
    const w = wishes.find(w=> w.index === i) || wishes[i] || { who:'', msg:'' };
    memRoot.insertAdjacentHTML('beforeend', cardTemplate(i, src, leftImage, w));
  });
}

function revealGallery(){
  hint.textContent = 'Make a wish, Michuka! Now scroll down for memories 🎉';
  hint.classList.remove('hidden');
  buildMemories();
  gallerySection.classList.remove('hidden');
  setTimeout(()=>{
    document.querySelector('a[href="#gallery"]').classList.add('active');
    document.getElementById('gallery').scrollIntoView({behavior:'smooth'});
  }, 350);
}

// -------- Fireworks system (mobile robust) --------
let fwParticles = []; let fwRaf = 0; let fwRunning = false;

function fireRocket(){
  const vw = window.visualViewport ? visualViewport.width : innerWidth;
  const vh = window.visualViewport ? visualViewport.height : innerHeight;
  const x = Math.random() * vw;
  const y = vh + 10;
  const peak = 100 + Math.random() * (vh * 0.4);
  const hue = Math.floor(Math.random()*360);
  const vx = (Math.random()-0.5)*1.2;
  const vy = - (6 + Math.random()*2.5);
  const rocket = { type:'rocket', x, y, vx, vy, hue, peak };
  fwParticles.push(rocket);
}

function explode(x, y, hue){
  const count = 80 + Math.floor(Math.random()*60);
  for(let i=0;i<count;i++){
    const angle = (Math.PI*2) * (i/count) + Math.random()*0.05;
    const speed = 2 + Math.random()*3.5;
    fwParticles.push({
      type:'spark', x, y,
      vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed - 0.5,
      life: 60 + Math.random()*40, age: 0, hue, alpha: 1
    });
  }
}

function stepFireworks(){
  fwCtx.globalCompositeOperation = 'destination-out';
  fwCtx.fillStyle = 'rgba(0,0,0,0.15)';
  fwCtx.fillRect(0,0,fwCanvas.width,fwCanvas.height);
  fwCtx.globalCompositeOperation = 'lighter';

  const g = 0.05, next=[];
  for(const p of fwParticles){
    if(p.type === 'rocket'){
      p.x += p.vx; p.y += p.vy; p.vy += 0.05;
      drawParticle(p.x, p.y, p.hue, 2, 0.9);
      if(p.y < p.peak){ explode(p.x, p.y, p.hue); } else { next.push(p); }
    }else{
      p.x += p.vx; p.y += p.vy; p.vy += g; p.age++; p.alpha = Math.max(0, 1 - p.age / p.life);
      if(p.alpha > 0){ drawParticle(p.x, p.y, p.hue, 2, p.alpha); next.push(p); }
    }
  }
  fwParticles = next;
  if(Math.random() < 0.2) fireRocket();
  if(fwRunning) fwRaf = requestAnimationFrame(stepFireworks);
}

function drawParticle(x, y, hue, radius, alpha){
  fwCtx.beginPath(); fwCtx.arc(x, y, radius, 0, Math.PI*2);
  fwCtx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`; fwCtx.fill();
}

function startFireworks(){
  if(fwRunning) return;
  fwRunning = true;
  fwCanvas.style.opacity = 1;
  for(let i=0;i<6;i++) fireRocket();
  fwRaf = requestAnimationFrame(stepFireworks);
  setTimeout(()=>{ stopFireworks(); fwCanvas.style.opacity = 0; setTimeout(forceClearFireworks, 900); }, 7000);
}

function stopFireworks(){ fwRunning = false; if(fwRaf) cancelAnimationFrame(fwRaf); }

// Strong clear for mobile: reset buffer (width/height reset) then re-size
function forceClearFireworks(){
  const vv = window.visualViewport;
  const cssW = Math.ceil((vv ? vv.width : window.innerWidth));
  const cssH = Math.ceil((vv ? vv.height : window.innerHeight));
  const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
  // Hard reset (clears everything on iOS)
  fwCanvas.width = 1; fwCanvas.height = 1;
  // Re-apply target size
  fwCanvas.style.width  = cssW + 'px';
  fwCanvas.style.height = cssH + 'px';
  fwCanvas.width  = Math.floor(cssW * dpr);
  fwCanvas.height = Math.floor(cssH * dpr);
  fwCtx.setTransform(dpr,0,0,dpr,0,0);
  fwParticles.length = 0;
}

spawnDoves();
