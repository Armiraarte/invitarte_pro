-- Full database rebuild for the Invitarte event portal
-- Generated from the current PHP backend schema on 2026-07-24

SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `invitaciones`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `invitaciones`;

DROP TABLE IF EXISTS `mesa_asignada`;
DROP TABLE IF EXISTS `confirmaciones`;
DROP TABLE IF EXISTS `invitacion_evento`;
DROP TABLE IF EXISTS `mesa`;
DROP TABLE IF EXISTS `invitado`;
DROP TABLE IF EXISTS `evento`;

CREATE TABLE `evento` (
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
  PRIMARY KEY (`idEvento`),
  UNIQUE KEY `uniq_evento_codigo` (`codigo_evento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `invitado` (
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
  PRIMARY KEY (`idInvitado`),
  KEY `idx_invitado_evento` (`idEvento`),
  UNIQUE KEY `uniq_invitado_evento_codigo` (`idEvento`, `codigo_invitado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `confirmaciones` (
  `idConfirmacion` int(11) NOT NULL AUTO_INCREMENT,
  `idInvitado` int(11) NOT NULL,
  `estatus` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`idConfirmacion`),
  UNIQUE KEY `uniq_confirmaciones_invitado` (`idInvitado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mesa` (
  `idMesa` int(11) NOT NULL AUTO_INCREMENT,
  `idEvento` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL DEFAULT '',
  `estatus` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`idMesa`),
  KEY `idx_mesa_evento` (`idEvento`),
  UNIQUE KEY `uniq_mesa_evento_nombre` (`idEvento`, `nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mesa_asignada` (
  `idMesaAsignada` int(11) NOT NULL AUTO_INCREMENT,
  `idMesa` int(11) NOT NULL,
  `idInvitado` int(11) NOT NULL,
  PRIMARY KEY (`idMesaAsignada`),
  UNIQUE KEY `uniq_mesa_asignada_invitado` (`idInvitado`),
  KEY `idx_mesa_asignada_mesa` (`idMesa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `invitacion_evento` (
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

ALTER TABLE `invitado`
  ADD CONSTRAINT `fk_invitado_evento`
    FOREIGN KEY (`idEvento`) REFERENCES `evento` (`idEvento`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE `confirmaciones`
  ADD CONSTRAINT `fk_confirmaciones_invitado`
    FOREIGN KEY (`idInvitado`) REFERENCES `invitado` (`idInvitado`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE `mesa`
  ADD CONSTRAINT `fk_mesa_evento`
    FOREIGN KEY (`idEvento`) REFERENCES `evento` (`idEvento`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE `mesa_asignada`
  ADD CONSTRAINT `fk_mesa_asignada_mesa`
    FOREIGN KEY (`idMesa`) REFERENCES `mesa` (`idMesa`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mesa_asignada_invitado`
    FOREIGN KEY (`idInvitado`) REFERENCES `invitado` (`idInvitado`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE `invitacion_evento`
  ADD CONSTRAINT `fk_invitacion_evento_evento`
    FOREIGN KEY (`idEvento`) REFERENCES `evento` (`idEvento`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- Recovered minimal event/project link found in /invitaciones/W9JSR86LCH
-- Guest list could not be reconstructed from the repository because no source list exists locally.
INSERT INTO `evento` (
  `idEvento`,
  `codigo_evento`,
  `nombre_evento`,
  `host_name`,
  `fecha_evento`,
  `fecha_evento_texto`,
  `lugar`,
  `maps_url`,
  `design_id`,
  `invitation_id`,
  `package_id`,
  `share_url`,
  `feature_labels_json`,
  `estatus`,
  `fecha_creacion`,
  `created_at`,
  `updated_at`,
  `expires_at`
) VALUES (
  1,
  'W9JSR86LCH',
  'Nombre 1 & Nombre 2',
  'Nombre 1 & Nombre 2',
  '2026-10-18 16:30:00',
  '18/10/2026 16:30',
  'Hacienda San Jose, Km 12.5 Carretera Real del Monte, Tepotzotlan, Edo. de Mexico',
  'https://maps.google.com/?q=Hacienda+San+Jose+Tepotzotlan',
  NULL,
  'W9JSR86LCH',
  'ORO',
  NULL,
  '["Datos del evento","Invitados","Acceso QR"]',
  'activo',
  '2026-06-24',
  '2026-06-24 01:40:57',
  '2026-07-03 19:34:52',
  '2026-08-17 19:34:52'
);

INSERT INTO `invitacion_evento` (
  `idInvitacionEvento`,
  `idEvento`,
  `codigo_evento`,
  `design_id`,
  `invitation_id`,
  `share_url`,
  `project_path`,
  `app_entry`,
  `template_source`,
  `created_at`,
  `updated_at`
) VALUES (
  1,
  1,
  'W9JSR86LCH',
  NULL,
  'W9JSR86LCH',
  NULL,
  'invitaciones/W9JSR86LCH',
  'invitaciones/W9JSR86LCH/src/App.tsx',
  'invitacion_plantilla/invitación-digital/plantilla',
  '2026-06-24 01:40:57',
  '2026-07-03 19:34:52'
);

-- Safety backfill: if more events are inserted manually later without a project link,
-- this creates the missing row using the current backend expectations.
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
    WHEN e.`design_id` IS NULL
      OR e.`design_id` = ''
      OR e.`design_id` = e.`codigo_evento`
      OR e.`design_id` LIKE 'manual-%'
    THEN NULL
    ELSE e.`design_id`
  END,
  e.`invitation_id`,
  e.`share_url`
FROM `evento` e
LEFT JOIN `invitacion_evento` ie ON ie.`idEvento` = e.`idEvento`
WHERE ie.`idInvitacionEvento` IS NULL;

SET FOREIGN_KEY_CHECKS = 1;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
