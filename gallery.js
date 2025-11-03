const grid = document.getElementById('gallery-grid');
const box = document.getElementById('lightbox');
const boxImg = document.getElementById('lightbox-img');

function render(){
  grid.innerHTML = '';
  CONFIG.PHOTOS.forEach(src=>{
    const card = document.createElement('div');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = src; img.alt = 'memory';
    img.addEventListener('click', ()=>{
      boxImg.src = src;
      box.classList.add('active');
    });
    card.appendChild(img);
    grid.appendChild(card);
  });
}
render();
box.addEventListener('click', ()=> box.classList.remove('active'));
document.addEventListener('keydown', e=>{ if(e.key==='Escape') box.classList.remove('active'); });
