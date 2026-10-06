document.getElementById('year').textContent=new Date().getFullYear();
const links=document.querySelector('.links');document.querySelector('.menu').onclick=()=>links.classList.toggle('open');
document.querySelectorAll('.links a').forEach(a=>a.onclick=()=>links.classList.remove('open'));
document.querySelectorAll('.copy').forEach(btn=>btn.onclick=async()=>{const ip=btn.dataset.ip;try{await navigator.clipboard.writeText(ip);const label=btn.querySelector('.copytext');if(label){label.textContent='COPIED!';setTimeout(()=>label.textContent='COPY IP',1400)}else{const b=btn.querySelector('b');const old=b.textContent;b.textContent='✓';setTimeout(()=>b.textContent=old,1400)}}catch(e){alert('Server IP: '+ip)}});
window.addEventListener('scroll',()=>document.querySelector('header').classList.toggle('scrolled',window.scrollY>25),{passive:true});

document.querySelectorAll('.event-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.event-tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.event-list').forEach(list=>{
      list.classList.remove('active');
      list.hidden=true;
    });
    tab.classList.add('active');
    const target=document.querySelector(`.event-list[data-events="${tab.dataset.filter}"]`);
    if(target){target.hidden=false;target.classList.add('active');}
  });
});

async function loadDiscordUser(){
  const slot=document.getElementById('auth-slot');
  if(!slot) return;
  try{
    const res=await fetch('/api/me',{credentials:'same-origin'});
    if(!res.ok) return;
    const data=await res.json();
    if(!data.user) return;
    const avatar=data.user.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png';
    slot.innerHTML=`<div class="discord-user"><img src="${avatar}" alt=""><span>${escapeHtml(data.user.global_name || data.user.username)}</span><a href="/logout" title="Log out">LOG OUT</a></div>`;
  }catch(e){}
}
function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
loadDiscordUser();
