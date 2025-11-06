// Single-page app with white background + realistic doves
const cfg = window.BDAY_CONFIG;
const canvas = document.getElementById('cake');
const ctx = canvas.getContext('2d');
const relightBtn = document.getElementById('relight');
const micStatus = document.getElementById('mic-status');
const gallerySection = document.getElementById('gallery');
const hint = document.getElementById('reveal-hint');
const dovesLayer = document.getElementById('doves-layer');

let candles = 5;
let flame = 1.0;            // 1 = full flame, 0 = out
let analyser, data;
let revealed = false;

// --- Doves ---
function spawnDoves(){
  // Create 6 doves with varying top positions, durations, and delays
  const count = 6;
  for(let i=0;i<count;i++){
    const d = document.createElement('div');
    d.className = 'dove';
    d.style.top = `${10 + i*12 + (Math.random()*6-3)}vh`;
    d.style.animationDuration = `${24 + Math.random()*10}s`;
    d.style.animationDelay = `${Math.random()*-20}s`; // negative = already in-flight
    // Use embed SVG
    const img = document.createElement('img');
    img.src = 'assets/dove.svg';
    img.alt = 'flying dove';
    d.appendChild(img);
    dovesLayer.appendChild(d);
  }
}

// --- Cake drawing ---
function drawCake(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const cx = canvas.width/2, cy = canvas.height/2 + 40;

  // plate
  ctx.fillStyle = '#e6ebff';
  ctx.beginPath();
  ctx.ellipse(cx, cy+70, 260, 26, 0, 0, Math.PI*2);
  ctx.fill();

  // cake body
  ctx.fillStyle = '#fde3da';
  ctx.fillRect(cx-220, cy-40, 440, 130);
  ctx.fillStyle = '#e2bdb3';
  ctx.fillRect(cx-220, cy-40, 440, 22);

  // icing drips
  ctx.fillStyle = '#fff8fd';
  ctx.fillRect(cx-230, cy-64, 460, 34);
  for(let i=0;i<12;i++){
    const x = cx-210 + i*38;
    ctx.beginPath();
    ctx.moveTo(x, cy-30);
    ctx.quadraticCurveTo(x+8, cy-10, x-4, cy-5);
    ctx.lineTo(x-4, cy-30);
    ctx.fill();
  }

  // candles
  const spacing = 440/(candles+1);
  let allOut = flame <= 0.02;
  for(let i=0;i<candles;i++){
    const x = cx - 220 + spacing*(i+1);
    // body
    ctx.fillStyle = '#9ad0ff';
    ctx.fillRect(x-6, cy-60, 12, 36);
    // wick
    ctx.fillStyle = '#333';
    ctx.fillRect(x-1, cy-66, 2, 8);
    // flame
    if(flame>0){
      const f = flame * (0.9 + Math.random()*0.2); // flicker
      const grad = ctx.createRadialGradient(x, cy-78, 2, x, cy-78, 14*f);
      grad.addColorStop(0,'rgba(255,240,150,0.95)');
      grad.addColorStop(1,'rgba(255,120,60,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, cy-78, 14*f, 0, Math.PI*2);
      ctx.fill();
      allOut = false;
    }
  }

  if(allOut && !revealed){
    revealed = true;
    revealGallery();
  }
  requestAnimationFrame(drawCake);
}

function rms(buf){
  let s=0;
  for(let i=0;i<buf.length;i++){ s += buf[i]*buf[i]; }
  return Math.sqrt(s/buf.length);
}

async function enableMic(){
  try{
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const src = ac.createMediaStreamSource(stream);
    analyser = ac.createAnalyser();
    analyser.fftSize = 2048;
    data = new Float32Array(analyser.fftSize);
    src.connect(analyser);
    micStatus.innerHTML = 'Microphone: <strong>on</strong>';
    listen();
  }catch(e){
    micStatus.innerHTML = 'Microphone: <strong>blocked</strong> — tap the cake to blow.';
  }
}

function listen(){
  if(!analyser) return;
  analyser.getFloatTimeDomainData(data);
  const level = rms(data);
  if(level > 0.08){           // blow threshold
    flame = Math.max(0, flame - 0.12);
  }
  requestAnimationFrame(listen);
}

// Click to reduce flame (fallback)
canvas.addEventListener('click', ()=>{
  flame = Math.max(0, flame - 0.2);
});

relightBtn.addEventListener('click', ()=>{
  flame = 1.0; revealed = false;
  gallerySection.classList.add('hidden');
  hint.classList.add('hidden');
  window.scrollTo({top: 0, behavior: 'smooth'});
});

window.addEventListener('load', ()=>{
  enableMic();
  drawCake();
  spawnDoves();
});

// ------- Gallery + per-image wishes -------
const memRoot = document.getElementById('memories');
const LS_KEY = 'bday_mem_wishes';

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

function readAll(){
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
}
function writeAll(obj){
  localStorage.setItem(LS_KEY, JSON.stringify(obj));
}
function cardTemplate(idx, src, left){
  const sideA = left ? 'mem-img' : 'mem-wish';
  const sideB = left ? 'mem-wish' : 'mem-img';
  return `
    <article class="mem-card" data-idx="${idx}">
      <div class="${sideA}">${ left ? `<img src="${src}" alt="memory ${idx+1}">` : wishBox(idx) }</div>
      <div class="${sideB}">${ left ? wishBox(idx) : `<img src="${src}" alt="memory ${idx+1}">` }</div>
    </article>
  `;
}
function wishBox(idx){
  const store = readAll();
  const saved = store[idx]?.msg || '';
  const who = store[idx]?.who || '';
  return `
    <label class="small">Your wish for memory #${idx+1}</label>
    <textarea id="msg-${idx}" placeholder="Write a sweet message...">${saved}</textarea>
    <div class="mem-actions">
      <input id="who-${idx}" placeholder="Your name (optional)" value="${who}"/>
      <button class="btn" onclick="saveWish(${idx})">Save</button>
      <button class="btn secondary" onclick="clearWish(${idx})">Clear</button>
    </div>
    <div id="meta-${idx}" class="small"></div>
  `;
}
window.saveWish = function(idx){
  const msg = document.getElementById('msg-'+idx).value.trim();
  const who = document.getElementById('who-'+idx).value.trim();
  const all = readAll();
  all[idx] = { msg, who, ts: Date.now() };
  writeAll(all);
  const dt = new Date(all[idx].ts).toLocaleString();
  document.getElementById('meta-'+idx).textContent = (msg?`Saved by ${who||'Anonymous'} • ${dt}`:'(empty)');
}
window.clearWish = function(idx){
  const all = readAll();
  delete all[idx];
  writeAll(all);
  document.getElementById('msg-'+idx).value='';
  document.getElementById('who-'+idx).value='';
  document.getElementById('meta-'+idx).textContent='';
}

function buildMemories(){
  memRoot.innerHTML = '';
  const arr = cfg.PHOTOS.slice(0,10);
  arr.forEach((src, i)=>{
    const leftImage = i % 2 === 0; // alternate left/right
    memRoot.insertAdjacentHTML('beforeend', cardTemplate(i, src, leftImage));
  });
  // Restore saved meta display
  const all = readAll();
  for(const k in all){
    const idx = parseInt(k,10);
    if(!isNaN(idx)){
      const dt = new Date(all[k].ts).toLocaleString();
      const meta = document.getElementById('meta-'+idx);
      const msgEl = document.getElementById('msg-'+idx);
      const whoEl = document.getElementById('who-'+idx);
      if(meta){ meta.textContent = `Saved by ${all[k].who||'Anonymous'} • ${dt}`; }
      if(msgEl){ msgEl.value = all[k].msg || ''; }
      if(whoEl){ whoEl.value = all[k].who || ''; }
    }
  }
}
