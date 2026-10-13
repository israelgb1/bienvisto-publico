// Rutas del manual del vendedor: /ayuda/manual (página) y /ayuda/manual.pdf (descarga).
// Los dos salen de ayuda-contenido.js con los importes vigentes de Ajustes del panel.
import { contenido } from "./ayuda-contenido.js";
import { htmlManual } from "./ayuda-html.js";
import { pdfManual } from "./ayuda-pdf.js";

const MARCA = "<!--MANUAL-->";

function fechaMx() {
  const d = new Date();
  try {
    return new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", dateStyle: "long", timeStyle: "short" }).format(d);
  } catch (e) {
    return d.toISOString().slice(0, 16).replace("T", " ") + " UTC";
  }
}

export async function responderAyuda(request, env, url, { valores, vivo, textos }) {
  const ruta = url.pathname.replace(/\/+$/, "");
  const esPdf = ruta === "/ayuda/manual.pdf";
  const esHtml = ruta === "/ayuda/manual" || ruta === "/ayuda/manual.html";
  if (!esPdf && !esHtml) return null;
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Método no permitido", { status: 405 });

  const t = textos(valores);
  const secciones = contenido(valores, t);
  const meta = { fecha: fechaMx(), vivo };

  if (esPdf) {
    const bytes = await pdfManual(secciones, meta);
    return new Response(request.method === "HEAD" ? null : bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Manual-del-vendedor-Bien-Visto.pdf"',
        "Cache-Control": "public, max-age=60",
        "X-Robots-Tag": "noindex",
      },
    });
  }

  const base = new URL(request.url);
  base.pathname = "/ayuda/manual";
  const res = await env.ASSETS.fetch(new Request(base.toString(), { headers: request.headers }));
  if (!res.ok) return res;
  const plantilla = await res.text();
  const html = plantilla.replace(MARCA, htmlManual(secciones, meta, valores, t));
  const h = new Headers(res.headers);
  h.set("Content-Type", "text/html; charset=utf-8");
  h.delete("Content-Length");
  h.delete("ETag");
  h.set("Cache-Control", "public, max-age=0, must-revalidate");
  h.set("X-Robots-Tag", "noindex");
  return new Response(request.method === "HEAD" ? null : html, { status: 200, headers: h });
}
