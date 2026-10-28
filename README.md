# gcardenas.cl — Refresh Andes Contemporáneo

## Abrir en local

- Abre `index.html` en un navegador, o usa Live Server en VS Code.
- Opcional: desde esta carpeta ejecuta `python -m http.server 8000` y visita `http://localhost:8000`.

## Archivos

- `index.html`: inicio
- `servicios.html`: servicios
- `proyectos.html`: catálogo del portafolio
- `proyecto-estacion48.html`: detalle de caso
- `sobre-mi.html`: presentación profesional
- `contacto.html`: formulario de consulta
- `assets/css/styles.css`: sistema visual responsive
- `assets/js/main.js`: navbar, header y footer compartidos; configuración de textos, botones y métricas por página
- `assets/img/logo.svg`: logotipo editable
- `assets/img/andes-hero.jpg`: imagen de montaña recortada de un mockup conceptual generado para este proyecto
- `assets/img/*.jpg`: referencias de portafolio, reemplazables por screenshots reales

## Personalizar

1. En `assets/js/main.js`, edita `PAGE_CONFIG` para cambiar el header de cada página. Cada header permite título, bajada, botones opcionales y tres bloques de icono + texto.
2. Modifica la lista `NAV_LINKS` en el mismo archivo para cambiar el menú.
3. Modifica `footerHTML()` para el pie de página.
4. Cambia colores desde variables CSS `:root`.
5. Reemplaza las imágenes de referencia por fotografías de paisaje licenciadas para uso comercial y capturas reales. El fondo actual proviene de un recorte del mockup conceptual y no de una fotografía original.
6. Confirma correo de contacto antes de publicar. Actualmente se indica `hola@gcardenas.cl` como valor provisional.

## Importante

El formulario **no tiene backend**: valida campos y abre la aplicación de correo con un borrador mediante `mailto:`. Para producción, conectar a endpoint seguro con validación server-side, CAPTCHA/rate-limit y política de privacidad.

Tipografías Manrope e Inter se cargan desde Google Fonts; si trabajas sin conexión el navegador utiliza fuentes de sistema.

Las imágenes de proyectos son referencias conceptuales; no presentan funcionalidades implementadas ni métricas de resultado.
