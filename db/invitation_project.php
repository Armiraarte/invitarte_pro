<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/event_portal_schema.php';
require_once __DIR__ . '/invitation_project_storage.php';

requireApiKey();

$pdo = getDbConnection();
ensureEventPortalSchema($pdo);

function fetchEventRowByCodeForProject(PDO $pdo, string $code): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM evento WHERE codigo_evento = ? LIMIT 1');
    $stmt->execute([$code]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function fetchInvitationProjectLink(PDO $pdo, string $code): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM invitacion_evento WHERE codigo_evento = ? LIMIT 1');
    $stmt->execute([$code]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function normalizeInvitationProjectDesignId(string $value, string $code): string
{
    $normalized = trim($value);
    if ($normalized === '' || strcasecmp($normalized, $code) === 0 || stripos($normalized, 'manual-') === 0) {
        return '';
    }

    return $normalized;
}

function upsertInvitationProjectLinkRecord(PDO $pdo, array $eventRow, string $code, array $projectData): array
{
    $eventId = (int) ($eventRow['idEvento'] ?? 0);
    if ($eventId <= 0) {
        throw new RuntimeException('Evento inválido para vincular proyecto.');
    }

    $existing = fetchInvitationProjectLink($pdo, $code);
    $designId = normalizeInvitationProjectDesignId((string) ($existing['design_id'] ?? ''), $code);
    $invitationId = trim((string) ($existing['invitation_id'] ?? ($eventRow['invitation_id'] ?? '')));
    $shareUrl = trim((string) ($existing['share_url'] ?? ($eventRow['share_url'] ?? '')));
    if (shouldRebuildInvitationProjectUrl($shareUrl)) {
        $shareUrl = buildInvitationProjectLaunchUrl($code);
    }

    if ($existing) {
        $stmt = $pdo->prepare(
            'UPDATE invitacion_evento SET
                idEvento = ?,
                codigo_evento = ?,
                design_id = ?,
                invitation_id = ?,
                share_url = ?,
                project_path = ?,
                app_entry = ?,
                template_source = ?,
                updated_at = NOW()
            WHERE idInvitacionEvento = ?'
        );
        $stmt->execute([
            $eventId,
            $code,
            $designId !== '' ? $designId : null,
            $invitationId !== '' ? $invitationId : null,
            $shareUrl,
            $projectData['project_path'],
            $projectData['app_entry'],
            $projectData['template_source'],
            (int) ($existing['idInvitacionEvento'] ?? 0),
        ]);
    } else {
        $stmt = $pdo->prepare(
            'INSERT INTO invitacion_evento (
                idEvento,
                codigo_evento,
                design_id,
                invitation_id,
                share_url,
                project_path,
                app_entry,
                template_source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $eventId,
            $code,
            $designId !== '' ? $designId : null,
            $invitationId !== '' ? $invitationId : null,
            $shareUrl,
            $projectData['project_path'],
            $projectData['app_entry'],
            $projectData['template_source'],
        ]);
    }

    $fresh = fetchInvitationProjectLink($pdo, $code);
    if (!$fresh) {
        throw new RuntimeException('No pudimos recuperar el vínculo del proyecto.');
    }

    return $fresh;
}

function buildProjectLinkResponse(array $eventRow, array $linkRow, string $projectAbsolutePath): array
{
    $templateKind = resolveInvitationProjectTemplateKind($projectAbsolutePath);
    $runtimeAppEntry = buildInvitationAppEntryRelativePath((string) ($linkRow['codigo_evento'] ?? ''), $templateKind);
    $runtimeTemplateSource = buildInvitationTemplateSourceRelativePath($templateKind);
    $appEntryAbsolutePath = buildInvitationProjectSourceAbsolutePath($projectAbsolutePath);
    $metadataAbsolutePath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'project.meta.json';
    $distAbsolutePath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'dist';
    $previewAbsolutePath = $distAbsolutePath . DIRECTORY_SEPARATOR . 'index.html';
    $eventCode = (string) ($linkRow['codigo_evento'] ?? '');
    $publicPreviewAbsolutePath = buildInvitationProjectPublicPreviewEntryAbsolutePath($eventCode);

    $runtimeShareUrl = buildInvitationProjectLaunchUrl($eventCode);

    if (is_file($previewAbsolutePath) && !is_file($publicPreviewAbsolutePath)) {
        syncInvitationProjectPublicPreview($eventCode, $projectAbsolutePath);
    }

    return [
        'eventCode' => $eventCode,
        'eventId' => (int) ($eventRow['idEvento'] ?? 0),
        'projectPath' => (string) ($linkRow['project_path'] ?? ''),
        'appEntry' => $runtimeAppEntry,
        'templateSource' => $runtimeTemplateSource,
        'designId' => trim((string) ($linkRow['design_id'] ?? '')) ?: null,
        'invitationId' => trim((string) ($linkRow['invitation_id'] ?? '')) ?: null,
        'shareUrl' => $runtimeShareUrl,
        'projectExists' => is_dir($projectAbsolutePath),
        'appEntryExists' => is_file($appEntryAbsolutePath),
        'metadataExists' => is_file($metadataAbsolutePath),
        'projectAbsolutePath' => $projectAbsolutePath,
        'appEntryAbsolutePath' => $appEntryAbsolutePath,
        'metadataAbsolutePath' => $metadataAbsolutePath,
        'distPath' => buildInvitationProjectDistRelativePath($eventCode),
        'distAbsolutePath' => $distAbsolutePath,
        'previewUrl' => is_file($publicPreviewAbsolutePath) ? buildWorkspacePublicUrl(buildInvitationProjectPreviewEntryRelativePath($eventCode)) : null,
        'previewExists' => is_file($publicPreviewAbsolutePath),
        'downloadFileName' => buildInvitationProjectArchiveFileName($eventCode),
    ];
}

function getInvitationProjectSourceAbsolutePath(string $projectAbsolutePath): string
{
    return buildInvitationProjectSourceAbsolutePath($projectAbsolutePath);
}

function readInvitationProjectSource(string $projectAbsolutePath): array
{
    $sourcePath = getInvitationProjectSourceAbsolutePath($projectAbsolutePath);
    if (!is_file($sourcePath)) {
        throw new RuntimeException('No encontramos el archivo fuente principal de la invitacion.');
    }

    $contents = file_get_contents($sourcePath);
    if ($contents === false) {
        throw new RuntimeException('No pudimos leer el archivo fuente principal de la invitacion.');
    }

    $updatedAt = filemtime($sourcePath);

    return [
        'source' => $contents,
        'sourceUpdatedAt' => $updatedAt ? date(DATE_ATOM, $updatedAt) : null,
    ];
}

function readInvitationProjectMetadataPayload(string $projectAbsolutePath): array
{
    $metadataPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'project.meta.json';
    if (!is_file($metadataPath)) {
        return [];
    }

    $contents = file_get_contents($metadataPath);
    if ($contents === false) {
        throw new RuntimeException('No pudimos leer project.meta.json del proyecto.');
    }

    $decoded = json_decode($contents, true);
    if (!is_array($decoded)) {
        return [];
    }

    return $decoded;
}

function hasInvitationProjectBuilderState(array $metadata): bool
{
    return isset($metadata['builderState']) && is_array($metadata['builderState']) && isset($metadata['builderState']['formData']) && is_array($metadata['builderState']['formData']);
}

function buildInvitationProjectBuilderStateResponse(array $project, array $metadata): array
{
    $hasBuilderState = hasInvitationProjectBuilderState($metadata);
    $builderState = $hasBuilderState ? (array) $metadata['builderState'] : [];
    $packageId = isset($builderState['packageId']) && is_string($builderState['packageId'])
        ? trim($builderState['packageId'])
        : null;
    $builderStateUpdatedAt = isset($metadata['builderStateUpdatedAt']) && is_string($metadata['builderStateUpdatedAt'])
        ? trim($metadata['builderStateUpdatedAt'])
        : '';

    return [
        'success' => true,
        'project' => $project,
        'packageId' => $packageId !== '' ? $packageId : null,
        'formData' => $hasBuilderState ? $builderState['formData'] : null,
        'builderStateUpdatedAt' => $builderStateUpdatedAt !== '' ? $builderStateUpdatedAt : null,
        'hasBuilderState' => $hasBuilderState,
    ];
}

function writeInvitationProjectSource(string $projectAbsolutePath, string $source): void
{
    $sourcePath = getInvitationProjectSourceAbsolutePath($projectAbsolutePath);
    $sourceDirectory = dirname($sourcePath);
    ensureFilesystemDirectory($sourceDirectory);

    if (trim($source) === '') {
        throw new RuntimeException('El archivo fuente principal de la invitacion no puede quedar vacio.');
    }

    if (file_put_contents($sourcePath, $source) === false) {
        throw new RuntimeException('No pudimos guardar el archivo fuente principal del proyecto.');
    }
}

function requireProjectCodeFromRequest(): string
{
    $payload = readJsonInput();
    $code = normalizeInvitationProjectCode((string) ($payload['code'] ?? ($_POST['code'] ?? ($_GET['code'] ?? ''))));
    if ($code === '') {
        sendJson([
            'success' => false,
            'message' => 'code es requerido',
        ], 400);
    }

    return $code;
}

function requireExistingEventForProject(PDO $pdo, string $code): array
{
    $eventRow = fetchEventRowByCodeForProject($pdo, $code);
    if (!$eventRow) {
        sendJson([
            'success' => false,
            'message' => 'Evento no encontrado',
        ], 404);
    }

    return $eventRow;
}

function ensureProjectLinkForEvent(PDO $pdo, array $eventRow, string $code): array
{
    invitationProjectDebugLog('ensure-link:start', [
        'code' => $code,
        'eventId' => (int) ($eventRow['idEvento'] ?? 0),
    ]);
    $templateRoot = getInvitationTemplateRootPath('legacy');
    if (!is_dir($templateRoot)) {
        throw new RuntimeException('No encontramos la carpeta plantilla para generar el proyecto.');
    }

    $projectsRoot = getInvitationProjectsRootPath();
    ensureFilesystemDirectory($projectsRoot);

    $projectAbsolutePath = buildInvitationProjectAbsolutePath($code);
    $created = false;
    if (!is_dir($projectAbsolutePath) || isDirectoryEmpty($projectAbsolutePath)) {
        copyInvitationTemplateDirectory($templateRoot, $projectAbsolutePath);
        $created = true;
    }

    $templateKind = resolveInvitationProjectTemplateKind($projectAbsolutePath);
    ensureInvitationProjectTemplateScaffold($projectAbsolutePath, $templateKind);
    ensureInvitationProjectHtmlEntry($projectAbsolutePath);
    ensureInvitationProjectAppEntry($projectAbsolutePath);
    ensureInvitationProjectViteBase($projectAbsolutePath);

    $projectPath = buildInvitationProjectRelativePath($code);
    $appEntry = buildInvitationAppEntryRelativePath($code, $templateKind);
    $templateSource = buildInvitationTemplateSourceRelativePath($templateKind);
    writeInvitationProjectMetadata($code, $projectAbsolutePath, [
        'createdFromTemplate' => $templateSource,
        'previewUrl' => buildWorkspacePublicUrl(buildInvitationProjectPreviewEntryRelativePath($code)),
    ]);

    $pdo->beginTransaction();
    try {
        $linkRow = upsertInvitationProjectLinkRecord($pdo, $eventRow, $code, [
            'project_path' => $projectPath,
            'app_entry' => $appEntry,
            'template_source' => $templateSource,
        ]);
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }

    invitationProjectDebugLog('ensure-link:done', [
        'code' => $code,
        'created' => $created,
        'projectAbsolutePath' => $projectAbsolutePath,
        'projectPath' => $projectPath,
        'appEntry' => $appEntry,
        'templateKind' => $templateKind,
    ]);
    return [
        'created' => $created,
        'projectAbsolutePath' => $projectAbsolutePath,
        'linkRow' => $linkRow,
    ];
}

function streamBinaryDownload(string $filePath, string $downloadFileName): void
{
    if (!is_file($filePath)) {
        throw new RuntimeException('No encontramos el archivo solicitado para descargar.');
    }

    if (function_exists('header_remove')) {
        header_remove('Content-Type');
    }

    http_response_code(200);
    header('Content-Type: application/zip');
    header('Content-Length: ' . (string) filesize($filePath));
    header('Content-Disposition: attachment; filename="' . $downloadFileName . '"');
    readfile($filePath);
}

function sendHtmlResponse(string $html, int $statusCode = 200): void
{
    if (function_exists('header_remove')) {
        header_remove('Content-Type');
    }

    http_response_code($statusCode);
    header('Content-Type: text/html; charset=UTF-8');
    echo $html;
    exit;
}

function sendRedirectResponse(string $url, int $statusCode = 302): void
{
    if (function_exists('header_remove')) {
        header_remove('Content-Type');
    }

    http_response_code($statusCode);
    header('Location: ' . $url, true, $statusCode);
    exit;
}

function buildRedirectUrlWithRequestQuery(string $baseUrl, array $requestQuery): string
{
    $filteredQuery = [];
    foreach ($requestQuery as $key => $value) {
        if (!is_string($key) || $key === 'action' || $key === '') {
            continue;
        }

        if (is_array($value)) {
            continue;
        }

        $normalizedValue = trim((string) $value);
        if ($normalizedValue === '') {
            continue;
        }

        $filteredQuery[$key] = $normalizedValue;
    }

    if ($filteredQuery === []) {
        return $baseUrl;
    }

    $fragment = '';
    $hashPosition = strpos($baseUrl, '#');
    if ($hashPosition !== false) {
        $fragment = substr($baseUrl, $hashPosition);
        $baseUrl = substr($baseUrl, 0, $hashPosition);
    }

    $separator = strpos($baseUrl, '?') !== false ? '&' : '?';
    return $baseUrl . $separator . http_build_query($filteredQuery) . $fragment;
}

function prepareInvitationProjectPreview(PDO $pdo, array $eventRow, string $code, bool $forceBuild = false): array
{
    invitationProjectDebugLog('prepare-preview:start', [
        'code' => $code,
        'forceBuild' => $forceBuild,
        'eventId' => (int) ($eventRow['idEvento'] ?? 0),
    ]);
    $projectData = ensureProjectLinkForEvent($pdo, $eventRow, $code);
    $projectAbsolutePath = $projectData['projectAbsolutePath'];
    $templateKind = resolveInvitationProjectTemplateKind($projectAbsolutePath);

    $previewBuilt = false;
    if ($forceBuild) {
        buildInvitationProjectPreview($projectAbsolutePath);
        $previewBuilt = true;
    } else {
        $previewBuilt = ensureInvitationProjectPreview($projectAbsolutePath);
    }

    $metadataUpdates = [
        'createdFromTemplate' => buildInvitationTemplateSourceRelativePath($templateKind),
        'previewUrl' => buildWorkspacePublicUrl(buildInvitationProjectPreviewEntryRelativePath($code)),
    ];
    if ($previewBuilt) {
        $metadataUpdates['previewBuiltAt'] = (new DateTimeImmutable())->format(DateTimeInterface::ATOM);
    }
    writeInvitationProjectMetadata($code, $projectAbsolutePath, $metadataUpdates);

    if (is_file(buildInvitationProjectPreviewEntryAbsolutePath($code))) {
        syncInvitationProjectPublicPreview($code, $projectAbsolutePath);
    }

    $freshLink = fetchInvitationProjectLink($pdo, $code);
    if (!$freshLink) {
        throw new RuntimeException('No pudimos recuperar el vinculo del proyecto.');
    }

    invitationProjectDebugLog('prepare-preview:done', [
        'code' => $code,
        'created' => $projectData['created'],
        'previewBuilt' => $previewBuilt,
        'projectAbsolutePath' => $projectAbsolutePath,
    ]);
    return [
        'created' => $projectData['created'],
        'project' => buildProjectLinkResponse($eventRow, $freshLink, $projectAbsolutePath),
    ];
}

$action = strtolower(trim((string) ($_GET['action'] ?? 'fetch')));

switch ($action) {
    case 'fetch':
        $code = normalizeInvitationProjectCode((string) ($_GET['code'] ?? ''));
        invitationProjectDebugLog('action:fetch', [
            'code' => $code,
        ]);
        if ($code === '') {
            sendJson([
                'success' => false,
                'message' => 'code es requerido',
            ], 400);
        }

        $eventRow = requireExistingEventForProject($pdo, $code);

        $linkRow = fetchInvitationProjectLink($pdo, $code);
        if (!$linkRow) {
            sendJson([
                'success' => true,
                'project' => null,
            ]);
        }

        sendJson([
            'success' => true,
            'project' => buildProjectLinkResponse($eventRow, $linkRow, buildInvitationProjectAbsolutePath($code)),
        ]);
        break;

    case 'provision':
        $code = requireProjectCodeFromRequest();
        invitationProjectDebugLog('action:provision', [
            'code' => $code,
        ]);
        $eventRow = requireExistingEventForProject($pdo, $code);
        $projectData = ensureProjectLinkForEvent($pdo, $eventRow, $code);

        sendJson([
            'success' => true,
            'created' => $projectData['created'],
            'project' => buildProjectLinkResponse($eventRow, $projectData['linkRow'], $projectData['projectAbsolutePath']),
        ]);
        break;

    case 'publish':
        $code = requireProjectCodeFromRequest();
        invitationProjectDebugLog('action:publish', [
            'code' => $code,
        ]);
        $eventRow = requireExistingEventForProject($pdo, $code);
        $prepared = prepareInvitationProjectPreview($pdo, $eventRow, $code, true);

        sendJson([
            'success' => true,
            'created' => $prepared['created'],
            'project' => $prepared['project'],
        ]);
        break;

    case 'source':
        $code = normalizeInvitationProjectCode((string) ($_GET['code'] ?? ''));
        if ($code === '') {
            sendJson([
                'success' => false,
                'message' => 'code es requerido',
            ], 400);
        }

        $eventRow = requireExistingEventForProject($pdo, $code);
        $projectData = ensureProjectLinkForEvent($pdo, $eventRow, $code);
        $freshLink = fetchInvitationProjectLink($pdo, $code);
        if (!$freshLink) {
            throw new RuntimeException('No pudimos recuperar el vinculo del proyecto.');
        }
        $project = buildProjectLinkResponse($eventRow, $freshLink, $projectData['projectAbsolutePath']);
        $sourceData = readInvitationProjectSource($projectData['projectAbsolutePath']);

        sendJson([
            'success' => true,
            'project' => $project,
            'source' => $sourceData['source'],
            'sourceUpdatedAt' => $sourceData['sourceUpdatedAt'],
        ]);
        break;

    case 'builder-state':
        $code = normalizeInvitationProjectCode((string) ($_GET['code'] ?? ''));
        if ($code === '') {
            sendJson([
                'success' => false,
                'message' => 'code es requerido',
            ], 400);
        }

        $eventRow = requireExistingEventForProject($pdo, $code);
        $projectData = ensureProjectLinkForEvent($pdo, $eventRow, $code);
        $freshLink = fetchInvitationProjectLink($pdo, $code);
        if (!$freshLink) {
            throw new RuntimeException('No pudimos recuperar el vinculo del proyecto.');
        }

        $project = buildProjectLinkResponse($eventRow, $freshLink, $projectData['projectAbsolutePath']);
        $metadata = readInvitationProjectMetadataPayload($projectData['projectAbsolutePath']);

        sendJson(buildInvitationProjectBuilderStateResponse($project, $metadata));
        break;

    case 'save-source':
        $payload = readJsonInput();
        $code = normalizeInvitationProjectCode((string) ($payload['code'] ?? ''));
        if ($code === '') {
            sendJson([
                'success' => false,
                'message' => 'code es requerido',
            ], 400);
        }

        $source = (string) ($payload['source'] ?? '');
        $eventRow = requireExistingEventForProject($pdo, $code);
        $projectData = ensureProjectLinkForEvent($pdo, $eventRow, $code);
        $templateKind = resolveInvitationProjectTemplateKind($projectData['projectAbsolutePath']);

        writeInvitationProjectSource($projectData['projectAbsolutePath'], $source);
        ensureInvitationProjectAppEntry($projectData['projectAbsolutePath']);
        ensureInvitationProjectViteBase($projectData['projectAbsolutePath']);
        writeInvitationProjectMetadata($code, $projectData['projectAbsolutePath'], [
            'createdFromTemplate' => buildInvitationTemplateSourceRelativePath($templateKind),
            'sourceUpdatedAt' => (new DateTimeImmutable())->format(DateTimeInterface::ATOM),
            'previewUrl' => buildWorkspacePublicUrl(buildInvitationProjectPreviewEntryRelativePath($code)),
        ]);

        $prepared = prepareInvitationProjectPreview($pdo, $eventRow, $code, true);
        $sourceData = readInvitationProjectSource((string) ($prepared['project']['projectAbsolutePath'] ?? ''));

        sendJson([
            'success' => true,
            'project' => $prepared['project'],
            'source' => $sourceData['source'],
            'sourceUpdatedAt' => $sourceData['sourceUpdatedAt'],
        ]);
        break;

    case 'save-builder-state':
        $payload = readJsonInput();
        $code = normalizeInvitationProjectCode((string) ($payload['code'] ?? ''));
        if ($code === '') {
            sendJson([
                'success' => false,
                'message' => 'code es requerido',
            ], 400);
        }

        $packageId = trim((string) ($payload['packageId'] ?? ''));
        if ($packageId === '') {
            sendJson([
                'success' => false,
                'message' => 'packageId es requerido',
            ], 400);
        }

        $formData = $payload['formData'] ?? null;
        if (!is_array($formData)) {
            sendJson([
                'success' => false,
                'message' => 'formData es requerido',
            ], 400);
        }

        $eventRow = requireExistingEventForProject($pdo, $code);
        $projectData = ensureProjectLinkForEvent($pdo, $eventRow, $code);
        $templateKind = resolveInvitationProjectTemplateKind($projectData['projectAbsolutePath']);
        writeInvitationProjectMetadata($code, $projectData['projectAbsolutePath'], [
            'createdFromTemplate' => buildInvitationTemplateSourceRelativePath($templateKind),
            'previewUrl' => buildWorkspacePublicUrl(buildInvitationProjectPreviewEntryRelativePath($code)),
            'builderState' => [
                'packageId' => $packageId,
                'formData' => $formData,
            ],
            'builderStateUpdatedAt' => (new DateTimeImmutable())->format(DateTimeInterface::ATOM),
        ]);

        $freshLink = fetchInvitationProjectLink($pdo, $code);
        if (!$freshLink) {
            throw new RuntimeException('No pudimos recuperar el vinculo del proyecto.');
        }

        $project = buildProjectLinkResponse($eventRow, $freshLink, $projectData['projectAbsolutePath']);
        $metadata = readInvitationProjectMetadataPayload($projectData['projectAbsolutePath']);

        sendJson(buildInvitationProjectBuilderStateResponse($project, $metadata));
        break;

    case 'open':
        $code = requireProjectCodeFromRequest();
        invitationProjectDebugLog('action:open', [
            'code' => $code,
        ]);
        $eventRow = requireExistingEventForProject($pdo, $code);
        $prepared = prepareInvitationProjectPreview($pdo, $eventRow, $code);

        sendJson([
            'success' => true,
            'created' => $prepared['created'],
            'project' => $prepared['project'],
        ]);
        break;

    case 'launch':
        $code = normalizeInvitationProjectCode((string) ($_GET['code'] ?? ''));
        invitationProjectDebugLog('action:launch', [
            'code' => $code,
            'query' => $_GET,
        ]);
        if ($code === '') {
            sendHtmlResponse('<!doctype html><html lang="es"><body><p>code es requerido</p></body></html>', 400);
        }

        try {
            $eventRow = requireExistingEventForProject($pdo, $code);
            $prepared = prepareInvitationProjectPreview($pdo, $eventRow, $code);
            $project = $prepared['project'];
            $previewUrl = trim((string) ($project['previewUrl'] ?? ''));
            if ($previewUrl === '') {
                throw new RuntimeException('La compilacion termino, pero no encontramos la vista previa.');
            }

            sendRedirectResponse(buildRedirectUrlWithRequestQuery($previewUrl, $_GET));
            /*

                throw new RuntimeException('No pudimos recuperar el vínculo del proyecto.');
            }

            $previewUrl = trim((string) ($project['previewUrl'] ?? ''));
            if ($previewUrl === '') {
                throw new RuntimeException('La compilación terminó, pero no encontramos la vista previa.');
            }

            $safePreviewUrl = htmlspecialchars($previewUrl, ENT_QUOTES, 'UTF-8');
            $safeCode = htmlspecialchars($code, ENT_QUOTES, 'UTF-8');

            sendHtmlResponse(
                '<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Abriendo invitación</title><meta http-equiv="refresh" content="0;url=' . $safePreviewUrl . '"></head><body style="font-family: Arial, sans-serif; background:#f6f2ec; color:#18181b; min-height:100vh; margin:0; display:grid; place-items:center;"><div style="max-width:520px; padding:24px; text-align:center;"><p style="margin:0 0 12px; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#71717a;">INViTARTE</p><h1 style="margin:0 0 12px; font-size:28px; line-height:1.15;">Abriendo la invitación</h1><p style="margin:0 0 18px; font-size:14px; line-height:1.7; color:#52525b;">La vista previa del evento ' . $safeCode . ' está lista. Si no redirige automáticamente, usa el botón de abajo.</p><p style="margin:0;"><a href="' . $safePreviewUrl . '" style="display:inline-block; padding:12px 18px; border-radius:12px; background:#18181b; color:#fff; text-decoration:none; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; font-size:12px;">Abrir invitación</a></p></div><script>window.location.replace(' . json_encode($previewUrl, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ');</script></body></html>'
            );
            */
        } catch (Throwable $error) {
            $safeMessage = htmlspecialchars($error->getMessage(), ENT_QUOTES, 'UTF-8');
            sendHtmlResponse(
                '<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>No pudimos abrir la invitación</title></head><body style="font-family: Arial, sans-serif; background:#f6f2ec; color:#18181b; min-height:100vh; margin:0; display:grid; place-items:center;"><div style="max-width:560px; padding:24px; text-align:center;"><p style="margin:0 0 12px; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#71717a;">INViTARTE</p><h1 style="margin:0 0 12px; font-size:28px; line-height:1.15;">No pudimos abrir la invitación</h1><p style="margin:0; font-size:14px; line-height:1.7; color:#52525b;">' . $safeMessage . '</p></div></body></html>',
                500
            );
        }
        break;

    case 'download':
        $code = normalizeInvitationProjectCode((string) ($_GET['code'] ?? ''));
        if ($code === '') {
            sendJson([
                'success' => false,
                'message' => 'code es requerido',
            ], 400);
        }

        $eventRow = requireExistingEventForProject($pdo, $code);
        $projectData = ensureProjectLinkForEvent($pdo, $eventRow, $code);
        $archivePath = createInvitationProjectArchive($code, $projectData['projectAbsolutePath']);

        try {
            streamBinaryDownload($archivePath, buildInvitationProjectArchiveFileName($code));
        } finally {
            if (is_file($archivePath)) {
                @unlink($archivePath);
            }
        }
        exit;
        break;

    case 'upload':
        $code = normalizeInvitationProjectCode((string) ($_POST['code'] ?? ($_GET['code'] ?? '')));
        if ($code === '') {
            sendJson([
                'success' => false,
                'message' => 'code es requerido',
            ], 400);
        }

        if (!isset($_FILES['archive']) || !is_array($_FILES['archive'])) {
            sendJson([
                'success' => false,
                'message' => 'archive es requerido',
            ], 400);
        }

        if ((int) ($_FILES['archive']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            sendJson([
                'success' => false,
                'message' => 'No pudimos recibir el archivo ZIP del proyecto.',
            ], 400);
        }

        $eventRow = requireExistingEventForProject($pdo, $code);
        $projectData = ensureProjectLinkForEvent($pdo, $eventRow, $code);

        $temporaryDirectory = createTemporaryDirectory();
        $responsePayload = null;

        try {
            extractInvitationArchiveToDirectory((string) ($_FILES['archive']['tmp_name'] ?? ''), $temporaryDirectory);
            $extractedRoot = resolveExtractedInvitationProjectRoot($temporaryDirectory);

            $isStaticArchive = isStaticInvitationProjectRoot($extractedRoot);
            $isLegacyArchive = isLegacyInvitationProjectRoot($extractedRoot);
            if (!$isStaticArchive && !$isLegacyArchive) {
                throw new RuntimeException('El ZIP debe contener una invitacion estatica con index.html, styles.css y script.js, o bien el proyecto React legado con package.json y src.');
            }

            clearDirectoryContents($projectData['projectAbsolutePath']);
            copyDirectoryTree($extractedRoot, $projectData['projectAbsolutePath'], [
                '.git',
                '.github',
                '.codex-tmp',
                'node_modules',
            ]);

            $projectData = ensureProjectLinkForEvent($pdo, $eventRow, $code);
            $templateKind = resolveInvitationProjectTemplateKind($projectData['projectAbsolutePath']);
            ensureInvitationProjectAppEntry($projectData['projectAbsolutePath']);
            ensureInvitationProjectViteBase($projectData['projectAbsolutePath']);
            optimizeInvitationProjectImages($projectData['projectAbsolutePath']);
            writeInvitationProjectMetadata($code, $projectData['projectAbsolutePath'], [
                'createdFromTemplate' => buildInvitationTemplateSourceRelativePath($templateKind),
                'uploadedAt' => (new DateTimeImmutable())->format(DateTimeInterface::ATOM),
                'previewUrl' => buildWorkspacePublicUrl(buildInvitationProjectPreviewEntryRelativePath($code)),
            ]);
            prepareInvitationProjectPreview($pdo, $eventRow, $code, true);

            $freshLink = fetchInvitationProjectLink($pdo, $code);
            if (!$freshLink) {
                throw new RuntimeException('No pudimos recuperar el vínculo del proyecto después de la carga.');
            }

            $responsePayload = [
                'success' => true,
                'project' => buildProjectLinkResponse($eventRow, $freshLink, $projectData['projectAbsolutePath']),
            ];
        } finally {
            deletePathRecursively($temporaryDirectory);
        }

        sendJson($responsePayload);
        break;

    default:
        sendJson([
            'success' => false,
            'message' => 'Accion no soportada',
        ], 400);
}
