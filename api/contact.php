<?php
declare(strict_types=1);

// Endpoint de contacto del sitio estático. No almacena el contenido enviado.
// Requiere PHP 8.1+ y ext-curl. El archivo .env REAL vive fuera del webroot.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');

function respond(int $status, string $message, bool $success = false): never {
    http_response_code($status);
    echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, 'Método no permitido.');
}

if (!function_exists('curl_init') || !function_exists('mb_substr') || !function_exists('mb_strlen')) {
    error_log('contact: missing required PHP extension (curl or mbstring)');
    respond(503, 'El formulario no está disponible temporalmente.');
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = strtolower(explode(':', $_SERVER['HTTP_HOST'] ?? '')[0]);
if ($origin !== '') {
    $originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
    if ($originHost === '' || $originHost !== $host) {
        respond(403, 'Origen no permitido.');
    }
}
if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'XMLHttpRequest') {
    respond(403, 'Solicitud no permitida.');
}
$type = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
if ($type !== 'application/json') {
    respond(415, 'Formato de solicitud no admitido.');
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 12288) {
    respond(413, 'La solicitud supera el tamaño permitido.');
}
$raw = file_get_contents('php://input', false, null, 0, 12289);
if ($raw === false || strlen($raw) > 12288) {
    respond(413, 'La solicitud supera el tamaño permitido.');
}
$data = json_decode($raw, true);
if (!is_array($data)) {
    respond(400, 'Solicitud inválida.');
}
if (trim((string) ($data['website'] ?? '')) !== '') {
    // No emitir email a bots que llenan el campo trampa.
    respond(200, 'Consulta procesada.', true);
}
if (($data['privacy'] ?? false) !== true) {
    respond(422, 'Debe aceptar el tratamiento de datos para enviar el mensaje.');
}
$clean = static fn (string $key, int $max): string =>
    mb_substr(trim((string) ($data[$key] ?? '')), 0, $max + 1, 'UTF-8');
$name = $clean('nombre', 100);
$email = $clean('email', 150);
$company = $clean('empresa', 120);
$position = $clean('cargo', 100);
$phone = $clean('telefono', 35);
$category = $clean('tipo', 100);
$message = $clean('mensaje', 3000);
if ($name === '' || mb_strlen($name, 'UTF-8') > 100 || preg_match('/[\r\n]/', $name)) {
    respond(422, 'Ingrese su nombre completo.');
}
if (strlen($email) > 150 || !filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email)) {
    respond(422, 'Ingrese un correo electrónico válido.');
}
if (mb_strlen($message, 'UTF-8') < 15 || mb_strlen($message, 'UTF-8') > 3000) {
    respond(422, 'Describa su consulta en al menos 15 caracteres.');
}
foreach ([$company, $position, $phone, $category] as $optional) {
    if (mb_strlen($optional, 'UTF-8') > 120) {
        respond(422, 'Revise la extensión de los campos opcionales.');
    }
}

function readEnv(string $file): array {
    if (!is_file($file) || !is_readable($file)) {
        return [];
    }
    $values = [];
    foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !preg_match('/^([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/', $line, $matches)) {
            continue;
        }
        $value = trim($matches[2]);
        if (strlen($value) >= 2 && (($value[0] === '"' && str_ends_with($value, '"')) || ($value[0] === "'" && str_ends_with($value, "'")))) {
            $value = substr($value, 1, -1);
        }
        $values[$matches[1]] = $value;
    }
    return $values;
}

$envFile = getenv('CONTACT_ENV_FILE') ?: dirname(__DIR__, 2) . '/.env';
$env = readEnv($envFile);
$config = static fn (string $key, string $default = ''): string =>
    (string) (getenv($key) ?: ($env[$key] ?? $default));
$key = $config('RESEND_API_KEY');
$from = $config('RESEND_FROM', 'Gustavo Cárdenas Web <contacto@gcardenas.cl>');
$to = $config('CONTACT_TO', 'hola@gcardenas.cl');
$salt = $config('CONTACT_RATE_SALT');
if ($key === '' || $salt === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
    error_log('contact: missing or invalid server configuration');
    respond(503, 'El formulario no está disponible temporalmente.');
}

// Limitación básica por IP sin almacenar IP ni datos del formulario.
// El archivo de control se guarda fuera del sitio público (directorio temporal del servidor).
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$lockPath = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'gcardenas-contact-' . hash_hmac('sha256', $ip, $salt);
$handle = @fopen($lockPath, 'c+');
if (!$handle || !flock($handle, LOCK_EX)) {
    error_log('contact: rate limit storage unavailable');
    respond(503, 'El formulario no está disponible temporalmente.');
}
$history = json_decode(stream_get_contents($handle) ?: '[]', true);
$history = is_array($history) ? $history : [];
$now = time();
$history = array_values(array_filter($history, static fn ($time) => is_int($time) && $time > $now - 900));
if (count($history) >= 5) {
    flock($handle, LOCK_UN);
    fclose($handle);
    header('Retry-After: 900');
    respond(429, 'Se alcanzó el límite temporal de consultas. Inténtelo más tarde.');
}
// Contabilizar intentos antes de llamar a Resend para frenar abuso.
$history[] = $now;
ftruncate($handle, 0);
rewind($handle);
fwrite($handle, json_encode($history));
fflush($handle);
flock($handle, LOCK_UN);
fclose($handle);

$escape = static fn (string $value): string => htmlspecialchars($value ?: 'No indicado', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$fields = [
    'Nombre' => $name,
    'Correo' => $email,
    'Empresa' => $company,
    'Cargo' => $position,
    'Teléfono' => $phone,
    'Área de consulta' => $category,
    'Mensaje' => $message,
];
$rows = '';
foreach ($fields as $label => $value) {
    $rows .= '<tr><th style="text-align:left;vertical-align:top;padding:10px;border-bottom:1px solid #e3e9ed">' . $escape($label) .
        '</th><td style="padding:10px;border-bottom:1px solid #e3e9ed;white-space:pre-wrap">' . nl2br($escape($value)) . '</td></tr>';
}
$payload = [
    'from' => $from,
    'to' => [$to],
    'reply_to' => $email,
    'subject' => 'Nueva consulta desde gcardenas.cl',
    'html' => '<h2>Nueva consulta desde gcardenas.cl</h2><table style="border-collapse:collapse;width:100%">' . $rows . '</table>',
];
// Enviar siempre primero la consulta interna. Sólo confirmamos al visitante
// después de que Resend haya aceptado el mensaje para el destinatario.
function sendViaResend(string $apiKey, array $payload): bool {
    $curl = curl_init('https://api.resend.com/emails');
    if ($curl === false) {
        error_log('contact: unable to initialize Resend connection');
        return false;
    }
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_FOLLOWLOCATION => false,
    ]);
    $body = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $curlError = curl_errno($curl);
    curl_close($curl);
    $response = is_string($body) ? json_decode($body, true) : null;
    if ($curlError !== 0 || !in_array($status, [200, 201], true) || !is_array($response) || empty($response['id'])) {
        error_log('contact: Resend rejected email, http_status=' . $status . ', transport_error=' . $curlError);
        return false;
    }
    return true;
}

if (!sendViaResend($key, $payload)) {
    respond(502, 'No fue posible enviar el mensaje. Inténtelo nuevamente más tarde.');
}

// Confirmación de cortesía para el visitante, incluyendo copia literal de su
// mensaje con caracteres escapados para impedir la inyección de HTML.
$ackHtml = '<!doctype html><html lang="es"><head><meta charset="UTF-8"></head>'
    . '<body style="margin:0;padding:28px 12px;background:#f3f7f9;font-family:Arial,Helvetica,sans-serif;color:#15394a">'
    . '<table role="presentation" style="width:100%;max-width:620px;margin:0 auto;background:#ffffff;border-collapse:collapse;border-radius:12px">'
    . '<tr><td style="padding:34px 34px 18px;border-bottom:1px solid #e0e9ed">'
    . '<p style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#527c8c;margin:0 0 16px">Gustavo Cárdenas · Consultoría y software</p>'
    . '<h1 style="font-size:25px;line-height:1.3;color:#0b3043;margin:0">Hemos recibido tu consulta</h1>'
    . '</td></tr><tr><td style="padding:28px 34px 16px">'
    . '<p style="font-size:16px;line-height:1.7;margin:0 0 16px">Hola ' . $escape($name) . ':</p>'
    . '<p style="font-size:16px;line-height:1.7;margin:0 0 16px">Gracias por contactarnos. Revisaremos tu mensaje y nos pondremos en contacto contigo <strong>dentro de un día hábil</strong> para aclarar tus dudas y conversar sobre la mejor forma de ayudarte.</p>'
    . '<p style="font-size:15px;line-height:1.7;margin:0 0 18px">A continuación encontrarás una copia de tu consulta para tus registros.</p>'
    . '<div style="border-left:3px solid #6b9cab;background:#f3f8fa;padding:18px 20px;border-radius:4px">'
    . '<p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#527c8c;margin:0 0 10px">Tu mensaje</p>'
    . '<p style="font-size:15px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere;margin:0">' . nl2br($escape($message)) . '</p>'
    . '</div><p style="font-size:15px;line-height:1.7;margin:24px 0 0">Saludos,<br><strong>Gustavo Cárdenas</strong><br>Consultoría tecnológica y desarrollo de software</p>'
    . '</td></tr><tr><td style="border-top:1px solid #e0e9ed;padding:20px 34px;font-size:13px;line-height:1.6;color:#527c8c">'
    . 'Este correo es una confirmación automática de tu consulta. Si necesitas agregar información, puedes responder a este mensaje o escribir a '
    . '<a href="mailto:'.htmlspecialchars($to, ENT_QUOTES, 'UTF-8').'" style="color:#0b5976">' . $escape($to) . '</a>.'
    . '</td></tr></table></body></html>';

$ackPayload = [
    'from' => $from,
    'to' => [$email],
    'reply_to' => $to,
    'subject' => 'Recibimos tu consulta | Gustavo Cárdenas',
    'html' => $ackHtml,
    'text' => "Hola {$name}:\n\nGracias por contactarnos. Revisaremos tu mensaje y nos pondremos en contacto contigo dentro de un día hábil para aclarar tus dudas y conversar sobre la mejor forma de ayudarte.\n\nCopia de tu mensaje:\n{$message}\n\nSaludos,\nGustavo Cárdenas\nConsultoría tecnológica y desarrollo de software\n{$to}",
];

if (!sendViaResend($key, $ackPayload)) {
    // La consulta interna ya fue aceptada: no indicar error ni pedir reenvío,
    // para evitar duplicados. Registrar el fallo para seguimiento operativo.
    error_log('contact: internal inquiry accepted but visitor acknowledgement failed');
    respond(200, 'Recibí tu consulta y responderé dentro de un día hábil. No se pudo enviar la copia de confirmación por correo.', true);
}

// Ambas solicitudes han sido aceptadas por Resend. La entrega final se
// comprueba en el panel de Resend y en las bandejas de entrada.
respond(200, 'Recibí tu consulta. Te envié una copia por correo y responderé dentro de un día hábil.', true);
