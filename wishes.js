const KEY = 'birthday_wishes_v1';
const list = document.getElementById('wishes-list');
const form = document.getElementById('wish-form');
const clearBtn = document.getElementById('clear-all');

function getWishes(){
  try{ return JSON.parse(localStorage.getItem(KEY)) || []; }catch{ return []; }
}
function setWishes(arr){
  localStorage.setItem(KEY, JSON.stringify(arr));
}
function cardOf(w){
  const div = document.createElement('div');
  div.className = 'card';
  const p = document.createElement('p');
  p.textContent = w.msg;
  const who = document.createElement('div');
  who.className = 'small';
  const dt = new Date(w.ts);
  who.textContent = `— ${w.who} • ${dt.toLocaleString()}`;
  div.appendChild(p); div.appendChild(who);
  return div;
}
function render(){
  list.innerHTML = '';
  getWishes().slice().reverse().forEach(w=> list.appendChild(cardOf(w)));
}
form.addEventListener('submit', e=>{
  e.preventDefault();
  const who = document.getElementById('who').value.trim() || 'Anonymous';
  const msg = document.getElementById('msg').value.trim();
  if(!msg) return;
  const data = getWishes();
  data.push({who, msg, ts: Date.now()});
  setWishes(data);
  form.reset();
  render();
});
clearBtn.addEventListener('click', ()=>{
  if(confirm('Clear all wishes saved in this browser?')){ localStorage.removeItem(KEY); render(); }
});
render();
