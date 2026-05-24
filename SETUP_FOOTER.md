# Setup del Footer — Instrucciones para Shopify Admin

El footer ya está preparado en el tema. Solo necesitas crear los menús de navegación y las páginas en el admin de Shopify.

---

## 1. Crear los 3 menús de navegación

Ve a **Tienda online > Navegación** en el admin de Shopify.

### Menú: COLECCIONES
- **Nombre del menú:** `colecciones`
- Este nombre es exacto (handle = `colecciones`)

| Texto del enlace | Enlace a |
|---|---|
| Lámparas | `colecciones/lamparas` |
| Jarrones | `colecciones/jarrones` |
| Sujetavelas | `colecciones/sujetavelas` |
| Macetas | `colecciones/macetas` |

> Si tus colecciones tienen otros handles, usa los correctos.

### Menú: INFORMACIÓN
- **Nombre del menú:** `informacion`
- Este nombre es exacto (handle = `informacion`)

| Texto del enlace | Enlace a |
|---|---|
| Sobre nosotros | `pages/sobre-nosotros` (usa el template **page.about-us**) |
| Proceso | `pages/proceso` (usa el template **page.proceso**) |
| Materiales | `pages/materiales` (usa el template **page.materiales**) |
| Personalización | `pages/personalizacion` (usa el template **page.personalizacion**) |

### Menú: AYUDA
- **Nombre del menú:** `ayuda`
- Este nombre es exacto (handle = `ayuda`)

| Texto del enlace | Enlace a |
|---|---|
| Envíos y plazos | `pages/envios-y-plazos` (usa el template **page.envios**) |
| Devoluciones | `pages/devoluciones` (usa el template **page.devoluciones**) |
| Preguntas frecuentes | `pages/preguntas-frecuentes` (usa el template **page.preguntas-frecuentes**) |
| Contacto | `pages/contacto` (usa el template **page.contact**) |

---

## 2. Crear las páginas

Ve a **Tienda online > Páginas** y crea cada página.

### Páginas existentes (ya deberías tenerlas)
| Página | Template a usar |
|---|---|
| Sobre nosotros | `page.about-us` |
| Contacto | `page.contact` |

### Páginas nuevas que debes crear
| Título | Handle sugerido | Template a usar | Contenido sugerido |
|---|---|---|---|
| Proceso | `proceso` | `page.proceso` | Explica el proceso de diseño e impresión 3D |
| Materiales | `materiales` | `page.materiales` | Describe los materiales que usáis (PLA, PETG, etc.) |
| Personalización | `personalizacion` | `page.personalizacion` | Explica las opciones de personalización |
| Envíos y plazos | `envios-y-plazos` | `page.envios` | Información de envíos, plazos y zonas |
| Devoluciones | `devoluciones` | `page.devoluciones` | Política de devoluciones |
| Preguntas frecuentes | `preguntas-frecuentes` | `page.preguntas-frecuentes` | FAQ con preguntas comunes |

> **Importante:** El handle de la página debe coincidir con los enlaces del menú.

---

## 3. Verificar colecciones

Asegúrate de que estas colecciones existen en tu tienda:
- `lamparas`
- `jarrones`
- `sujetavelas`
- `macetas`

Si tienen nombres diferentes, actualiza los enlaces del menú **COLECCIONES** para que apunten a los handles correctos.

---

## 4. Publicar el tema

Una vez creados los menús y las páginas, sube el tema a Shopify y el footer funcionará automáticamente con todos los enlaces.

---

## Archivos creados/modificados en el tema

- `assets/logo-ossomosso-blanco.png`
- `blocks/logo.liquid` — soporte para logo desde assets
- `blocks/footer-copyright.liquid` — texto de copyright personalizado
- `blocks/text.liquid` — color muted añadido
- `sections/footer-utilities.liquid` — acepta bloques de texto
- `sections/footer-group.json` — estructura completa del footer
- `templates/page.proceso.json`
- `templates/page.materiales.json`
- `templates/page.personalizacion.json`
- `templates/page.envios.json`
- `templates/page.devoluciones.json`
- `templates/page.preguntas-frecuentes.json`
