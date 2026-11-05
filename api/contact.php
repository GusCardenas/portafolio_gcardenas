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

if (!function_exists('curl_init')) {
    error_log('contact: missing php-curl');
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
$curl = curl_init('https://api.resend.com/emails');
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $key,
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
$result = is_string($body) ? json_decode($body, true) : null;
if ($curlError !== 0 || !in_array($status, [200, 201], true) || !is_array($result) || empty($result['id'])) {
    error_log('contact: Resend did not accept message, http_status=' . $status . ', transport_error=' . $curlError);
    respond(502, 'No fue posible enviar el mensaje. Inténtelo nuevamente más tarde.');
}
// Resend acepta el mensaje; su entrega final se verifica en el panel de Resend.
respond(200, 'Mensaje enviado correctamente. Responderé dentro de un día hábil.', true);
