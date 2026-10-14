# Auditoría operativa — 14 de octubre de 2026

## Envíos: MRW frente a web

La política pública de envío dice actualmente:

| Destino | Precio publicado | Plazo publicado |
| --- | ---: | --- |
| España | 6,99 EUR | 3–5 días hábiles |
| UE y Reino Unido | 8,99 EUR | 5–8 días hábiles |
| Estados Unidos | 12,99 EUR | 5–8 días hábiles |

La tarifa e-Commerce de MRW recibida hoy no permite sostener los importes internacionales publicados. Sus precios `BUSINESS`, sin IVA ni suplemento semanal de combustible, son:

| Destino | Hasta 2 kg | Hasta 5 kg | Hasta 10 kg |
| --- | ---: | ---: | ---: |
| Zona 1: Polonia, Francia, Alemania, Italia, Reino Unido, etc. | 24,58 EUR | 38,24 EUR | 46,44 EUR |
| Zona 3: EE. UU. y Canadá | 47,81 EUR | 73,77 EUR | 98,37 EUR |

El transporte internacional usa peso volumétrico `(largo × ancho × alto) / 5.000`, admite un solo bulto de hasta 25 kg y suma IVA, combustible y, cuando corresponda, aduanas. Por tanto, cobrar 8,99 EUR para UE/Reino Unido y 12,99 EUR para EE. UU. genera pérdidas incluso en el tramo más bajo. Para Polonia, la tarifa publicada queda al menos 15,59 EUR por debajo de la tarifa MRW base; para EE. UU., al menos 34,82 EUR por debajo.

### Acción requerida antes de aceptar pedidos internacionales

1. Configurar en Shopify tarifas por zona y peso (o desactivar temporalmente esos destinos).
2. Añadir recargo suficiente para IVA y combustible o comunicar claramente que se calcula al finalizar la compra.
3. No prometer 5–8 días a todos los destinos: fuera de la UE pueden aplicarse aduanas y los plazos deben depender de MRW.
4. Confirmar la tarifa nacional de MRW antes de mantener 6,99 EUR: el material recibido en este hilo no incluye la matriz nacional de precios.

## Hallazgos de SEO y tienda

- Search Console avisa de campos de producto incompletos: `shippingDetails`, `hasMerchantReturnPolicy` y `description`; además, `review` y `aggregateRating` son sugerencias no críticas. El JSON-LD público actual sí tiene descripciones de producto, pero no datos estructurados de envío/devoluciones.
- Search Console también registra 404 y 5xx junto con exclusiones esperables (robots, canónica y noindex). Necesita inspección desde la cuenta de Search Console para conocer las URLs concretas; no se deben eliminar las exclusiones normales sin esa lista.
- `robots.txt` y `sitemap.xml` públicos responden correctamente (HTTP 200), y el sitemap está declarado.

## Correcciones locales realizadas

- Corregido un error de sintaxis Liquid en el bloque de precio destacado que impedía validar el tema.
- Añadidos atributos intrínsecos de tamaño al logo personalizado para evitar saltos de diseño.
- Corregidos dos regresiones de la plantilla Brisa detectadas por las pruebas: consejos prácticos desactivados y valor de color no normalizado.

## Verificación

- `node --test tests/*.test.mjs`: 67 pruebas superadas tras las correcciones.
- Pendiente: validación integral de Theme Check, que también revisa traducciones heredadas de todos los idiomas y requiere tratar esa deuda de forma separada.
