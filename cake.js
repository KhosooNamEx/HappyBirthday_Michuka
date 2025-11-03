const canvas = document.getElementById('cake');
const ctx = canvas.getContext('2d');
const micBtn = document.getElementById('mic-btn');
const relightBtn = document.getElementById('relight');
const micStatus = document.getElementById('mic-status');

let candles = 5;
let flame = 1.0;            // 1 = full flame, 0 = out
let audioActive = false;
let analyser, data;

function drawCake(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const cx = canvas.width/2, cy = canvas.height/2 + 40;

  // plate
  ctx.fillStyle = '#e2e8ff';
  ctx.beginPath();
  ctx.ellipse(cx, cy+70, 220, 24, 0, 0, Math.PI*2);
  ctx.fill();

  // cake body
  ctx.fillStyle = '#f3d1c6';
  ctx.fillRect(cx-180, cy-40, 360, 120);
  ctx.fillStyle = '#d9a79c';
  ctx.fillRect(cx-180, cy-40, 360, 20);

  // icing drips
  ctx.fillStyle = '#fff4fb';
  ctx.fillRect(cx-190, cy-60, 380, 30);
  for(let i=0;i<10;i++){
    const x = cx-170 + i*38;
    ctx.beginPath();
    ctx.moveTo(x, cy-30);
    ctx.quadraticCurveTo(x+8, cy-10, x-4, cy-5);
    ctx.lineTo(x-4, cy-30);
    ctx.fill();
  }

  // candles
  const spacing = 360/(candles+1);
  for(let i=0;i<candles;i++){
    const x = cx - 180 + spacing*(i+1);
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
    }
  }
}

function loop(){
  drawCake();
  requestAnimationFrame(loop);
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
    audioActive = true;
    micStatus.innerHTML = 'Microphone: <strong>on</strong>';
    listen();
  }catch(e){
    alert('Microphone permission denied. You can still click the candles to blow them out.');
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

// Click to reduce flame
canvas.addEventListener('click', ()=>{
  flame = Math.max(0, flame - 0.2);
});

relightBtn.addEventListener('click', ()=>{
  flame = 1.0;
});

micBtn.addEventListener('click', ()=>{
  if(!audioActive){ enableMic(); }
});

loop();
