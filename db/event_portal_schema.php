<?php

require_once __DIR__ . '/config.php';

const EVENT_PORTAL_SCHEMA_VERSION = '2026-06-22-2';
const EVENT_PORTAL_SCHEMA_CACHE_TTL = 86400;

function ensureColumn(PDO $pdo, string $table, string $column, string $sql): void
{
    if (dbColumnExists($pdo, $table, $column)) {
        return;
    }

    $pdo->exec($sql);
}

function ensureIndex(PDO $pdo, string $table, string $index, string $sql): void
{
    if (dbIndexExists($pdo, $table, $index)) {
        return;
    }

    $pdo->exec($sql);
}

function getEventPortalSchemaCachePath(): string
{
    global $dbConfig;

    $databaseName = preg_replace('/[^A-Za-z0-9_-]+/', '_', (string) ($dbConfig['name'] ?? 'default')) ?: 'default';
    return rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'invitarte_schema_' . $databaseName . '.json';
}

function shouldSkipEventPortalSchemaSync(): bool
{
    $cachePath = getEventPortalSchemaCachePath();
    if (!is_file($cachePath)) {
        return false;
    }

    $contents = @file_get_contents($cachePath);
    if ($contents === false || trim($contents) === '') {
        return false;
    }

    $payload = json_decode($contents, true);
    if (!is_array($payload)) {
        return false;
    }

    if (($payload['version'] ?? '') !== EVENT_PORTAL_SCHEMA_VERSION) {
        return false;
    }

    $checkedAt = (int) ($payload['checked_at'] ?? 0);
    if ($checkedAt <= 0) {
        return false;
    }

    return (time() - $checkedAt) < EVENT_PORTAL_SCHEMA_CACHE_TTL;
}

function markEventPortalSchemaSyncComplete(): void
{
    $cachePath = getEventPortalSchemaCachePath();
    $payload = [
        'version' => EVENT_PORTAL_SCHEMA_VERSION,
        'checked_at' => time(),
    ];

    @file_put_contents(
        $cachePath,
        json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL,
        LOCK_EX
    );
}

function ensureEventPortalSchema(PDO $pdo): void
{
    static $isReady = false;
    if ($isReady) {
        return;
    }

    if (shouldSkipEventPortalSchemaSync()) {
        $isReady = true;
        return;
    }

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `evento` (
            `idEvento` int(11) NOT NULL AUTO_INCREMENT,
            `codigo_evento` varchar(20) NOT NULL,
            `nombre_evento` varchar(150) NOT NULL,
            `host_name` varchar(150) DEFAULT NULL,
            `fecha_evento` datetime NOT NULL,
            `fecha_evento_texto` varchar(160) DEFAULT NULL,
            `lugar` varchar(250) NOT NULL,
            `maps_url` varchar(500) DEFAULT NULL,
            `design_id` varchar(100) DEFAULT NULL,
            `invitation_id` varchar(100) DEFAULT NULL,
            `package_id` varchar(30) DEFAULT NULL,
            `share_url` varchar(255) DEFAULT NULL,
            `feature_labels_json` text DEFAULT NULL,
            `estatus` varchar(50) NOT NULL DEFAULT 'activo',
            `fecha_creacion` date NOT NULL,
            `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            `expires_at` datetime DEFAULT NULL,
            PRIMARY KEY (`idEvento`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `invitado` (
            `idInvitado` int(11) NOT NULL AUTO_INCREMENT,
            `idEvento` int(11) NOT NULL,
            `codigo_invitado` varchar(50) NOT NULL,
            `guest_url` varchar(255) DEFAULT NULL,
            `nombre` varchar(100) NOT NULL,
            `grupo` varchar(100) DEFAULT NULL,
            `telefono` varchar(100) NOT NULL,
            `correo` varchar(100) NOT NULL,
            `pases_asignados` int(11) NOT NULL DEFAULT 1,
            `estatus` int(11) NOT NULL DEFAULT 0,
            `nota` text DEFAULT NULL,
            `checked_in_at` datetime DEFAULT NULL,
            `check_in_count` int(11) NOT NULL DEFAULT 0,
            `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`idInvitado`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `confirmaciones` (
            `idConfirmacion` int(11) NOT NULL AUTO_INCREMENT,
            `idInvitado` int(11) NOT NULL,
            `estatus` int(11) NOT NULL DEFAULT 0,
            PRIMARY KEY (`idConfirmacion`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `mesa` (
            `idMesa` int(11) NOT NULL AUTO_INCREMENT,
            `idEvento` int(11) NOT NULL,
            `nombre` varchar(100) NOT NULL,
            `descripcion` varchar(100) NOT NULL DEFAULT '',
            `estatus` int(11) NOT NULL DEFAULT 1,
            PRIMARY KEY (`idMesa`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `mesa_asignada` (
            `idMesaAsignada` int(11) NOT NULL AUTO_INCREMENT,
            `idMesa` int(11) NOT NULL,
            `idInvitado` int(11) NOT NULL,
            PRIMARY KEY (`idMesaAsignada`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `invitacion_evento` (
            `idInvitacionEvento` int(11) NOT NULL AUTO_INCREMENT,
            `idEvento` int(11) NOT NULL,
            `codigo_evento` varchar(20) NOT NULL,
            `design_id` varchar(100) DEFAULT NULL,
            `invitation_id` varchar(100) DEFAULT NULL,
            `share_url` varchar(255) DEFAULT NULL,
            `project_path` varchar(255) DEFAULT NULL,
            `app_entry` varchar(255) DEFAULT NULL,
            `template_source` varchar(255) DEFAULT NULL,
            `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`idInvitacionEvento`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    ensureColumn($pdo, 'evento', 'host_name', "ALTER TABLE `evento` ADD COLUMN `host_name` varchar(150) DEFAULT NULL AFTER `nombre_evento`");
    ensureColumn($pdo, 'evento', 'fecha_evento_texto', "ALTER TABLE `evento` ADD COLUMN `fecha_evento_texto` varchar(160) DEFAULT NULL AFTER `fecha_evento`");
    ensureColumn($pdo, 'evento', 'maps_url', "ALTER TABLE `evento` ADD COLUMN `maps_url` varchar(500) DEFAULT NULL AFTER `lugar`");
    ensureColumn($pdo, 'evento', 'design_id', "ALTER TABLE `evento` ADD COLUMN `design_id` varchar(100) DEFAULT NULL AFTER `lugar`");
    ensureColumn($pdo, 'evento', 'invitation_id', "ALTER TABLE `evento` ADD COLUMN `invitation_id` varchar(100) DEFAULT NULL AFTER `design_id`");
    ensureColumn($pdo, 'evento', 'package_id', "ALTER TABLE `evento` ADD COLUMN `package_id` varchar(30) DEFAULT NULL AFTER `invitation_id`");
    ensureColumn($pdo, 'evento', 'share_url', "ALTER TABLE `evento` ADD COLUMN `share_url` varchar(255) DEFAULT NULL AFTER `package_id`");
    ensureColumn($pdo, 'evento', 'feature_labels_json', "ALTER TABLE `evento` ADD COLUMN `feature_labels_json` text DEFAULT NULL AFTER `share_url`");
    ensureColumn($pdo, 'evento', 'created_at', "ALTER TABLE `evento` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP AFTER `fecha_creacion`");
    ensureColumn($pdo, 'evento', 'updated_at', "ALTER TABLE `evento` ADD COLUMN `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`");
    ensureColumn($pdo, 'evento', 'expires_at', "ALTER TABLE `evento` ADD COLUMN `expires_at` datetime DEFAULT NULL AFTER `updated_at`");

    ensureColumn($pdo, 'invitado', 'guest_url', "ALTER TABLE `invitado` ADD COLUMN `guest_url` varchar(255) DEFAULT NULL AFTER `codigo_invitado`");
    ensureColumn($pdo, 'invitado', 'grupo', "ALTER TABLE `invitado` ADD COLUMN `grupo` varchar(100) DEFAULT NULL AFTER `nombre`");
    ensureColumn($pdo, 'invitado', 'nota', "ALTER TABLE `invitado` ADD COLUMN `nota` text DEFAULT NULL AFTER `estatus`");
    ensureColumn($pdo, 'invitado', 'checked_in_at', "ALTER TABLE `invitado` ADD COLUMN `checked_in_at` datetime DEFAULT NULL AFTER `nota`");
    ensureColumn($pdo, 'invitado', 'check_in_count', "ALTER TABLE `invitado` ADD COLUMN `check_in_count` int(11) NOT NULL DEFAULT 0 AFTER `checked_in_at`");
    ensureColumn($pdo, 'invitado', 'updated_at', "ALTER TABLE `invitado` ADD COLUMN `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `fecha_creacion`");

    ensureIndex($pdo, 'evento', 'uniq_evento_codigo', "ALTER TABLE `evento` ADD UNIQUE KEY `uniq_evento_codigo` (`codigo_evento`)");
    ensureIndex($pdo, 'invitado', 'idx_invitado_evento', "ALTER TABLE `invitado` ADD KEY `idx_invitado_evento` (`idEvento`)");
    ensureIndex($pdo, 'invitado', 'uniq_invitado_evento_codigo', "ALTER TABLE `invitado` ADD UNIQUE KEY `uniq_invitado_evento_codigo` (`idEvento`, `codigo_invitado`)");
    ensureIndex($pdo, 'confirmaciones', 'uniq_confirmaciones_invitado', "ALTER TABLE `confirmaciones` ADD UNIQUE KEY `uniq_confirmaciones_invitado` (`idInvitado`)");
    ensureIndex($pdo, 'mesa', 'idx_mesa_evento', "ALTER TABLE `mesa` ADD KEY `idx_mesa_evento` (`idEvento`)");
    ensureIndex($pdo, 'mesa', 'uniq_mesa_evento_nombre', "ALTER TABLE `mesa` ADD UNIQUE KEY `uniq_mesa_evento_nombre` (`idEvento`, `nombre`)");
    ensureIndex($pdo, 'mesa_asignada', 'uniq_mesa_asignada_invitado', "ALTER TABLE `mesa_asignada` ADD UNIQUE KEY `uniq_mesa_asignada_invitado` (`idInvitado`)");
    ensureIndex($pdo, 'mesa_asignada', 'idx_mesa_asignada_mesa', "ALTER TABLE `mesa_asignada` ADD KEY `idx_mesa_asignada_mesa` (`idMesa`)");
    ensureIndex($pdo, 'invitacion_evento', 'uniq_invitacion_evento_evento', "ALTER TABLE `invitacion_evento` ADD UNIQUE KEY `uniq_invitacion_evento_evento` (`idEvento`)");
    ensureIndex($pdo, 'invitacion_evento', 'uniq_invitacion_evento_codigo', "ALTER TABLE `invitacion_evento` ADD UNIQUE KEY `uniq_invitacion_evento_codigo` (`codigo_evento`)");
    ensureIndex($pdo, 'invitacion_evento', 'uniq_invitacion_evento_invitation', "ALTER TABLE `invitacion_evento` ADD UNIQUE KEY `uniq_invitacion_evento_invitation` (`invitation_id`)");
    ensureIndex($pdo, 'invitacion_evento', 'idx_invitacion_evento_design', "ALTER TABLE `invitacion_evento` ADD KEY `idx_invitacion_evento_design` (`design_id`)");
    ensureColumn($pdo, 'invitacion_evento', 'project_path', "ALTER TABLE `invitacion_evento` ADD COLUMN `project_path` varchar(255) DEFAULT NULL AFTER `share_url`");
    ensureColumn($pdo, 'invitacion_evento', 'app_entry', "ALTER TABLE `invitacion_evento` ADD COLUMN `app_entry` varchar(255) DEFAULT NULL AFTER `project_path`");
    ensureColumn($pdo, 'invitacion_evento', 'template_source', "ALTER TABLE `invitacion_evento` ADD COLUMN `template_source` varchar(255) DEFAULT NULL AFTER `app_entry`");

    $pdo->exec(
        "INSERT INTO `invitacion_evento` (
            `idEvento`,
            `codigo_evento`,
            `design_id`,
            `invitation_id`,
            `share_url`
        )
        SELECT
            e.`idEvento`,
            e.`codigo_evento`,
            CASE
                WHEN e.`design_id` IS NULL OR e.`design_id` = '' OR e.`design_id` = e.`codigo_evento` OR e.`design_id` LIKE 'manual-%' THEN NULL
                ELSE e.`design_id`
            END,
            e.`invitation_id`,
            COALESCE(NULLIF(e.`share_url`, ''), CONCAT('https://invitarte.app/v/', COALESCE(NULLIF(e.`invitation_id`, ''), e.`codigo_evento`)))
        FROM `evento` e
        LEFT JOIN `invitacion_evento` ie ON ie.`idEvento` = e.`idEvento`
        WHERE ie.`idInvitacionEvento` IS NULL"
    );

    markEventPortalSchemaSyncComplete();
    $isReady = true;
}
