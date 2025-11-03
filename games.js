// Balloon Pop
const can = document.getElementById('balloon-canvas');
const ctx = can.getContext('2d');
const startBtn = document.getElementById('start-balloons');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const bestEl = document.getElementById('best');
let balloons = [], running=false, score=0, timeLeft=30, timerId=null;
const BEST_KEY = 'balloon_best';

function rnd(a,b){return Math.random()*(b-a)+a;}
function makeBalloon(){ 
  const r = rnd(16, 32);
  return {
    x: rnd(r, can.width - r), y: can.height + r, r,
    vy: rnd(1.2, 2.6), hue: Math.floor(rnd(0,360)), popped:false
  };
}
function resetGame(){
  balloons = Array.from({length: 12}, makeBalloon);
  score = 0; timeLeft = 30; running = true;
  scoreEl.textContent = score; timeEl.textContent = timeLeft.toString();
}
function draw(){
  ctx.clearRect(0,0,can.width, can.height);
  for(const b of balloons){
    if(!b.popped){
      b.y -= b.vy;
      if(b.y + b.r < -10){ b.y = can.height + b.r; b.x = rnd(b.r, can.width-b.r); }
      ctx.beginPath();
      ctx.fillStyle = `hsl(${b.hue},90%,60%)`;
      ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
      ctx.fill();
      // string
      ctx.beginPath(); ctx.moveTo(b.x, b.y+b.r); ctx.lineTo(b.x, b.y+b.r+20); ctx.strokeStyle='white'; ctx.stroke();
    }else{
      // little confetti burst
      for(let i=0;i<5;i++){
        ctx.fillStyle = `hsl(${b.hue},90%,60%)`;
        ctx.fillRect(b.x+rnd(-b.r,b.r), b.y+rnd(-b.r,b.r), 3,3);
      }
    }
  }
  if(running) requestAnimationFrame(draw);
}
can.addEventListener('click', e=>{
  if(!running) return;
  const rect = can.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (can.width / rect.width);
  const y = (e.clientY - rect.top) * (can.height / rect.height);
  for(const b of balloons){
    if(!b.popped && (x-b.x)**2 + (y-b.y)**2 <= b.r**2){
      b.popped = true; score++; scoreEl.textContent = score;
      // respawn after pop
      setTimeout(()=>{ Object.assign(b, makeBalloon()); b.popped=false; }, 300);
      break;
    }
  }
});
function startTimer(){
  clearInterval(timerId);
  timerId = setInterval(()=>{
    timeLeft--; timeEl.textContent = timeLeft.toString();
    if(timeLeft<=0){ 
      clearInterval(timerId); running=false;
      const best = parseInt(localStorage.getItem(BEST_KEY)||'0',10);
      if(score>best){ localStorage.setItem(BEST_KEY, String(score)); }
      bestEl.textContent = localStorage.getItem(BEST_KEY)||'0';
      alert(`Time! Your score: ${score}`);
    }
  },1000);
}

startBtn?.addEventListener('click', ()=>{
  resetGame(); draw(); startTimer();
  bestEl.textContent = localStorage.getItem(BEST_KEY)||'0';
});

// Candle
const candle = document.getElementById('candle');
if(candle){
  const cctx = candle.getContext('2d');
  let flame = 1.0; // 1 = full flame, 0 = out
  function drawCandle(){
    cctx.clearRect(0,0,candle.width,candle.height);
    const cx = candle.width/2, cy = candle.height/2 + 20;
    // body
    cctx.fillStyle = '#f3e8d8';
    cctx.fillRect(cx-20, cy-60, 40, 80);
    // wick
    cctx.fillStyle = '#333';
    cctx.fillRect(cx-2, cy-66, 4, 10);
    // flame
    if(flame>0){
      const f = flame;
      const grad = cctx.createRadialGradient(cx, cy-80, 2, cx, cy-80, 30*f);
      grad.addColorStop(0, 'rgba(255,240,150,0.9)');
      grad.addColorStop(1, 'rgba(255,120,60,0.0)');
      cctx.fillStyle = grad;
      cctx.beginPath();
      cctx.arc(cx, cy-80, 30*f, 0, Math.PI*2); cctx.fill();
    }
  }
  drawCandle();
  candle.addEventListener('click', ()=>{
    flame = Math.max(0, flame - 0.15);
    drawCandle();
  });
  document.getElementById('relight')?.addEventListener('click', ()=>{ flame=1.0; drawCandle(); });
}
