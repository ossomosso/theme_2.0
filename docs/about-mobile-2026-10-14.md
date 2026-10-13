# Sobre nosotros: espaciado móvil

Publicado el 14 de octubre de 2026. Se corrigieron los huecos mostrados en las cinco capturas aportadas por el comerciante. Los commits son `54d3944` (espaciado) y `6d80ac0` (marquee inglés).

## Recorrido y resultado

| Zona | Antes | Resultado publicado |
| --- | --- | --- |
| Inicio | 72 px de padding del contenedor y 100 px del texto, además de márgenes tipográficos | 24 + 24 px; separación explícita de 20–24 px entre etiqueta, título y descripción |
| Fotografía | Foto estrecha, con espacios independientes del texto | Ancho completo del área interior, margen lateral de 24 px y separación inferior de 32 px |
| Historia | Visual de relleno con altura mínima de 420 px después de los párrafos | Relleno oculto en móvil; las fotos y los SVG configurados en Shopify siguen mostrándose |
| Filosofía y CTA | Padding vertical de 80 px y márgenes acumulados | Padding de 56 px y márgenes definidos entre los elementos |
| Proceso | Dos columnas sin gutter; bloques casi pegados | 24 px entre columnas, 32 px entre filas y divisores de fila; una columna por debajo de 360 px |
| Idioma | El marquee inglés incluía «Impresión 3D» | «3D printing» en inglés; español conservado mediante la traducción nativa |

Los ajustes de composición se aplican hasta 749 px. El escritorio conserva las reglas anteriores. El proceso de la página de inicio no recibe estos overrides: el selector exige que la página contenga el hero de Sobre nosotros.

## Verificación

- Navegador Zen/Firefox, página publicada: español a 390 × 844, inglés a 390 × 844 y 320 × 844. Verificados el inicio, la continuidad de historia/filosofía y la separación de los pasos a 390 px. No se presenta la prueba de 320 px como una inspección completa de todas las secciones.
- Cambio real de español a inglés desde el selector del pie; destino `/en/pages/sobre-nosostros`. Pie móvil revisado visualmente.
- Escritorio revisado después de cerrar la simulación móvil. El marquee inglés muestra «3D printing».
- Cinco secciones Liquid y la plantilla JSON pasaron el validador oficial Shopify. `git diff --check` correcto. La consulta del tema no devolvió traducciones españolas desactualizadas.
- Evidencia guardada localmente en `output/about-mobile-2026-10-14`: capturas de navegador y recortes del viewport. `about-mobile-before-after.png` compara el mismo viewport de 390 × 844 sin cambiar la escala. Los originales completos se conservan; las capturas no se incluyen en el repositorio.

La revisión cubre los tamaños indicados y no equivale a una prueba física en Safari/iPhone ni a una auditoría completa de accesibilidad.

## Edición en Shopify

En Tienda online → Temas → Personalizar, abrir Páginas → about-us y seleccionar la página Sobre nosotros. Los textos e imágenes siguen en las secciones existentes About Hero, About Story, About Values, About CTA y Process. El contenido fuente inglés se edita en esos campos; el español se mantiene en Translate & Adapt. Marquee permite editar su lista de frases. No se añadieron copias de texto ni diccionarios que sobrescriban los cambios del editor.

La sección Story vuelve a mostrar un visual en móvil cuando se selecciona una imagen o se añade un SVG. Solo se oculta la ilustración predeterminada de relleno.

## Estado de la auditoría anterior

Se sincronizó main con `b1b5cc9` antes de editar y se preservaron las mejoras posteriores de fichas y personalizador. El informe de producto actualizado está en `design-qa.md`; esta corrección no revierte ese trabajo. La conversión local del logotipo PNG a WebP del comerciante permanece fuera de estos commits.

Sigue pendiente publicar la corrección de los términos ingleses: la API deniega `shopPolicyUpdate` por ausencia de `write_legal_policies`. El archivo local `output/audit-2026-10-01/terms-source-en-proposed.html` está preparado para Configuración → Políticas. Las condiciones comerciales no se han cambiado.

La reanudación única de esta auditoría se ejecutó y se eliminó para evitar repetir cambios ya publicados.
