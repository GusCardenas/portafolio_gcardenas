# Despliegue V1 — gcardenas.cl (sitio estático + contacto PHP/Resend)

## Objetivo y estructura
El sitio permanece en HTML/CSS/JavaScript y solo incorpora un endpoint PHP para el formulario. No requiere Laravel, base de datos ni Composer.

Estructura propuesta del VPS (adaptar al directorio real antes de ejecutar):

```text
/var/www/gcardenas/
├── .env                  # PRIVADO: fuera del directorio público, no versionado
└── public/               # raíz de Nginx; contenido del repositorio
    ├── index.html
    ├── contacto.html
    ├── privacidad.html
    ├── api/contact.php
    └── assets/...
```

**No colocar la API key en GitHub, en `public/.env`, en JS ni en HTML.**
El archivo `.env.example` del repositorio es solamente una plantilla sin credenciales.

## 1. Requisitos de PHP
PHP 8.3+ con FPM, cURL y mbstring. En Ubuntu, si estas extensiones no están instaladas:

```bash
sudo apt update
sudo apt install php8.3-fpm php8.3-curl php8.3-mbstring -y
sudo systemctl enable --now php8.3-fpm
php -l /var/www/gcardenas/public/api/contact.php
```

Ajustar la versión y el socket de PHP-FPM si el VPS utiliza otra versión.

## 2. Configurar el .env sin exponer secretos

```bash
sudo cp /var/www/gcardenas/public/.env.example /var/www/gcardenas/.env
sudo chown www-data:www-data /var/www/gcardenas/.env
sudo chmod 600 /var/www/gcardenas/.env
sudo nano /var/www/gcardenas/.env
```

Completar:
- `RESEND_API_KEY=` la clave real ya existente.
- `RESEND_FROM="Gustavo Cárdenas Web <contacto@gcardenas.cl>"` (el dominio gcardenas.cl debe estar verificado como remitente en Resend).
- `CONTACT_TO=hola@gcardenas.cl`
- `CONTACT_RATE_SALT=` valor aleatorio, generar con `openssl rand -hex 32`.

Por defecto, `api/contact.php` busca `../../.env` relativo a su ubicación. También admite una ruta absoluta definida con la variable del proceso `CONTACT_ENV_FILE`.

El correo del visitante se pasa como `reply_to` de Resend; **nunca** como remitente autenticado.

## 3. Integración Nginx — insertar en el server block existente
**No reemplazar** el bloque de dominio, TLS, Cloudflare o redirecciones que ya tienes configurados.

```nginx
root /var/www/gcardenas/public;
index index.html;

location = /api/contact.php {
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root/api/contact.php;
    fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    fastcgi_read_timeout 20s;
}

# No permitir ejecución ni descarga accidental de otros archivos PHP.
location ~* \.(?:php|phtml)$ {
    return 404;
}

# Bloquear archivos ocultos (.env, .git, etc.) salvo /.well-known.
location ~ /\.(?!well-known) {
    deny all;
}

location / {
    try_files $uri $uri/ =404;
}
```

La ubicación exacta `/api/contact.php` tiene prioridad sobre la regla que bloquea los demás `.php`. Es obligatorio probar que Nginx **ejecuta el endpoint con PHP-FPM** y no devuelve su código fuente.

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Además de la limitación en PHP (máximo 5 intentos cada 15 minutos por IP), puede agregarse `limit_req` de Nginx en una segunda iteración.

## 4. Prueba de configuración
1. Abrir `https://gcardenas.cl/contacto.html`.
2. Revisar que la política de privacidad abra y el checkbox sea obligatorio.
3. Hacer una consulta real desde el navegador.
4. Comprobar aceptación por el endpoint y después el estado **Delivered** de **dos correos** en el panel de Resend.
5. Verificar que la consulta llegue a `hola@gcardenas.cl` y que **Responder** se dirija al visitante.
6. Verificar que el visitante reciba su correo de confirmación, con copia completa de su mensaje, y que al responder se dirija a `hola@gcardenas.cl`.
7. Probar un error temporal (por ejemplo clave ausente en un entorno de prueba, sin modificar producción) y confirmar que no se muestra éxito.
8. Probar límite de envíos, protección honeypot, navegación móvil y logs de Nginx/PHP sin almacenar contenidos del formulario.

Una respuesta `success:true` significa que Resend aceptó el email, **no** garantiza entrega final.

## 5. SEO final y dominios
Los canonical, Open Graph, Twitter Cards, robots y sitemap del repositorio apuntan a `https://gcardenas.cl/`. Confirmar la redirección 301 desde `www.gcardenas.cl` y revisar que la versión de GitHub Pages no compita en los resultados de búsqueda; si se mantiene como vista previa, configurarla sin indexación antes del lanzamiento.

## 6. Actualizar código en Laragon

```powershell
cd C:\laragon\www\portfolio
git status
git pull --ff-only origin master
git log -1 --oneline
```

La vista previa de GitHub Pages no ejecuta PHP. Localmente el formulario requiere Apache/Nginx con PHP habilitado y un `.env` fuera del document root, o bien validar el envío directamente en el VPS.

## Checklist de liberación
- [ ] Clave de Resend configurada en `/var/www/gcardenas/.env`, con permisos restrictivos.
- [ ] Remitente del dominio verificado en Resend.
- [ ] PHP-FPM y extensiones habilitados; `php -l` sin errores.
- [ ] Nginx sirve el PHP solo en el endpoint aprobado.
- [ ] Envío, recepción y Reply-To comprobados con correo real.
- [ ] Confirmaciones de éxito/error probadas.
- [ ] Enlaces, favicon, imágenes, diseño responsive y consola JS revisados.
- [ ] Canonical, sitemap, robots y redirecciones validados en el dominio.
