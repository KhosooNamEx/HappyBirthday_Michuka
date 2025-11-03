// Confetti & music on the Home page
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
const bgm = document.getElementById("bgm");
const btnCelebrate = document.getElementById("celebrate");
const btnMusic = document.getElementById("toggle-music");
let W, H, particles = [], running = false;

function resize(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize); resize();

function rand(min,max){return Math.random()*(max-min)+min;}

function spawn(n=160){
  particles = [];
  for(let i=0;i<n;i++){
    particles.push({
      x: rand(0, W), y: rand(-H*0.2, -10), r: rand(2,5),
      vx: rand(-1,1), vy: rand(2,5),
      rot: rand(0, Math.PI*2), vr: rand(-0.1, 0.1),
      hue: Math.floor(rand(0,360))
    });
  }
}

function tick(){
  if(!running) return;
  ctx.clearRect(0,0,W,H);
  for(const p of particles){
    p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vy += 0.02;
    if(p.y - p.r > H){ p.y = rand(-40,-10); p.x = rand(0,W); p.vy = rand(2,5); }
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
    ctx.fillStyle = `hsl(${p.hue},90%,60%)`;
    ctx.fillRect(-p.r,-p.r,p.r*2,p.r*2);
    ctx.restore();
  }
  requestAnimationFrame(tick);
}

if(btnCelebrate){
  btnCelebrate.addEventListener("click", ()=>{
    spawn();
    if(!running){ running = true; tick(); setTimeout(()=>running=false, 6000); }
  });
}

if(btnMusic){
  btnMusic.addEventListener("click", async ()=>{
    const pressed = btnMusic.getAttribute("aria-pressed")==="true";
    try{
      if(!pressed){ await bgm.play(); btnMusic.setAttribute("aria-pressed","true"); btnMusic.textContent="Pause Music ⏸"; }
      else{ bgm.pause(); btnMusic.setAttribute("aria-pressed","false"); btnMusic.textContent="Play Music 🎵"; }
    }catch(e){ alert("Autoplay blocked—tap again to start music."); }
  });
}
