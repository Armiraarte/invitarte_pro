<?php

/*
  Registro de eventos nuevos (modulo "Empieza por $389").

  Acciones:
    POST ?action=create   Guarda datos del cliente, del evento y sus fotos. Si hay MP_ACCESS_TOKEN
                          configurado, crea la preferencia de pago de Mercado Pago y devuelve checkout_url.
    GET  ?action=status   Consulta el estado de un pedido por folio (&folio=INV-XXXX).
    POST ?action=webhook  Notificaciones de Mercado Pago. Se valida consultando el pago en la API
                          de Mercado Pago con nuestro token, nunca confiando en el cuerpo recibido.

  Configuracion (config.local.php o variables de entorno):
    MP_ACCESS_TOKEN   Token privado de Mercado Pago (produccion o prueba).
    SITE_URL          URL publica del sitio, para regresar al cliente despues de pagar.
    PUBLIC_API_URL    URL publica de esta carpeta /db, para las notificaciones de pago.
*/

require_once __DIR__ . '/config.php';

const ORDER_AMOUNT = 389.00;
const ORDER_CURRENCY = 'MXN';
const ORDER_TITLE = 'INViTARTE: sistema de control de invitados';
const ORDER_MAX_PHOTOS = 10;
const ORDER_MAX_PHOTO_BYTES = 6 * 1024 * 1024;
const ORDER_ALLOWED_PHOTO_TYPES = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];

$action = (string) ($_GET['action'] ?? 'create');

// Mercado Pago no envia nuestra API key: el webhook se valida consultando el pago directamente.
if ($action !== 'webhook') {
    requireApiKey();
}

$pdo = getDbConnection();
ensureOrdersSchema($pdo);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($action === 'create' && $method === 'POST') {
    createOrder($pdo);
}

if ($action === 'status' && $method === 'GET') {
    getOrderStatus($pdo);
}

if ($action === 'webhook') {
    handlePaymentWebhook($pdo);
}

sendJson(['success' => false, 'message' => 'Acción no válida'], 404);

function ensureOrdersSchema(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS invitarte_orders (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            folio VARCHAR(20) NOT NULL,
            status VARCHAR(30) NOT NULL DEFAULT \'pendiente_pago\',
            template_id VARCHAR(60) NOT NULL DEFAULT \'\',
            customer_name VARCHAR(160) NOT NULL,
            customer_email VARCHAR(190) NOT NULL,
            customer_phone VARCHAR(30) NOT NULL,
            event_type VARCHAR(60) NOT NULL DEFAULT \'\',
            event_title VARCHAR(190) NOT NULL,
            event_date DATE NULL,
            event_time VARCHAR(10) NOT NULL DEFAULT \'\',
            event_venue VARCHAR(190) NOT NULL DEFAULT \'\',
            event_address VARCHAR(255) NOT NULL DEFAULT \'\',
            event_guests INT UNSIGNED NULL,
            event_notes TEXT NULL,
            photos JSON NULL,
            amount DECIMAL(10,2) NOT NULL,
            currency CHAR(3) NOT NULL,
            payment_provider VARCHAR(30) NOT NULL DEFAULT \'\',
            payment_preference_id VARCHAR(120) NOT NULL DEFAULT \'\',
            payment_reference VARCHAR(120) NOT NULL DEFAULT \'\',
            paid_at DATETIME NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_invitarte_orders_folio (folio),
            KEY idx_invitarte_orders_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
}

function cleanText($value, int $maxLength): string
{
    $text = trim(preg_replace('/\s+/u', ' ', (string) $value) ?? '');
    return mb_substr($text, 0, $maxLength);
}

function generateOrderFolio(PDO $pdo): string
{
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for ($attempt = 0; $attempt < 8; $attempt += 1) {
        $code = '';
        for ($index = 0; $index < 8; $index += 1) {
            $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }
        $folio = 'INV-' . $code;

        $statement = $pdo->prepare('SELECT 1 FROM invitarte_orders WHERE folio = ? LIMIT 1');
        $statement->execute([$folio]);
        if (!$statement->fetchColumn()) {
            return $folio;
        }
    }

    throw new RuntimeException('No pudimos generar un folio único.');
}

function readOrderPayload(): array
{
    $raw = $_POST['order'] ?? '';
    $decoded = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($decoded)) {
        sendJson(['success' => false, 'message' => 'Datos del registro no válidos.'], 400);
    }

    $customer = is_array($decoded['customer'] ?? null) ? $decoded['customer'] : [];
    $event = is_array($decoded['event'] ?? null) ? $decoded['event'] : [];

    $data = [
        'template_id' => cleanText($decoded['templateId'] ?? '', 60),
        'customer_name' => cleanText($customer['name'] ?? '', 160),
        'customer_email' => strtolower(cleanText($customer['email'] ?? '', 190)),
        'customer_phone' => preg_replace('/[^0-9+]/', '', (string) ($customer['phone'] ?? '')) ?? '',
        'event_type' => cleanText($event['type'] ?? '', 60),
        'event_title' => cleanText($event['title'] ?? '', 190),
        'event_date' => cleanText($event['date'] ?? '', 10),
        'event_time' => cleanText($event['time'] ?? '', 10),
        'event_venue' => cleanText($event['venue'] ?? '', 190),
        'event_address' => cleanText($event['address'] ?? '', 255),
        'event_guests' => ($event['guests'] ?? '') === '' ? null : max(0, min(100000, (int) $event['guests'])),
        'event_notes' => mb_substr(trim((string) ($event['notes'] ?? '')), 0, 2000),
    ];

    $errors = [];
    if (mb_strlen($data['customer_name']) < 3) {
        $errors[] = 'Escribe tu nombre completo.';
    }
    if (!filter_var($data['customer_email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'El correo no es válido.';
    }
    if (strlen(preg_replace('/\D/', '', $data['customer_phone']) ?? '') < 10) {
        $errors[] = 'El WhatsApp debe tener al menos 10 dígitos.';
    }
    if (mb_strlen($data['event_title']) < 2) {
        $errors[] = 'Escribe el nombre del evento.';
    }
    if ($data['event_date'] !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['event_date'])) {
        $errors[] = 'La fecha del evento no es válida.';
    }

    if ($errors) {
        sendJson(['success' => false, 'message' => implode(' ', $errors)], 422);
    }

    return $data;
}

/* Reordena $_FILES['photos'] (formato de arreglo de PHP) en una lista de archivos */
function collectUploadedPhotos(): array
{
    $files = $_FILES['photos'] ?? null;
    if (!$files || !is_array($files['name'] ?? null)) {
        return [];
    }

    $photos = [];
    foreach ($files['name'] as $index => $name) {
        $photos[] = [
            'name' => (string) $name,
            'tmp_name' => (string) ($files['tmp_name'][$index] ?? ''),
            'error' => (int) ($files['error'][$index] ?? UPLOAD_ERR_NO_FILE),
            'size' => (int) ($files['size'][$index] ?? 0),
        ];
    }

    return $photos;
}

function storeOrderPhotos(string $folio, array $photos): array
{
    if (count($photos) > ORDER_MAX_PHOTOS) {
        sendJson(['success' => false, 'message' => 'Puedes subir hasta ' . ORDER_MAX_PHOTOS . ' fotos.'], 422);
    }

    $baseDir = __DIR__ . '/uploads/orders';
    if (!is_dir($baseDir) && !mkdir($baseDir, 0755, true) && !is_dir($baseDir)) {
        throw new RuntimeException('No se pudo crear la carpeta de fotos.');
    }

    // Las fotos nunca deben ejecutarse ni listarse desde el navegador.
    $guard = __DIR__ . '/uploads/.htaccess';
    if (!is_file($guard)) {
        file_put_contents($guard, "Options -Indexes\n<FilesMatch \"\\.(php|phtml|phar)$\">\n  Require all denied\n</FilesMatch>\n");
    }

    $orderDir = $baseDir . '/' . $folio;
    $stored = [];
    $finfo = new finfo(FILEINFO_MIME_TYPE);

    foreach ($photos as $index => $photo) {
        if ($photo['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($photo['tmp_name'])) {
            continue;
        }
        if ($photo['size'] <= 0 || $photo['size'] > ORDER_MAX_PHOTO_BYTES) {
            sendJson(['success' => false, 'message' => 'Cada foto debe pesar menos de 6 MB.'], 422);
        }

        $mime = $finfo->file($photo['tmp_name']) ?: '';
        if (!isset(ORDER_ALLOWED_PHOTO_TYPES[$mime])) {
            sendJson(['success' => false, 'message' => 'Solo se aceptan fotos JPG, PNG o WEBP.'], 422);
        }

        if (!is_dir($orderDir) && !mkdir($orderDir, 0755, true) && !is_dir($orderDir)) {
            throw new RuntimeException('No se pudo crear la carpeta del pedido.');
        }

        $fileName = sprintf('foto-%02d.%s', $index + 1, ORDER_ALLOWED_PHOTO_TYPES[$mime]);
        if (!move_uploaded_file($photo['tmp_name'], $orderDir . '/' . $fileName)) {
            throw new RuntimeException('No se pudo guardar una foto.');
        }

        $stored[] = 'uploads/orders/' . $folio . '/' . $fileName;
    }

    return $stored;
}

function createOrder(PDO $pdo): void
{
    $data = readOrderPayload();

    try {
        $folio = generateOrderFolio($pdo);
        $photos = storeOrderPhotos($folio, collectUploadedPhotos());

        $statement = $pdo->prepare(
            'INSERT INTO invitarte_orders
                (folio, template_id, customer_name, customer_email, customer_phone, event_type, event_title, event_date,
                 event_time, event_venue, event_address, event_guests, event_notes, photos, amount, currency)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $statement->execute([
            $folio,
            $data['template_id'],
            $data['customer_name'],
            $data['customer_email'],
            $data['customer_phone'],
            $data['event_type'],
            $data['event_title'],
            $data['event_date'] !== '' ? $data['event_date'] : null,
            $data['event_time'],
            $data['event_venue'],
            $data['event_address'],
            $data['event_guests'],
            $data['event_notes'],
            json_encode($photos, JSON_UNESCAPED_SLASHES),
            ORDER_AMOUNT,
            ORDER_CURRENCY,
        ]);
    } catch (Throwable $error) {
        logApiError('orders:create_failed', ['error' => $error->getMessage()]);
        sendJson(['success' => false, 'message' => 'No pudimos guardar tu registro. Intenta de nuevo.'], 500);
    }

    $checkoutUrl = createMercadoPagoCheckout($pdo, $folio, $data);

    sendJson([
        'success' => true,
        'order' => [
            'folio' => $folio,
            'status' => 'pendiente_pago',
            'amount' => ORDER_AMOUNT,
            'currency' => ORDER_CURRENCY,
        ],
        'checkout_url' => $checkoutUrl,
    ], 201);
}

function mercadoPagoRequest(string $method, string $path, ?array $body = null): ?array
{
    $token = (string) getConfigValue('MP_ACCESS_TOKEN', '');
    if ($token === '' || !function_exists('curl_init')) {
        return null;
    }

    $curl = curl_init('https://api.mercadopago.com' . $path);
    $headers = ['Authorization: Bearer ' . $token, 'Content-Type: application/json'];
    if ($body !== null) {
        $headers[] = 'X-Idempotency-Key: ' . bin2hex(random_bytes(12));
    }

    curl_setopt_array($curl, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => $body !== null ? json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
    ]);

    $response = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    if ($response === false || $status >= 400) {
        logApiError('orders:mercadopago_error', ['path' => $path, 'status' => $status]);
        return null;
    }

    $decoded = json_decode((string) $response, true);
    return is_array($decoded) ? $decoded : null;
}

/* Crea la preferencia de Checkout Pro. Sin token configurado devuelve null y el pedido queda pendiente de pago. */
function createMercadoPagoCheckout(PDO $pdo, string $folio, array $data): ?string
{
    $siteUrl = rtrim((string) getConfigValue('SITE_URL', ''), '/');
    $apiUrl = rtrim((string) getConfigValue('PUBLIC_API_URL', ''), '/');

    $preference = [
        'items' => [[
            'id' => 'invitarte-evento',
            'title' => ORDER_TITLE,
            'description' => $data['event_title'],
            'quantity' => 1,
            'unit_price' => ORDER_AMOUNT,
            'currency_id' => ORDER_CURRENCY,
        ]],
        'payer' => [
            'name' => $data['customer_name'],
            'email' => $data['customer_email'],
        ],
        'external_reference' => $folio,
        'statement_descriptor' => 'INVITARTE',
    ];

    if ($siteUrl !== '') {
        $preference['back_urls'] = [
            'success' => $siteUrl . '/?pago=aprobado',
            'pending' => $siteUrl . '/?pago=pendiente',
            'failure' => $siteUrl . '/?pago=rechazado',
        ];
        $preference['auto_return'] = 'approved';
    }

    if ($apiUrl !== '') {
        $preference['notification_url'] = $apiUrl . '/orders.php?action=webhook';
    }

    $result = mercadoPagoRequest('POST', '/checkout/preferences', $preference);
    if (!$result || empty($result['init_point'])) {
        return null;
    }

    $statement = $pdo->prepare('UPDATE invitarte_orders SET payment_provider = ?, payment_preference_id = ? WHERE folio = ?');
    $statement->execute(['mercadopago', (string) ($result['id'] ?? ''), $folio]);

    return (string) $result['init_point'];
}

function handlePaymentWebhook(PDO $pdo): void
{
    $body = readJsonInput();
    $type = (string) ($body['type'] ?? $_GET['type'] ?? $_GET['topic'] ?? '');
    $paymentId = (string) ($body['data']['id'] ?? $_GET['data_id'] ?? $_GET['id'] ?? '');

    if ($type !== 'payment' || !preg_match('/^\d+$/', $paymentId)) {
        sendJson(['success' => true, 'ignored' => true]);
    }

    // Fuente de verdad: el pago consultado directamente en Mercado Pago.
    $payment = mercadoPagoRequest('GET', '/v1/payments/' . $paymentId);
    if (!$payment) {
        sendJson(['success' => false, 'message' => 'No se pudo verificar el pago.'], 502);
    }

    $folio = (string) ($payment['external_reference'] ?? '');
    $status = (string) ($payment['status'] ?? '');
    $statusMap = [
        'approved' => 'pagado',
        'pending' => 'pago_en_proceso',
        'in_process' => 'pago_en_proceso',
        'rejected' => 'pago_rechazado',
        'cancelled' => 'pago_cancelado',
        'refunded' => 'reembolsado',
    ];

    if ($folio === '' || !isset($statusMap[$status])) {
        sendJson(['success' => true, 'ignored' => true]);
    }

    $amountPaid = (float) ($payment['transaction_amount'] ?? 0);
    if ($status === 'approved' && abs($amountPaid - ORDER_AMOUNT) > 0.01) {
        logApiError('orders:amount_mismatch', ['folio' => $folio, 'amount' => $amountPaid]);
        sendJson(['success' => false, 'message' => 'Monto no coincide.'], 409);
    }

    $statement = $pdo->prepare(
        'UPDATE invitarte_orders
            SET status = ?, payment_provider = \'mercadopago\', payment_reference = ?,
                paid_at = IF(? = \'pagado\', COALESCE(paid_at, NOW()), paid_at)
          WHERE folio = ?'
    );
    $statement->execute([$statusMap[$status], $paymentId, $statusMap[$status], $folio]);

    sendJson(['success' => true]);
}

function getOrderStatus(PDO $pdo): void
{
    $folio = strtoupper(preg_replace('/[^A-Za-z0-9-]/', '', (string) ($_GET['folio'] ?? '')) ?? '');
    if ($folio === '') {
        sendJson(['success' => false, 'message' => 'Folio requerido.'], 400);
    }

    $statement = $pdo->prepare('SELECT folio, status, amount, currency, created_at FROM invitarte_orders WHERE folio = ? LIMIT 1');
    $statement->execute([$folio]);
    $order = $statement->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        sendJson(['success' => false, 'message' => 'No encontramos ese folio.'], 404);
    }

    sendJson(['success' => true, 'order' => $order]);
}
