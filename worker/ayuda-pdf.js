// Genera el PDF del manual del vendedor con el mismo contenido que la página (ayuda-contenido.js).
import { PDFDocument, StandardFonts, rgb } from "./pdf-lib.min.js";
import { FRASE_CASILLA } from "./ayuda-contenido.js";

const W = 612, H = 792, M = 54, CW = W - 2 * M;
const VERDE = rgb(0.055, 0.42, 0.36), MENTA = rgb(0.906, 0.941, 0.925), TINTA = rgb(0.07, 0.19, 0.17), GRIS = rgb(0.36, 0.44, 0.41);
const AMBAR = rgb(0.949, 0.655, 0.106), LINEA = rgb(0.8, 0.85, 0.83), CREMA = rgb(0.984, 0.965, 0.925);
const AVISO = { ok: [rgb(0.906, 0.941, 0.925), VERDE], alto: [rgb(0.99, 0.92, 0.9), rgb(0.82, 0.3, 0.2)], dato: [rgb(0.99, 0.95, 0.85), AMBAR] };

// Helvetica solo tiene el alfabeto latino de Windows: lo demás se sustituye para que nunca falle.
const SUST = { "–": "-", "—": "-", "−": "-", "→": ">", "›": ">", "≥": ">=", "≤": "<=", "✓": "", "×": "x", "…": "...", " ": " ", " ": " " };
function limpiar(s) {
  let o = "";
  for (const ch of String(s)) {
    if (SUST[ch] !== undefined) o += SUST[ch];
    else if (ch === "\n") o += "\n";
    else {
      const c = ch.codePointAt(0);
      if (c < 0x20) continue;
      if (c < 0x100 || "“”‘’•€".includes(ch)) o += ch;
      else o += "";
    }
  }
  return o;
}

function trozos(texto) {
  // "**negrita**" -> [{x, b}]
  const out = [];
  const partes = limpiar(texto).split("**");
  partes.forEach((p, i) => { if (p) out.push({ x: p, b: i % 2 === 1 }); });
  return out;
}

class Pdf {
  constructor(doc, fonts, meta, paginas) {
    this.doc = doc; this.f = fonts; this.meta = meta; this.paginas = paginas || {}; this.marcas = {};
    this.page = null; this.y = 0; this.n = 0;
  }
  nueva() {
    this.page = this.doc.addPage([W, H]);
    this.n += 1;
    this.y = H - M;
    if (this.n > 1) {
      this.page.drawRectangle({ x: 0, y: H - 30, width: W, height: 30, color: VERDE });
      this.page.drawText("Manual del vendedor", { x: M, y: H - 20, size: 9.5, font: this.f.b, color: CREMA });
      this.page.drawText("Bien Visto", { x: W - M - this.f.b.widthOfTextAtSize("Bien Visto", 9.5), y: H - 20, size: 9.5, font: this.f.b, color: CREMA });
      this.y = H - 58;
    }
  }
  asegurar(alto) { if (this.y - alto < M + 24) this.nueva(); }
  // pdf-lib mide con pares de kerning pero dibuja sin ellos: se mide letra por letra para que no se encimen.
  ancho(run, size) {
    const f = run.b ? this.f.b : this.f.r;
    let w = 0;
    for (const ch of run.x) w += f.widthOfTextAtSize(ch, size);
    return w;
  }
  // Parte el texto en líneas que caben en `ancho`; cada línea es una lista de palabras con su tipo de letra.
  lineas(texto, size, ancho, forzarNegrita = false) {
    const out = [];
    for (const parrafo of limpiar(texto).split("\n")) {
      const palabras = [];
      let finEspacio = true; // el texto anterior terminó en espacio (o no hay texto anterior)
      trozos(parrafo).forEach((r) => {
        const ws = r.x.split(/\s+/);
        const empiezaEsp = /^\s/.test(r.x);
        ws.forEach((w, i) => {
          if (!w) return;
          const sp = i > 0 || empiezaEsp || finEspacio || palabras.length === 0;
          palabras.push({ x: w, b: r.b || forzarNegrita, sp });
        });
        finEspacio = /\s$/.test(r.x);
      });
      let linea = [], w = 0;
      const esp = this.f.r.widthOfTextAtSize(" ", size);
      for (const p of palabras) {
        const pw = this.ancho(p, size);
        const sep = linea.length && p.sp ? esp : 0;
        if (linea.length && p.sp && w + sep + pw > ancho) { out.push(linea); linea = []; w = 0; }
        linea.push(p); w += (linea.length > 1 ? (p.sp ? esp : 0) : 0) + pw;
      }
      out.push(linea);
    }
    return out;
  }
  dibujaLinea(linea, x, y, size, color) {
    const esp = this.f.r.widthOfTextAtSize(" ", size);
    let cx = x;
    linea.forEach((p, i) => {
      if (i > 0 && p.sp) cx += esp;
      this.page.drawText(p.x, { x: cx, y, size, font: p.b ? this.f.b : this.f.r, color });
      cx += this.ancho(p, size);
    });
  }
  parrafo(texto, { size = 10.5, lh = 14.8, x = M, ancho = CW, color = TINTA, negrita = false, despues = 5 } = {}) {
    for (const l of this.lineas(texto, size, ancho, negrita)) {
      this.asegurar(lh);
      this.y -= lh;
      this.dibujaLinea(l, x, this.y, size, color);
    }
    this.y -= despues;
  }
  titulo2(s) {
    this.asegurar(90);
    this.y -= 22;
    this.marcas[s.id] = this.n;
    this.page.drawRectangle({ x: M, y: this.y - 4, width: 5, height: 26, color: AMBAR });
    this.page.drawText(limpiar(s.titulo), { x: M + 14, y: this.y + 2, size: 18, font: this.f.b, color: VERDE });
    this.y -= 14;
    if (s.intro) this.parrafo(s.intro, { size: 10.5, color: GRIS, despues: 6 });
    else this.y -= 4;
  }
  titulo3(x) { this.asegurar(50); this.y -= 6; this.parrafo(x, { size: 12.5, negrita: true, color: VERDE, despues: 4, lh: 16 }); }
  lista(items, ordenada) {
    items.forEach((it, i) => {
      const ls = this.lineas(it, 10.5, CW - 18);
      this.asegurar(14.8 * Math.min(ls.length, 2));
      const y0 = this.y - 14.8;
      this.page.drawText(ordenada ? `${i + 1}.` : "•", { x: M + 2, y: y0, size: 10.5, font: this.f.b, color: VERDE });
      for (const l of ls) { this.asegurar(14.8); this.y -= 14.8; this.dibujaLinea(l, M + 18, this.y, 10.5, TINTA); }
      this.y -= 3;
    });
    this.y -= 3;
  }
  check(items) {
    for (const it of items) {
      const ls = this.lineas(it, 10.5, CW - 22);
      this.asegurar(14.8 * Math.min(ls.length, 2) + 4);
      const y0 = this.y - 14.8;
      this.page.drawRectangle({ x: M + 1, y: y0 - 1.5, width: 11, height: 11, borderColor: VERDE, borderWidth: 1.4 });
      for (const l of ls) { this.asegurar(14.8); this.y -= 14.8; this.dibujaLinea(l, M + 22, this.y, 10.5, TINTA); }
      this.y -= 4;
    }
    this.y -= 2;
  }
  tabla(b) {
    const tot = b.w.reduce((a, c) => a + c, 0);
    const ws = b.w.map((w) => (w / tot) * CW);
    const size = 9.8, lh = 13, pad = 6;
    const medir = (fila, negrita) => fila.map((c, i) => this.lineas(c, size, ws[i] - 2 * pad, negrita));
    const dibuja = (celdas, alto, esCab, esPrimera) => {
      let x = M;
      if (esCab) this.page.drawRectangle({ x: M, y: this.y - alto, width: CW, height: alto, color: MENTA });
      celdas.forEach((ls, i) => {
        let yy = this.y - pad - lh + 3.5;
        for (const l of ls) { this.dibujaLinea(l, x + pad, yy, size, esCab ? VERDE : TINTA); yy -= lh; }
        x += ws[i];
      });
      this.page.drawLine({ start: { x: M, y: this.y - alto }, end: { x: M + CW, y: this.y - alto }, thickness: 0.6, color: LINEA });
      this.y -= alto;
    };
    const cab = medir(b.cols, true);
    const altoCab = Math.max(...cab.map((c) => c.length)) * lh + 2 * pad;
    this.asegurar(altoCab + 40);
    this.page.drawLine({ start: { x: M, y: this.y }, end: { x: M + CW, y: this.y }, thickness: 0.6, color: LINEA });
    dibuja(cab, altoCab, true);
    for (const fila of b.rows) {
      const celdas = fila.map((c, i) => this.lineas(c, size, ws[i] - 2 * pad, i === 0));
      const alto = Math.max(...celdas.map((c) => c.length)) * lh + 2 * pad;
      if (this.y - alto < M + 24) { this.nueva(); this.page.drawLine({ start: { x: M, y: this.y }, end: { x: M + CW, y: this.y }, thickness: 0.6, color: LINEA }); dibuja(cab, altoCab, true); }
      dibuja(celdas, alto, false);
    }
    this.y -= 8;
    if (b.nota) this.parrafo(b.nota, { size: 9.2, color: GRIS });
  }
  aviso(b) {
    const [fondo, barra] = AVISO[b.tipo] || AVISO.dato;
    const size = 10.3, lh = 14.2, pad = 11;
    const ls = this.lineas(b.x, size, CW - 2 * pad - 8);
    const alto = 2 * pad + 17 + ls.length * lh;
    this.asegurar(Math.min(alto, 150) + 6);
    if (this.y - alto < M + 24) {
      // Aviso largo: se parte en cuerpo continuo
      this.nueva();
    }
    const top = this.y;
    this.page.drawRectangle({ x: M, y: top - alto, width: CW, height: alto, color: fondo });
    this.page.drawRectangle({ x: M, y: top - alto, width: 5, height: alto, color: barra });
    let yy = top - pad - 11;
    this.page.drawText(limpiar(b.titulo), { x: M + pad + 6, y: yy, size: 11.5, font: this.f.b, color: TINTA });
    yy -= 6;
    for (const l of ls) { yy -= lh; this.dibujaLinea(l, M + pad + 6, yy, size, TINTA); }
    this.y = top - alto - 10;
  }
  flujo(b) {
    const n = b.pasos.length, porFila = 4, bw = (CW - (porFila - 1) * 16) / porFila, bh = 40;
    const filas = Math.ceil(n / porFila);
    this.asegurar(26 + filas * (bh + 14));
    this.parrafo(b.titulo, { size: 11.5, negrita: true, despues: 4 });
    for (let i = 0; i < n; i++) {
      const fila = Math.floor(i / porFila), col = i % porFila;
      const x = M + col * (bw + 16), yTop = this.y - fila * (bh + 14);
      this.page.drawRectangle({ x, y: yTop - bh, width: bw, height: bh, color: MENTA, borderColor: VERDE, borderWidth: 0.8 });
      this.page.drawCircle({ x: x + 14, y: yTop - bh / 2, size: 8, color: VERDE });
      const num = String(i + 1);
      this.page.drawText(num, { x: x + 14 - this.f.b.widthOfTextAtSize(num, 9) / 2, y: yTop - bh / 2 - 3.2, size: 9, font: this.f.b, color: CREMA });
      const ls = this.lineas(b.pasos[i], 9.2, bw - 36, true);
      let yy = yTop - bh / 2 + (ls.length - 1) * 5.5 - 3;
      for (const l of ls) { this.dibujaLinea(l, x + 28, yy, 9.2, TINTA); yy -= 11; }
      if (col < porFila - 1 && i < n - 1) this.page.drawText(">", { x: x + bw + 4.5, y: yTop - bh / 2 - 3.5, size: 10, font: this.f.b, color: GRIS });
    }
    this.y -= filas * (bh + 14) + 2;
  }
  pasos(b) {
    b.items.forEach((p, i) => {
      const lsX = this.lineas(p.x, 10.5, CW - 34);
      this.asegurar(60 + Math.min(lsX.length, 3) * 14.8);
      this.y -= 4;
      const yc = this.y - 11;
      this.page.drawCircle({ x: M + 11, y: yc, size: 11, color: AMBAR });
      const num = String(i + 1);
      this.page.drawText(num, { x: M + 11 - this.f.b.widthOfTextAtSize(num, 12) / 2, y: yc - 4.2, size: 12, font: this.f.b, color: TINTA });
      this.page.drawText(limpiar(p.titulo), { x: M + 34, y: yc - 4.2, size: 12.5, font: this.f.b, color: VERDE });
      this.y -= 24;
      for (const l of lsX) { this.asegurar(14.8); this.y -= 14.8; this.dibujaLinea(l, M + 34, this.y, 10.5, TINTA); }
      if (p.nota) { this.y -= 2; this.parrafo(p.nota, { size: 9.6, x: M + 34, ancho: CW - 34, color: GRIS, despues: 2 }); }
      if (p.dile) {
        const ls = this.lineas("Dile al cliente: " + p.dile, 9.8, CW - 34 - 20);
        const alto = ls.length * 13.5 + 12;
        this.asegurar(alto + 6);
        const top = this.y - 2;
        this.page.drawRectangle({ x: M + 34, y: top - alto, width: CW - 34, height: alto, color: MENTA });
        let yy = top - 6;
        for (const l of ls) { yy -= 13.5; this.dibujaLinea(l, M + 44, yy, 9.8, TINTA); }
        this.y = top - alto - 2;
      }
      this.y -= 12;
    });
  }
  faq(items) {
    for (const [q, a] of items) {
      const lq = this.lineas(q, 10.5, CW, true), la = this.lineas(a, 10.3, CW - 12);
      this.asegurar(lq.length * 14.5 + Math.min(la.length, 3) * 14 + 10);
      for (const l of lq) { this.y -= 14.5; this.dibujaLinea(l, M, this.y, 10.5, VERDE); }
      for (const l of la) { this.asegurar(14); this.y -= 14; this.dibujaLinea(l, M + 12, this.y, 10.3, TINTA); }
      this.y -= 9;
    }
  }
  glosario(items) {
    for (const [k, d] of items) {
      const ls = this.lineas(d, 10.3, CW - 12);
      this.asegurar(16 + Math.min(ls.length, 2) * 14);
      this.y -= 14.5;
      this.page.drawText(limpiar(k), { x: M, y: this.y, size: 10.8, font: this.f.b, color: VERDE });
      for (const l of ls) { this.asegurar(14); this.y -= 14; this.dibujaLinea(l, M + 12, this.y, 10.3, TINTA); }
      this.y -= 6;
    }
  }
  bloque(b) {
    switch (b.t) {
      case "p": return this.parrafo(b.x);
      case "h3": return this.titulo3(b.x);
      case "ul": return this.lista(b.items, false);
      case "ol": return this.lista(b.items, true);
      case "tabla": return this.tabla(b);
      case "aviso": return this.aviso(b);
      case "flujo": return this.flujo(b);
      case "check": return this.check(b.items);
      case "pasos": return this.pasos(b);
      case "faq": return this.faq(b.items);
      case "glosario": return this.glosario(b.items);
      default: return undefined; // "calc" solo existe en la página
    }
  }
  portada(secciones) {
    this.nueva();
    const alto = 150;
    this.page.drawRectangle({ x: 0, y: H - alto, width: W, height: alto, color: VERDE });
    // Isotipo (mismo trazado que isotipo-reverso.svg)
    const s = 0.26, x0 = M, yTop = H - 38;
    const ox = x0 - 10 * s, oy = yTop + 41 * s;
    this.page.drawSvgPath("M62 163 L62 78 A16 16 0 0 0 30 78 L30 163 A16 16 0 0 0 62 163 Z", { x: ox, y: oy, scale: s, color: CREMA });
    this.page.drawSvgPath("M30 163 A59 59 0 1 1 148 163 A59 59 0 1 1 30 163 Z M62 163 A27 27 0 1 0 116 163 A27 27 0 1 0 62 163 Z", { x: ox, y: oy, scale: s, color: CREMA });
    this.page.drawSvgPath("M159.53 150 L197.35 215.5 A15 15 0 0 0 223.33 215.5 L298.96 84.5 A15 15 0 0 0 272.98 69.5 L210.34 178 L185.51 135 A15 15 0 0 0 159.53 150 Z", { x: ox, y: oy, scale: s, color: AMBAR });
    this.page.drawText("Bien Visto", { x: M + 90, y: H - 62, size: 15, font: this.f.b, color: CREMA });
    this.page.drawText("Manual del vendedor", { x: M, y: H - 106, size: 28, font: this.f.b, color: CREMA });
    this.page.drawText("Cómo vender, cobrar y entregar, paso a paso", { x: M, y: H - 128, size: 12, font: this.f.r, color: CREMA });
    this.y = H - alto - 26;
    this.parrafo(`Importes vigentes al ${this.meta.fecha}`, { size: 11, negrita: true, color: VERDE, despues: 2 });
    if (!this.meta.vivo) this.parrafo("No se pudieron leer los importes actuales: los de este documento son de respaldo. Confírmalos en la app.", { size: 10, color: rgb(0.82, 0.3, 0.2), despues: 2 });
    this.parrafo("Versión siempre actualizada en bienvisto.com.mx/ayuda/manual. Los importes de este PDF son los de la fecha de arriba; si cambian, descarga el PDF de nuevo.", { size: 9.8, color: GRIS, despues: 14 });
    this.parrafo("Contenido", { size: 14, negrita: true, color: TINTA, despues: 6, lh: 18 });
    for (const s2 of secciones) {
      this.y -= 15;
      this.page.drawText(limpiar(s2.titulo), { x: M, y: this.y, size: 11, font: this.f.r, color: TINTA });
      const pg = this.paginas[s2.id] ? String(this.paginas[s2.id]) : "";
      if (pg) this.page.drawText(pg, { x: W - M - this.f.r.widthOfTextAtSize(pg, 11), y: this.y, size: 11, font: this.f.b, color: VERDE });
      this.page.drawLine({ start: { x: M, y: this.y - 4 }, end: { x: W - M, y: this.y - 4 }, thickness: 0.4, color: LINEA });
    }
    this.y -= 24;
    this.parrafo("Este manual resume los Términos para vendedores (bienvisto.com.mx/terminos-vendedores). Si algo no coincide, manda el texto de los Términos.", { size: 9.2, color: GRIS });
  }
}

async function armar(secciones, meta, paginas) {
  const doc = await PDFDocument.create();
  const fonts = { r: await doc.embedFont(StandardFonts.Helvetica), b: await doc.embedFont(StandardFonts.HelveticaBold) };
  const p = new Pdf(doc, fonts, meta, paginas);
  p.portada(secciones);
  p.nueva();
  for (const s of secciones) {
    p.titulo2(s);
    for (const b of s.bloques) p.bloque(b);
  }
  return { doc, p };
}

export async function pdfManual(secciones, meta) {
  // Primera pasada: saber en qué página empieza cada sección para el índice. Segunda: el documento final.
  const a = await armar(secciones, meta, {});
  const total = a.doc.getPageCount();
  const b = await armar(secciones, meta, a.p.marcas);
  const pags = b.doc.getPages();
  pags.forEach((pg, i) => {
    const txt = `bienvisto.com.mx/ayuda/manual   ·   Página ${i + 1} de ${total}`;
    pg.drawText(txt, { x: W / 2 - fonts_ancho(b.p, txt, 8.5) / 2, y: 26, size: 8.5, font: b.p.f.r, color: GRIS });
  });
  b.doc.setTitle("Manual del vendedor | Bien Visto");
  b.doc.setAuthor("Bien Visto");
  b.doc.setSubject("Cómo vender, cobrar y entregar con Bien Visto");
  b.doc.setLanguage?.("es-MX");
  return b.doc.save();
}
const fonts_ancho = (p, txt, size) => p.f.r.widthOfTextAtSize(limpiar(txt), size);
