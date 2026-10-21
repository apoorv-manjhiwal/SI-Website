const menu = document.querySelector('#menu');
const nav = document.querySelector('#navigation');
function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); });
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
document.querySelector('#year').textContent = new Date().getFullYear();
const dialog = document.querySelector('#info-dialog');
const title = document.querySelector('#dialog-title');
const body = document.querySelector('#dialog-body');
document.querySelector('.close').addEventListener('click', () => dialog.close());
const notices = {
  privacy: ['Privacy information', 'This website does not include analytics, advertising trackers, or a server-side contact form. Project briefs are generated locally in your browser; the site does not transmit their contents. Your hosting provider may retain access logs under its own policies. Before launch, the site owner should provide its legal identity, privacy contact, retention practices, and any applicable data rights information.'],
  terms: ['Website information', 'This is a draft business website. Service descriptions are general information, not a quotation, service-level agreement, or guarantee. Scope, availability, warranties, and support obligations must be agreed in a written contract. Vendor names are used for identification and do not establish authorized partnerships or endorsements. Company identity, jurisdiction, and final legal terms must be supplied before commercial publication.']
};
document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => { const content = notices[button.dataset.dialog]; title.textContent = content[0]; body.replaceChildren(); const p = document.createElement('p'); p.textContent = content[1]; body.append(p); dialog.showModal(); }));
document.querySelector('#brief-button').addEventListener('click', () => {
  title.textContent = 'Tell us about your project.';
  body.innerHTML = '<p>Prepare a brief to share with your SI Systems contact. This form downloads a file; it does not send email.</p><form id="brief-form"><label for="name">Your name</label><input id="name" name="name" autocomplete="name" required maxlength="200"><label for="email">Work email</label><input id="email" name="email" type="email" autocomplete="email" required maxlength="254"><label for="details">Project requirements</label><textarea id="details" name="details" rows="4" required maxlength="10000" placeholder="Current environment, goals, timeline, and any preferred technologies…"></textarea><button class="button" type="submit">Download project brief ↗</button><p id="form-status" role="status"></p></form>';
  body.querySelector('form').addEventListener('submit', event => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const content = `SI SYSTEMS — PROJECT BRIEF\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\n\nRequirements:\n${data.get('details')}\n`;
    const url = URL.createObjectURL(new Blob([content], {type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = 'si-systems-project-brief.txt'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    document.querySelector('#form-status').textContent = 'Your brief is ready. Share the downloaded file with your SI Systems contact.';
  }); dialog.showModal();
});
// Dependency-free, rotating point-cloud globe with traveling network packets.
const canvas = document.querySelector('#globe');
const ctx = canvas.getContext('2d');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let width = 0, height = 0, frame = 0, animation;
const points = Array.from({length:420}, (_, i) => { const y = 1 - (i / 419) * 2; const r = Math.sqrt(1-y*y); const angle = i * Math.PI * (3-Math.sqrt(5)); return {x:Math.cos(angle)*r,y,z:Math.sin(angle)*r}; });
function resize() { const box = canvas.getBoundingClientRect(); width = box.width; height = box.height; const dpr = Math.min(devicePixelRatio || 1,2); canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); if (motion.matches) draw(); }
function draw() {
  ctx.clearRect(0,0,width,height); const radius = Math.min(width * (width < 650 ? .63 : .25),290); const cx = width * (width < 650 ? .82 : .79), cy = height*.49;
  const angle = frame*.002, cos = Math.cos(angle), sin = Math.sin(angle);
  const projected = points.map(p => {const x=p.x*cos-p.z*sin,z=p.x*sin+p.z*cos; return {x:cx+x*radius,y:cy+p.y*radius,z};});
  const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,radius*1.3); glow.addColorStop(0,'#196a8725');glow.addColorStop(1,'#196a8700');ctx.fillStyle=glow;ctx.fillRect(cx-radius*1.4,cy-radius*1.4,radius*2.8,radius*2.8);
  projected.forEach((p,i) => { if(p.z < -.25) return; ctx.fillStyle=`rgba(125,203,232,${(p.z+1)*.32})`;ctx.beginPath();ctx.arc(p.x,p.y,p.z>0?1.7:1,0,Math.PI*2);ctx.fill(); if(i%3!==0)return; [i+13,i+21].forEach(j=> {const q=projected[j%projected.length];if(q.z<0||Math.hypot(q.x-p.x,q.y-p.y)>radius*.45)return;ctx.strokeStyle=`rgba(95,184,215,${(p.z+1)*.09})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}); });
  for(let i=0;i<9;i++){const start=projected[(i*43+12)%420], end=projected[(i*43+96)%420];if(start.z<0||end.z<0)continue;const t=((frame*.004+i*.17)%1);const bend=-radius*.22;ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.quadraticCurveTo((start.x+end.x)/2,(start.y+end.y)/2+bend,end.x,end.y);ctx.strokeStyle='#b7f76a3d';ctx.lineWidth=1;ctx.stroke();const x=(1-t)*(1-t)*start.x+2*(1-t)*t*(start.x+end.x)/2+t*t*end.x;const y=(1-t)*(1-t)*start.y+2*(1-t)*t*((start.y+end.y)/2+bend)+t*t*end.y;ctx.beginPath();ctx.arc(x,y,2.6,0,Math.PI*2);ctx.fillStyle='#c3ff7d';ctx.shadowBlur=12;ctx.shadowColor='#b7f76a';ctx.fill();ctx.shadowBlur=0;}
  ctx.strokeStyle='#6aaec022';ctx.beginPath();ctx.arc(cx,cy,radius+16,0,Math.PI*2);ctx.stroke();
  frame++; if(!motion.matches && !document.hidden) animation=requestAnimationFrame(draw);
}
function restart(){cancelAnimationFrame(animation);draw();}
window.addEventListener('resize',()=>{resize();restart();});motion.addEventListener('change',restart);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(animation);else restart();});resize();restart();
