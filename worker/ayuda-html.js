// Pinta el manual del vendedor como HTML para /ayuda/manual. Usa el contenido de ayuda-contenido.js.
import { FRASE_CASILLA } from "./ayuda-contenido.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");

// Términos del glosario que se despliegan como nota dentro del texto (primera aparición por sección).
const ALIAS = { "Display": "displays?", "Folio": "folios?", "Ficha": "fichas?", "Prueba": "prueba", "Activación": "activaci[oó]n|activaciones", "Comisión": "comisi[oó]n|comisiones", "Saldo por entregar": "saldo por entregar", "Tope": "topes?", "Corte": "cortes?", "Referencia de la venta": "referencia de la venta", "Adeudo": "adeudos?", "Nivel Nuevo / De confianza": "nivel (?:nuevo|de confianza)", "Resúmenes": "res[uú]menes" };
let GL = null;
let usados = null;
function glInit(secciones) {
  const g = secciones.find((x) => x.id === "glosario");
  const items = g ? g.bloques.flatMap((b) => b.items || []) : [];
  GL = items.filter(([k]) => ALIAS[k]).map(([k, d]) => ({ k, d, re: new RegExp("(?<![\\p{L}\\d])(" + ALIAS[k] + ")(?![\\p{L}\\d])", "iu") }));
}
const mdg = (s) => {
  const h = md(s);
  if (!GL || !usados) return h;
  return h.split(/(<[^>]+>)/).map((part) => {
    if (part.startsWith("<")) return part;
    for (const g of GL) {
      if (usados.has(g.k)) continue;
      const m = g.re.exec(part);
      if (!m) continue;
      usados.add(g.k);
      const i = m.index, w = m[0];
      return part.slice(0, i) + `<span class="mv-nw"><button type="button" class="mv-n" aria-expanded="false">${w}</button><span class="mv-nt" role="note" hidden><b>${esc(g.k)}.</b> ${esc(g.d)}</span></span>` + part.slice(i + w.length);
    }
    return part;
  }).join("");
};

const CSS = `
.mv{--mv-card:rgba(255,255,255,.05);--mv-line:rgba(255,255,255,.12)}
.mv-hero{padding:56px 0 28px}
.mv-hero h1{font-size:clamp(36px,6vw,64px);max-width:16ch}
.mv-hero .lede{margin-top:14px}
.mv-acc{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.mv-acc .btn{min-height:48px}
.mv-vig{display:inline-flex;align-items:center;gap:8px;margin-top:18px;font-size:15px;color:var(--mut)}
.mv-vig::before{content:"";width:9px;height:9px;border-radius:50%;background:var(--mint)}
.mv-warn{margin-top:16px;padding:12px 16px;border-radius:14px;background:rgba(242,167,27,.14);border:1px solid rgba(242,167,27,.45);color:#FFE2A8;max-width:62ch;font-size:16px}
.mv-toc{position:sticky;top:72px;z-index:30;background:rgba(3,19,15,.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--mv-line);margin-bottom:8px}
.mv-toc ul{list-style:none;margin:0;padding:10px 22px;display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;max-width:1200px;margin-inline:auto}
.mv-toc ul::-webkit-scrollbar{display:none}
.mv-toc a{display:block;white-space:nowrap;padding:9px 14px;border-radius:999px;border:1px solid var(--mv-line);font-size:15px;font-weight:600;color:#CFE3DC;text-decoration:none}
.mv-toc a:hover,.mv-toc a[aria-current=true]{background:var(--mint);color:#03130F;border-color:var(--mint)}
.mv-sec{padding:48px 0 8px;scroll-margin-top:150px}
.mv-sec>h2{font-size:clamp(28px,4vw,42px)}
.mv-sec>.intro{color:var(--mut);margin-top:10px;max-width:62ch;font-size:19px}
.mv-b{display:grid;gap:18px;margin-top:22px}
.mv-b p,.mv-b li{max-width:70ch}
.mv-b ul,.mv-b ol{margin:0;padding-left:1.3em;display:grid;gap:8px}
.mv-b h3{margin-top:10px}
.mv-tw{overflow-x:auto;border:1px solid var(--mv-line);border-radius:16px;background:var(--mv-card)}
.mv table{border-collapse:collapse;width:100%;font-size:16px;min-width:480px}
.mv th{text-align:left;font:600 14px/1.2 var(--fb);letter-spacing:.04em;color:var(--mint2);padding:12px 14px;background:rgba(63,194,165,.1)}
.mv td{padding:12px 14px;border-top:1px solid var(--mv-line);vertical-align:top}
.mv td:first-child{font-weight:600}
.mv-nota{font-size:15px;color:var(--mut);margin-top:-6px}
.mv-av{border-radius:18px;padding:16px 18px;border:1px solid var(--mv-line);background:var(--mv-card);border-left-width:6px}
.mv-av b.t{display:block;font:700 18px/1.2 var(--fd);margin-bottom:6px;color:#fff}
.mv-av.ok{border-left-color:var(--mint)}.mv-av.alto{border-left-color:#FF8A6B;background:rgba(255,138,107,.08)}.mv-av.dato{border-left-color:var(--amb)}
.mv-av p{max-width:none}
.mv-flujo{border:1px solid var(--mv-line);border-radius:18px;padding:16px 18px;background:var(--mv-card)}
.mv-flujo b.t{display:block;font:700 18px/1.2 var(--fd);margin-bottom:12px;color:#fff}
.mv-flujo ol{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:8px 6px;align-items:center;counter-reset:f}
.mv-flujo li{counter-increment:f;display:flex;align-items:center;gap:6px}
.mv-flujo li span{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:rgba(63,194,165,.14);font-weight:600;font-size:15px}
.mv-flujo li span::before{content:counter(f);display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--mint);color:#03130F;font-size:13px;font-weight:700}
.mv-flujo li:not(:last-child)::after{content:"›";color:var(--mut);font-size:20px}
.mv-pasos{list-style:none;padding:0!important;margin:0;display:grid;gap:28px}
.mv-b .mv-paso{max-width:none}
.mv-paso{display:grid;gap:18px;grid-template-columns:minmax(0,1fr);border:1px solid var(--mv-line);border-radius:22px;padding:20px;background:var(--mv-card)}
.mv-paso h3{display:flex;gap:12px;align-items:center;margin:0}
.mv-paso h3 i{flex:none;display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:var(--amb);color:#03130F;font:700 18px/1 var(--fd);font-style:normal}
.mv-paso .tx{display:grid;gap:12px;align-content:start}
.mv-paso .nota{font-size:16px;color:var(--mut);border-left:3px solid var(--mv-line);padding-left:12px}
.mv-dile{background:rgba(63,194,165,.1);border-radius:14px;padding:12px 14px;font-size:16px}
.mv-dile b{display:block;font-size:13px;letter-spacing:.06em;color:var(--mint2);margin-bottom:2px}
.mv-phone{margin:0;justify-self:center;width:230px;border-radius:30px;padding:9px;background:#0b1f1a;border:2px solid #29423b;box-shadow:0 18px 40px rgba(0,0,0,.35)}
.mv-scr{overflow:hidden;background:#FBF6EC;color:#12302B;border-radius:22px;padding:16px 14px 16px;min-height:300px;display:grid;gap:9px;align-content:start;font:500 12.5px/1.35 var(--fb)}
.mv-scr>*{min-width:0;box-sizing:border-box}.mv-scr b{color:#12302B}
.mv-scr .mt{font:800 17px/1.1 var(--fd);color:#0E6B5C}
.mv-scr .ms{font-size:11.5px;color:#4d6a62}
.mv-scr .mi{border:1.5px solid #cdd9d4;background:#fff;border-radius:10px;padding:8px 10px;font-size:12.5px}
.mv-scr .mi small{display:block;color:#6a8179;font-size:10.5px}
.mv-scr .mb{border-radius:999px;padding:9px 10px;text-align:center;font-weight:700;background:#0E6B5C;color:#fff;font-size:12.5px}
.mv-scr .mb.a{background:#F2A71B;color:#12302B}.mv-scr .mb.s{background:transparent;border:1.5px solid #0E6B5C;color:#0E6B5C}
.mv-scr .mrw{border:1.5px solid #cdd9d4;background:#fff;border-radius:10px;padding:8px 10px}
.mv-scr .mrw.on{border-color:#0E6B5C;background:#E7F0EC}
.mv-scr .mrw small{display:block;color:#6a8179;font-size:10.5px}
.mv-scr .mchip{justify-self:start;background:#FCE3AE;color:#7a5200;border-radius:999px;padding:3px 9px;font-size:10.5px;font-weight:700}
.mv-scr .mbar{height:8px;border-radius:99px;background:#dde7e2;overflow:hidden}.mv-scr .mbar i{display:block;height:100%;background:#0E6B5C}
.mv-scr .mcols{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.mv-scr .mcols div{background:#fff;border:1.5px solid #cdd9d4;border-radius:10px;padding:8px;text-align:center}
.mv-scr .mcols b{display:block;font:800 17px/1.1 var(--fd);color:#0E6B5C}
.mv-scr .mck{display:flex;gap:8px;align-items:flex-start;font-size:11px}
.mv-scr .mck i{flex:none;width:15px;height:15px;border-radius:4px;border:1.5px solid #0E6B5C;background:#0E6B5C;position:relative}
.mv-scr .mck i.off{background:#fff}
.mv-scr .ok{justify-self:center;width:42px;height:42px;border-radius:50%;background:#0E6B5C;color:#fff;display:grid;place-items:center;font-size:22px}
details.mv-q{border:1px solid var(--mv-line);border-radius:16px;background:var(--mv-card)}
details.mv-q summary{cursor:pointer;list-style:none;padding:14px 18px;font-weight:600;display:flex;justify-content:space-between;gap:14px}
details.mv-q summary::-webkit-details-marker{display:none}
details.mv-q summary::after{content:"+";font-size:22px;line-height:1;color:var(--mint2)}
details.mv-q[open] summary::after{content:"–"}
details.mv-q p{padding:0 18px 16px;color:#cfe3dc}
.mv-chk{list-style:none;padding:0!important;display:grid;gap:10px}
.mv-chk label{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border:1px solid var(--mv-line);border-radius:14px;background:var(--mv-card);cursor:pointer}
.mv-chk input{flex:none;width:22px;height:22px;margin-top:2px;accent-color:var(--mint)}
.mv-n{all:unset;cursor:pointer;color:var(--mint2);border-bottom:1.5px dotted var(--mint2);font:inherit}.mv-n:hover,.mv-n[aria-expanded=true]{color:#fff;border-bottom-style:solid}.mv-n:focus-visible{outline:2px solid var(--mint);outline-offset:2px}
.mv-nw{position:relative}.mv-nt{position:absolute;left:0;top:calc(100% + 6px);z-index:20;width:min(320px,calc(100vw - 32px));padding:10px 14px;border-left:3px solid var(--mint);background:#0d2a24;box-shadow:0 8px 24px rgba(0,0,0,.45);border-radius:0 12px 12px 0;font-size:15px;line-height:1.45;color:#cfe3dc;font-weight:400;text-align:left}.mv-nt[hidden]{display:none}.mv-nt b{font:700 15px/1.45 var(--fb);color:#fff;display:inline}
.mv-gl{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.mv-gl div{border:1px solid var(--mv-line);border-radius:16px;padding:14px 16px;background:var(--mv-card)}
.mv-gl dt{font:700 18px/1.2 var(--fd);color:#fff}.mv-gl dd{margin:4px 0 0;color:#cfe3dc;font-size:16px}
.mv-calc{border:1px solid var(--mint);border-radius:22px;padding:20px;background:rgba(63,194,165,.08);display:grid;gap:14px}
.mv-calc b.t{font:700 22px/1.2 var(--fd);color:#fff}
.mv-calc .ctl{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.mv-calc button{width:48px;height:48px;border-radius:50%;border:2px solid var(--mint);background:transparent;color:var(--mint2);font-size:26px;line-height:1;cursor:pointer}
.mv-calc output.n{font:800 40px/1 var(--fd);min-width:2ch;text-align:center;color:#fff}
.mv-calc .res{display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
.mv-calc .res div{background:rgba(0,0,0,.2);border-radius:14px;padding:12px 14px}
.mv-calc .res small{display:block;color:var(--mut);font-size:14px}.mv-calc .res strong{font:800 26px/1.1 var(--fd);color:#fff}
.mv-calc .res .g strong{color:var(--amb2)}
.mv-fin{padding:56px 0 8px}
.mv-fin .btn{margin-top:6px}
@media(max-width:600px){.mv-tw{overflow-x:visible}.mv table{min-width:0;font-size:14px}.mv th{font-size:12.5px;padding:10px 8px}.mv td{padding:10px 8px;overflow-wrap:anywhere}}
@media(min-width:900px){.mv-paso{grid-template-columns:minmax(0,1fr) 260px;align-items:center;padding:26px 28px}.mv-pasos li:nth-child(even) .mv-phone{order:-1}.mv-pasos li:nth-child(even).mv-paso{grid-template-columns:260px minmax(0,1fr)}}
@media print{
 :root{color-scheme:light}body{background:#fff!important;color:#111!important;font-size:12pt}
 .hdr,.ftr,.fab,.mv-toc,.mv-acc,.mv-calc,.mv-phone{display:none!important}
 h1,h2,h3,.mv-av b.t,.mv-flujo b.t,.mv-gl dt{color:#111!important}
 .mv-av,.mv-paso,.mv-flujo,details.mv-q,.mv-gl div,.mv-chk label{background:#fff!important;border-color:#bbb!important}
 .mv td,.mv th{border-color:#bbb!important;color:#111!important;background:#fff!important}
 .mv-paso{display:block}.mv-sec{break-inside:avoid-page}.mv-vig,.mv-nota,.mv-sec>.intro,.mv-paso .nota,details.mv-q p,.mv-gl dd{color:#333!important}
}
`;

const mck = (txt, on = true) => `<div class="mck"><i class="${on ? "" : "off"}"></i><span>${esc(txt)}</span></div>`;

function mock(clave, v, t) {
  const min = Math.max(1, v.prueba_minutos - 2);
  const pct = Math.round((min / v.prueba_minutos) * 100);
  const pantallas = {
    folio: ["Pantalla Vender un display, con el botón para escanear el QR y el campo del folio",
      `<div class="mt">Vender un display</div><div class="ms">Acerca tu celular al display para empezar.</div><div class="mb">Escanear el QR del display</div><div class="ms" style="margin-top:6px">¿Prefieres escribir el folio?</div><div class="mi">X4W3<small>Son 4 caracteres y abre solo.</small></div>`],
    negocio: ["Pantalla de búsqueda del negocio en Google Maps",
      `<div class="mt">¿Cuál es su negocio?</div><div class="ms">Escribe el nombre como aparece en Google Maps.</div><div class="mi">Tacos La Esquina</div><div class="mrw on">Tacos La Esquina<small>Av. Patria 1234, Zapopan</small></div><div class="mrw">Tacos La Esquina Centro<small>Calle Hidalgo 45, Guadalajara</small></div><div class="mb s">¿Ya es cliente? Búscalo</div>`],
    confirmar: ["Pantalla para confirmar el negocio con nombre y dirección",
      `<div class="mt">¿Es este?</div><div class="ms">Confirma con el cliente: nombre y dirección.</div><div class="mrw on"><b>Tacos La Esquina</b><small>Av. Patria 1234, Zapopan</small></div><div class="mb a">Probar el display ahora</div><div class="mb s">No es este: buscar otro</div>`],
    prueba: ["Pantalla del modo prueba con el tiempo restante",
      `<span class="mchip">Modo prueba</span><div class="mt">Tacos La Esquina</div><div class="mrw"><small>Tiempo de prueba</small><b style="font:800 20px/1.2 var(--fd)">Quedan ${min} min</b><div class="mbar"><i style="width:${pct}%"></i></div></div><div class="mb a">Seguir con la venta</div><div class="mb s">Terminar la prueba</div>`],
    datos: ["Pantalla de datos del cliente con la casilla de resúmenes",
      `<div class="mt">Datos del cliente</div><div class="mi">Rosa Ruiz<small>Nombre</small></div><div class="mi">33 1234 5678<small>WhatsApp, 10 dígitos</small></div><div class="mi">rosa@correo.com<small>Correo (opcional)</small></div>${mck("Acepta recibir un resumen por WhatsApp cada 15 días durante tres meses", true)}<div class="mb a">Siguiente: cobrar ${esc(t.precio)}</div>`],
    cobro: ["Pantalla de cobro con precio, comisión y forma de pago",
      `<div class="mt">Cobra antes de activar</div><div class="mrw"><b style="font:800 22px/1 var(--fd)">${esc(t.precio)}</b> <small style="display:inline">IVA incluido</small></div><div class="mcols"><div><b>${esc(t.comision)}</b>Tu comisión</div><div><b>${esc(t.entrega)}</b>Entregas</div></div><div class="mcols"><div class="mrw on" style="padding:6px">Efectivo</div><div style="padding:6px">Transferencia</div></div>${mck("Confirmo que cobré y me comprometo a entregar a Bien Visto", true)}<div class="mb a">Activar display X4W3</div>`],
    listo: ["Pantalla final con el display activo, factura y recibo",
      `<div class="ok">✓</div><div class="mt" style="text-align:center">Display X4W3 activo</div><div class="mrw"><b>Recibo de compra</b><small>Se le enviará por correo</small></div><div class="mrw"><b>¿El cliente quiere factura?</b><small>Pregúntaselo ahora</small></div><div class="mb s">Abrir enlace de reseña</div><div class="mb">Activar otro display de este cliente</div>`],
  };
  const p = pantallas[clave];
  if (!p) return "";
  return `<figure class="mv-phone" role="img" aria-label="${esc(p[0])}"><div class="mv-scr" aria-hidden="true">${p[1]}</div></figure>`;
}

function tabla(b) {
  const tot = b.w.reduce((a, c) => a + c, 0);
  const cg = b.w.map((w) => `<col style="width:${(w / tot * 100).toFixed(1)}%">`).join("");
  return `<div class="mv-tw"><table><colgroup>${cg}</colgroup><thead><tr>${b.cols.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead><tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${md(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${b.nota ? `<p class="mv-nota">${md(b.nota)}</p>` : ""}`;
}

function calc(v, t) {
  return `<div class="mv-calc" id="mv-calc"><b class="t">Calcula una venta</b><p>¿Cuántos displays vendes al mismo cliente en la misma venta? La promoción se aplica sola.</p><div class="ctl"><button type="button" id="mc-m" aria-label="Quitar un display">−</button><output class="n" id="mc-n" aria-live="polite">1</output><button type="button" id="mc-p" aria-label="Agregar un display">+</button></div><div class="res"><div><small>El cliente paga</small><strong id="mc-pago">${esc(t.precio)}</strong></div><div class="g"><small>Tu comisión</small><strong id="mc-com">${esc(t.comision)}</strong></div><div><small>Entregas a Bien Visto</small><strong id="mc-ent">${esc(t.entrega)}</strong></div></div></div>`;
}

function bloque(b, v, t) {
  switch (b.t) {
    case "p": return `<p>${mdg(b.x)}</p>`;
    case "h3": return `<h3>${esc(b.x)}</h3>`;
    case "ul": return `<ul>${b.items.map((i) => `<li>${mdg(i)}</li>`).join("")}</ul>`;
    case "ol": return `<ol>${b.items.map((i) => `<li>${mdg(i)}</li>`).join("")}</ol>`;
    case "tabla": return tabla(b);
    case "aviso": return `<div class="mv-av ${b.tipo}"><b class="t">${esc(b.titulo)}</b><p>${mdg(b.x)}</p></div>`;
    case "flujo": return `<div class="mv-flujo"><b class="t">${esc(b.titulo)}</b><ol>${b.pasos.map((p) => `<li><span>${esc(p)}</span></li>`).join("")}</ol></div>`;
    case "check": return `<ul class="mv-chk">${b.items.map((i, k) => `<li><label><input type="checkbox" data-k="${k}"><span>${md(i)}</span></label></li>`).join("")}</ul>`;
    case "faq": return b.items.map(([q, a]) => `<details class="mv-q"><summary>${esc(q)}</summary><p>${mdg(a)}</p></details>`).join("");
    case "glosario": return `<dl class="mv-gl">${b.items.map(([k, d]) => `<div><dt>${esc(k)}</dt><dd>${md(d)}</dd></div>`).join("")}</dl>`;
    case "calc": return calc(v, t);
    case "pasos":
      return `<ol class="mv-pasos">${b.items.map((p, i) => `<li class="mv-paso"><div class="tx"><h3><i>${i + 1}</i>${esc(p.titulo)}</h3><p>${mdg(p.x)}</p>${p.nota ? `<p class="nota">${mdg(p.nota)}</p>` : ""}${p.dile ? `<div class="mv-dile"><b>DILE AL CLIENTE</b>${md(p.dile)}</div>` : ""}</div>${mock(p.mock, v, t)}</li>`).join("")}</ol>`;
    default: return "";
  }
}

const SCRIPT = `(function(){
var P=__P__,C=__C__,N=__N__,PP=__PP__;
function mx(n){return "$"+n.toLocaleString("es-MX",{maximumFractionDigits:2})}
var n=1,el=document.getElementById("mc-n");
function pinta(){if(!el)return;el.textContent=n;var pago=Math.floor(n/N)*PP+(n%N)*P,com=n*C;document.getElementById("mc-pago").textContent=mx(pago);document.getElementById("mc-com").textContent=mx(com);document.getElementById("mc-ent").textContent=mx(pago-com)}
var m=document.getElementById("mc-m"),p=document.getElementById("mc-p");
if(m)m.addEventListener("click",function(){if(n>1){n--;pinta()}});
if(p)p.addEventListener("click",function(){if(n<50){n++;pinta()}});
try{var K="bv_manual_check",g=JSON.parse(localStorage.getItem(K)||"{}");document.querySelectorAll(".mv-chk input").forEach(function(c){c.checked=!!g[c.dataset.k];c.addEventListener("change",function(){g[c.dataset.k]=c.checked;try{localStorage.setItem(K,JSON.stringify(g))}catch(e){}})})}catch(e){}
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".mv-n");if(!b){document.querySelectorAll(".mv-nt:not([hidden])").forEach(function(x){x.setAttribute("hidden","");x.previousElementSibling.setAttribute("aria-expanded","false")});return}var t=b.nextElementSibling;if(!t)return;var o=t.hasAttribute("hidden");document.querySelectorAll(".mv-nt:not([hidden])").forEach(function(x){x.setAttribute("hidden","");x.previousElementSibling.setAttribute("aria-expanded","false")});if(o){t.removeAttribute("hidden");t.style.left="0";var r=t.getBoundingClientRect(),W=document.documentElement.clientWidth;if(r.right>W-16)t.style.left=(W-16-r.right)+"px"}else t.setAttribute("hidden","");b.setAttribute("aria-expanded",o?"true":"false")});
var links=[].slice.call(document.querySelectorAll(".mv-toc a"));
if("IntersectionObserver" in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.removeAttribute("aria-current")});var a=document.querySelector('.mv-toc a[href="#'+e.target.id+'"]');if(a){a.setAttribute("aria-current","true");var box=a.parentNode.parentNode;box.scrollTo({left:a.offsetLeft-20,behavior:"smooth"})}}})},{rootMargin:"-30% 0px -60% 0px"});document.querySelectorAll(".mv-sec").forEach(function(s){io.observe(s)})}
})();`;

export function htmlManual(secciones, meta, v, t) {
  const toc = secciones.map((s) => `<li><a href="#${s.id}">${esc(s.titulo)}</a></li>`).join("");
  glInit(secciones);
  const cuerpo = secciones.map((s) => { usados = new Set(); return `<section class="mv-sec" id="${s.id}"><h2>${esc(s.titulo)}</h2>${s.intro ? `<p class="intro">${esc(s.intro)}</p>` : ""}<div class="mv-b">${s.bloques.map((b) => bloque(b, v, t)).join("")}</div></section>`; }).join("");
  const script = SCRIPT.replace("__P__", v.precio_display).replace("__C__", v.comision_display).replace("__N__", Math.max(1, v.promo_n)).replace("__PP__", v.promo_precio);
  return `<style>${CSS}</style><div class="mv"><section class="mv-hero"><div class="in"><p class="crumb"><a href="/vendedores">Vendedores</a> / Manual</p><h1>Manual del vendedor</h1><p class="lede">Cómo vender, cobrar y entregar con Bien Visto, paso a paso y con los importes de hoy.</p><div class="mv-acc"><a class="btn" href="/ayuda/manual.pdf" download="Manual-del-vendedor-Bien-Visto.pdf">Descargar PDF</a><a class="btn gh" href="https://wa.me/522201435851?text=${encodeURIComponent("Hola, soy vendedor de Bien Visto y necesito ayuda con mi panel.")}" target="_blank" rel="noopener">Escribir a soporte</a></div><p class="mv-vig">Importes vigentes al ${esc(meta.fecha.replace(/\.$/, ""))}. Se actualizan solos.</p>${meta.vivo ? "" : `<p class="mv-warn"><strong>No pudimos leer los importes actuales.</strong> Los que ves son de respaldo y pueden no ser los vigentes. Confirma el precio y tu comisión en la app.</p>`}</div></section><nav class="mv-toc" aria-label="Secciones del manual"><ul>${toc}</ul></nav><div class="in">${cuerpo}</div></div><script>${script}</script>`;
}
