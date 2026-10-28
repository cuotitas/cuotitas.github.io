(function(){
const NS='http://www.w3.org/2000/svg';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt=(v,d=0)=>v.toLocaleString('es-BO',{minimumFractionDigits:d,maximumFractionDigits:d});
const bs=v=>'Bs '+fmt(v,Math.abs(v%1)>0.001?2:0);
const el=(tag,attrs,parent,text)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(text!=null)e.textContent=text;if(parent)parent.appendChild(e);return e};
const $=s=>document.querySelector(s);
const tip=$('#tip');
function showTip(html,x,y){tip.innerHTML=html;tip.classList.add('on');const w=tip.offsetWidth,h=tip.offsetHeight;let lx=x+14,ly=y-h-12;if(lx+w>innerWidth-8)lx=x-w-14;if(ly<8)ly=y+16;tip.style.left=lx+'px';tip.style.top=ly+'px'}
function hideTip(){tip.classList.remove('on')}
function hover(n,html){n.addEventListener('pointermove',e=>showTip(html,e.clientX,e.clientY));n.addEventListener('pointerleave',hideTip)}

/* theme toggle */
const root=document.documentElement;
try{const t=localStorage.getItem('cuotitas-theme');if(t)root.dataset.theme=t}catch(e){}
$('#theme').addEventListener('click',()=>{const dark=root.dataset.theme?root.dataset.theme==='dark':!matchMedia('(prefers-color-scheme: light)').matches;root.dataset.theme=dark?'light':'dark';try{localStorage.setItem('cuotitas-theme',root.dataset.theme)}catch(e){}});

/* scroll progress + scroll spy */
const prog=$('#progress'),links=[...document.querySelectorAll('.links a')];
const secs=links.map(a=>document.querySelector(a.getAttribute('href')));
function onScroll(){const h=document.documentElement;prog.style.transform=`scaleX(${h.scrollTop/(h.scrollHeight-h.clientHeight||1)})`;
  let cur=-1;secs.forEach((s,i)=>{if(s&&s.getBoundingClientRect().top<140)cur=i});links.forEach((a,i)=>a.classList.toggle('act',i===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* pointer glow */
document.querySelectorAll('.card.glow').forEach(c=>c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')}));

/* console stream (simulation) */
const log=$('#log');
const evs=[
 ['POST','/v1/orders           ','201','ok',()=>`${60+Math.floor(Math.random()*60)}ms  Bs ${fmt(300+Math.floor(Math.random()*40)*100)}`],
 ['RISK',()=>`score usr_${Math.random().toString(16).slice(2,5)} nivel ${1+Math.floor(Math.random()*5)}  `,'aprobado','ok',()=>`inicial ${[50,45,40,30,25][Math.floor(Math.random()*5)]}%`],
 ['HOOK','bank.qr.paid         ','200','ok',()=>`Bs ${fmt(100+Math.random()*900,2)}`],
 ['JOB ','cuotas.crear         ','3 cuotas','ok',()=>'d14 d28 d42'],
 ['WS  ','caja.orden.aprobada  ','enviado','ok',()=>''],
 ['JOB ','liquidacion.t+1      ','Bs '+fmt(48210),'ok',()=>'12 comercios'],
 ['RISK',()=>`score usr_${Math.random().toString(16).slice(2,5)} nivel 1  `,'rechazado','wa',()=>'supera la línea'],
 ['JOB ','cuota.vencida        ','congelada','wa',()=>'aviso WhatsApp']];
let lines=log.innerHTML.split('\n').filter(l=>l&&!l.includes('caret'));
let clock=10*3600+41*60+9;
function tick(){clock+=1+Math.floor(Math.random()*3);const t=new Date(clock*1000).toISOString().slice(11,19);
  const e=evs[Math.floor(Math.random()*evs.length)];const p=typeof e[1]==='function'?e[1]():e[1];
  lines.push(`<span class="dim">${t}</span> <span class="in">${e[0]}</span> ${p}<span class="${e[3]}">${e[2]}</span> ${e[4]()}`);
  lines=lines.slice(-9);log.innerHTML=lines.join('\n')+'\n<span class="caret"></span>';
  $('#mLat').textContent=fmt(1.9+Math.random()*0.9,1)+' s';$('#mOps').textContent=30+Math.floor(Math.random()*20)}
if(!reduce)setInterval(tick,1300);

/* count-up */
function countUp(b){const n=+b.dataset.count,pre=b.dataset.pre||'',suf=b.dataset.suf||'';const t0=performance.now();const f=t=>{const p=Math.min(1,(t-t0)/1200),e=1-Math.pow(1-p,3);b.textContent=pre+fmt(Math.round(n*e))+suf;if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
if(!reduce)document.querySelectorAll('[data-count]').forEach(countUp);

/* simulator */
const LV={1:[.50,500],2:[.45,1000],3:[.40,2000],4:[.30,4000],5:[.25,6000]};let lv=1;const pr=$('#precio');
function sim(){const p=+pr.value,[ip,lin]=LV[lv],ini=Math.round(p*ip*100)/100,fin=Math.round((p-ini)*100)/100,cu=Math.round(fin/3*100)/100,com=Math.round(p*7)/100;
  $('#precioTxt').textContent=bs(p);$('#iniTxt').textContent=bs(ini);$('#cuTxt').textContent=bs(cu);$('#lineaTxt').textContent=bs(lin);$('#finTxt').textContent=bs(fin);$('#comTxt').textContent=bs(com);$('#netTxt').textContent=bs(Math.max(0,fin-com));
  $('#bIni').style.flexGrow=(ip/((1-ip)/3)).toFixed(3);$('#bIni').textContent='Inicial '+Math.round(ip*100)+'%';
  const st=$('#estado');if(fin>lin){st.className='status bad';st.lastElementChild.textContent='Rechazado: supera la línea de '+bs(lin)+'. Sube la inicial o elige un producto más barato.'}else{st.className='status ok';st.lastElementChild.textContent='Aprobado: dentro de la línea'}}
pr.addEventListener('input',sim);
document.querySelectorAll('.seg button').forEach(b=>b.addEventListener('click',()=>{lv=+b.dataset.l;document.querySelectorAll('.seg button').forEach(x=>x.setAttribute('aria-pressed',x===b));sim()}));
sim();

/* ---------- architecture diagram with moving packets ---------- */
(function(){
 const svg=$('#arch');
 const defs=el('defs',{},svg);const mk=el('marker',{id:'ar',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse'},defs);el('path',{d:'M0 0L10 5L0 10z',fill:'var(--muted)'},mk);
 const N={
  cli:{x:150,y:56,w:200,t:'App del cliente',s:'Flutter · Android/iOS',c:'s1'},
  caja:{x:480,y:56,w:200,t:'App del comercio',s:'Next.js PWA · WebSocket',c:'s1'},
  pan:{x:810,y:56,w:200,t:'Panel interno',s:'React · RBAC · auditoría',c:'s1'},
  edge:{x:480,y:160,w:300,t:'CloudFront + WAF',s:'TLS 1.3 · límites de tasa',c:'s2'},
  api:{x:480,y:268,w:300,t:'API Cuotitas (NestJS)',s:'KYC · riesgo · órdenes · cuotas · cobranza · liquidación',c:'s1',main:true},
  bank:{x:120,y:268,w:180,t:'Banco aliado',s:'QR, webhooks, pagos',c:'s3'},
  work:{x:840,y:268,w:180,t:'Workers + SQS',s:'vencimientos, avisos',c:'s2'},
  kyc:{x:100,y:400,w:160,t:'KYC e Infocred',s:'identidad, buró',c:'s3'},
  pg:{x:290,y:400,w:160,t:'PostgreSQL 16',s:'RDS Multi-AZ',c:'s2'},
  rd:{x:480,y:400,w:160,t:'Redis',s:'sesiones, límites',c:'s2'},
  s3:{x:670,y:400,w:160,t:'S3 cifrado',s:'documentos KYC',c:'s2'},
  wa:{x:860,y:400,w:160,t:'WhatsApp y SMS',s:'recordatorios',c:'s3'}};
 const H=54;
 const E=[['cli','edge','M150 83 V120 H420 V133'],['caja','edge','M480 83 V133'],['pan','edge','M810 83 V120 H540 V133'],['edge','api','M480 187 V241'],
  ['api','bank','M330 268 H210'],['bank','api','M210 280 H330'],['api','work','M630 268 H750'],['work','wa','M860 295 V373'],
  ['api','pg','M400 295 V340 H290 V373'],['api','rd','M480 295 V373'],['api','s3','M560 295 V340 H670 V373'],['api','kyc','M360 295 V320 H100 V373'],['cli','bank','M80 83 V241']];
 const paths=[];
 E.forEach(([a,b,d])=>{const p=el('path',{d,fill:'none',stroke:'var(--line)','stroke-width':1.5,'marker-end':'url(#ar)'},svg);paths.push(p)});
 Object.entries(N).forEach(([k,n])=>{const g=el('g',{},svg);
  el('rect',{x:n.x-n.w/2,y:n.y-H/2,width:n.w,height:H,rx:10,fill:n.main?'var(--accent-soft)':'var(--surface-2)',stroke:`var(--${n.c})`,'stroke-width':n.main?2:1.25},g);
  el('text',{x:n.x,y:n.y-4,'text-anchor':'middle','font-size':14,'font-weight':600,fill:'var(--ink)'},g,n.t);
  el('text',{x:n.x,y:n.y+14,'text-anchor':'middle','font-size':11.5,fill:'var(--ink-2)'},g,n.s);
  hover(g,`<b>${n.t}</b><br>${n.s}`)});
 el('text',{x:330,y:258,'text-anchor':'middle','font-size':10.5,fill:'var(--muted)'},svg,'');
 el('text',{x:70,y:160,'font-size':11,fill:'var(--muted)',transform:'rotate(-90 70 160)','text-anchor':'middle'},svg,'paga por QR');
 const dots=paths.map((p,i)=>({p,len:p.getTotalLength(),c:el('circle',{r:3.5,fill:i%3===0?'var(--accent)':i%3===1?'var(--cyan)':'var(--sun)'},svg),o:Math.random(),sp:.25+Math.random()*.25}));
 function place(t){dots.forEach(d=>{const f=((t/1000)*d.sp+d.o)%1,pt=d.p.getPointAtLength(f*d.len);d.c.setAttribute('cx',pt.x);d.c.setAttribute('cy',pt.y)})}
 place(0);
 if(!reduce){let vis=true;new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(svg);const loop=t=>{if(vis)place(t);requestAnimationFrame(loop)};requestAnimationFrame(loop)}
})();

/* ---------- stack tabs ---------- */
(function(){
 const T=[
  {k:'App cliente',why:'Un solo código para Android, que es la gran mayoría de celulares en Bolivia, y para iOS.',items:['<b>Flutter 3 + Dart</b>, estado con Riverpod','<b>SDK de KYC</b> para selfie y prueba de vida','<b>Biometría</b> para aprobar cada compra','<b>Almacenamiento seguro</b> (Keystore / Keychain)','<b>Notificaciones push</b> con Firebase'],b:['Flutter','Dart','Riverpod','Firebase','Keystore']},
  {k:'App comercio',why:'Funciona en la computadora o el celular de la caja sin instalar nada de la tienda de apps.',items:['<b>Next.js (React)</b> como PWA instalable','<b>WebSocket</b> para ver la aprobación en vivo','<b>Generación de QR</b> por orden, válido 5 min','<b>Roles</b> cajero y supervisor','<b>Reporte diario</b> de ventas y comisiones'],b:['Next.js','React','TypeScript','WebSocket','PWA']},
  {k:'Backend',why:'TypeScript en todo el stack: el mismo equipo mueve backend, comercio y panel.',items:['<b>NestJS</b> como monolito modular','<b>REST + webhooks</b> firmados con HMAC','<b>Colas SQS</b> y workers para vencimientos y avisos','<b>Motor de riesgo</b> por reglas versionadas','<b>Idempotencia</b> en pagos y liquidaciones'],b:['Node.js 22','NestJS','TypeScript','SQS','OpenAPI']},
  {k:'Datos',why:'PostgreSQL da transacciones fuertes para dinero; lo analítico va a una réplica.',items:['<b>PostgreSQL 16</b> en RDS Multi-AZ','<b>Redis</b> para sesiones y límites de tasa','<b>S3 cifrado</b> para documentos de identidad','<b>Réplica de lectura</b> + Metabase para reportes','<b>Respaldos diarios</b> con 35 días de retención'],b:['PostgreSQL','Redis','S3','Metabase','dbt']},
  {k:'Infra y DevOps',why:'São Paulo es la región de AWS más cercana a Bolivia (baja latencia).',items:['<b>AWS sa-east-1</b>: ECS Fargate, RDS, ElastiCache','<b>Terraform</b> para toda la infraestructura','<b>GitHub Actions</b> con despliegue azul-verde','<b>Grafana + Sentry</b> para métricas y errores','<b>Guardia</b> con alertas por WhatsApp/correo'],b:['AWS','ECS Fargate','Terraform','GitHub Actions','Grafana','Sentry']},
  {k:'Seguridad',why:'Es un negocio de crédito supervisado: la seguridad es requisito de ASFI, no un extra.',items:['<b>Cifrado</b> AES-256 en reposo (KMS) y TLS 1.3','<b>MFA</b> y mínimo privilegio para el equipo','<b>WAF</b> y límites de tasa contra abuso','<b>Auditoría inmutable</b> de decisiones de crédito','<b>Pentest externo</b> antes de lanzar y cada año'],b:['KMS','WAF','MFA','OWASP ASVS','Pentest']}];
 const tabs=$('#tabs'),panel=$('#tabpanel');let cur=0;
 function show(i){cur=i;[...tabs.children].forEach((b,j)=>{b.setAttribute('aria-selected',j===i);b.tabIndex=j===i?0:-1});const t=T[i];
  panel.innerHTML=`<div style="display:grid;gap:12px;align-content:start"><h3>${t.k}</h3><p style="color:var(--ink-2)">${t.why}</p><div class="stackbadges">${t.b.map(x=>`<span>${x}</span>`).join('')}</div></div><ul>${t.items.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  panel.classList.remove('in');void panel.offsetWidth;if(!reduce)panel.classList.add('in')}
 T.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.role='tab';b.id='tab'+i;b.textContent=t.k;b.addEventListener('click',()=>show(i));
  b.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){const n=(cur+(e.key==='ArrowRight'?1:T.length-1))%T.length;show(n);tabs.children[n].focus()}});tabs.appendChild(b)});
 show(2);
})();

/* ---------- sequence diagram ---------- */
(function(){
 const svg=$('#seq');const A=[['Cliente (app)',90],['Caja (comercio)',280],['API Cuotitas',480],['Motor de riesgo',680],['Banco aliado',870]];
 const defs=el('defs',{},svg);const mk=el('marker',{id:'sa',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:7,markerHeight:7,orient:'auto-start-reverse'},defs);el('path',{d:'M0 0L10 5L0 10z',fill:'var(--accent)'},mk);
 A.forEach(([t,x],i)=>{el('rect',{x:x-78,y:12,width:156,height:38,rx:9,fill:i===2?'var(--accent-soft)':'var(--surface-2)',stroke:i===2?'var(--accent)':'var(--line)'},svg);
  el('text',{x,y:36,'text-anchor':'middle','font-size':13,'font-weight':600,fill:'var(--ink)'},svg,t);
  el('line',{x1:x,x2:x,y1:50,y2:505,stroke:'var(--line)','stroke-dasharray':'4 5'},svg)});
 const X=i=>A[i][1];
 const S=[[1,2,'1. POST /orders (monto)'],[2,1,'2. QR de la orden'],[0,2,'3. Escanea QR y abre la orden'],[2,3,'4. Evaluar usuario y monto'],[3,2,'5. Aprobado · inicial 45%'],[0,4,'6. Paga la inicial por QR'],[4,2,'7. Webhook: pago confirmado'],[2,1,'8. Orden aprobada (WebSocket)'],[2,4,'9. Liquidación al comercio T+1']];
 const steps=S.map(([a,b,t],i)=>{const y=82+i*46,g=el('g',{class:'seqstep'},svg);const x1=X(a),x2=X(b),dir=x2>x1?1:-1;
  el('line',{x1:x1+dir*4,x2:x2-dir*6,y1:y,y2:y,stroke:'var(--accent)','stroke-width':1.6,'marker-end':'url(#sa)'},g);
  el('text',{x:(x1+x2)/2,y:y-8,'text-anchor':'middle','font-size':12.5,fill:'var(--ink)'},g,t);return g});
 const y10=82+9*46;const g=el('g',{class:'seqstep'},svg);el('rect',{x:X(2)-90,y:y10-16,width:180,height:30,rx:8,fill:'var(--sun-soft)',stroke:'var(--sun)'},g);el('text',{x:X(2),y:y10+4,'text-anchor':'middle','font-size':12.5,fill:'var(--ink)'},g,'Crea 3 cuotas: d14, d28, d42');steps.push(g);
 let timer=null;
 $('#seqPlay').addEventListener('click',()=>{clearInterval(timer);svg.classList.add('running');steps.forEach(s=>s.classList.remove('on'));let i=0;
  const go=()=>{if(i>=steps.length){clearInterval(timer);setTimeout(()=>svg.classList.remove('running'),900);return}steps[i].classList.add('on');i++};go();timer=setInterval(go,reduce?50:650)});
})();

/* ---------- cuota state machine ---------- */
(function(){
 const svg=$('#states');const defs=el('defs',{},svg);const mk=el('marker',{id:'st',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse'},defs);el('path',{d:'M0 0L10 5L0 10z',fill:'var(--muted)'},mk);
 const B={prog:[90,60,'Programada','al aprobar'],venc:[300,60,'Por vencer','D-3 · recordatorio'],pag:[520,60,'Pagada','QR conciliado'],vencida:[300,170,'Vencida','D+1 · cuenta congelada'],cob:[540,170,'En cobranza','D+3 · llamadas'],cast:[790,170,'Castigada','D+90 · pérdida']};
 const ar=(d,lab,lx,ly)=>{el('path',{d,fill:'none',stroke:'var(--muted)','stroke-width':1.3,'marker-end':'url(#st)'},svg);if(lab)el('text',{x:lx,y:ly,'font-size':11.5,fill:'var(--muted)','text-anchor':'middle'},svg,lab)};
 ar('M170 60 H218');ar('M380 60 H438','paga',409,50);ar('M300 87 V141','no paga',336,118);ar('M380 170 H458');ar('M540 143 V100 H560 V89','paga',600,124);ar('M620 170 H708');
 Object.values(B).forEach(([x,y,t,s])=>{const good=t==='Pagada',bad=t==='Castigada'||t==='Vencida';
  el('rect',{x:x-80,y:y-27,width:160,height:54,rx:10,fill:'var(--surface-2)',stroke:good?'var(--good)':bad?'var(--bad)':'var(--line)','stroke-width':good||bad?1.6:1.2},svg);
  el('text',{x,y:y-3,'text-anchor':'middle','font-size':14,'font-weight':600,fill:'var(--ink)'},svg,t);
  el('text',{x,y:y+15,'text-anchor':'middle','font-size':11.5,fill:'var(--ink-2)'},svg,s)});
})();

/* ---------- ERD ---------- */
(function(){
 const T={usuarios:['id','ci','telefono','nivel_id→niveles','estado','creado_en'],niveles:['id','inicial_pct','linea_bs','requisito'],comercios:['id','nit','rubro','comision_pct','cuenta_banco'],
  ordenes:['id','usuario_id→usuarios','comercio_id→comercios','monto_bs','inicial_bs','estado'],cuotas:['id','orden_id→ordenes','numero','vence_el','monto_bs','estado'],pagos:['id','cuota_id→cuotas','canal','ref_banco','idempotency_key','pagado_en'],
  liquidaciones:['id','comercio_id→comercios','fecha','bruto_bs','comision_bs','neto_bs'],auditoria:['id','actor','accion','entidad','datos_json','ts']};
 const erd=$('#erd');const rel={};
 Object.entries(T).forEach(([t,cols])=>{cols.forEach(c=>{const m=c.split('→')[1];if(m){(rel[t]=rel[t]||new Set()).add(m);(rel[m]=rel[m]||new Set()).add(t)}})});
 Object.entries(T).forEach(([t,cols])=>{const d=document.createElement('div');d.className='ent';d.dataset.t=t;
  d.innerHTML=`<b>${t}</b><ul>${cols.map(c=>{const [n,ref]=c.split('→');return c==='id'?`<li><span class="pk">PK</span> id</li>`:ref?`<li><span class="fk">FK</span> ${n} <span>→ ${ref}</span></li>`:`<li>${n}</li>`}).join('')}</ul>`;
  d.addEventListener('pointerenter',()=>{(rel[t]||[]).forEach(r=>erd.querySelector(`[data-t="${r}"]`).classList.add('hl'))});
  d.addEventListener('pointerleave',()=>erd.querySelectorAll('.hl').forEach(x=>x.classList.remove('hl')));erd.appendChild(d)});
})();

/* ---------- charts ---------- */
function hbars(id,rows,{max,left=150,w=520,rowH=36,top=6,f,color}){
 const svg=$('#'+id);const plotW=w-left-90,X=v=>v/max*plotW;
 rows.forEach((r,i)=>{const y=top+i*rowH;
  el('text',{x:left-10,y:y+rowH/2+4,'text-anchor':'end',class:'lab'},svg,r.k);
  el('rect',{x:left,y:y+7,width:Math.max(2,X(r.v)),height:rowH-14,rx:4,fill:color?color(r,i):'var(--s1)',class:'hbar',style:`animation-delay:${i*70}ms`},svg);
  el('text',{x:left+X(r.v)+8,y:y+rowH/2+4,class:'val'},svg,f(r.v));
  const hit=el('rect',{x:0,y,width:w,height:rowH,fill:'transparent'},svg);hover(hit,`<b>${r.k}</b><br>${f(r.v)}${r.n?'<br>'+r.n:''}`)});
}
hbars('devcost',[{k:'Desarrollo Servisofts SRL',v:571200,n:'US$ 6.000 × 8 meses, con UX/UI y DevOps'},{k:'Nube (8 meses)',v:44000,n:'dev, staging y producción'},{k:'Pentest externo',v:35000},{k:'Servicios externos',v:30000,n:'KYC, WhatsApp, cuentas de tiendas'}],
 {max:571200,left:170,rowH:44,f:v=>'Bs '+fmt(v),color:r=>r.k.startsWith('Desarrollo')?'var(--s1)':r.k==='Servicios externos'?'var(--s3)':'var(--s2)'});
hbars('effort',[{k:'Backend (2)',v:16},{k:'Frontend (2)',v:16},{k:'Project manager',v:8},{k:'Integrador',v:8},{k:'QA / pruebas',v:8},{k:'Diseño UX/UI',v:8},{k:'DevOps',v:8}],
 {max:16,left:150,rowH:44,f:v=>v+' meses-persona',color:r=>r.k==='Integrador'||r.k==='DevOps'?'var(--s2)':r.k.startsWith('QA')?'var(--s3)':r.k==='Project manager'?'var(--mark)':'var(--s1)'});

/* Servisofts vs in-house vs factory: range bars */
(function(){
 const svg=$('#vs');const left=150,W=300,max=1500000,X=v=>left+v/max*W;
 [0,500000,1000000,1500000].forEach(t=>{el('line',{x1:X(t),x2:X(t),y1:14,y2:182,stroke:'var(--line)'},svg);el('text',{x:X(t),y:202,'text-anchor':'middle',class:'lab'},svg,t?fmt(t/1e6,1)+' M':'0')});
 el('text',{x:left-10,y:52,'text-anchor':'end',class:'lab'},svg,'Servisofts SRL');
 const s=el('rect',{x:left,y:34,width:X(571200)-left,height:28,rx:4,fill:'var(--accent)',class:'hbar'},svg);el('text',{x:X(571200)+8,y:53,class:'val'},svg,'Bs 0,57 M');hover(s,'Servisofts SRL: US$ 48.000 (Bs 571.200)');
 el('text',{x:left-10,y:104,'text-anchor':'end',class:'lab'},svg,'Equipo propio');
 const a=el('rect',{x:left,y:86,width:X(890675)-left,height:28,rx:4,fill:'var(--mark)',class:'hbar',style:'animation-delay:120ms'},svg);el('text',{x:X(890675)+8,y:105,class:'val'},svg,'Bs 0,89 M');hover(a,'Equipo propio: Bs 890.675');
 el('text',{x:left-10,y:156,'text-anchor':'end',class:'lab'},svg,'Fábrica de software');
 const b=el('rect',{x:left,y:138,width:X(1200000)-left,height:28,rx:4,fill:'var(--mark)',class:'hbar',style:'animation-delay:240ms'},svg);
 el('line',{x1:X(1200000),x2:X(1440000),y1:152,y2:152,stroke:'var(--ink-2)','stroke-width':2},svg);el('line',{x1:X(1440000),x2:X(1440000),y1:144,y2:160,stroke:'var(--ink-2)','stroke-width':2},svg);
 el('text',{x:X(1440000)+8,y:157,class:'val'},svg,'Bs 1,2–1,44 M');hover(b,'Fábrica: Bs 1,2 a 1,44 M');
 el('text',{x:left,y:228,class:'lab'},svg,'millones de Bs');
})();

/* gantt */
(function(){
 const svg=$('#gantt');const left=230,right=940,top=44,rowH=30,X=w=>left+w/32*(right-left);
 const R=[['Descubrimiento y diseño UX',0,6,'s3'],['Infra base, CI/CD y seguridad',0,8,'s2'],['Registro y KYC',2,10,'s1'],['Niveles y motor de riesgo',6,14,'s1'],['Compras y app del comercio',6,16,'s1'],['App del cliente',2,16,'s1'],['Cuotas y cobros QR (banco)',8,18,'s1'],['Cobranza y WhatsApp',12,18,'s1'],['Liquidación a comercios',12,20,'s1'],['Panel interno',10,20,'s1'],['QA y pruebas de carga',16,24,'s3'],['Piloto con 10 comercios',18,24,'s3'],['Pentest y entorno de pruebas ASFI',24,32,'s2']];
 for(let s=0;s<16;s++){const x=X(s*2);if(s%2===0)el('rect',{x,y:top-6,width:X(2)-X(0),height:R.length*rowH+10,fill:'var(--grid)'},svg);el('text',{x:x+(X(2)-X(0))/2,y:top-14,'text-anchor':'middle',class:'lab','font-size':11},svg,'S'+(s+1))}
 [['Mes 1–4: MVP',0,16],['Mes 5–8: piloto y endurecimiento',16,32]].forEach(([t,a,b])=>{el('text',{x:(X(a)+X(b))/2,y:16,'text-anchor':'middle','font-size':12,'font-weight':600,fill:'var(--ink)'},svg,t)});
 el('line',{x1:X(16),x2:X(16),y1:6,y2:top+R.length*rowH,stroke:'var(--sun)','stroke-dasharray':'4 4'},svg);
 R.forEach(([t,a,b,c],i)=>{const y=top+i*rowH;el('text',{x:left-12,y:y+rowH/2+2,'text-anchor':'end',class:'lab'},svg,t);
  const r=el('rect',{x:X(a)+1,y:y+6,width:X(b)-X(a)-2,height:rowH-14,rx:5,fill:`var(--${c})`,class:'hbar',style:`animation-delay:${i*60}ms`},svg);
  hover(r,`<b>${t}</b><br>Sprints ${a/2+1} a ${b/2} · semanas ${a+1} a ${b}`)});
 const ly=top+R.length*rowH+30;const mx=X(18);el('path',{d:`M${mx} ${ly-8}l8 8l-8 8l-8 -8z`,fill:'var(--sun)'},svg);el('text',{x:mx+14,y:ly+4,'font-size':12,fill:'var(--ink)'},svg,'Piloto en Santa Cruz (mes 5)');
 const lx=X(32);el('path',{d:`M${lx-8} ${ly+18}l8 8l-8 8l-8 -8z`,fill:'var(--accent)'},svg);el('text',{x:lx-22,y:ly+30,'text-anchor':'end','font-size':12,fill:'var(--ink)'},svg,'Producción lista para escalar (mes 8)');
})();

/* tech run cost: stacked bars per year */
(function(){
 const svg=$('#techrun');const rows=[{y:'Año 1',f:0.096,u:0.171},{y:'Año 2',f:0.18,u:1.058},{y:'Año 3',f:0.30,u:2.306}];
 const left=60,right=940,top=20,bot=210,max=3,Y=v=>bot-v/max*(bot-top);
 [0,1,2,3].forEach(t=>{el('line',{x1:left,x2:right,y1:Y(t),y2:Y(t),stroke:t?'var(--line)':'var(--muted)'},svg);el('text',{x:left-10,y:Y(t)+4,'text-anchor':'end',class:'lab'},svg,t)});
 const bw=(right-left)/3;
 rows.forEach((r,i)=>{const x=left+i*bw+bw*.3,w=bw*.4;
  const a=el('rect',{x,y:Y(r.f),width:w,height:Y(0)-Y(r.f),rx:3,fill:'var(--s2)',class:'bar',style:`animation-delay:${i*120}ms`},svg);
  const b=el('rect',{x,y:Y(r.f+r.u),width:w,height:Y(r.f)-Y(r.f+r.u)-2,rx:3,fill:'var(--s1)',class:'bar',style:`animation-delay:${i*120+200}ms`},svg);
  el('text',{x:x+w/2,y:Y(r.f+r.u)-8,'text-anchor':'middle',class:'val'},svg,'Bs '+fmt(r.f+r.u,2)+' M');
  el('text',{x:x+w/2,y:bot+22,'text-anchor':'middle',class:'lab'},svg,r.y);
  hover(a,`<b>${r.y}</b><br>Nube fija: Bs ${fmt(r.f,2)} M`);hover(b,`<b>${r.y}</b><br>Servicios por uso: Bs ${fmt(r.u,2)} M`)});
 const lg=el('g',{},svg);el('rect',{x:left,y:bot+36,width:12,height:12,rx:3,fill:'var(--s1)'},lg);el('text',{x:left+18,y:bot+46,class:'lab'},lg,'Servicios por uso');el('rect',{x:left+150,y:bot+36,width:12,height:12,rx:3,fill:'var(--s2)'},lg);el('text',{x:left+168,y:bot+46,class:'lab'},lg,'Nube fija');
})();

/* waterfall */
(function(){
 const svg=$('#water');const S=[['Comisión 7%',70,'up'],['Impago 3%',-15,'dn'],['Costo dinero',-5,'dn'],['Cobro y KYC',-5,'dn'],['Margen',0,'tot']];
 const left=20,right=510,base=230,top=30,max=80,Y=v=>base-v/max*(base-top),bw=(right-left)/S.length;let run=0;
 el('line',{x1:left,x2:right,y1:base,y2:base,stroke:'var(--muted)'},svg);
 S.forEach(([k,v,t],i)=>{let y0,y1,fill,l;if(t==='up'){y0=0;y1=v;run=v;fill='var(--good)';l='+'+v}else if(t==='dn'){y0=run+v;y1=run;run+=v;fill='var(--bad)';l='−'+(-v)}else{y0=0;y1=run;fill='var(--mark)';l='Bs '+run}
  const x=left+i*bw+bw*.2,w=bw*.6;const r=el('rect',{x,y:Y(y1),width:w,height:Math.max(2,Y(y0)-Y(y1)),rx:4,fill,'fill-opacity':t==='tot'?1:.78,class:'bar'+(t==='dn'?' neg':''),style:`animation-delay:${i*140}ms`},svg);
  el('text',{x:x+w/2,y:Y(y1)-8,'text-anchor':'middle',class:'val',style:t==='tot'?'font-size:14px;font-weight:600':''},svg,l);
  el('text',{x:x+w/2,y:base+20,'text-anchor':'middle',class:'lab','font-size':11.5},svg,k);
  if(i<S.length-1)el('line',{x1:x+w,x2:left+(i+1)*bw+bw*.2,y1:Y(run),y2:Y(run),stroke:'var(--muted)','stroke-dasharray':'3 3'},svg);hover(r,`<b>${k}</b><br>${l} Bs`)});
})();

/* annual */
(function(){
 const svg=$('#annual');const R=[['Año 1',-2.53],['Año 2',-0.69],['Año 3',8.93]];const left=44,right=500,top=24,bot=200,lo=-4,hi=11,Y=v=>top+(hi-v)/(hi-lo)*(bot-top),bw=(right-left)/3;
 [-4,0,4,8].forEach(t=>{el('line',{x1:left,x2:right,y1:Y(t),y2:Y(t),stroke:t?'var(--line)':'var(--muted)'},svg);el('text',{x:left-8,y:Y(t)+4,'text-anchor':'end',class:'lab'},svg,t)});
 R.forEach(([k,v],i)=>{const x=left+i*bw+bw*.28,w=bw*.44,p=v>=0;const b=el('rect',{x,y:p?Y(v):Y(0),width:w,height:Math.max(2,Math.abs(Y(v)-Y(0))),rx:4,fill:p?'var(--s1)':'var(--mark)',class:'bar'+(p?'':' neg'),style:`animation-delay:${i*140}ms`},svg);
  el('text',{x:x+w/2,y:p?Y(v)-8:Y(v)+16,'text-anchor':'middle',class:'val'},svg,(v>0?'+':'')+fmt(v,2));el('text',{x:x+w/2,y:bot+30,'text-anchor':'middle',class:'lab'},svg,k);hover(b,`<b>${k}</b><br>Bs ${fmt(v,2)} M`)});
})();

/* cash line with crosshair */
(function(){
 const caja=[-0.28,-0.37,-0.46,-0.55,-0.79,-1.21,-1.65,-2.39,-3.02,-3.67,-4.34,-5.03,-5.73,-6.48,-7.01,-7.51,-7.98,-8.41,-8.80,-9.16,-9.47,-9.74,-9.96,-10.13,-10.25,-10.88,-10.83,-10.71,-10.52,-10.26,-9.93,-9.52,-9.04,-8.47,-7.83,-7.11];
 const res=[-0.28,-0.09,-0.09,-0.09,-0.18,-0.18,-0.17,-0.42,-0.28,-0.27,-0.25,-0.23,-0.21,-0.36,-0.24,-0.20,-0.15,-0.10,-0.05,0.01,0.06,0.12,0.18,0.25,0.31,0.29,0.47,0.55,0.62,0.70,0.79,0.87,0.95,1.04,1.13,1.21];
 const svg=$('#cash');const left=56,right=940,top=24,bot=280,X=m=>left+(m-1)/35*(right-left),Y=v=>top+(-v)/12*(bot-top);
 const defs=el('defs',{},svg);const gr=el('linearGradient',{id:'cg',x1:0,x2:0,y1:0,y2:1},defs);el('stop',{offset:'0','stop-color':'var(--accent)','stop-opacity':.02},gr);el('stop',{offset:'1','stop-color':'var(--accent)','stop-opacity':.22},gr);
 [0,-3,-6,-9,-12].forEach(t=>{el('line',{x1:left,x2:right,y1:Y(t),y2:Y(t),stroke:t?'var(--line)':'var(--muted)'},svg);el('text',{x:left-10,y:Y(t)+4,'text-anchor':'end',class:'lab'},svg,t)});
 [1,6,12,18,24,30,36].forEach(m=>el('text',{x:X(m),y:bot+24,'text-anchor':'middle',class:'lab'},svg,'Mes '+m));
 [['Año 1',6.5],['Año 2',18.5],['Año 3',30.5]].forEach(([t,m])=>el('text',{x:X(m),y:top+16,'text-anchor':'middle',class:'lab',style:'fill:var(--muted)'},svg,t));
 [12.5,24.5].forEach(m=>el('line',{x1:X(m),x2:X(m),y1:top,y2:bot,stroke:'var(--line)'},svg));
 const be=res.findIndex(v=>v>0)+1;el('line',{x1:X(be),x2:X(be),y1:top+24,y2:bot,stroke:'var(--sun)','stroke-dasharray':'4 4','stroke-width':1.5},svg);
 el('text',{x:X(be)-8,y:bot-12,'text-anchor':'end',class:'lab',style:'fill:var(--ink)'},svg,'Mes '+be+': la operación ya gana dinero');
 const d=caja.map((v,i)=>(i?'L':'M')+X(i+1)+' '+Y(v)).join('');
 el('path',{d:`M${X(1)} ${Y(0)}`+d.replace('M','L')+`L${X(36)} ${Y(0)}Z`,fill:'url(#cg)'},svg);
 const line=el('path',{d,fill:'none',stroke:'var(--accent)','stroke-width':2.5,'stroke-linejoin':'round',class:'drawline'},svg);line.style.setProperty('--len',line.getTotalLength());
 let lo=0;caja.forEach((v,i)=>{if(v<caja[lo])lo=i});
 el('circle',{cx:X(lo+1),cy:Y(caja[lo]),r:6,fill:'var(--accent)',stroke:'var(--surface)','stroke-width':2},svg);
 el('text',{x:X(lo+1)+12,y:Y(caja[lo])+22,class:'val',style:'font-weight:600;font-size:13px'},svg,'Bs '+fmt(-caja[lo],1)+' M en el mes '+(lo+1));
 const cross=el('line',{y1:top,y2:bot,stroke:'var(--ink-2)',opacity:0},svg),dot=el('circle',{r:5,fill:'var(--surface)',stroke:'var(--accent)','stroke-width':2,opacity:0},svg);
 const hit=el('rect',{x:left,y:top,width:right-left,height:bot-top,fill:'transparent'},svg);
 hit.addEventListener('pointermove',e=>{const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const p=pt.matrixTransform(svg.getScreenCTM().inverse());const m=Math.max(1,Math.min(36,Math.round((p.x-left)/(right-left)*35)+1));
  cross.setAttribute('x1',X(m));cross.setAttribute('x2',X(m));cross.setAttribute('opacity',.5);dot.setAttribute('cx',X(m));dot.setAttribute('cy',Y(caja[m-1]));dot.setAttribute('opacity',1);
  showTip(`<b>Mes ${m}</b><br>Caja acumulada: Bs ${fmt(caja[m-1],2)} M<br>Resultado del mes: Bs ${fmt(res[m-1],2)} M`,e.clientX,e.clientY)});
 hit.addEventListener('pointerleave',()=>{cross.setAttribute('opacity',0);dot.setAttribute('opacity',0);hideTip()});
})();

/* replay animations when scrolled into view; everything is fully drawn at rest */
if(!reduce&&'IntersectionObserver' in window){
 const io=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;const t=en.target;
  if(t.tagName==='svg'){t.classList.remove('play');void t.getBoundingClientRect();t.classList.add('play')}else t.classList.add('in');io.unobserve(t)}),{threshold:.2});
 document.querySelectorAll('svg.chart,#gantt,.rv').forEach(n=>io.observe(n));
}
})();
