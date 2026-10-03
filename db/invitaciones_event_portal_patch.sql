ALTER TABLE `evento`
  ADD COLUMN `host_name` varchar(150) DEFAULT NULL AFTER `nombre_evento`,
  ADD COLUMN `fecha_evento_texto` varchar(160) DEFAULT NULL AFTER `fecha_evento`,
  ADD COLUMN `maps_url` varchar(500) DEFAULT NULL AFTER `lugar`,
  ADD COLUMN `design_id` varchar(100) DEFAULT NULL AFTER `lugar`,
  ADD COLUMN `invitation_id` varchar(100) DEFAULT NULL AFTER `design_id`,
  ADD COLUMN `package_id` varchar(30) DEFAULT NULL AFTER `invitation_id`,
  ADD COLUMN `share_url` varchar(255) DEFAULT NULL AFTER `package_id`,
  ADD COLUMN `feature_labels_json` text DEFAULT NULL AFTER `share_url`,
  ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP AFTER `fecha_creacion`,
  ADD COLUMN `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`,
  ADD COLUMN `expires_at` datetime DEFAULT NULL AFTER `updated_at`,
  ADD UNIQUE KEY `uniq_evento_codigo` (`codigo_evento`);

ALTER TABLE `invitado`
  ADD COLUMN `guest_url` varchar(255) DEFAULT NULL AFTER `codigo_invitado`,
  ADD COLUMN `grupo` varchar(100) DEFAULT NULL AFTER `nombre`,
  ADD COLUMN `nota` text DEFAULT NULL AFTER `estatus`,
  ADD COLUMN `checked_in_at` datetime DEFAULT NULL AFTER `nota`,
  ADD COLUMN `check_in_count` int(11) NOT NULL DEFAULT 0 AFTER `checked_in_at`,
  ADD COLUMN `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `fecha_creacion`,
  ADD KEY `idx_invitado_evento` (`idEvento`),
  ADD UNIQUE KEY `uniq_invitado_evento_codigo` (`idEvento`, `codigo_invitado`);

ALTER TABLE `confirmaciones`
  ADD UNIQUE KEY `uniq_confirmaciones_invitado` (`idInvitado`);

ALTER TABLE `mesa`
  ADD KEY `idx_mesa_evento` (`idEvento`),
  ADD UNIQUE KEY `uniq_mesa_evento_nombre` (`idEvento`, `nombre`);

ALTER TABLE `mesa_asignada`
  ADD UNIQUE KEY `uniq_mesa_asignada_invitado` (`idInvitado`),
  ADD KEY `idx_mesa_asignada_mesa` (`idMesa`);

CREATE TABLE IF NOT EXISTS `invitacion_evento` (
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
  PRIMARY KEY (`idInvitacionEvento`),
  UNIQUE KEY `uniq_invitacion_evento_evento` (`idEvento`),
  UNIQUE KEY `uniq_invitacion_evento_codigo` (`codigo_evento`),
  UNIQUE KEY `uniq_invitacion_evento_invitation` (`invitation_id`),
  KEY `idx_invitacion_evento_design` (`design_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `invitacion_evento` (
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
WHERE ie.`idInvitacionEvento` IS NULL;
