// Contenido del manual del vendedor. Es la única fuente: de aquí salen la página /ayuda/manual y el PDF.
// Los importes y plazos llegan de Ajustes del panel (v = números, t = textos con formato), así que
// cuando se cambia un precio, una comisión o un tope, el manual y el PDF cambian solos.
// Lo que NO se actualiza solo es la forma de hacer las cosas: si cambia un flujo de la app, hay que editar este archivo.
//
// Tipos de bloque: h3, p, ul, ol, tabla, aviso, pasos, faq, flujo, check, calc, glosario.
// En los textos, **así** es negrita.

export const FRASE_CASILLA =
  "¿Aceptas recibir, como beneficio exclusivo y gratuito, un resumen por WhatsApp del uso de tu display cada 15 días durante tres meses? Puedes darte de baja cuando quieras.";

export function contenido(v, t) {
  const P = v.precio_display, C = v.comision_display, E = P - C;
  const N = v.promo_n, PP = v.promo_precio, PC = C * N, PE = PP - PC;
  const mxn = (n) => "$" + Number(n).toLocaleString("es-MX", { maximumFractionDigits: 2 });
  const tresDisplays = 3 * P;

  // Tabla de importes: una venta suelta, la promoción y dos promociones.
  const importes = {
    t: "tabla",
    cols: ["Venta", "El cliente paga", "Tú retienes", "Entregas a Bien Visto"],
    w: [2.2, 1.5, 1.3, 1.7],
    rows: [
      ["1 display", t.precio, t.comision, t.entrega],
      [`Promoción: ${N} displays`, t.promo_precio, t.promo_comision, t.promo_entrega],
      [`${N * 2} displays (2 promociones)`, mxn(PP * 2), mxn(PC * 2), mxn((PP - PC) * 2)],
    ],
    nota: "Todos los precios llevan IVA incluido. El precio es fijo: no se puede cambiar ni dar descuentos propios.",
  };

  return [
    {
      id: "resumen",
      titulo: "Lo esencial en un minuto",
      intro: "Si solo vas a leer una parte, que sea esta.",
      bloques: [
        { t: "p", x: `Vendes displays de Bien Visto como comisionista independiente: tú decides cuándo, dónde y a quién. **Por cada display de ${t.precio} retienes ${t.comision} y entregas ${t.entrega} a Bien Visto.**` },
        importes,
        { t: "flujo", titulo: "Así se vende un display", pasos: ["Abrir el display", "Buscar el negocio", "Confirmar", "Probar", "Datos del cliente", "Cobrar", "Activar"] },
        { t: "aviso", tipo: "alto", titulo: "Tres reglas que no se negocian", x: "1. **Nunca actives un display sin verificar el pago.**\n2. **Cobra solo el precio de lista** y solo en efectivo o a tu propia cuenta de cobro.\n3. **No prometas resultados.** Nadie puede asegurar cuántas reseñas llegarán ni qué posición tendrá el negocio en Google." },
        { t: "aviso", tipo: "dato", titulo: "Tu tope", x: `Puedes tener contigo hasta **${t.tope_confianza}** de Bien Visto, o durante **${t.horas} horas**, lo que ocurra primero. Si eres vendedor nuevo, tu tope es de **${t.tope_nuevo}** hasta tu primera entrega confirmada. Al llegar al tope, la app no te deja activar más displays hasta que entregues.` },
      ],
    },
    {
      id: "empezar",
      titulo: "Antes de salir a vender",
      intro: "Cinco minutos de preparación evitan la mayoría de los problemas en el local del cliente.",
      bloques: [
        { t: "check", items: [
          "Entré a la app con mi cuenta de Google o con el código que llega a mi correo.",
          "Cargué mis datos de cobro en Menú > Mi cuenta (titular, banco, CLABE y número de cuenta). Sin ellos no puedes cobrar por transferencia.",
          "Mi cuenta de cobro está a mi nombre. Los cambios los aprueba Bien Visto.",
          "Traigo mi gafete: me identifico y digo con claridad que vendo por Bien Visto.",
          "Mi celular tiene batería, internet y el NFC encendido (Android: Ajustes > Conexiones).",
          "Revisé en Mis displays que tengo displays disponibles y mi saldo por entregar.",
        ] },
        { t: "h3", x: "Cómo está organizada la app" },
        { t: "tabla", cols: ["Parte de la app", "Para qué sirve"], w: [1.4, 3.6], rows: [
          ["Inicio", "Empezar una venta, ver tu prueba en curso y tu inventario."],
          ["Varios", "Activar 2 o más displays en el mismo negocio, en una sola venta."],
          ["Mis displays", "Buscar un display por folio, negocio o estado, y pedir cambios."],
          ["Mi saldo", "Ver lo que cobraste, lo que debes entregar y avisar tus entregas."],
          ["Menú", "Mi cuenta y datos de cobro, Mi desempeño, Mis ventas y comisión, Manual, Ayuda de esta pantalla, Soporte y Cerrar sesión."],
        ] },
        { t: "aviso", tipo: "ok", titulo: "Ayuda dentro de la app", x: "En cualquier pantalla, abre Menú > Ayuda de esta pantalla: te explica justo lo que estás viendo. Este manual es la versión completa." },
      ],
    },
    {
      id: "vender",
      titulo: "Vender un display, paso a paso",
      intro: "Este es el flujo completo con un solo display. Si entregas 2 o más en el mismo local, mejor usa la parte de Varios.",
      bloques: [
        { t: "pasos", items: [
          { titulo: "Abre el display", mock: "folio",
            x: "En Inicio toca **Vender un display**. Acerca la parte de arriba de tu celular al ícono NFC del display o toca **Escanear el QR del display**. También puedes escribir el folio: son 4 caracteres impresos al pie del display (por ejemplo X4W3).",
            nota: "Si el celular no reacciona al acercarlo, revisa que el NFC esté encendido. En iPhone funciona con la pantalla desbloqueada. Si no, usa el QR o el folio.",
            dile: "Te voy a enseñar cómo funciona con tu propio negocio, sin costo y sin compromiso." },
          { titulo: "Busca su negocio", mock: "negocio",
            x: "Escribe el nombre como aparece en Google Maps y elige el correcto. Si no sale, agrega la colonia o la calle. Si el cliente ya compró antes contigo, toca **¿Ya es cliente?** y búscalo por nombre para no duplicarlo.",
            nota: "Si hay dos negocios con el mismo nombre, fíjate en la dirección: cada sucursal tiene su propia ficha y sus propias reseñas. Si el negocio no tiene ficha en Google Maps, deja el display libre y escribe a soporte." },
          { titulo: "Confirma que es el negocio correcto", mock: "confirmar",
            x: "En **¿Es este?** lee en voz alta el nombre y la dirección con el cliente. Si coincide con el local donde están, confirma.",
            nota: "Si te equivocas, tienes unos segundos para deshacer. Después, entra al display y usa «Cambiar de negocio»: el folio no cambia y no se reimprime nada.",
            dile: "¿Este es tu negocio y esta es la dirección?" },
          { titulo: "Pruébalo con el cliente", mock: "prueba",
            x: `Toca **Probar el display ahora**. El cliente acerca su celular o escanea el QR y ve su reseña funcionando, con un aviso de demostración, durante ${t.prueba} minutos. Todavía no paga y el display no es suyo. Puedes tener hasta 2 displays en prueba al mismo tiempo. Si el cliente no compra, toca **Terminar la prueba**: el display queda libre y no se guarda ningún dato suyo.`,
            nota: "Para escribir una reseña hay que tener sesión de Google en el celular. Si no abre, prueba con otro teléfono. Así ves lo que verá un cliente real, no la pantalla de administrador.",
            dile: "Acerca tu celular aquí. Así les aparece a tus clientes para dejar su reseña." },
          { titulo: "Captura los datos del cliente", mock: "datos",
            x: "Cuando el cliente decide comprar, toca **Ya quiere comprarlo: ir al cobro** y llena: nombre, **WhatsApp de 10 dígitos** (obligatorio, de quien decide en el negocio) y correo (opcional; ahí le llega su recibo). Al final está la **casilla de resúmenes**: léele la pregunta y marca solo si dice que sí (ver la sección «La casilla de resúmenes»)." },
          { titulo: "Cobra antes de activar", mock: "cobro",
            x: `Verás el precio fijo (${t.precio} con IVA incluido), tu comisión (${t.comision}) y lo que entregas (${t.entrega}). Elige **Efectivo** o **Transferencia**, cobra y verifica el pago. Marca la casilla de compromiso y toca **Activar display**.`,
            nota: "Si activas sin haber cobrado, de todos modos te comprometes a entregar el monto a Bien Visto. Más detalle en la sección «Cobrar»." },
          { titulo: "Listo: factura, recibo y prueba final", mock: "listo",
            x: `Al activar, el display empieza a llevar a reseñas del negocio. El cliente recibe su recibo por correo unos ${t.recibo} minutos después (si dejó correo). **Pregúntale ahora si necesita factura**: si dice que sí, enséñale el QR o comparte el enlace; tendrá que escribir la **referencia de la venta** que aparece en pantalla. Por último, toca **Abrir enlace de reseña** para ver lo que verá un cliente. Para otro display del mismo cliente toca **Activar otro display de este cliente**.` },
        ] },
      ],
    },
    {
      id: "cobrar",
      titulo: "Cobrar: efectivo y transferencia",
      intro: "El dinero que cobras se reparte así: tú retienes tu comisión y entregas el resto a Bien Visto.",
      bloques: [
        importes,
        { t: "h3", x: "Efectivo" },
        { t: "p", x: `Cobra ${t.precio} al cliente, quédate con tu comisión de ${t.comision} y guarda ${t.entrega} para entregarlos a Bien Visto. Marca la casilla de compromiso y activa.` },
        { t: "h3", x: "Transferencia" },
        { t: "ol", items: [
          "Elige **Transferencia**. Si aún no cargaste tu cuenta, la app te pide **Cargar mi cuenta**.",
          "Toca **Compartir datos**: el cliente recibe un enlace o escanea un QR con tus datos de cobro y el monto exacto.",
          "El cliente paga **a tu cuenta**, la que cargaste en la app y aparece en tu gafete. Nunca a otra cuenta.",
          "**Revisa en tu banco que el dinero ya cayó** antes de activar. La clave de rastreo ayuda, pero no sustituye a tu banco.",
          "Escribe la clave de rastreo si la tienes (es opcional), marca la casilla y activa.",
        ] },
        { t: "h3", x: "La promoción" },
        { t: "p", x: `Si el mismo cliente compra **${N} displays en la misma venta**, paga ${t.promo_precio} en vez de ${mxn(N * P)}. Tu comisión sigue siendo ${t.comision} por display (${t.promo_comision} en total) y entregas ${t.promo_entrega}. El descuento lo absorbe Bien Visto. Con ${N * 2} displays son 2 promociones (${mxn(PP * 2)}); con ${N + 1}, una promoción más un display de ${t.precio}. Para que cuente, los displays tienen que ir en la misma venta (usa Varios).` },
        { t: "aviso", tipo: "alto", titulo: "Si activas sin cobrar", x: `Al activar te comprometes a entregar ${t.entrega} por display, lo hayas cobrado o no. Si el cliente no pagó, ese dinero lo pones tú y no ganas la comisión de esa venta. Si pasa del plazo, Bien Visto puede retirar los displays por impago y cobrar una pena del 10% sobre lo adeudado.` },
        { t: "aviso", tipo: "dato", titulo: "Los únicos medios válidos", x: "Efectivo entregado a ti como vendedor identificado, o transferencia a tu cuenta de cobro. No aceptes pagos en ninguna otra cuenta ni de otra forma, ni vendas a plazos, ni cobres cargos extra." },
        { t: "calc" },
      ],
    },
    {
      id: "casilla",
      titulo: "La casilla de resúmenes",
      intro: "Con el consentimiento del cliente, Bien Visto le manda por WhatsApp un resumen de cómo se está usando su display.",
      bloques: [
        { t: "p", x: "Al capturar los datos del cliente verás una casilla de consentimiento. Es tu responsabilidad preguntarle y registrar su respuesta con honestidad." },
        { t: "aviso", tipo: "ok", titulo: "Lo que le preguntas al cliente", x: `«${FRASE_CASILLA}»` },
        { t: "ul", items: [
          "**Marca la casilla solo si el cliente dice que sí.** No la marques por él ni la dejes marcada por costumbre.",
          "**No le ofrezcas nada a cambio** y no lo presentes como obligatorio.",
          "Si dice que no, **la venta sigue igual** y el display se activa sin resúmenes.",
          "El WhatsApp debe ser de **quien decide en el negocio**. Confírmalo con el cliente.",
          "Los resúmenes los manda Bien Visto. Tú no escribes al cliente por ese medio en nombre de Bien Visto ni usas su WhatsApp para tus propias ofertas.",
          "Marcar la casilla sin que el cliente lo haya aceptado es un incumplimiento grave y puede costarte tu cuenta.",
        ] },
        { t: "h3", x: "Qué recibe el cliente" },
        { t: "p", x: "Un saludo inicial y, cada 15 días durante tres meses, un resumen corto con los escaneos de su display, su mejor día y su mejor hora, y recomendaciones generales. Puede pedir la baja en cualquier momento respondiendo BAJA." },
      ],
    },
    {
      id: "varios",
      titulo: "Varios displays en un mismo negocio",
      intro: "Cuando entregas 2 o más displays en el mismo local, usa la pestaña Varios: eliges el negocio una vez y solo tocas cada display.",
      bloques: [
        { t: "ol", items: [
          "Abre **Varios** y elige o busca el negocio (nuevo o ya cliente). Confirma nombre y dirección.",
          "Toca cada display con el celular para sumarlo, o elígelos de la lista. Sin NFC, usa **Escanear QR de varios**: la cámara se queda abierta y cada QR que lees se suma; al final toca **Listo**.",
          "Si te equivocas de display, tócalo en la lista y elige **Quitar** antes de activar.",
          "Revisa el total: la app aplica la promoción sola si corresponde.",
          "Captura los datos del cliente (con la casilla de resúmenes), cobra y activa **una sola vez** para todos.",
        ] },
        { t: "aviso", tipo: "dato", titulo: "Ojo con el tope", x: `Los displays de una venta suman a tu saldo por entregar. Revisa que no pases tu tope de ${t.tope_confianza} (${t.tope_nuevo} si eres nuevo).` },
      ],
    },
    {
      id: "saldo",
      titulo: "Tu saldo, el tope y tus entregas",
      intro: "Cada venta que cobras deja dinero de Bien Visto en tus manos. Entregarlo a tiempo mantiene tu cuenta activa.",
      bloques: [
        { t: "p", x: `Tu **saldo por entregar** es la suma de los ${t.entrega} de cada display que cobraste y aún no entregas. Tu comisión de ${t.comision} por display ya la retuviste al cobrar, así que Bien Visto no te debe nada.` },
        { t: "tabla", cols: ["Ejemplo", "Cantidad"], w: [3, 2], rows: [
          ["Vendes 3 displays sueltos y cobras", mxn(tresDisplays)],
          ["Tu comisión (la retienes)", mxn(3 * C)],
          ["Tu saldo por entregar", mxn(3 * E)],
        ] },
        { t: "h3", x: "El tope" },
        { t: "p", x: `Es el máximo de dinero de Bien Visto que puedes tener contigo: **${t.tope_confianza} o ${t.horas} horas**, lo que ocurra primero. Si eres vendedor nuevo, empiezas con **${t.tope_nuevo}** y subes cuando Bien Visto confirma una entrega que deja tu saldo en cero. Al llegar al tope, la app no te deja activar más displays hasta que entregues.` },
        { t: "h3", x: "Cómo entregar" },
        { t: "ol", items: [
          "Entrega el dinero en mano a Bien Visto o por depósito o transferencia a la cuenta que Bien Visto indica en la app.",
          "En **Mi saldo** toca **Avisar que entregué**.",
          "Si fue depósito o transferencia, adjunta la foto del comprobante (tómala ahí mismo o súbela de tu galería).",
          "Cuando Bien Visto lo confirma, tu saldo baja y te llega un comprobante por correo por cada venta que quede entregada completa. Cada entrega confirmada es un **corte**.",
        ] },
        { t: "aviso", tipo: "alto", titulo: "Adeudo y retiro por impago", x: `Si pasas del plazo de entrega y no avisas, Bien Visto puede retirar esos displays por impago. Los ${t.entrega} de cada uno quedan como adeudo, puede aplicarse una pena del 10% y no puedes activar más hasta liquidarlo o devolver los displays.` },
        { t: "h3", x: "Dónde ver tus números" },
        { t: "ul", items: [
          "**Mi saldo:** lo que cobraste, lo que entregas y lo que ganas.",
          "**Menú > Mis ventas y comisión:** cada venta y tu comisión.",
          "**Menú > Mi desempeño:** tu mes. Un display cuenta como entregado cuando Bien Visto confirma tu entrega del dinero, no cuando lo vendes. El mes va del 1 al último día y el día 1 empiezas de cero.",
        ] },
      ],
    },
    {
      id: "cambios",
      titulo: "Cambios, reposiciones y anulaciones",
      intro: "Un display cambiado o repuesto cambia a dónde van las reseñas de un cliente que ya pagó, por eso Bien Visto lo cuida.",
      bloques: [
        { t: "tabla", cols: ["Qué necesitas", "Si eres vendedor Nuevo", "Si eres de Confianza"], w: [1.6, 2, 2], rows: [
          ["Cambiar de negocio", "Envías una solicitud con el motivo y Bien Visto la revisa.", "Lo haces directo desde el display."],
          ["Reponer un display dañado", "Envías una solicitud con el motivo y una foto.", `Directo, hasta ${t.lim_rep} veces al mes; después, solicitud.`],
          ["Anular una venta", "Solicitud, Bien Visto la aprueba.", "Solicitud, Bien Visto la aprueba."],
          ["Retirar un display", "No se puede desde la app.", "No se puede desde la app."],
        ] },
        { t: "ul", items: [
          "Mientras Bien Visto revisa una solicitud, el display sigue funcionando.",
          "El primer cambio de negocio de un cliente no tiene costo para él.",
          "Una venta puede anularse por error de captura, devolución o falta de pago. Si ya la habías entregado en un corte, la comisión se descuenta como ajuste en tu siguiente corte.",
          "No se pierden los escaneos: el historial queda guardado aunque el display se retire.",
          "Si un cliente ya no quiere su display, pide la anulación o escribe a Bien Visto.",
        ] },
        { t: "p", x: "Bien Visto decide cuándo subes al nivel de Confianza según tu historial, y puede revertirlo." },
      ],
    },
    {
      id: "reglas",
      titulo: "Reglas de oro",
      intro: "Son las reglas de los Términos para vendedores que más importan en la calle. El texto completo manda.",
      bloques: [
        { t: "h3", x: "Siempre" },
        { t: "ul", items: [
          "Identifícate con tu gafete y di con claridad que vendes por Bien Visto.",
          "Explica el display con verdad, sin exagerar.",
          "Trata con respeto a clientes y compañeros.",
          "Cumple las leyes y las políticas de Google sobre reseñas.",
          "Cuida los displays que tienes: son de Bien Visto hasta que se concrete la venta.",
          "Devuelve los displays no vendidos cuando Bien Visto lo pida.",
        ] },
        { t: "h3", x: "Nunca" },
        { t: "ul", items: [
          "Prometer más reseñas, mejor calificación, mejor posición en Google o más ventas.",
          "Ofrecer o aceptar pagos, descuentos, regalos u otros beneficios a cambio de reseñas.",
          "Pedir reseñas solo a clientes satisfechos, ni escribir ni comprar reseñas falsas.",
          "Vender un display ya activo, alterar el chip o el QR, o vincularlo a un negocio sin el cliente presente.",
          "Cobrar a nombre propio, a cuentas personales o más del precio de lista.",
          "Activar sin verificar el pago.",
          "Decir que eres empleado de Bien Visto o que representas a Google.",
          "Usar los datos de los clientes para otro fin, como ofrecerles tus propios servicios.",
        ] },
        { t: "aviso", tipo: "dato", titulo: "Eres independiente", x: "Eres comisionista independiente: sin horario, sin metas obligatorias y sin exclusividad. También eres responsable de tus propios impuestos." },
      ],
    },
    {
      id: "guion",
      titulo: "Cómo presentarlo al cliente",
      intro: "Un guion corto y honesto. Lo importante es que el cliente entienda qué compra y qué no.",
      bloques: [
        { t: "aviso", tipo: "ok", titulo: "En 30 segundos", x: `«Soy [tu nombre], vendo por Bien Visto. Este display lleva a tus clientes directo a dejar su reseña en Google: acercan el celular o escanean el QR y ya están en la pantalla de reseña de tu negocio. Cuesta ${t.precio} con IVA incluido, un solo pago, sin mensualidad. Puedes probarlo ahora mismo sin pagar.»` },
        { t: "h3", x: "Respuestas a dudas frecuentes del cliente" },
        { t: "faq", items: [
          ["¿Cuántas reseñas voy a recibir?", "No lo sabemos ni lo prometemos. El display facilita que tus clientes dejen una reseña; cuántas lleguen depende de tu negocio y de que se lo pidas."],
          ["¿Tengo que pagar mensualidad?", `No. Son ${t.precio} con IVA incluido, un solo pago.`],
          ["¿Y si le doy un descuento a quien me reseñe?", "No lo hagas. Google prohíbe dar algo a cambio de reseñas y puede eliminarlas o restringir tu ficha. Tampoco conviene pedirla solo a clientes contentos."],
          ["¿Y si se descompone?", "Tiene garantía de 90 días contra defectos de fabricación. Se repone sin costo; el cliente escribe a soporte o tú pides la reposición."],
          ["¿Por cuánto tiempo funciona el enlace?", "Bien Visto lo mantiene funcionando por al menos 3 años desde la activación."],
          ["¿Puedo cambiarlo si me cambio de local?", "Sí. Se pide un cambio de negocio a través de ti o de soporte. El primero no tiene costo."],
          ["¿Esto es de Google?", "No. Bien Visto no es Google ni tiene relación con Google. El display lleva a la pantalla de reseñas de Google."],
          ["¿Puedo facturar?", "Sí, pide factura el mismo día. Tú le muestras el QR o el enlace y la referencia de la venta."],
        ] },
      ],
    },
    {
      id: "faq",
      titulo: "Preguntas frecuentes",
      intro: "Las dudas que más te harán al vender.",
      bloques: [
        { t: "faq", items: [
          ["Mi celular no tiene NFC.", "Toca Escanear el QR del display dentro de la app. Es mejor que la cámara del celular porque no te saca de tu sesión."],
          ["No se abrió la reseña en la prueba.", "Para escribir una reseña hay que tener sesión de Google en el celular. Prueba con otro teléfono o abre el enlace desde la app."],
          ["No encuentro el negocio.", "Agrega la colonia o la calle al nombre. Si aun así no sale, puede que no tenga ficha en Google Maps: deja el display libre y escribe a soporte."],
          ["El nombre del negocio está mal escrito en Google.", "Elígelo igual. Las reseñas van a esa ficha; corregir el nombre se hace aparte, en Google."],
          ["Me equivoqué de negocio.", "Deshaz de inmediato si te da la opción. Después, entra al display y usa Cambiar de negocio (si eres vendedor nuevo, envía una solicitud)."],
          ["El cliente ya tiene otro display conmigo.", "Toca ¿Ya es cliente? y búscalo por nombre. Así no se duplica."],
          ["¿Qué pasa si el cliente no compra después de la prueba?", "Toca Terminar la prueba. El display queda libre y no se guarda ningún dato suyo."],
          ["La app no me deja activar.", `Tienes dinero de Bien Visto contigo por encima del tope o desde hace más de ${t.horas} horas. Entrega y avísalo en Mi saldo: se desbloquea cuando Bien Visto lo confirma.`],
          ["No puedo cobrar por transferencia.", "Aún no cargaste tu cuenta de cobro. Entra a Menú > Mi cuenta y cárgala; Bien Visto la aprueba."],
          ["El WhatsApp o el correo del cliente estaban mal.", "Si lo notas al momento, corrígelo en esa misma pantalla. Después, escribe a soporte y lo corrigen."],
          ["¿Cuándo recibo mi comisión?", `La retienes al cobrar: del dinero del cliente te quedas ${t.comision} y entregas el resto.`],
          ["¿Qué cuenta como display entregado en Mi desempeño?", "Cuando Bien Visto confirma tu entrega del dinero, no cuando lo vendes."],
          ["¿Puedo cambiar el precio o hacer descuentos?", `No. El precio es fijo: ${t.precio} con IVA incluido. Solo cambia con la promoción de ${N} displays por ${t.promo_precio}.`],
          ["¿Qué hago si pierdo o dañan un display que tengo conmigo?", "Avisa a soporte de inmediato. Si se pierde, roban o daña mientras lo tienes, el costo de reponerlo corre por tu cuenta, salvo desgaste normal o defecto de fabricación."],
        ] },
      ],
    },
    {
      id: "glosario",
      titulo: "Glosario",
      intro: "Las palabras que vas a ver en la app.",
      bloques: [
        { t: "glosario", items: [
          ["Display", "Inserto de 10 × 15 cm en un portacartel de acrílico en T, con un chip NFC y un código QR."],
          ["Folio", "Los 4 caracteres que identifican a cada display (por ejemplo X4W3). Está impreso al pie."],
          ["Ficha", "La página del negocio en Google Maps (Perfil de Negocio de Google)."],
          ["Prueba", `Modo en que el cliente ve su reseña funcionando antes de pagar. Dura hasta ${t.prueba} minutos.`],
          ["Activación", "Paso que deja el display funcionando para el negocio, una vez cobrado y verificado el pago."],
          ["Comisión", `Lo que retienes por cada display vendido: ${t.comision}.`],
          ["Saldo por entregar", `Lo que cobraste y aún no entregas a Bien Visto (${t.entrega} por display).`],
          ["Tope", "El máximo de dinero de Bien Visto que puedes tener contigo."],
          ["Corte", "Cada entrega de dinero que Bien Visto confirma."],
          ["Referencia de la venta", "Código que aparece al activar y que el cliente escribe en el formulario de factura."],
          ["Adeudo", "Dinero que debes a Bien Visto después del plazo. Bloquea nuevas activaciones."],
          ["Nivel Nuevo / De confianza", "Tu nivel de permisos. El nivel de Confianza puede hacer cambios de negocio directos y algunas reposiciones."],
          ["Resúmenes", "Mensajes por WhatsApp, cada 15 días durante tres meses, con el uso del display, si el cliente aceptó."],
        ] },
      ],
    },
    {
      id: "bolsillo",
      titulo: "Tarjeta de bolsillo",
      intro: "Imprímela o tómale una captura.",
      bloques: [
        { t: "tabla", cols: ["Dato", "Valor"], w: [3, 2], rows: [
          ["Precio de un display (IVA incluido)", t.precio],
          ["Tu comisión por display", t.comision],
          ["Entregas por display", t.entrega],
          [`Promoción: ${N} displays`, `${t.promo_precio} (tú retienes ${t.promo_comision}, entregas ${t.promo_entrega})`],
          ["Prueba antes de pagar", `Hasta ${t.prueba} minutos, máximo 2 displays a la vez`],
          ["Tu tope por entregar", `${t.tope_confianza} o ${t.horas} horas (nuevo: ${t.tope_nuevo})`],
          ["Reposiciones directas al mes (nivel de Confianza)", t.lim_rep],
          ["WhatsApp de soporte", "+52 220 143 5851"],
        ] },
        { t: "ol", items: [
          "Abre el display (NFC, QR o folio).", "Busca y confirma el negocio.", "Pruébalo con el cliente.", "Captura sus datos y pregunta por la casilla de resúmenes.",
          "Cobra y verifica el pago.", "Activa.", "Pregunta por factura y entrega tu saldo a tiempo.",
        ] },
      ],
    },
    {
      id: "soporte",
      titulo: "¿Necesitas ayuda?",
      bloques: [
        { t: "p", x: "Escríbenos por WhatsApp al **+52 220 143 5851** o por correo a **contacto@bienvisto.com.mx**. Dentro de la app, abre Menú > Escribir a soporte. Para entender el texto legal completo, lee los Términos para vendedores en bienvisto.com.mx/terminos-vendedores." },
      ],
    },
  ];
}
