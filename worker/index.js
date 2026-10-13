// Sitio bienvisto.com.mx: sirve los archivos estáticos y, en las páginas HTML,
// llena los marcadores {{clave}} con los valores de Ajustes del panel (precio, comisión, promoción, plazos).
// Si el panel no responde, usa los valores de respaldo de abajo para que el sitio nunca se rompa.

const RESPALDO = {
  precio_display: 350, comision_display: 150, promo_n: 3, promo_precio: 900, prueba_minutos: 30,
  recibo_min: 5, horas: 72, tope_nuevo: 600, tope_confianza: 2000, lim_rep: 2,
};
const URL_CONFIG = "https://vendedores.bienvisto.com.mx/api/publico/config";
const VIGENCIA_MS = 60 * 1000;

let memoria = { hasta: 0, valores: null };

async function leerValores(env) {
  if (memoria.valores && Date.now() < memoria.hasta) return memoria.valores;
  const valores = { ...RESPALDO };
  try {
    const peticion = new Request(URL_CONFIG, { headers: { Accept: "application/json" } });
    const res = env.API ? await env.API.fetch(peticion) : await fetch(peticion);
    if (res.ok) {
      const j = await res.json();
      for (const k of Object.keys(RESPALDO)) {
        const n = Number(j[k]);
        if (Number.isFinite(n) && n >= 0) valores[k] = n;
      }
    }
  } catch (e) {
    console.log("valores del panel no disponibles: " + (e && e.message));
  }
  memoria = { hasta: Date.now() + VIGENCIA_MS, valores };
  return valores;
}

const mxn = (n) => "$" + Number(n).toLocaleString("es-MX", { maximumFractionDigits: 2 });

export function textos(v) {
  const entrega = v.precio_display - v.comision_display;
  const promoComision = v.comision_display * v.promo_n;
  return {
    precio: mxn(v.precio_display),
    comision: mxn(v.comision_display),
    entrega: mxn(entrega),
    promo_n: String(v.promo_n),
    promo_precio: mxn(v.promo_precio),
    promo_comision: mxn(promoComision),
    promo_entrega: mxn(v.promo_precio - promoComision),
    prueba: String(v.prueba_minutos),
    recibo: String(v.recibo_min),
    horas: String(v.horas),
    tope_nuevo: mxn(v.tope_nuevo),
    tope_confianza: mxn(v.tope_confianza),
    lim_rep: String(v.lim_rep),
    // Números sin formato, para el JavaScript de la página de vendedores
    n_precio: String(v.precio_display),
    n_comision: String(v.comision_display),
    n_entrega: String(entrega),
    n_horas: String(v.horas),
    n_tope_nuevo: String(v.tope_nuevo),
    n_tope_confianza: String(v.tope_confianza),
    n_prueba: String(v.prueba_minutos),
  };
}

export function llenar(html, t) {
  return html.replace(/\{\{([a-z_]+)\}\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(t, k) ? t[k] : m));
}

export default {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(request);
    const tipo = res.headers.get("Content-Type") || "";
    if (!tipo.includes("text/html") || request.method === "HEAD") return res;
    const html = await res.text();
    if (!html.includes("{{")) return new Response(html, res);
    const cuerpo = llenar(html, textos(await leerValores(env)));
    const h = new Headers(res.headers);
    h.delete("Content-Length");
    h.delete("ETag");
    h.set("Cache-Control", "public, max-age=0, must-revalidate");
    return new Response(cuerpo, { status: res.status, statusText: res.statusText, headers: h });
  },
};
