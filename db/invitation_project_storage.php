<?php

const INVITATION_PROJECTS_DIR_NAME = 'invitaciones';
const INVITATION_TEMPLATE_RELATIVE_PATH = 'invitacion_plantilla/invitación-digital/plantilla';

const STATIC_INVITATION_TEMPLATE_RELATIVE_PATH = 'plantilla';
const LEGACY_INVITATION_TEMPLATE_RELATIVE_PATH = INVITATION_TEMPLATE_RELATIVE_PATH;
const STATIC_INVITATION_PROJECT_SOURCE_RELATIVE_PATH = 'script.js';
const LEGACY_INVITATION_PROJECT_SOURCE_RELATIVE_PATH = 'src/App.tsx';

function invitationProjectDebugLog(string $message, array $context = []): void
{
    $payload = $context === []
        ? ''
        : ' ' . (json_encode($context, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: '[contexto no serializable]');

    error_log('[invitation_project] ' . $message . $payload);
}

function normalizeInvitationProjectCode(string $value): string
{
    return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', trim($value)) ?? '');
}

function getWorkspaceRootPath(): string
{
    return dirname(__DIR__);
}

function getInvitationProjectsRootPath(): string
{
    return getWorkspaceRootPath() . DIRECTORY_SEPARATOR . INVITATION_PROJECTS_DIR_NAME;
}

function getInvitationProjectsPublicRootPath(): string
{
    return __DIR__ . DIRECTORY_SEPARATOR . INVITATION_PROJECTS_DIR_NAME;
}

function getInvitationTemplateRootPath(string $templateKind = 'static'): string
{
    $relativePath = $templateKind === 'legacy'
        ? LEGACY_INVITATION_TEMPLATE_RELATIVE_PATH
        : STATIC_INVITATION_TEMPLATE_RELATIVE_PATH;

    return getWorkspaceRootPath() . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativePath);
}

function isStaticInvitationProjectRoot(string $projectAbsolutePath): bool
{
    return is_file($projectAbsolutePath . DIRECTORY_SEPARATOR . 'index.html')
        && is_file($projectAbsolutePath . DIRECTORY_SEPARATOR . STATIC_INVITATION_PROJECT_SOURCE_RELATIVE_PATH)
        && is_file($projectAbsolutePath . DIRECTORY_SEPARATOR . 'styles.css');
}

function isLegacyInvitationProjectRoot(string $projectAbsolutePath): bool
{
    return is_file($projectAbsolutePath . DIRECTORY_SEPARATOR . LEGACY_INVITATION_PROJECT_SOURCE_RELATIVE_PATH)
        || is_file($projectAbsolutePath . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR . 'Invitacion.tsx');
}

function resolveInvitationProjectTemplateKind(string $projectAbsolutePath): string
{
    if (isLegacyInvitationProjectRoot($projectAbsolutePath)) {
        return 'legacy';
    }

    if (isStaticInvitationProjectRoot($projectAbsolutePath)) {
        return 'static';
    }

    return 'legacy';
}

function buildInvitationProjectRelativePath(string $eventCode): string
{
    return INVITATION_PROJECTS_DIR_NAME . '/' . $eventCode;
}

function buildInvitationProjectAbsolutePath(string $eventCode): string
{
    return getInvitationProjectsRootPath() . DIRECTORY_SEPARATOR . $eventCode;
}

function buildInvitationProjectPublicAbsolutePath(string $eventCode): string
{
    return getInvitationProjectsPublicRootPath() . DIRECTORY_SEPARATOR . $eventCode;
}

function buildInvitationProjectSourceRelativePath(string $templateKind = 'static'): string
{
    return $templateKind === 'legacy'
        ? LEGACY_INVITATION_PROJECT_SOURCE_RELATIVE_PATH
        : STATIC_INVITATION_PROJECT_SOURCE_RELATIVE_PATH;
}

function buildInvitationProjectSourceAbsolutePath(string $projectAbsolutePath): string
{
    return $projectAbsolutePath . DIRECTORY_SEPARATOR . str_replace(
        '/',
        DIRECTORY_SEPARATOR,
        buildInvitationProjectSourceRelativePath(resolveInvitationProjectTemplateKind($projectAbsolutePath))
    );
}

function buildInvitationAppEntryRelativePath(string $eventCode, string $templateKind = 'static'): string
{
    return buildInvitationProjectRelativePath($eventCode) . '/' . buildInvitationProjectSourceRelativePath($templateKind);
}

function buildInvitationProjectDistRelativePath(string $eventCode): string
{
    return buildInvitationProjectRelativePath($eventCode) . '/dist';
}

function buildInvitationProjectPreviewEntryRelativePath(string $eventCode): string
{
    return buildInvitationProjectDistRelativePath($eventCode) . '/index.html';
}

function buildInvitationProjectScriptRelativePath(): string
{
    $scriptName = str_replace('\\', '/', (string) ($_SERVER['SCRIPT_NAME'] ?? '/db/invitation_project.php'));
    $directory = normalizePublicBasePath(dirname($scriptName));
    return ltrim(($directory !== '' ? $directory . '/' : '') . 'invitation_project.php', '/');
}

function buildInvitationProjectLaunchRelativePath(string $eventCode): string
{
    return buildInvitationProjectScriptRelativePath() . '?action=launch&code=' . rawurlencode($eventCode);
}

function buildInvitationTemplateSourceRelativePath(string $templateKind = 'static'): string
{
    return $templateKind === 'legacy'
        ? LEGACY_INVITATION_TEMPLATE_RELATIVE_PATH
        : STATIC_INVITATION_TEMPLATE_RELATIVE_PATH;
}

function buildInvitationProjectArchiveFileName(string $eventCode): string
{
    return 'invitacion-proyecto-' . strtolower($eventCode) . '.zip';
}

function ensureFilesystemDirectory(string $path): void
{
    if (is_dir($path)) {
        return;
    }

    if (!mkdir($path, 0777, true) && !is_dir($path)) {
        throw new RuntimeException('No pudimos crear la carpeta: ' . $path);
    }
}

function isDirectoryEmpty(string $path): bool
{
    if (!is_dir($path)) {
        return true;
    }

    $items = scandir($path);
    if ($items === false) {
        return true;
    }

    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }

        return false;
    }

    return true;
}

function buildInvitationProjectDistAbsolutePath(string $eventCode): string
{
    return buildInvitationProjectAbsolutePath($eventCode) . DIRECTORY_SEPARATOR . 'dist';
}

function buildInvitationProjectPublicDistAbsolutePath(string $eventCode): string
{
    return buildInvitationProjectPublicAbsolutePath($eventCode) . DIRECTORY_SEPARATOR . 'dist';
}

function buildInvitationProjectPreviewEntryAbsolutePath(string $eventCode): string
{
    return buildInvitationProjectDistAbsolutePath($eventCode) . DIRECTORY_SEPARATOR . 'index.html';
}

function buildInvitationProjectPublicPreviewEntryAbsolutePath(string $eventCode): string
{
    return buildInvitationProjectPublicDistAbsolutePath($eventCode) . DIRECTORY_SEPARATOR . 'index.html';
}

function normalizePublicBasePath(string $path): string
{
    $normalized = str_replace('\\', '/', $path);
    if ($normalized === '.' || $normalized === '/') {
        return '';
    }

    return rtrim($normalized, '/');
}

function getWorkspacePublicBaseUrl(): string
{
    $forwardedProto = trim((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''));
    $https = (string) ($_SERVER['HTTPS'] ?? '');
    $scheme = $forwardedProto !== ''
        ? strtolower(strtok($forwardedProto, ','))
        : (($https !== '' && strtolower($https) !== 'off') ? 'https' : 'http');

    $host = trim((string) ($_SERVER['HTTP_HOST'] ?? ''));
    if ($host === '') {
        $serverName = trim((string) ($_SERVER['SERVER_NAME'] ?? 'localhost'));
        $serverPort = trim((string) ($_SERVER['SERVER_PORT'] ?? '80'));
        $host = $serverPort !== '' && !in_array($serverPort, ['80', '443'], true)
            ? $serverName . ':' . $serverPort
            : $serverName;
    }

    $scriptName = str_replace('\\', '/', (string) ($_SERVER['SCRIPT_NAME'] ?? '/db/invitation_project.php'));
    $basePath = normalizePublicBasePath(dirname(dirname($scriptName)));

    return $scheme . '://' . $host . $basePath;
}

function buildWorkspacePublicUrl(string $relativePath): string
{
    return getWorkspacePublicBaseUrl() . '/' . ltrim(str_replace('\\', '/', $relativePath), '/');
}

function buildInvitationProjectLaunchUrl(string $eventCode): string
{
    return buildWorkspacePublicUrl(buildInvitationProjectLaunchRelativePath($eventCode));
}

function isLegacyHostedInvitationUrl(string $url): bool
{
    $trimmed = trim($url);
    if ($trimmed === '') {
        return false;
    }

    return preg_match('~^https?://(?:www\.)?invitarte\.app/v/[^/?#]+(?:\?.*)?$~i', $trimmed) === 1;
}

function isOutdatedInvitationProjectUrl(string $url): bool
{
    $trimmed = trim($url);
    if ($trimmed === '') {
        return false;
    }

    $parsed = parse_url($trimmed);
    if (!is_array($parsed)) {
        return false;
    }

    $path = '/' . ltrim(str_replace('\\', '/', (string) ($parsed['path'] ?? '')), '/');
    if (preg_match('~/invitation_project\.php$~i', $path) !== 1) {
        return false;
    }

    $expectedPath = '/' . buildInvitationProjectScriptRelativePath();
    return strcasecmp($path, $expectedPath) !== 0;
}

function shouldRebuildInvitationProjectUrl(string $url): bool
{
    $trimmed = trim($url);
    return $trimmed === '' || isLegacyHostedInvitationUrl($trimmed) || isOutdatedInvitationProjectUrl($trimmed);
}

function copyDirectoryTree(string $source, string $destination, array $excludedNames = []): void
{
    ensureFilesystemDirectory($destination);

    $iterator = new DirectoryIterator($source);
    foreach ($iterator as $item) {
        if ($item->isDot()) {
            continue;
        }

        $name = $item->getFilename();
        if (in_array($name, $excludedNames, true)) {
            continue;
        }

        $sourcePath = $item->getPathname();
        $destinationPath = $destination . DIRECTORY_SEPARATOR . $name;

        if ($item->isDir()) {
            copyDirectoryTree($sourcePath, $destinationPath, $excludedNames);
            continue;
        }

        if (!copy($sourcePath, $destinationPath)) {
            throw new RuntimeException('No pudimos copiar el archivo de plantilla: ' . $sourcePath);
        }
    }
}

function copyInvitationTemplateDirectory(string $source, string $destination): void
{
    copyDirectoryTree($source, $destination, [
        '.git',
        '.github',
        '.codex-tmp',
        'node_modules',
        'dist',
    ]);
}

function buildInvitationTemplateAbsolutePath(string $relativePath, string $templateKind = 'static'): string
{
    return getInvitationTemplateRootPath($templateKind) . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath);
}

function buildInvitationProjectScopedAbsolutePath(string $projectAbsolutePath, string $relativePath): string
{
    return $projectAbsolutePath . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath);
}

function ensureInvitationProjectTemplateFile(string $projectAbsolutePath, string $relativePath, ?string $templateKind = null): void
{
    $resolvedTemplateKind = $templateKind ?? resolveInvitationProjectTemplateKind($projectAbsolutePath);
    $templatePath = buildInvitationTemplateAbsolutePath($relativePath, $resolvedTemplateKind);
    if (!is_file($templatePath)) {
        throw new RuntimeException('La plantilla no contiene el archivo requerido: ' . $relativePath);
    }

    $destinationPath = buildInvitationProjectScopedAbsolutePath($projectAbsolutePath, $relativePath);
    if (file_exists($destinationPath)) {
        return;
    }

    ensureFilesystemDirectory(dirname($destinationPath));
    if (!copy($templatePath, $destinationPath)) {
        throw new RuntimeException('No pudimos restaurar el archivo base del proyecto: ' . $relativePath);
    }
}

function ensureInvitationProjectTemplateDirectory(string $projectAbsolutePath, string $relativePath, ?string $templateKind = null): void
{
    $resolvedTemplateKind = $templateKind ?? resolveInvitationProjectTemplateKind($projectAbsolutePath);
    $templatePath = buildInvitationTemplateAbsolutePath($relativePath, $resolvedTemplateKind);
    if (!is_dir($templatePath)) {
        throw new RuntimeException('La plantilla no contiene la carpeta requerida: ' . $relativePath);
    }

    $destinationPath = buildInvitationProjectScopedAbsolutePath($projectAbsolutePath, $relativePath);
    if (is_dir($destinationPath) && !isDirectoryEmpty($destinationPath)) {
        return;
    }

    copyInvitationTemplateDirectory($templatePath, $destinationPath);
}

function ensureInvitationProjectTemplateScaffold(string $projectAbsolutePath, ?string $templateKind = null): void
{
    $resolvedTemplateKind = $templateKind ?? resolveInvitationProjectTemplateKind($projectAbsolutePath);

    if ($resolvedTemplateKind === 'legacy') {
        foreach ([
            '.gitignore',
            'index.html',
            'package.json',
            'package-lock.json',
            'README.md',
            'tsconfig.json',
            'vite-env.d.ts',
            'vite.config.ts',
            'src/index.css',
            'src/main.tsx',
        ] as $relativePath) {
            ensureInvitationProjectTemplateFile($projectAbsolutePath, $relativePath, 'legacy');
        }

        ensureInvitationProjectTemplateDirectory($projectAbsolutePath, 'public', 'legacy');

        $appPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR . 'App.tsx';
        $legacyPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR . 'Invitacion.tsx';
        if (!is_file($appPath) && !is_file($legacyPath)) {
            ensureInvitationProjectTemplateFile($projectAbsolutePath, 'src/Invitacion.tsx', 'legacy');
        }
        return;
    }

    foreach ([
        'index.html',
        'styles.css',
        'script.js',
        'README.md',
    ] as $relativePath) {
        ensureInvitationProjectTemplateFile($projectAbsolutePath, $relativePath, 'static');
    }

    ensureInvitationProjectTemplateDirectory($projectAbsolutePath, 'invitacion', 'static');
}

function migrateLegacyInvitationProjectToStaticTemplate(string $projectAbsolutePath): void
{
    if (!is_dir($projectAbsolutePath) || !isLegacyInvitationProjectRoot($projectAbsolutePath) || isStaticInvitationProjectRoot($projectAbsolutePath)) {
        return;
    }

    invitationProjectDebugLog('migrate-legacy-to-static:start', [
        'projectAbsolutePath' => $projectAbsolutePath,
    ]);

    $temporaryDirectory = createTemporaryDirectory();
    $temporaryProjectPath = $temporaryDirectory . DIRECTORY_SEPARATOR . 'static_project';

    try {
        copyInvitationTemplateDirectory(getInvitationTemplateRootPath('static'), $temporaryProjectPath);

        $temporaryInvitationAssetsPath = $temporaryProjectPath . DIRECTORY_SEPARATOR . 'invitacion';
        $legacyPublicInvitationPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'invitacion';
        $legacyStaticInvitationPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'invitacion';

        if (is_dir($legacyPublicInvitationPath)) {
            clearDirectoryContents($temporaryInvitationAssetsPath);
            copyDirectoryTree($legacyPublicInvitationPath, $temporaryInvitationAssetsPath);
        } elseif (is_dir($legacyStaticInvitationPath)) {
            clearDirectoryContents($temporaryInvitationAssetsPath);
            copyDirectoryTree($legacyStaticInvitationPath, $temporaryInvitationAssetsPath);
        }

        $metadataPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'project.meta.json';
        if (is_file($metadataPath)) {
            copy($metadataPath, $temporaryProjectPath . DIRECTORY_SEPARATOR . 'project.meta.json');
        }

        clearDirectoryContents($projectAbsolutePath);
        copyDirectoryTree($temporaryProjectPath, $projectAbsolutePath);
    } finally {
        deletePathRecursively($temporaryDirectory);
    }

    ensureInvitationProjectTemplateScaffold($projectAbsolutePath, 'static');
    ensureInvitationProjectHtmlEntry($projectAbsolutePath);
    ensureInvitationProjectAppEntry($projectAbsolutePath);
    invitationProjectDebugLog('migrate-legacy-to-static:done', [
        'projectAbsolutePath' => $projectAbsolutePath,
    ]);
}

function writeInvitationProjectMetadata(string $eventCode, string $projectAbsolutePath, array $data = []): void
{
    $metadataPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'project.meta.json';
    $templateKind = resolveInvitationProjectTemplateKind($projectAbsolutePath);
    $existingPayload = [];
    if (is_file($metadataPath)) {
        $existingContents = file_get_contents($metadataPath);
        if ($existingContents !== false) {
            $decodedExisting = json_decode($existingContents, true);
            if (is_array($decodedExisting)) {
                $existingPayload = $decodedExisting;
            }
        }
    }

    $payload = array_merge($existingPayload, [
        'eventCode' => $eventCode,
        'projectPath' => buildInvitationProjectRelativePath($eventCode),
        'appEntry' => buildInvitationAppEntryRelativePath($eventCode, $templateKind),
        'distPath' => buildInvitationProjectDistRelativePath($eventCode),
        'templateSource' => buildInvitationTemplateSourceRelativePath($templateKind),
    ], $data);

    if (!isset($payload['linkedAt']) || !is_string($payload['linkedAt']) || trim($payload['linkedAt']) === '') {
        $payload['linkedAt'] = (new DateTimeImmutable())->format(DateTimeInterface::ATOM);
    }

    $encoded = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($encoded === false) {
        throw new RuntimeException('No pudimos serializar los metadatos del proyecto.');
    }

    if (file_put_contents($metadataPath, $encoded . PHP_EOL) === false) {
        throw new RuntimeException('No pudimos escribir project.meta.json.');
    }
}

function ensureInvitationProjectAppEntry(string $projectAbsolutePath): void
{
    if (resolveInvitationProjectTemplateKind($projectAbsolutePath) === 'static') {
        ensureInvitationProjectTemplateFile($projectAbsolutePath, 'script.js', 'static');
        return;
    }

    $srcPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'src';
    $appPath = $srcPath . DIRECTORY_SEPARATOR . 'App.tsx';
    $legacyPath = $srcPath . DIRECTORY_SEPARATOR . 'Invitacion.tsx';
    $mainPath = $srcPath . DIRECTORY_SEPARATOR . 'main.tsx';

    if (!is_dir($srcPath)) {
        throw new RuntimeException('El proyecto no contiene carpeta src.');
    }

    if (!is_file($appPath) && is_file($legacyPath)) {
        if (!rename($legacyPath, $appPath)) {
            throw new RuntimeException('No pudimos renombrar Invitacion.tsx a App.tsx.');
        }
    }

    if (is_file($mainPath)) {
        $mainContents = file_get_contents($mainPath);
        if ($mainContents === false) {
            throw new RuntimeException('No pudimos leer src/main.tsx.');
        }

        $updatedContents = str_replace('./Invitacion.tsx', './App.tsx', $mainContents);
        if ($updatedContents !== $mainContents && file_put_contents($mainPath, $updatedContents) === false) {
            throw new RuntimeException('No pudimos actualizar src/main.tsx.');
        }
    }
}

function ensureInvitationProjectHtmlEntry(string $projectAbsolutePath): void
{
    $templateKind = resolveInvitationProjectTemplateKind($projectAbsolutePath);
    ensureInvitationProjectTemplateFile($projectAbsolutePath, 'index.html', $templateKind);

    if ($templateKind === 'static') {
        return;
    }

    $indexPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'index.html';
    $contents = file_get_contents($indexPath);
    if ($contents === false) {
        throw new RuntimeException('No pudimos leer index.html del proyecto.');
    }

    $looksLikeLegacyEntry = strpos($contents, 'id="root"') !== false
        && (
            strpos($contents, 'src="./src/main.tsx"') !== false
            || strpos($contents, 'src="/src/main.tsx"') !== false
        );
    if (!$looksLikeLegacyEntry) {
        $templateContents = file_get_contents(buildInvitationTemplateAbsolutePath('index.html', 'legacy'));
        if ($templateContents === false) {
            throw new RuntimeException('No pudimos restaurar index.html de la plantilla legacy.');
        }
        $contents = $templateContents;
    }

    $updatedContents = str_replace('src="/src/main.tsx"', 'src="./src/main.tsx"', $contents);
    if (strpos($updatedContents, 'data-invitarte-standalone-help') === false) {
        $helperScript = <<<HTML
    <script data-invitarte-standalone-help>
      if (window.location.protocol === 'file:') {
        const root = document.getElementById('root');
        if (root) {
          root.innerHTML = `
            <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#f6f1ea;color:#1f2937;font-family:Arial,sans-serif;">
              <section style="max-width:680px;background:#ffffff;border:1px solid #e5ded5;border-radius:24px;padding:28px;box-shadow:0 20px 60px rgba(15,23,42,0.08);">
                <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#8b7355;">Invitarte</p>
                <h1 style="margin:0 0 12px;font-size:30px;line-height:1.15;">Este proyecto se edita de forma independiente, pero no se abre con doble clic.</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4b5563;">Para modificar esta invitacion necesitas correr el proyecto con Vite. Abre esta carpeta en una terminal y ejecuta:</p>
                <pre style="margin:0 0 16px;padding:16px;border-radius:16px;background:#111827;color:#f9fafb;overflow:auto;font-size:14px;line-height:1.6;"><code>npm install
npm run dev</code></pre>
                <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#4b5563;">Despues abre <strong>http://localhost:3000</strong>. Si quieres generar la version compilada usa:</p>
                <pre style="margin:0;padding:16px;border-radius:16px;background:#111827;color:#f9fafb;overflow:auto;font-size:14px;line-height:1.6;"><code>npm run build
npm run preview</code></pre>
              </section>
            </main>
          `;
        }
      }
    </script>
HTML;
        $updatedContents = str_replace(
            '<script type="module" src="./src/main.tsx"></script>',
            $helperScript . "\n    <script type=\"module\" src=\"./src/main.tsx\"></script>",
            $updatedContents
        );
        $updatedContents = str_replace(
            '<script type="module" src="/src/main.tsx"></script>',
            $helperScript . "\n    <script type=\"module\" src=\"./src/main.tsx\"></script>",
            $updatedContents
        );
    }

    if ($updatedContents !== $contents && file_put_contents($indexPath, $updatedContents) === false) {
        throw new RuntimeException('No pudimos actualizar index.html del proyecto.');
    }
}

function ensureInvitationProjectViteBase(string $projectAbsolutePath): void
{
    if (resolveInvitationProjectTemplateKind($projectAbsolutePath) === 'static') {
        return;
    }

    $viteConfigPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'vite.config.ts';
    if (!is_file($viteConfigPath)) {
        return;
    }

    $contents = file_get_contents($viteConfigPath);
    if ($contents === false) {
        throw new RuntimeException('No pudimos leer vite.config.ts.');
    }

    $updatedContents = $contents;
    if (preg_match('/\bbase\s*:\s*([\'"])(.*?)\1/', $updatedContents) === 1) {
        $updatedContents = preg_replace('/\bbase\s*:\s*([\'"])(.*?)\1/', "base: './'", $updatedContents, 1) ?? $updatedContents;
    } elseif (strpos($updatedContents, 'return {') !== false) {
        $updatedContents = preg_replace('/return\s*{/', "return {\n    base: './',", $updatedContents, 1) ?? $updatedContents;
    } elseif (preg_match('/defineConfig\(\s*{/', $updatedContents) === 1) {
        $updatedContents = preg_replace('/defineConfig\(\s*{/', "defineConfig({\n  base: './',", $updatedContents, 1) ?? $updatedContents;
    }

    if ($updatedContents !== $contents && file_put_contents($viteConfigPath, $updatedContents) === false) {
        throw new RuntimeException('No pudimos actualizar vite.config.ts para usar assets relativos.');
    }
}

function deletePathRecursively(string $path): void
{
    if (!file_exists($path)) {
        return;
    }

    if (is_file($path) || is_link($path)) {
        if (!unlink($path)) {
            throw new RuntimeException('No pudimos eliminar el archivo: ' . $path);
        }
        return;
    }

    $iterator = new FilesystemIterator($path);
    foreach ($iterator as $item) {
        deletePathRecursively($item->getPathname());
    }

    if (!rmdir($path)) {
        throw new RuntimeException('No pudimos eliminar la carpeta: ' . $path);
    }
}

function clearDirectoryContents(string $path): void
{
    if (!is_dir($path)) {
        ensureFilesystemDirectory($path);
        return;
    }

    $iterator = new FilesystemIterator($path);
    foreach ($iterator as $item) {
        deletePathRecursively($item->getPathname());
    }
}

function validateZipEntryName(string $name): void
{
    $normalized = str_replace('\\', '/', $name);
    if ($normalized === '' || $normalized === '.' || str_starts_with($normalized, '/')) {
        throw new RuntimeException('El archivo ZIP contiene rutas inválidas.');
    }

    if (preg_match('/^[A-Za-z]:\//', $normalized) === 1 || strpos($normalized, '../') !== false) {
        throw new RuntimeException('El archivo ZIP contiene rutas inseguras.');
    }
}

function extractInvitationArchiveToDirectory(string $archiveAbsolutePath, string $destinationPath): void
{
    if (!class_exists('ZipArchive')) {
        throw new RuntimeException('La extensión ZipArchive no está disponible en el servidor.');
    }

    ensureFilesystemDirectory($destinationPath);

    $zip = new ZipArchive();
    $status = $zip->open($archiveAbsolutePath);
    if ($status !== true) {
        throw new RuntimeException('No pudimos abrir el archivo ZIP de la invitación.');
    }

    for ($index = 0; $index < $zip->numFiles; $index += 1) {
        $entryName = $zip->getNameIndex($index);
        if ($entryName === false) {
            continue;
        }
        validateZipEntryName($entryName);
    }

    if (!$zip->extractTo($destinationPath)) {
        $zip->close();
        throw new RuntimeException('No pudimos extraer el proyecto ZIP.');
    }

    $zip->close();
}

function resolveExtractedInvitationProjectRoot(string $basePath): string
{
    $items = array_values(array_filter(scandir($basePath) ?: [], static function (string $item): bool {
        return $item !== '.' && $item !== '..';
    }));

    if (count($items) === 1) {
        $candidatePath = $basePath . DIRECTORY_SEPARATOR . $items[0];
        if (is_dir($candidatePath)) {
            return $candidatePath;
        }
    }

    return $basePath;
}

function createTemporaryFilesystemPath(string $suffix): string
{
    $base = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'invitarte_' . uniqid('', true);
    return $base . $suffix;
}

function createTemporaryDirectory(): string
{
    $path = createTemporaryFilesystemPath('');
    ensureFilesystemDirectory($path);
    return $path;
}

function createInvitationProjectArchive(string $eventCode, string $projectAbsolutePath): string
{
    if (!class_exists('ZipArchive')) {
        throw new RuntimeException('La extensión ZipArchive no está disponible en el servidor.');
    }

    $archivePath = createTemporaryFilesystemPath('.zip');
    $zip = new ZipArchive();
    $status = $zip->open($archivePath, ZipArchive::CREATE | ZipArchive::OVERWRITE);
    if ($status !== true) {
        throw new RuntimeException('No pudimos crear el archivo ZIP del proyecto.');
    }

    $rootPrefix = $eventCode . '/';
    $excludedNames = [
        '.git',
        '.github',
        '.codex-tmp',
        '.invitarte-image-cache.json',
        'node_modules',
        'dist',
    ];

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($projectAbsolutePath, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($iterator as $item) {
        $relativePath = str_replace('\\', '/', substr($item->getPathname(), strlen($projectAbsolutePath) + 1));
        if ($relativePath === '') {
            continue;
        }

        $segments = explode('/', $relativePath);
        $skip = false;
        foreach ($segments as $segment) {
            if (in_array($segment, $excludedNames, true)) {
                $skip = true;
                break;
            }
        }

        if ($skip) {
            continue;
        }

        $archiveEntryPath = $rootPrefix . $relativePath;
        if ($item->isDir()) {
            $zip->addEmptyDir($archiveEntryPath);
            continue;
        }

        if (!$zip->addFile($item->getPathname(), $archiveEntryPath)) {
            $zip->close();
            @unlink($archivePath);
            throw new RuntimeException('No pudimos agregar archivos al ZIP del proyecto.');
        }
    }

    $zip->close();

    return $archivePath;
}

function readInvitationProjectPackageList(string $packageJsonPath): array
{
    if (!is_file($packageJsonPath)) {
        return [];
    }

    $contents = file_get_contents($packageJsonPath);
    if ($contents === false) {
        return [];
    }

    $decoded = json_decode($contents, true);
    if (!is_array($decoded)) {
        return [];
    }

    $packageNames = [];
    foreach (['dependencies', 'devDependencies'] as $section) {
        $sectionPackages = $decoded[$section] ?? null;
        if (!is_array($sectionPackages)) {
            continue;
        }

        foreach (array_keys($sectionPackages) as $packageName) {
            if (!is_string($packageName) || trim($packageName) === '') {
                continue;
            }

            $packageNames[] = $packageName;
        }
    }

    return array_values(array_unique($packageNames));
}

function shouldInstallInvitationProjectDependencies(string $projectAbsolutePath): bool
{
    $packageJsonPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'package.json';
    $packageLockPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'package-lock.json';
    $nodeModulesPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'node_modules';

    if (!is_dir($nodeModulesPath)) {
        return true;
    }

    $nodeModulesTime = filemtime($nodeModulesPath) ?: 0;
    $packageJsonTime = is_file($packageJsonPath) ? (filemtime($packageJsonPath) ?: 0) : 0;
    $packageLockTime = is_file($packageLockPath) ? (filemtime($packageLockPath) ?: 0) : 0;

    foreach (readInvitationProjectPackageList($packageJsonPath) as $packageName) {
        $packagePath = $nodeModulesPath . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $packageName);
        if (!file_exists($packagePath)) {
            return true;
        }
    }

    return max($packageJsonTime, $packageLockTime) > $nodeModulesTime;
}

function runInvitationProjectCommand(string $projectAbsolutePath, string $command): string
{
    set_time_limit(0);
    invitationProjectDebugLog('command:start', [
        'projectAbsolutePath' => $projectAbsolutePath,
        'command' => $command,
    ]);

    $descriptorSpec = [
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    $wrappedCommand = PHP_OS_FAMILY === 'Windows'
        ? 'cmd /c ' . $command
        : $command;

    $process = proc_open($wrappedCommand, $descriptorSpec, $pipes, $projectAbsolutePath);
    if (!is_resource($process)) {
        throw new RuntimeException('No pudimos iniciar el proceso de compilación de la invitación.');
    }

    $stdout = stream_get_contents($pipes[1]);
    fclose($pipes[1]);

    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[2]);

    $exitCode = proc_close($process);
    $output = trim(($stdout ?: '') . PHP_EOL . ($stderr ?: ''));

    if ($exitCode !== 0) {
        invitationProjectDebugLog('command:failed', [
            'projectAbsolutePath' => $projectAbsolutePath,
            'command' => $command,
            'exitCode' => $exitCode,
            'output' => $output,
        ]);
        throw new RuntimeException(
            trim('Falló el comando del proyecto: ' . $command . '. ' . ($output !== '' ? $output : 'Sin salida adicional.'))
        );
    }

    invitationProjectDebugLog('command:done', [
        'projectAbsolutePath' => $projectAbsolutePath,
        'command' => $command,
        'exitCode' => $exitCode,
        'output' => $output,
    ]);
    return $output;
}

function ensureInvitationProjectDependencies(string $projectAbsolutePath): void
{
    if (!shouldInstallInvitationProjectDependencies($projectAbsolutePath)) {
        return;
    }

    $npmCommand = PHP_OS_FAMILY === 'Windows'
        ? 'npm.cmd install --no-fund --no-audit'
        : 'npm install --no-fund --no-audit';

    runInvitationProjectCommand($projectAbsolutePath, $npmCommand);
}

function optimizeInvitationProjectImages(string $projectAbsolutePath): void
{
    $scriptAbsolutePath = getWorkspaceRootPath() . DIRECTORY_SEPARATOR . 'scripts' . DIRECTORY_SEPARATOR . 'optimize-project-images.mjs';
    if (!is_file($scriptAbsolutePath) || !is_dir($projectAbsolutePath)) {
        return;
    }

    $nodeCommand = 'node ' . escapeshellarg($scriptAbsolutePath) . ' ' . escapeshellarg($projectAbsolutePath);

    try {
        runInvitationProjectCommand(getWorkspaceRootPath(), $nodeCommand);
    } catch (Throwable $error) {
        // Best effort: la invitacion debe seguir disponible aunque la optimizacion falle.
    }
}

function buildStaticInvitationProjectPreview(string $projectAbsolutePath): void
{
    $distPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'dist';
    clearDirectoryContents($distPath);
    copyDirectoryTree($projectAbsolutePath, $distPath, [
        '.git',
        '.github',
        '.codex-tmp',
        '.invitarte-image-cache.json',
        'dist',
        'node_modules',
        'project.meta.json',
    ]);
}

function buildInvitationProjectPreview(string $projectAbsolutePath): void
{
    invitationProjectDebugLog('preview-build:start', [
        'projectAbsolutePath' => $projectAbsolutePath,
    ]);
    $templateKind = resolveInvitationProjectTemplateKind($projectAbsolutePath);
    ensureInvitationProjectTemplateScaffold($projectAbsolutePath, $templateKind);
    ensureInvitationProjectHtmlEntry($projectAbsolutePath);
    ensureInvitationProjectAppEntry($projectAbsolutePath);

    if ($templateKind === 'static') {
        optimizeInvitationProjectImages($projectAbsolutePath);
        buildStaticInvitationProjectPreview($projectAbsolutePath);
        invitationProjectDebugLog('preview-build:done', [
            'projectAbsolutePath' => $projectAbsolutePath,
            'previewEntry' => $projectAbsolutePath . DIRECTORY_SEPARATOR . 'dist' . DIRECTORY_SEPARATOR . 'index.html',
            'templateKind' => $templateKind,
        ]);
        return;
    }

    $packageJsonPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'package.json';
    if (!is_file($packageJsonPath)) {
        throw new RuntimeException('El proyecto no contiene package.json.');
    }

    ensureInvitationProjectViteBase($projectAbsolutePath);
    optimizeInvitationProjectImages($projectAbsolutePath);
    ensureInvitationProjectDependencies($projectAbsolutePath);

    $buildCommand = PHP_OS_FAMILY === 'Windows'
        ? 'npm.cmd run build'
        : 'npm run build';

    runInvitationProjectCommand($projectAbsolutePath, $buildCommand);
    invitationProjectDebugLog('preview-build:done', [
        'projectAbsolutePath' => $projectAbsolutePath,
        'previewEntry' => $projectAbsolutePath . DIRECTORY_SEPARATOR . 'dist' . DIRECTORY_SEPARATOR . 'index.html',
        'templateKind' => $templateKind,
    ]);
}

function resolveInvitationProjectSourceLastModifiedAt(string $projectAbsolutePath): int
{
    if (!is_dir($projectAbsolutePath)) {
        return 0;
    }

    $excludedNames = [
        '.git',
        '.github',
        '.codex-tmp',
        'dist',
        'node_modules',
    ];
    $excludedFiles = [
        'project.meta.json',
    ];

    $latestTimestamp = 0;
    $filterIterator = new RecursiveCallbackFilterIterator(
        new RecursiveDirectoryIterator($projectAbsolutePath, FilesystemIterator::SKIP_DOTS),
        static function (SplFileInfo $item, $key, $iterator) use ($excludedNames, $excludedFiles): bool {
            $filename = $item->getFilename();
            if ($item->isDir()) {
                return !in_array($filename, $excludedNames, true);
            }

            return !in_array($filename, $excludedFiles, true);
        }
    );
    $iterator = new RecursiveIteratorIterator(
        $filterIterator,
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($iterator as $item) {
        if (!$item->isFile()) {
            continue;
        }

        $modifiedAt = $item->getMTime();
        if ($modifiedAt > $latestTimestamp) {
            $latestTimestamp = $modifiedAt;
        }
    }

    return $latestTimestamp;
}

function shouldBuildInvitationProjectPreview(string $projectAbsolutePath): bool
{
    $previewEntryPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'dist' . DIRECTORY_SEPARATOR . 'index.html';
    if (!is_file($previewEntryPath)) {
        return true;
    }

    $previewModifiedAt = filemtime($previewEntryPath) ?: 0;
    $sourceModifiedAt = resolveInvitationProjectSourceLastModifiedAt($projectAbsolutePath);

    return $sourceModifiedAt > $previewModifiedAt;
}

function ensureInvitationProjectPreview(string $projectAbsolutePath): bool
{
    if (!shouldBuildInvitationProjectPreview($projectAbsolutePath)) {
        return false;
    }

    buildInvitationProjectPreview($projectAbsolutePath);
    return true;
}

function syncInvitationProjectPublicPreview(string $eventCode, string $projectAbsolutePath): void
{
    $sourceDistPath = $projectAbsolutePath . DIRECTORY_SEPARATOR . 'dist';
    if (!is_dir($sourceDistPath)) {
        invitationProjectDebugLog('public-preview:skip-missing-dist', [
            'eventCode' => $eventCode,
            'projectAbsolutePath' => $projectAbsolutePath,
        ]);
        return;
    }

    $publicRootPath = getInvitationProjectsPublicRootPath();
    ensureFilesystemDirectory($publicRootPath);

    $publicProjectPath = buildInvitationProjectPublicAbsolutePath($eventCode);
    ensureFilesystemDirectory($publicProjectPath);

    $publicDistPath = buildInvitationProjectPublicDistAbsolutePath($eventCode);
    clearDirectoryContents($publicDistPath);
    copyDirectoryTree($sourceDistPath, $publicDistPath);
    invitationProjectDebugLog('public-preview:sync-done', [
        'eventCode' => $eventCode,
        'sourceDistPath' => $sourceDistPath,
        'publicDistPath' => $publicDistPath,
    ]);
}
