# Traducciones del tema

La tienda tiene inglés como idioma principal y español como idioma traducido.

- El editor del tema gestiona una sola estructura: bloques, imágenes, colores y textos originales.
- Translate & Adapt gestiona las traducciones españolas de esos textos, incluidas las frases del marquee, los acordeones, las especificaciones y los consejos.
- No crear secciones o bloques separados por idioma, ni selectores Language para ocultarlos según el idioma.
- Los textos fijos del tema utilizan las claves de `locales/` y el filtro `t`; también son contenido de tema traducible.

Product Story conserva el identificador interno `ossomosso_product_story_en` para no invalidar las claves de traducción ya registradas. Ese sufijo es histórico: la sección se muestra en todos los idiomas y no es una copia exclusiva para inglés.

La migración de octubre de 2026 registró 268 traducciones españolas nativas en el tema conectado antes de eliminar las siete secciones duplicadas. Las traducciones se almacenan en Shopify, no como bloques en GitHub. Si se crea otro tema o tienda, exportar/importar las traducciones con las herramientas de Shopify y verificar ambos idiomas antes de publicarlo.

Cambiar un texto original puede marcar su traducción como desactualizada. Revisarla en Translate & Adapt. Evitar renombrar los identificadores de sección/bloque sin migrar sus traducciones.
