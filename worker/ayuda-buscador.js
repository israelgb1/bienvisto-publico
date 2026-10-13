// Buscador del manual: índice (servidor) + búsqueda local con sinónimos (navegador). No usa IA externa.
const limpia = (s) => String(s || "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

// Índice plano del contenido: una entrada por pregunta, término, paso, aviso, bloque de texto o fila de tabla.
export function indiceManual(secciones) {
  const out = [];
  let nFaq = 0;
  for (const s of secciones) {
    let h3 = "";
    const base = s.titulo;
    if (s.intro && s.id !== "glosario") out.push({ t: base, x: limpia(s.intro), a: s.id });
    for (const b of s.bloques) {
      switch (b.t) {
        case "h3": h3 = b.x; break;
        case "p": out.push({ t: h3 || base, x: limpia(b.x), a: s.id }); break;
        case "ul": case "ol": case "check": out.push({ t: h3 || base, x: b.items.map((i) => "• " + limpia(i)).join("\n"), a: s.id }); break;
        case "aviso": out.push({ t: limpia(b.titulo), x: limpia(b.x), a: s.id }); break;
        case "flujo": out.push({ t: limpia(b.titulo), x: b.pasos.map((p, i) => `${i + 1}. ${limpia(p)}`).join("\n"), a: s.id }); break;
        case "faq": for (const [q, a] of b.items) out.push({ t: limpia(q), x: limpia(a), a: "faq-" + nFaq++, k: "faq" }); break;
        case "glosario": for (const [k, d] of b.items) out.push({ t: k, x: limpia(d), a: "glosario", k: "gl" }); break;
        case "tabla": for (const r of b.rows) out.push({ t: limpia(r[0]), x: r.slice(1).map((c, i) => `${limpia(b.cols[i + 1])}: ${limpia(c)}`).join("\n"), a: s.id }); break;
        case "pasos": b.items.forEach((p, i) => out.push({ t: `Paso ${i + 1}: ${limpia(p.titulo)}`, x: [p.x, p.nota, p.dile ? "Dile al cliente: " + p.dile : ""].filter(Boolean).map(limpia).join("\n"), a: "paso-" + (i + 1) })); break;
        default: break;
      }
    }
  }
  return out.filter((e) => e.x);
}

export const BUSCADOR_CSS = `
.mv-bus{flex:1 1 320px;min-width:0;max-width:560px}
.mv-bus form{display:flex;gap:8px}
.mv-bus input{flex:1;min-width:0;min-height:48px;border-radius:999px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.07);color:#fff;font:inherit;font-size:16px;padding:0 18px}
.mv-bus input::placeholder{color:#9db9af}
.mv-bus input:focus-visible{outline:2px solid var(--mint);outline-offset:2px}
.mv-bus form button{min-height:48px;padding:0 20px;border-radius:999px;border:0;background:var(--mint);color:#03130F;font:700 16px var(--fb);cursor:pointer}
.mv-sug{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.mv-sug button{border:1px solid var(--mv-line);background:transparent;color:#cfe3dc;border-radius:999px;padding:6px 12px;font:inherit;font-size:14px;cursor:pointer}
.mv-sug button:hover{border-color:var(--mint);color:#fff}
.mv-res{margin-top:14px;display:grid;gap:10px}.mv-res:empty{display:none}
.mv-r{border:1px solid var(--mv-line);border-radius:16px;padding:14px 16px;background:rgba(255,255,255,.05)}
.mv-r.top{border-color:rgba(63,194,165,.6);background:rgba(63,194,165,.1)}
.mv-r h3{font:700 17px/1.25 var(--fd);color:#fff;margin:0 0 6px}
.mv-r p{margin:0;white-space:pre-line;color:#dcebe6;font-size:16px;max-width:none}
.mv-r a{display:inline-block;margin-top:8px;color:var(--mint2);font-weight:600;font-size:15px}
.mv-r.no p a{display:inline;margin:0}
.mv-mas{font-size:14px;color:var(--mut);margin:2px 0 -2px}
.mv-hl{animation:mvhl 2s ease-out 1}@keyframes mvhl{from{box-shadow:0 0 0 3px var(--mint)}to{box-shadow:0 0 0 3px transparent}}
@media(prefers-reduced-motion:reduce){.mv-hl{animation:none}}
@media(max-width:600px){.mv-bus{flex-basis:100%;max-width:none}}
`;

export function buscadorHtml(wa) {
  const sug = ["¿Cuánto me queda de comisión?", "¿Qué hago si se descompone un display?", "¿Cómo entrego el dinero?"];
  return `<div class="mv-bus"><form role="search" id="mv-bf" autocomplete="off"><input type="search" id="mv-bq" aria-label="Pregunta al manual" placeholder="Pregunta lo que necesites" enterkeyhint="search"><button type="submit">Buscar</button></form><div class="mv-sug">${sug.map((q) => `<button type="button" data-q="${q.replace(/"/g, "&quot;")}">${q}</button>`).join("")}</div><div class="mv-res" id="mv-bres" aria-live="polite" data-wa="${wa}"></div></div>`;
}

// JS del navegador. String.raw: las barras invertidas llegan tal cual.
export const BUSCADOR_JS = String.raw`(function(){
var IDX=__IDX__;
var q=document.getElementById("mv-bq"),f=document.getElementById("mv-bf"),R=document.getElementById("mv-bres");
if(!q||!f||!R)return;
var STOP="el la los las un una unos unas de del al en y o u que como cual cuales cuanto cuanta cuantos es son ser esta este esto estos estas mi mis tu tus te me se si por para con sin sobre lo le les ya hay puedo puede pueden hago hacer debo tengo tiene tienen quiero hace cuando donde quien muy mas pero ni mucho algo todo toda cada hacerlo quiere dice dicen cosa cosas necesito saber sirve".split(" ");
var SIN=[
 ["dinero plata lana billete billetes","dinero saldo"],
 ["pagar pago cobrar cobro cobre cobrado","cobrar pago efectivo transferencia"],
 ["ganar ganancia gano gana ganas sueldo comision comisiones queda","comision comision retienes ganas"],
 ["entregar entrego depositar deposito liquidar entrega pasar pasarle","entregar entregar saldo corte"],
 ["deber debo deuda adeudo multa pena castigo","adeudo pena plazo"],
 ["roto rota danado danada descompone descompuesto falla falla malo defectuoso","garantia reposicion descompone"],
 ["perdi perder perdido robo robaron robado extravio","perdida danan costo"],
 ["precio costo cuesta vale cuanto","precio"],
 ["descuento rebaja regalar regalo gratis","descuento precio"],
 ["factura rfc cfdi fiscal","factura"],
 ["nfc qr escanear escaneo celular telefono","nfc qr escanear"],
 ["cancelar anular devolver devolucion reembolso arrepiente","anular anulacion"],
 ["mudar mudo local sucursal cambiar cambio","cambio negocio"],
 ["baja desuscribir cancelar mensajes whatsapp resumen resumenes","resumenes baja"],
 ["tope limite maximo","tope"],
 ["nivel confianza permisos permiso","nivel confianza"],
 ["probar prueba demo demostracion","prueba"],
 ["varios muchos mayoreo promocion paquete combo","varios promocion"],
 ["ayuda soporte contacto llamar","soporte"],
 ["google opinion opiniones review reviews estrellas calificacion","resenas google"],
 ["empezar comenzar iniciar primer","empezar"],
 ["entrar sesion cuenta acceso contrasena","cuenta"]
];
function norm(s){return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")}
function stem(w){if(w.length<4)return w;var m=w.replace(/(es|s)$/,"");if(m.length>=4)w=m;m=w.replace(/(ando|iendo|ado|ido|aron|ar|er|ir|ion|a|o|e)$/,"");if(m.length>=3)w=m;return w.slice(0,5)}
function toks(s){return norm(s).split(/[^a-z0-9ñ]+/).filter(function(w){return w&&STOP.indexOf(w)<0&&(w.length>2||/^\d+$/.test(w))}).map(stem)}
var SY=SIN.map(function(g){return{k:g[0].split(" ").map(stem),v:toks(g[1])}});
var D=IDX.map(function(e,i){var tt=toks(e.t),bt=toks(e.x),tf={};bt.concat(tt).forEach(function(w){tf[w]=(tf[w]||0)+1});return{i:i,e:e,tt:tt,tf:tf,len:bt.length+tt.length}});
var df={},avg=0;D.forEach(function(d){avg+=d.len;for(var w in d.tf)df[w]=(df[w]||0)+1});avg/=D.length||1;
var P4={};Object.keys(df).forEach(function(w){if(w.length>=4){var k=w.slice(0,4);(P4[k]=P4[k]||[]).push(w)}});
function ed1(a,b){if(Math.abs(a.length-b.length)>1)return false;var i=0,j=0,e=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue}if(++e>1)return false;if(a.length>b.length)i++;else if(a.length<b.length)j++;else{i++;j++}}return e+(a.length-i)+(b.length-j)<=1}
function idf(w){var n=df[w]||0;return Math.log(1+(D.length-n+.5)/(n+.5))}
function buscar(txt){
 var qs=toks(txt);if(!qs.length)return[];
 var W={};qs.forEach(function(w){W[w]=1});
 SY.forEach(function(g){if(qs.some(function(w){return g.k.indexOf(w)>=0})){g.v.forEach(function(w){if(!W[w])W[w]=.45})}});
 qs.forEach(function(w){if(w.length>=4){(P4[w.slice(0,4)]||[]).forEach(function(v){if(!W[v])W[v]=.3})}if(!df[w]&&w.length>=5){Object.keys(df).forEach(function(v){if(!W[v]&&ed1(w,v))W[v]=.6})}});
 var res=[];
 D.forEach(function(d){var s=0,hit=0;
  for(var w in W){var t=d.tf[w];if(!t)continue;var inT=d.tt.indexOf(w)>=0;
   var bm=t*2.2/(t+1.2*(.4+.6*d.len/avg));s+=W[w]*idf(w)*(bm+(inT?1.6:0));if(W[w]===1)hit++}
  if(s>0){if(d.e.k==="faq")s*=1.4;else if(d.e.k==="gl")s*=.85;res.push({d:d,s:s,c:hit/qs.length})}});
 res.sort(function(a,b){return b.s-a.s});
 if(!res.length||res[0].c<.25)return[];
 return res.slice(0,12);
}
function corta(x,n){if(x.length<=n)return x;var c=x.slice(0,n),p=Math.max(c.lastIndexOf(". "),c.lastIndexOf("\n"));return(p>n*.5?c.slice(0,p+1):c.replace(/\s+\S*$/,"")+"…")}
function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n}
function ver(a,id){var l=el("a",null,"Ver en el manual");l.href="#"+id;l.addEventListener("click",function(ev){ev.preventDefault();irA(id)});return l}
function irA(id){var t=document.getElementById(id);if(!t)return;if(t.tagName==="DETAILS")t.open=true;t.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"center"});t.classList.remove("mv-hl");void t.offsetWidth;t.classList.add("mv-hl");try{history.replaceState(null,"","#"+id)}catch(e){}}
function pinta(txt){
 R.textContent="";txt=txt.trim();if(txt.length<3)return;
 var r=buscar(txt);
 if(!r.length){var n=el("div","mv-r no");n.appendChild(el("h3",null,"No encontré esto en el manual"));var p=el("p");p.appendChild(document.createTextNode("Prueba con otras palabras (por ejemplo: cobrar, saldo, display, factura). Si no resuelve tu duda, "));var a=el("a",null,"escribe a soporte por WhatsApp");a.href="https://wa.me/522201435851?text="+encodeURIComponent("Hola, soy vendedor de Bien Visto. Mi duda: "+txt);a.target="_blank";a.rel="noopener";p.appendChild(a);p.appendChild(document.createTextNode("."));n.appendChild(p);R.appendChild(n);return}
 var t=r[0].d.e,top=el("div","mv-r top");top.appendChild(el("h3",null,t.t));top.appendChild(el("p",null,corta(t.x,700)));top.appendChild(ver(t,t.a));R.appendChild(top);
 var vistos={};vistos[t.a+"|"+t.t]=1;var otros=[];
 for(var i=1;i<r.length&&otros.length<2;i++){var e=r[i].d.e,k=e.a+"|"+e.t;if(vistos[k]||r[i].s<r[0].s*.35)continue;vistos[k]=1;otros.push(e)}
 if(otros.length){R.appendChild(el("p","mv-mas","También te puede servir:"));otros.forEach(function(e){var c=el("div","mv-r");c.appendChild(el("h3",null,e.t));c.appendChild(el("p",null,corta(e.x,160)));c.appendChild(ver(e,e.a));R.appendChild(c)})}
 var s=el("p","mv-mas");s.appendChild(document.createTextNode("¿Sigue la duda? "));var w=el("a",null,"Escribe a soporte");w.href="https://wa.me/522201435851?text="+encodeURIComponent("Hola, soy vendedor de Bien Visto. Mi duda: "+txt);w.target="_blank";w.rel="noopener";w.style.cssText="color:var(--mint2);font-weight:600";s.appendChild(w);R.appendChild(s)
}
var tm;
f.addEventListener("submit",function(ev){ev.preventDefault();pinta(q.value)});
q.addEventListener("input",function(){clearTimeout(tm);tm=setTimeout(function(){pinta(q.value)},300)});
q.addEventListener("keydown",function(ev){if(ev.key==="Escape"){q.value="";R.textContent=""}});
document.querySelectorAll(".mv-sug button").forEach(function(b){b.addEventListener("click",function(){q.value=b.dataset.q;pinta(q.value);q.focus()})});
})();`;
