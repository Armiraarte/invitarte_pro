<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/event_portal_schema.php';
require_once __DIR__ . '/invitation_project_storage.php';

const EVENT_PORTAL_EXPIRATION_DAYS = 45;
const EVENT_PORTAL_ACCESS_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const EVENT_PORTAL_ACCESS_CODE_LENGTH = 10;

requireApiKey();

$pdo = getDbConnection();
ensureEventPortalSchema($pdo);

function normalizeAccessCode(string $value): string
{
    return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', trim($value)) ?? '');
}

function normalizeText(string $value): string
{
    return trim(preg_replace('/\s+/', ' ', $value) ?? '');
}

function generateRandomAccessCode(int $length = EVENT_PORTAL_ACCESS_CODE_LENGTH): string
{
    $alphabet = str_split(EVENT_PORTAL_ACCESS_CODE_ALPHABET);
    if ($length > count($alphabet)) {
        throw new RuntimeException('No hay suficientes caracteres unicos para generar el codigo.');
    }

    $code = '';
    for ($index = 0; $index < $length; $index += 1) {
        $randomIndex = random_int(0, count($alphabet) - 1);
        $code .= $alphabet[$randomIndex];
        array_splice($alphabet, $randomIndex, 1);
    }

    return $code;
}

function normalizeGuestStatus(?string $value): string
{
    $normalized = strtolower(normalizeText((string) $value));
    if (strpos($normalized, 'confirm') === 0) {
        return 'confirmado';
    }

    if (strpos($normalized, 'declin') === 0 || strpos($normalized, 'cancel') === 0) {
        return 'declinado';
    }

    return 'pendiente';
}

function guestStatusToInt(string $status): int
{
    switch (normalizeGuestStatus($status)) {
        case 'confirmado':
            return 1;
        case 'declinado':
            return 2;
        default:
            return 0;
    }
}

function guestStatusFromInt($status): string
{
    switch ((int) $status) {
        case 1:
            return 'confirmado';
        case 2:
            return 'declinado';
        default:
            return 'pendiente';
    }
}

function toIsoString(?string $value): ?string
{
    $trimmed = trim((string) $value);
    if ($trimmed === '') {
        return null;
    }

    try {
        return (new DateTimeImmutable($trimmed))->format(DateTimeInterface::ATOM);
    } catch (Throwable $error) {
        return null;
    }
}

function toMysqlDateTime(?string $value): ?string
{
    $trimmed = trim((string) $value);
    if ($trimmed === '') {
        return null;
    }

    try {
        return (new DateTimeImmutable($trimmed))->format('Y-m-d H:i:s');
    } catch (Throwable $error) {
        return null;
    }
}

function toDateInputString(?string $value): ?string
{
    $trimmed = trim((string) $value);
    if ($trimmed === '') {
        return null;
    }

    try {
        return (new DateTimeImmutable($trimmed))->format('Y-m-d');
    } catch (Throwable $error) {
        return null;
    }
}

function toDateTimeLocalString(?string $value): ?string
{
    $trimmed = trim((string) $value);
    if ($trimmed === '') {
        return null;
    }

    try {
        return (new DateTimeImmutable($trimmed))->format('Y-m-d\TH:i');
    } catch (Throwable $error) {
        return null;
    }
}

function addDaysToIso(string $value, int $days): string
{
    try {
        return (new DateTimeImmutable($value))->modify('+' . $days . ' days')->format(DateTimeInterface::ATOM);
    } catch (Throwable $error) {
        return (new DateTimeImmutable())->modify('+' . $days . ' days')->format(DateTimeInterface::ATOM);
    }
}

function buildDefaultShareUrl(string $eventCode): string
{
    return buildInvitationProjectLaunchUrl($eventCode);
}

function buildGuestUrl(string $shareUrl, string $eventCode, string $guestCode): string
{
    $baseUrl = trim($shareUrl) !== '' ? trim($shareUrl) : buildDefaultShareUrl($eventCode);
    $separator = strpos($baseUrl, '?') !== false ? '&' : '?';
    return $baseUrl . $separator . 'event=' . rawurlencode($eventCode) . '&guest=' . rawurlencode($guestCode);
}

function formatGuestRow(array $row, string $eventCode, string $shareUrl): array
{
    $guestCode = normalizeText((string) ($row['codigo_invitado'] ?? ''));
    $storedGuestUrl = normalizeText((string) ($row['guest_url'] ?? ''));
    $guestUrl = shouldRebuildInvitationProjectUrl($storedGuestUrl)
        ? buildGuestUrl($shareUrl, $eventCode, $guestCode)
        : $storedGuestUrl;

    return [
        'id' => (string) ($row['idInvitado'] ?? ''),
        'name' => normalizeText((string) ($row['nombre'] ?? 'Invitado')),
        'companions' => max(1, (int) ($row['pases_asignados'] ?? 1)),
        'group' => normalizeText((string) ($row['grupo'] ?? '')) ?: 'General',
        'tableLabel' => normalizeText((string) ($row['mesa_nombre'] ?? '')) ?: null,
        'guestCode' => $guestCode,
        'guestUrl' => $guestUrl,
        'email' => normalizeText((string) ($row['correo'] ?? '')) ?: null,
        'phone' => normalizeText((string) ($row['telefono'] ?? '')) ?: null,
        'status' => guestStatusFromInt($row['confirmacion_estatus'] ?? $row['estatus'] ?? 0),
        'checkedInAt' => toIsoString((string) ($row['checked_in_at'] ?? '')),
        'checkInCount' => max(0, (int) ($row['check_in_count'] ?? 0)),
        'note' => normalizeText((string) ($row['nota'] ?? '')) ?: null,
    ];
}

function decodeFeatureLabels(?string $value): array
{
    $trimmed = trim((string) $value);
    if ($trimmed === '') {
        return [];
    }

    $decoded = json_decode($trimmed, true);
    if (!is_array($decoded)) {
        return [];
    }

    $labels = [];
    foreach ($decoded as $label) {
        if (!is_string($label)) {
            continue;
        }

        $cleaned = normalizeText($label);
        if ($cleaned !== '') {
            $labels[] = $cleaned;
        }
    }

    return array_slice($labels, 0, 6);
}

function encodeFeatureLabels($value): string
{
    $labels = [];
    if (is_array($value)) {
        foreach ($value as $label) {
            if (!is_string($label)) {
                continue;
            }

            $cleaned = normalizeText($label);
            if ($cleaned !== '') {
                $labels[] = $cleaned;
            }
        }
    }

    return json_encode(array_slice($labels, 0, 6), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '[]';
}

function normalizeDateSource(string $value): string
{
    $replaced = strtr($value, [
        'Á' => 'A',
        'É' => 'E',
        'Í' => 'I',
        'Ó' => 'O',
        'Ú' => 'U',
        'Ü' => 'U',
        'á' => 'a',
        'é' => 'e',
        'í' => 'i',
        'ó' => 'o',
        'ú' => 'u',
        'ü' => 'u',
        '·' => ' ',
        '|' => ' ',
    ]);

    return strtolower(normalizeText($replaced));
}

function parseEventDateToMysql(?string $value): ?string
{
    $trimmed = trim((string) $value);
    if ($trimmed === '' || strtolower($trimmed) === 'fecha pendiente') {
        return null;
    }

    try {
        return (new DateTimeImmutable($trimmed))->format('Y-m-d H:i:s');
    } catch (Throwable $error) {
    }

    $normalized = normalizeDateSource($trimmed);

    if (preg_match('/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})(?:\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/', $normalized, $matches) === 1) {
        $day = (int) $matches[1];
        $month = (int) $matches[2];
        $year = strlen($matches[3]) === 2 ? 2000 + (int) $matches[3] : (int) $matches[3];
        $hour = isset($matches[4]) && $matches[4] !== '' ? (int) $matches[4] : 0;
        $minute = isset($matches[5]) && $matches[5] !== '' ? (int) $matches[5] : 0;
        $meridiem = $matches[6] ?? '';

        if ($meridiem === 'pm' && $hour < 12) {
            $hour += 12;
        }
        if ($meridiem === 'am' && $hour === 12) {
            $hour = 0;
        }

        return sprintf('%04d-%02d-%02d %02d:%02d:00', $year, $month, $day, $hour, $minute);
    }

    $monthMap = [
        'enero' => 1,
        'febrero' => 2,
        'marzo' => 3,
        'abril' => 4,
        'mayo' => 5,
        'junio' => 6,
        'julio' => 7,
        'agosto' => 8,
        'septiembre' => 9,
        'setiembre' => 9,
        'octubre' => 10,
        'noviembre' => 11,
        'diciembre' => 12,
    ];

    if (preg_match('/^(\d{1,2})\s*(?:de\s+)?([a-z]+)\s*(?:de\s+)?(\d{4})(?:\s+(?:a\s+las\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/', $normalized, $matches) === 1) {
        $day = (int) $matches[1];
        $month = $monthMap[$matches[2]] ?? 0;
        $year = (int) $matches[3];
        $hour = isset($matches[4]) && $matches[4] !== '' ? (int) $matches[4] : 0;
        $minute = isset($matches[5]) && $matches[5] !== '' ? (int) $matches[5] : 0;
        $meridiem = $matches[6] ?? '';

        if ($month <= 0) {
            return null;
        }

        if ($meridiem === 'pm' && $hour < 12) {
            $hour += 12;
        }
        if ($meridiem === 'am' && $hour === 12) {
            $hour = 0;
        }

        return sprintf('%04d-%02d-%02d %02d:%02d:00', $year, $month, $day, $hour, $minute);
    }

    return null;
}

function fetchEventRowByCode(PDO $pdo, string $code): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM evento WHERE codigo_evento = ? LIMIT 1');
    $stmt->execute([$code]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function listEventRows(PDO $pdo, int $limit = 80): array
{
    $safeLimit = max(1, min(200, $limit));
    $stmt = $pdo->query(
        'SELECT * FROM evento
        ORDER BY COALESCE(updated_at, created_at, fecha_evento) DESC, idEvento DESC
        LIMIT ' . $safeLimit
    );

    if (!$stmt) {
        return [];
    }

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return is_array($rows) ? $rows : [];
}

function fetchEventRowById(PDO $pdo, int $eventId): ?array
{
    if ($eventId <= 0) {
        return null;
    }

    $stmt = $pdo->prepare('SELECT * FROM evento WHERE idEvento = ? LIMIT 1');
    $stmt->execute([$eventId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function fetchInvitationEventLinkByEventId(PDO $pdo, int $eventId): ?array
{
    if ($eventId <= 0) {
        return null;
    }

    $stmt = $pdo->prepare('SELECT * FROM invitacion_evento WHERE idEvento = ? LIMIT 1');
    $stmt->execute([$eventId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function fetchInvitationEventLinkByEventCode(PDO $pdo, string $eventCode): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM invitacion_evento WHERE codigo_evento = ? LIMIT 1');
    $stmt->execute([$eventCode]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function fetchInvitationEventLinkByInvitationId(PDO $pdo, string $invitationId): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM invitacion_evento WHERE invitation_id = ? LIMIT 1');
    $stmt->execute([$invitationId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function normalizeLinkedDesignId(string $value, string $eventCode): string
{
    $normalized = normalizeText($value);
    if ($normalized === '') {
        return '';
    }

    if (strcasecmp($normalized, $eventCode) === 0) {
        return '';
    }

    if (stripos($normalized, 'manual-') === 0) {
        return '';
    }

    return $normalized;
}

function fetchEventRowByInvitationId(PDO $pdo, string $invitationId): ?array
{
    $linkRow = fetchInvitationEventLinkByInvitationId($pdo, $invitationId);
    if ($linkRow) {
        $eventRow = fetchEventRowById($pdo, (int) ($linkRow['idEvento'] ?? 0));
        if ($eventRow) {
            return $eventRow;
        }
    }

    $stmt = $pdo->prepare('SELECT * FROM evento WHERE invitation_id = ? LIMIT 1');
    $stmt->execute([$invitationId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function upsertInvitationEventLink(PDO $pdo, int $eventId, string $eventCode, array $record, array $eventRow): void
{
    if ($eventId <= 0 || $eventCode === '') {
        return;
    }

    $existingLink = fetchInvitationEventLinkByEventId($pdo, $eventId) ?? fetchInvitationEventLinkByEventCode($pdo, $eventCode);
    $designId = normalizeLinkedDesignId((string) ($record['designId'] ?? ''), $eventCode)
        ?: normalizeLinkedDesignId((string) ($existingLink['design_id'] ?? ''), $eventCode)
        ?: normalizeLinkedDesignId((string) ($eventRow['design_id'] ?? ''), $eventCode);
    $invitationId = normalizeText((string) ($record['invitationId'] ?? ''))
        ?: normalizeText((string) ($existingLink['invitation_id'] ?? ''))
        ?: normalizeText((string) ($eventRow['invitation_id'] ?? ''));
    $shareUrl = normalizeText((string) ($record['shareUrl'] ?? ''))
        ?: normalizeText((string) ($existingLink['share_url'] ?? ''))
        ?: normalizeText((string) ($eventRow['share_url'] ?? ''));
    if (shouldRebuildInvitationProjectUrl($shareUrl)) {
        $shareUrl = buildDefaultShareUrl($eventCode);
    }

    if ($existingLink) {
        $stmt = $pdo->prepare(
            'UPDATE invitacion_evento SET
                idEvento = ?,
                codigo_evento = ?,
                design_id = ?,
                invitation_id = ?,
                share_url = ?,
                updated_at = NOW()
            WHERE idInvitacionEvento = ?'
        );
        $stmt->execute([
            $eventId,
            $eventCode,
            $designId !== '' ? $designId : null,
            $invitationId !== '' ? $invitationId : null,
            $shareUrl,
            (int) ($existingLink['idInvitacionEvento'] ?? 0),
        ]);
        return;
    }

    $stmt = $pdo->prepare(
        'INSERT INTO invitacion_evento (
            idEvento,
            codigo_evento,
            design_id,
            invitation_id,
            share_url
        ) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $eventId,
        $eventCode,
        $designId !== '' ? $designId : null,
        $invitationId !== '' ? $invitationId : null,
        $shareUrl,
    ]);
}

function generateUniqueEventAccessCode(PDO $pdo, int $length = EVENT_PORTAL_ACCESS_CODE_LENGTH): string
{
    for ($attempt = 0; $attempt < 24; $attempt += 1) {
        $candidate = generateRandomAccessCode($length);
        if (fetchEventRowByCode($pdo, $candidate) === null) {
            return $candidate;
        }
    }

    throw new RuntimeException('No pudimos generar un codigo unico para el evento.');
}

function buildEventDateLabel(array $eventRow): string
{
    $textValue = normalizeText((string) ($eventRow['fecha_evento_texto'] ?? ''));
    if ($textValue !== '') {
        return $textValue;
    }

    $storedDate = trim((string) ($eventRow['fecha_evento'] ?? ''));
    if ($storedDate === '') {
        return 'Fecha pendiente';
    }

    try {
        return (new DateTimeImmutable($storedDate))->format('d/m/Y · H:i');
    } catch (Throwable $error) {
        return 'Fecha pendiente';
    }
}

function loadGuestsForEvent(PDO $pdo, int $eventId, string $eventCode, string $shareUrl): array
{
    $stmt = $pdo->prepare(
        'SELECT
            i.*,
            c.estatus AS confirmacion_estatus,
            m.nombre AS mesa_nombre
        FROM invitado i
        LEFT JOIN confirmaciones c ON c.idInvitado = i.idInvitado
        LEFT JOIN mesa_asignada ma ON ma.idInvitado = i.idInvitado
        LEFT JOIN mesa m ON m.idMesa = ma.idMesa
        WHERE i.idEvento = ?
        ORDER BY i.idInvitado ASC'
    );
    $stmt->execute([$eventId]);

    $guests = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $guests[] = formatGuestRow($row, $eventCode, $shareUrl);
    }

    return $guests;
}

function loadGuestForEventByCode(PDO $pdo, int $eventId, string $eventCode, string $shareUrl, string $guestCode): ?array
{
    $stmt = $pdo->prepare(
        'SELECT
            i.*,
            c.estatus AS confirmacion_estatus,
            m.nombre AS mesa_nombre
        FROM invitado i
        LEFT JOIN confirmaciones c ON c.idInvitado = i.idInvitado
        LEFT JOIN mesa_asignada ma ON ma.idInvitado = i.idInvitado
        LEFT JOIN mesa m ON m.idMesa = ma.idMesa
        WHERE i.idEvento = ? AND i.codigo_invitado = ?
        LIMIT 1'
    );
    $stmt->execute([$eventId, $guestCode]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        return null;
    }

    return formatGuestRow($row, $eventCode, $shareUrl);
}

function resolveShareUrlForEvent(PDO $pdo, array $eventRow, string $eventCode): string
{
    $linkRow = fetchInvitationEventLinkByEventId($pdo, (int) ($eventRow['idEvento'] ?? 0))
        ?? fetchInvitationEventLinkByEventCode($pdo, $eventCode);
    $shareUrl = normalizeText((string) ($linkRow['share_url'] ?? ''))
        ?: normalizeText((string) ($eventRow['share_url'] ?? ''));
    if (shouldRebuildInvitationProjectUrl($shareUrl)) {
        $shareUrl = buildDefaultShareUrl($eventCode);
    }

    return $shareUrl;
}

function buildGuestAccessPayload(PDO $pdo, array $eventRow, string $eventCode, array $guest): array
{
    return [
        'event' => [
            'code' => $eventCode,
            'eventTitle' => normalizeText((string) ($eventRow['nombre_evento'] ?? '')) ?: 'Evento sin titulo',
            'hostName' => normalizeText((string) ($eventRow['host_name'] ?? '')) ?: 'Anfitrion por definir',
            'eventDate' => buildEventDateLabel($eventRow),
            'eventDateValue' => toDateTimeLocalString((string) ($eventRow['fecha_evento'] ?? '')) ?: '',
            'venue' => normalizeText((string) ($eventRow['lugar'] ?? '')) ?: 'Lugar por confirmar',
            'venueMapsUrl' => normalizeText((string) ($eventRow['maps_url'] ?? '')),
            'shareUrl' => resolveShareUrlForEvent($pdo, $eventRow, $eventCode),
        ],
        'guest' => $guest,
    ];
}

function buildEventRecord(PDO $pdo, array $eventRow, bool $includeGuests = true): array
{
    $code = normalizeAccessCode((string) ($eventRow['codigo_evento'] ?? ''));
    $linkRow = fetchInvitationEventLinkByEventId($pdo, (int) ($eventRow['idEvento'] ?? 0))
        ?? fetchInvitationEventLinkByEventCode($pdo, $code);
    $invitationId = normalizeText((string) ($linkRow['invitation_id'] ?? ''))
        ?: normalizeText((string) ($eventRow['invitation_id'] ?? ''))
        ?: null;
    $shareUrl = normalizeText((string) ($linkRow['share_url'] ?? ''))
        ?: normalizeText((string) ($eventRow['share_url'] ?? ''));
    if (shouldRebuildInvitationProjectUrl($shareUrl)) {
        $shareUrl = buildDefaultShareUrl($code);
    }
    $designId = normalizeLinkedDesignId((string) ($linkRow['design_id'] ?? ''), $code)
        ?: normalizeLinkedDesignId((string) ($eventRow['design_id'] ?? ''), $code)
        ?: $code;
    $createdAt = toIsoString((string) ($eventRow['created_at'] ?? ''))
        ?? toIsoString(trim((string) ($eventRow['fecha_creacion'] ?? '')) . ' 00:00:00')
        ?? (new DateTimeImmutable())->format(DateTimeInterface::ATOM);
    $updatedAt = toIsoString((string) ($eventRow['updated_at'] ?? '')) ?? $createdAt;
    $expiresAt = toIsoString((string) ($eventRow['expires_at'] ?? '')) ?? addDaysToIso($updatedAt, EVENT_PORTAL_EXPIRATION_DAYS);

    return [
        'code' => $code,
        'invitationId' => $invitationId,
        'designId' => $designId,
        'packageId' => normalizeText((string) ($eventRow['package_id'] ?? '')) ?: 'ORO',
        'eventTitle' => normalizeText((string) ($eventRow['nombre_evento'] ?? '')) ?: 'Evento sin titulo',
        'hostName' => normalizeText((string) ($eventRow['host_name'] ?? '')) ?: 'Anfitrion por definir',
        'eventDate' => buildEventDateLabel($eventRow),
        'eventDateValue' => toDateTimeLocalString((string) ($eventRow['fecha_evento'] ?? '')) ?: '',
        'venue' => normalizeText((string) ($eventRow['lugar'] ?? '')) ?: 'Lugar por confirmar',
        'venueMapsUrl' => normalizeText((string) ($eventRow['maps_url'] ?? '')),
        'status' => normalizeText((string) ($eventRow['estatus'] ?? '')) ?: 'activo',
        'createdDate' => trim((string) ($eventRow['fecha_creacion'] ?? '')) ?: (toDateInputString((string) ($eventRow['created_at'] ?? '')) ?: ''),
        'shareUrl' => $shareUrl,
        'featureLabels' => decodeFeatureLabels((string) ($eventRow['feature_labels_json'] ?? '')),
        'guests' => $includeGuests ? loadGuestsForEvent($pdo, (int) ($eventRow['idEvento'] ?? 0), $code, $shareUrl) : [],
        'expiresAt' => $expiresAt,
        'createdAt' => $createdAt,
        'updatedAt' => $updatedAt,
    ];
}

function upsertEventRow(PDO $pdo, array $record): array
{
    $code = normalizeAccessCode((string) ($record['code'] ?? ''));
    if ($code === '') {
        $code = generateUniqueEventAccessCode($pdo);
    }

    $existingRow = fetchEventRowByCode($pdo, $code);
    $existingLink = $existingRow
        ? (fetchInvitationEventLinkByEventId($pdo, (int) ($existingRow['idEvento'] ?? 0)) ?? fetchInvitationEventLinkByEventCode($pdo, $code))
        : fetchInvitationEventLinkByEventCode($pdo, $code);
    $invitationId = normalizeText((string) ($record['invitationId'] ?? ''))
        ?: normalizeText((string) ($existingLink['invitation_id'] ?? ''))
        ?: normalizeText((string) ($existingRow['invitation_id'] ?? ''));
    $now = new DateTimeImmutable();
    $createdDateValue = trim((string) ($record['createdDate'] ?? ''));
    $createdAtSql = toMysqlDateTime((string) ($record['createdAt'] ?? ''))
        ?? ($createdDateValue !== '' ? toMysqlDateTime($createdDateValue . 'T00:00:00') : null)
        ?? ($existingRow['created_at'] ?? null)
        ?? $now->format('Y-m-d H:i:s');
    $updatedAtSql = toMysqlDateTime((string) ($record['updatedAt'] ?? '')) ?? $now->format('Y-m-d H:i:s');
    $eventDateLabel = normalizeText((string) ($record['eventDate'] ?? ''));
    $eventDateSource = normalizeText((string) ($record['eventDateValue'] ?? '')) ?: $eventDateLabel;
    $eventDateSql = parseEventDateToMysql($eventDateSource)
        ?? (!empty($existingRow['fecha_evento']) ? (string) $existingRow['fecha_evento'] : $now->format('Y-m-d H:i:s'));
    $expiresAtSql = toMysqlDateTime((string) ($record['expiresAt'] ?? ''))
        ?? (!empty($existingRow['expires_at']) ? (string) $existingRow['expires_at'] : null);

    if ($eventDateLabel === '' && $eventDateSql !== '') {
        try {
            $eventDateLabel = (new DateTimeImmutable($eventDateSql))->format('d/m/Y · H:i');
        } catch (Throwable $error) {
            $eventDateLabel = 'Fecha pendiente';
        }
    }

    if ($expiresAtSql === null) {
        $expiresAtSql = (new DateTimeImmutable($updatedAtSql))->modify('+' . EVENT_PORTAL_EXPIRATION_DAYS . ' days')->format('Y-m-d H:i:s');
    }

    $payload = [
        'nombre_evento' => normalizeText((string) ($record['eventTitle'] ?? '')) ?: 'Evento sin titulo',
        'host_name' => normalizeText((string) ($record['hostName'] ?? '')) ?: 'Anfitrion por definir',
        'fecha_evento' => $eventDateSql,
        'fecha_evento_texto' => $eventDateLabel !== '' ? $eventDateLabel : 'Fecha pendiente',
        'lugar' => normalizeText((string) ($record['venue'] ?? '')) ?: 'Lugar por confirmar',
        'maps_url' => normalizeText((string) ($record['venueMapsUrl'] ?? '')) ?: null,
        'design_id' => normalizeText((string) ($record['designId'] ?? ''))
            ?: normalizeText((string) ($existingLink['design_id'] ?? ''))
            ?: $code,
        'invitation_id' => $invitationId !== '' ? $invitationId : null,
        'package_id' => normalizeText((string) ($record['packageId'] ?? '')) ?: 'ORO',
        'share_url' => normalizeText((string) ($record['shareUrl'] ?? ''))
            ?: normalizeText((string) ($existingLink['share_url'] ?? ''))
            ?: buildDefaultShareUrl($invitationId !== '' ? $invitationId : $code),
        'feature_labels_json' => encodeFeatureLabels($record['featureLabels'] ?? []),
        'estatus' => normalizeText((string) ($record['status'] ?? 'activo')) ?: 'activo',
        'fecha_creacion' => (new DateTimeImmutable($createdAtSql))->format('Y-m-d'),
        'created_at' => $createdAtSql,
        'updated_at' => $updatedAtSql,
        'expires_at' => $expiresAtSql,
    ];

    if ($existingRow) {
        $stmt = $pdo->prepare(
            'UPDATE evento SET
                nombre_evento = ?,
                host_name = ?,
                fecha_evento = ?,
                fecha_evento_texto = ?,
                lugar = ?,
                maps_url = ?,
                design_id = ?,
                invitation_id = ?,
                package_id = ?,
                share_url = ?,
                feature_labels_json = ?,
                estatus = ?,
                fecha_creacion = ?,
                created_at = ?,
                updated_at = ?,
                expires_at = ?
            WHERE idEvento = ?'
        );
        $stmt->execute([
            $payload['nombre_evento'],
            $payload['host_name'],
            $payload['fecha_evento'],
            $payload['fecha_evento_texto'],
            $payload['lugar'],
            $payload['maps_url'],
            $payload['design_id'],
            $payload['invitation_id'],
            $payload['package_id'],
            $payload['share_url'],
            $payload['feature_labels_json'],
            $payload['estatus'],
            $payload['fecha_creacion'],
            $payload['created_at'],
            $payload['updated_at'],
            $payload['expires_at'],
            (int) $existingRow['idEvento'],
        ]);
    } else {
        $stmt = $pdo->prepare(
            'INSERT INTO evento (
                codigo_evento,
                nombre_evento,
                host_name,
                fecha_evento,
                fecha_evento_texto,
                lugar,
                maps_url,
                design_id,
                invitation_id,
                package_id,
                share_url,
                feature_labels_json,
                estatus,
                fecha_creacion,
                created_at,
                updated_at,
                expires_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $code,
            $payload['nombre_evento'],
            $payload['host_name'],
            $payload['fecha_evento'],
            $payload['fecha_evento_texto'],
            $payload['lugar'],
            $payload['maps_url'],
            $payload['design_id'],
            $payload['invitation_id'],
            $payload['package_id'],
            $payload['share_url'],
            $payload['feature_labels_json'],
            $payload['estatus'],
            $payload['fecha_creacion'],
            $payload['created_at'],
            $payload['updated_at'],
            $payload['expires_at'],
        ]);
    }

    $freshRow = fetchEventRowByCode($pdo, $code);
    if (!$freshRow) {
        throw new RuntimeException('No pudimos recuperar el evento actualizado.');
    }

    return $freshRow;
}

function syncConfirmationStatus(PDO $pdo, int $guestId, int $status): void
{
    $stmt = $pdo->prepare(
        'INSERT INTO confirmaciones (idInvitado, estatus) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE estatus = VALUES(estatus)'
    );
    $stmt->execute([$guestId, $status]);
}

function deleteByGuestIds(PDO $pdo, string $table, array $guestIds): void
{
    if (empty($guestIds)) {
        return;
    }

    $placeholders = implode(',', array_fill(0, count($guestIds), '?'));
    $sql = sprintf('DELETE FROM `%s` WHERE idInvitado IN (%s)', $table, $placeholders);
    $stmt = $pdo->prepare($sql);
    $stmt->execute($guestIds);
}

function getOrCreateMesaId(PDO $pdo, int $eventId, string $tableLabel): int
{
    $cleanLabel = normalizeText($tableLabel);
    if ($cleanLabel === '') {
        throw new InvalidArgumentException('Nombre de mesa inválido.');
    }

    $selectStmt = $pdo->prepare('SELECT idMesa FROM mesa WHERE idEvento = ? AND nombre = ? LIMIT 1');
    $selectStmt->execute([$eventId, $cleanLabel]);
    $existingId = $selectStmt->fetchColumn();
    if ($existingId !== false) {
        return (int) $existingId;
    }

    $insertStmt = $pdo->prepare('INSERT INTO mesa (idEvento, nombre, descripcion, estatus) VALUES (?, ?, ?, 1)');
    $insertStmt->execute([$eventId, $cleanLabel, $cleanLabel]);

    return (int) $pdo->lastInsertId();
}

function syncGuests(PDO $pdo, int $eventId, string $eventCode, string $shareUrl, array $guests): void
{
    $existingStmt = $pdo->prepare('SELECT idInvitado, codigo_invitado FROM invitado WHERE idEvento = ?');
    $existingStmt->execute([$eventId]);

    $existingGuestIdsByCode = [];
    $existingGuestIds = [];
    while ($existingRow = $existingStmt->fetch(PDO::FETCH_ASSOC)) {
        $guestCode = normalizeText((string) ($existingRow['codigo_invitado'] ?? ''));
        $guestId = (int) ($existingRow['idInvitado'] ?? 0);
        if ($guestCode !== '' && $guestId > 0) {
            $existingGuestIdsByCode[$guestCode] = $guestId;
            $existingGuestIds[] = $guestId;
        }
    }

    $seenGuestIds = [];
    $tableAssignments = [];
    $submittedGuestCodes = [];

    foreach ($guests as $index => $guest) {
        if (!is_array($guest)) {
            continue;
        }

        $guestCode = normalizeText((string) ($guest['guestCode'] ?? ''));
        if ($guestCode === '') {
            sendJson([
                'success' => false,
                'message' => 'Cada invitado debe incluir guestCode.',
            ], 400);
        }

        if (strpos($guestCode, $eventCode . '-') !== 0) {
            sendJson([
                'success' => false,
                'message' => 'Cada guestCode debe pertenecer al evento activo.',
            ], 400);
        }

        if (isset($submittedGuestCodes[$guestCode])) {
            sendJson([
                'success' => false,
                'message' => 'La carga incluye guestCode repetidos dentro del mismo evento.',
            ], 400);
        }
        $submittedGuestCodes[$guestCode] = true;

        $name = normalizeText((string) ($guest['name'] ?? '')) ?: ('Invitado ' . ($index + 1));
        $group = normalizeText((string) ($guest['group'] ?? '')) ?: 'General';
        $companions = max(1, (int) ($guest['companions'] ?? 1));
        $phone = normalizeText((string) ($guest['phone'] ?? ''));
        $email = normalizeText((string) ($guest['email'] ?? ''));
        $status = guestStatusToInt((string) ($guest['status'] ?? 'pendiente'));
        $note = normalizeText((string) ($guest['note'] ?? ''));
        $tableLabel = normalizeText((string) ($guest['tableLabel'] ?? ''));
        $guestUrl = normalizeText((string) ($guest['guestUrl'] ?? ''));
        if (shouldRebuildInvitationProjectUrl($guestUrl)) {
            $guestUrl = buildGuestUrl($shareUrl, $eventCode, $guestCode);
        }
        $checkedInAt = toMysqlDateTime((string) ($guest['checkedInAt'] ?? ''));
        $checkInCount = max(0, (int) ($guest['checkInCount'] ?? 0));

        $existingGuestId = $existingGuestIdsByCode[$guestCode] ?? null;
        if ($existingGuestId !== null) {
            $updateStmt = $pdo->prepare(
                'UPDATE invitado SET
                    guest_url = ?,
                    nombre = ?,
                    grupo = ?,
                    telefono = ?,
                    correo = ?,
                    pases_asignados = ?,
                    estatus = ?,
                    nota = ?,
                    checked_in_at = ?,
                    check_in_count = ?,
                    updated_at = NOW()
                WHERE idInvitado = ?'
            );
            $updateStmt->execute([
                $guestUrl,
                $name,
                $group,
                $phone,
                $email,
                $companions,
                $status,
                $note !== '' ? $note : null,
                $checkedInAt,
                $checkInCount,
                $existingGuestId,
            ]);
            $guestId = (int) $existingGuestId;
        } else {
            $insertStmt = $pdo->prepare(
                'INSERT INTO invitado (
                    idEvento,
                    codigo_invitado,
                    guest_url,
                    nombre,
                    grupo,
                    telefono,
                    correo,
                    pases_asignados,
                    estatus,
                    nota,
                    checked_in_at,
                    check_in_count,
                    fecha_creacion
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())'
            );
            $insertStmt->execute([
                $eventId,
                $guestCode,
                $guestUrl,
                $name,
                $group,
                $phone,
                $email,
                $companions,
                $status,
                $note !== '' ? $note : null,
                $checkedInAt,
                $checkInCount,
            ]);
            $guestId = (int) $pdo->lastInsertId();
        }

        $seenGuestIds[] = $guestId;
        syncConfirmationStatus($pdo, $guestId, $status);

        if ($tableLabel !== '') {
            $tableAssignments[$guestId] = $tableLabel;
        }
    }

    $missingGuestIds = array_values(array_diff($existingGuestIds, $seenGuestIds));
    deleteByGuestIds($pdo, 'confirmaciones', $missingGuestIds);
    deleteByGuestIds($pdo, 'mesa_asignada', $missingGuestIds);
    if (!empty($missingGuestIds)) {
        $placeholders = implode(',', array_fill(0, count($missingGuestIds), '?'));
        $deleteGuestsStmt = $pdo->prepare("DELETE FROM invitado WHERE idInvitado IN ({$placeholders})");
        $deleteGuestsStmt->execute($missingGuestIds);
    }

    $deleteAssignmentsStmt = $pdo->prepare(
        'DELETE ma FROM mesa_asignada ma
        INNER JOIN invitado i ON i.idInvitado = ma.idInvitado
        WHERE i.idEvento = ?'
    );
    $deleteAssignmentsStmt->execute([$eventId]);

    foreach ($tableAssignments as $guestId => $tableLabel) {
        $mesaId = getOrCreateMesaId($pdo, $eventId, $tableLabel);
        $insertAssignmentStmt = $pdo->prepare('INSERT INTO mesa_asignada (idMesa, idInvitado) VALUES (?, ?)');
        $insertAssignmentStmt->execute([$mesaId, $guestId]);
    }

    $cleanupMesasStmt = $pdo->prepare(
        'DELETE m FROM mesa m
        LEFT JOIN mesa_asignada ma ON ma.idMesa = m.idMesa
        WHERE m.idEvento = ? AND ma.idMesa IS NULL'
    );
    $cleanupMesasStmt->execute([$eventId]);
}

function registerGuestCheckIn(PDO $pdo, string $eventCode, string $guestCode): array
{
    $normalizedEventCode = normalizeAccessCode($eventCode);
    $normalizedGuestCode = normalizeText($guestCode);
    if ($normalizedEventCode === '' || $normalizedGuestCode === '') {
        sendJson([
            'success' => false,
            'message' => 'code y guestCode son requeridos',
        ], 400);
    }

    $eventRow = fetchEventRowByCode($pdo, $normalizedEventCode);
    if (!$eventRow) {
        sendJson([
            'success' => false,
            'message' => 'Evento no encontrado',
        ], 404);
    }

    $guestStmt = $pdo->prepare('SELECT idInvitado FROM invitado WHERE idEvento = ? AND codigo_invitado = ? LIMIT 1');
    $guestStmt->execute([(int) $eventRow['idEvento'], $normalizedGuestCode]);
    $guestId = $guestStmt->fetchColumn();
    if ($guestId === false) {
        sendJson([
            'success' => false,
            'message' => 'Invitado no encontrado',
        ], 404);
    }

    $updateStmt = $pdo->prepare(
        'UPDATE invitado SET
            checked_in_at = NOW(),
            check_in_count = COALESCE(check_in_count, 0) + 1,
            updated_at = NOW()
        WHERE idInvitado = ?'
    );
    $updateStmt->execute([(int) $guestId]);

    $refreshRow = fetchEventRowByCode($pdo, $normalizedEventCode);
    if (!$refreshRow) {
        throw new RuntimeException('No pudimos recuperar el evento después del check-in.');
    }

    $record = buildEventRecord($pdo, $refreshRow);
    $updatedGuest = null;
    foreach ($record['guests'] as $guest) {
        if (($guest['guestCode'] ?? '') === $normalizedGuestCode) {
            $updatedGuest = $guest;
            break;
        }
    }

    return [
        'record' => $record,
        'updatedGuest' => $updatedGuest,
    ];
}

function registerGuestRsvp(PDO $pdo, string $eventCode, string $guestCode, bool $confirmed): array
{
    $normalizedEventCode = normalizeAccessCode($eventCode);
    $normalizedGuestCode = normalizeText($guestCode);
    if ($normalizedEventCode === '' || $normalizedGuestCode === '') {
        sendJson([
            'success' => false,
            'message' => 'code y guestCode son requeridos',
        ], 400);
    }

    $eventRow = fetchEventRowByCode($pdo, $normalizedEventCode);
    if (!$eventRow) {
        sendJson([
            'success' => false,
            'message' => 'Evento no encontrado',
        ], 404);
    }

    $shareUrl = resolveShareUrlForEvent($pdo, $eventRow, $normalizedEventCode);
    $guest = loadGuestForEventByCode($pdo, (int) ($eventRow['idEvento'] ?? 0), $normalizedEventCode, $shareUrl, $normalizedGuestCode);
    if ($guest === null) {
        sendJson([
            'success' => false,
            'message' => 'Invitado no encontrado',
        ], 404);
    }

    $guestId = (int) ($guest['id'] ?? 0);
    if ($guestId <= 0) {
        throw new RuntimeException('No pudimos identificar el invitado para guardar la confirmacion.');
    }

    $status = $confirmed ? 1 : 2;

    $updateStmt = $pdo->prepare(
        'UPDATE invitado SET
            estatus = ?,
            updated_at = NOW()
        WHERE idInvitado = ?'
    );
    $updateStmt->execute([$status, $guestId]);
    syncConfirmationStatus($pdo, $guestId, $status);

    $updatedGuest = loadGuestForEventByCode($pdo, (int) ($eventRow['idEvento'] ?? 0), $normalizedEventCode, $shareUrl, $normalizedGuestCode);
    if ($updatedGuest === null) {
        throw new RuntimeException('No pudimos recuperar el invitado actualizado.');
    }

    return buildGuestAccessPayload($pdo, $eventRow, $normalizedEventCode, $updatedGuest);
}

$action = strtolower(trim((string) ($_GET['action'] ?? 'fetch')));

switch ($action) {
    case 'list':
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 80;
        $rows = listEventRows($pdo, $limit);
        $records = [];

        foreach ($rows as $row) {
            $records[] = buildEventRecord($pdo, $row, false);
        }

        sendJson([
            'success' => true,
            'records' => $records,
        ]);
        break;

    case 'fetch':
        $code = normalizeAccessCode((string) ($_GET['code'] ?? ''));
        $invitationId = normalizeText((string) ($_GET['invitationId'] ?? ''));
        $includeGuestsRaw = strtolower(trim((string) ($_GET['includeGuests'] ?? '1')));
        $includeGuests = !in_array($includeGuestsRaw, ['0', 'false', 'no'], true);
        if ($code === '' && $invitationId === '') {
            sendJson([
                'success' => false,
                'message' => 'code o invitationId es requerido',
            ], 400);
        }

        $eventRow = $code !== '' ? fetchEventRowByCode($pdo, $code) : fetchEventRowByInvitationId($pdo, $invitationId);
        sendJson([
            'success' => true,
            'record' => $eventRow ? buildEventRecord($pdo, $eventRow, $includeGuests) : null,
        ]);
        break;

    case 'guest-access':
    case 'guest_access':
        $eventCode = normalizeAccessCode((string) ($_GET['code'] ?? $_GET['event'] ?? ''));
        $guestCode = normalizeText((string) ($_GET['guestCode'] ?? $_GET['guest'] ?? ''));
        if ($eventCode === '' || $guestCode === '') {
            sendJson([
                'success' => false,
                'message' => 'code/event y guestCode/guest son requeridos',
            ], 400);
        }

        $eventRow = fetchEventRowByCode($pdo, $eventCode);
        if (!$eventRow) {
            sendJson([
                'success' => false,
                'message' => 'Evento no encontrado',
            ], 404);
        }

        $shareUrl = resolveShareUrlForEvent($pdo, $eventRow, $eventCode);
        $guest = loadGuestForEventByCode($pdo, (int) ($eventRow['idEvento'] ?? 0), $eventCode, $shareUrl, $guestCode);
        if ($guest === null) {
            sendJson([
                'success' => false,
                'message' => 'Invitado no encontrado',
            ], 404);
        }

        sendJson([
            'success' => true,
            'guestAccess' => buildGuestAccessPayload($pdo, $eventRow, $eventCode, $guest),
        ]);
        break;

    case 'rsvp':
        $payload = readJsonInput();
        $confirmed = filter_var($payload['confirmed'] ?? null, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($confirmed === null) {
            sendJson([
                'success' => false,
                'message' => 'confirmed es requerido',
            ], 400);
        }

        $pdo->beginTransaction();
        try {
            $guestAccess = registerGuestRsvp(
                $pdo,
                (string) ($payload['code'] ?? ''),
                (string) ($payload['guestCode'] ?? ''),
                $confirmed
            );
            $pdo->commit();
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $error;
        }

        sendJson([
            'success' => true,
            'guestAccess' => $guestAccess,
        ]);
        break;

    case 'upsert':
        $payload = readJsonInput();
        $record = $payload['record'] ?? null;
        if (!is_array($record)) {
            sendJson([
                'success' => false,
                'message' => 'record es requerido',
            ], 400);
        }

        $syncGuestsFlag = filter_var($payload['syncGuests'] ?? true, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        $shouldSyncGuests = $syncGuestsFlag !== false;

        $pdo->beginTransaction();
        try {
            $eventRow = upsertEventRow($pdo, $record);
            upsertInvitationEventLink(
                $pdo,
                (int) ($eventRow['idEvento'] ?? 0),
                normalizeAccessCode((string) ($eventRow['codigo_evento'] ?? '')),
                $record,
                $eventRow
            );
            if ($shouldSyncGuests && array_key_exists('guests', $record) && is_array($record['guests'])) {
                $eventCode = normalizeAccessCode((string) ($eventRow['codigo_evento'] ?? ''));
                $linkRow = fetchInvitationEventLinkByEventId($pdo, (int) ($eventRow['idEvento'] ?? 0))
                    ?? fetchInvitationEventLinkByEventCode($pdo, $eventCode);
                $shareUrl = normalizeText((string) ($linkRow['share_url'] ?? ''))
                    ?: normalizeText((string) ($eventRow['share_url'] ?? ''));
                if (shouldRebuildInvitationProjectUrl($shareUrl)) {
                    $shareUrl = buildDefaultShareUrl($eventCode);
                }
                syncGuests($pdo, (int) $eventRow['idEvento'], $eventCode, $shareUrl, $record['guests']);
            }
            $pdo->commit();
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $error;
        }

        $freshRow = fetchEventRowByCode($pdo, normalizeAccessCode((string) ($eventRow['codigo_evento'] ?? '')));
        if (!$freshRow) {
            throw new RuntimeException('No pudimos recuperar el evento actualizado.');
        }

        sendJson([
            'success' => true,
            'record' => buildEventRecord($pdo, $freshRow),
        ]);
        break;

    case 'checkin':
        $payload = readJsonInput();
        $pdo->beginTransaction();
        try {
            $result = registerGuestCheckIn(
                $pdo,
                (string) ($payload['code'] ?? ''),
                (string) ($payload['guestCode'] ?? '')
            );
            $pdo->commit();
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $error;
        }

        sendJson([
            'success' => true,
            'record' => $result['record'],
            'updatedGuest' => $result['updatedGuest'],
        ]);
        break;

    default:
        sendJson([
            'success' => false,
            'message' => 'Acción no soportada',
        ], 400);
}
