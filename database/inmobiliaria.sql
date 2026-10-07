-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 07-10-2026 a las 23:04:03
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `inmobiliaria`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consultas_crm`
--

CREATE TABLE `consultas_crm` (
  `id` bigint(20) NOT NULL,
  `propiedad_id` bigint(20) DEFAULT NULL,
  `cliente_id` bigint(20) DEFAULT NULL,
  `nombre_contacto` varchar(150) NOT NULL,
  `email_contacto` varchar(150) NOT NULL,
  `telefono_contacto` varchar(30) DEFAULT NULL,
  `mensaje` text NOT NULL,
  `origen` enum('EMAIL','WEB','WHATSAPP') DEFAULT NULL,
  `estado` enum('ATENDIDA','CANCELADA','EN_PROCESO','PENDIENTE') DEFAULT NULL,
  `fecha_consulta` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `consultas_crm`
--

INSERT INTO `consultas_crm` (`id`, `propiedad_id`, `cliente_id`, `nombre_contacto`, `email_contacto`, `telefono_contacto`, `mensaje`, `origen`, `estado`, `fecha_consulta`) VALUES
(1, 15, 1, 'Marcos Godoy', 'admin@inmobiliariamg.com', '+54 2923 410901', 'hola, quiero', 'WEB', 'PENDIENTE', '2026-09-29 15:11:41'),
(2, 15, 1, 'Marcos Godoy', 'godoy.marcos.cp@gmail.com', '+54 2923 410901', 'hola, quiero', 'WEB', 'PENDIENTE', '2026-09-29 15:12:53'),
(3, 13, 1, 'Marcos Godoy', 'admin@inmobiliariamg.com', '+54 2923 410901', 'hola\n', 'WEB', 'PENDIENTE', '2026-09-29 15:48:59'),
(4, 14, 1, 'Arturo Puig', 'admin@inmobiliariamg.com', '+54 2923 410901', 'Como estan', 'WEB', 'PENDIENTE', '2026-09-29 15:51:02'),
(5, 15, 2, 'Analia Gibelli', 'analia.gibelli@inmobiliariamg.com', '+54 2923 408097', 'hola\n', 'WEB', 'PENDIENTE', '2026-09-29 16:01:06');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contratos`
--

CREATE TABLE `contratos` (
  `id` bigint(20) NOT NULL,
  `propiedad_id` bigint(20) NOT NULL,
  `inquilino_id` bigint(20) NOT NULL,
  `agente_id` bigint(20) NOT NULL,
  `monto_mensual` decimal(15,2) NOT NULL,
  `porcentaje_honorarios` decimal(5,2) DEFAULT 5.00,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `dia_vencimiento_pago` int(11) DEFAULT 10,
  `estado` enum('ACTIVO','CANCELADO','FINALIZADO') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fotos_propiedad`
--

CREATE TABLE `fotos_propiedad` (
  `id` bigint(20) NOT NULL,
  `propiedad_id` bigint(20) NOT NULL,
  `url_foto` varchar(255) NOT NULL,
  `es_principal` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `fotos_propiedad`
--

INSERT INTO `fotos_propiedad` (`id`, `propiedad_id`, `url_foto`, `es_principal`) VALUES
(10, 12, 'http://localhost:8080/img/depto1.png', 1),
(13, 11, '/uploads/propiedades/11/3f324776-a65e-4cb3-94b7-00347d09060c_Casaquinta3.png', 0),
(14, 14, '/uploads/propiedades/14/5b0bc6f1-c221-47e7-bf85-7791c0bfa5a3_Casaquinta1.png', 1),
(15, 14, '/uploads/propiedades/14/cf3327be-b73b-4942-a7e7-1a54c69ca175_Casaquinta4.png', 0),
(16, 14, '/uploads/propiedades/14/672b0ae0-622b-4367-a48a-d878ff3c38ae_Casaquinta5.png', 0),
(20, 11, '/uploads/propiedades/11/7563a772-4e62-4f7b-8ff3-cec420c8d9ee_Casaquinta4.png', 0),
(23, 12, '/uploads/propiedades/12/8467609f-7b2b-4ef8-8a81-9bb3267d1aee_depto3.png', 0),
(24, 12, '/uploads/propiedades/12/fa0a7390-9e18-4d3b-9956-e6f687db4470_depto2.png', 0),
(26, 11, '/uploads/propiedades/11/3a5142b2-697d-4909-b199-be1ea22c1233_Casaquinta5.png', 0),
(28, 13, '/uploads/propiedades/13/f85fa046-b4b1-4b1d-b603-0bc587f9c8d2_frentelocal.png', 1),
(29, 13, '/uploads/propiedades/13/47170fb4-646f-47a0-aee6-8cc9cb0a0548_frentelocal1.png', 0),
(32, 15, '/uploads/propiedades/15/7d1dc7a2-2b04-4fcd-b959-da1331be0b5b_Casarancho.png', 1),
(34, 16, '/uploads/propiedades/16/8aede190-d329-43dd-bbb9-b1b09f3abc6c_Casarancho3.png', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` bigint(20) NOT NULL,
  `usuario_id` bigint(20) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `mensaje` text NOT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos`
--

CREATE TABLE `pagos` (
  `id` bigint(20) NOT NULL,
  `contrato_id` bigint(20) NOT NULL,
  `periodo` varchar(7) NOT NULL,
  `monto` decimal(15,2) NOT NULL,
  `monto_honorarios` decimal(15,2) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  `estado` enum('MOROSO','PAGADO','PENDIENTE') DEFAULT NULL,
  `comprobante_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `propiedades`
--

CREATE TABLE `propiedades` (
  `id` bigint(20) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo_propiedad` enum('CASA','DEPARTAMENTO','TERRENO','LOCAL','CAMPO') NOT NULL,
  `tipo_operacion` enum('VENTA','ALQUILER') NOT NULL,
  `precio` decimal(15,2) NOT NULL,
  `moneda` varchar(10) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `ciudad` varchar(100) NOT NULL DEFAULT 'Coronel Pringles',
  `provincia` varchar(100) NOT NULL DEFAULT 'Buenos Aires',
  `ambientes` int(11) DEFAULT NULL,
  `dormitorios` int(11) DEFAULT NULL,
  `banos` int(11) DEFAULT NULL,
  `superficie_total` decimal(10,2) DEFAULT NULL,
  `superficie_cubierta` decimal(10,2) DEFAULT NULL,
  `cochera` tinyint(1) DEFAULT 0,
  `patio` tinyint(1) DEFAULT 0,
  `estado` enum('DISPONIBLE','RESERVADA','ALQUILADA','VENDIDA') NOT NULL DEFAULT 'DISPONIBLE',
  `destacada` tinyint(1) DEFAULT 0,
  `agente_id` bigint(20) NOT NULL,
  `fecha_publicacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `propiedades`
--

INSERT INTO `propiedades` (`id`, `titulo`, `descripcion`, `tipo_propiedad`, `tipo_operacion`, `precio`, `moneda`, `direccion`, `ciudad`, `provincia`, `ambientes`, `dormitorios`, `banos`, `superficie_total`, `superficie_cubierta`, `cochera`, `patio`, `estado`, `destacada`, `agente_id`, `fecha_publicacion`) VALUES
(11, 'Casa céntrica con patio amplio', 'Hermosa propiedad refaccionada a nueva en zona céntrica de Coronel Pringles.', 'CASA', 'VENTA', 75000.00, 'USD', 'San Martín 450', 'Coronel Pringles', 'Buenos Aires', 4, 2, 1, 250.00, 110.00, 1, 1, 'DISPONIBLE', 0, 1, '2026-09-10 11:27:58'),
(12, 'Departamento moderno 2 ambientes', 'Departamento luminoso e ideal para estudiantes o parejas.', 'DEPARTAMENTO', 'ALQUILER', 180000.00, 'ARS', 'Avenida 25 de Mayo 1200', 'Coronel Pringles', 'Buenos Aires', 2, 1, 1, 50.00, 50.00, 0, 0, 'DISPONIBLE', 1, 2, '2026-09-10 11:27:58'),
(13, 'Local Comercial Zona Centro', 'Excelente local comercial ubicado sobre calle comercial de alto tránsito peatonal.', 'LOCAL', 'ALQUILER', 450000.00, 'ARS', 'Rivadavia 400', 'Coronel Pringles', 'Buenos Aires', 2, 0, 1, 80.00, 80.00, 0, 0, 'DISPONIBLE', 1, 3, '2026-09-10 11:27:58'),
(14, 'Casa Quinta con Amplio Parque', 'quinta con pileta', 'CAMPO', 'VENTA', 69999.86, 'USD', 'zona rural', 'Coronel Pringles', 'Buenos Aires', 6, 5, 4, NULL, NULL, 1, 1, 'DISPONIBLE', 1, 4, '2026-09-18 02:13:42'),
(15, 'casa ', 'Casa sencilla, pero calida', 'CASA', 'VENTA', 1000.00, 'USD', 'Rivadavia y Dorrego', 'Coronel Pringles', 'Buenos Aires', 2, 1, 1, NULL, NULL, 0, 0, 'DISPONIBLE', 1, 1, '2026-09-18 15:13:15'),
(16, 'casa ', 'casa centro bien cool', 'CASA', 'VENTA', 10.00, 'USD', 'Cabrera y 21', 'Coronel Pringles', 'Buenos Aires', 1, 0, 1, NULL, NULL, 0, 0, 'DISPONIBLE', 1, 2, '2026-09-18 20:54:12');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` bigint(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `rol` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `password`, `telefono`, `foto_perfil`, `rol`, `activo`, `fecha_creacion`) VALUES
(1, 'Marcos', 'Godoy', 'admin@inmobiliariamg.com', 'agente123', '+54 2923 410901', 'http://localhost:8080/img/Marcos.jpeg', 'ADMIN', 1, '2026-09-07 19:36:29'),
(2, 'Analia', 'Gibelli', 'analia.gibelli@inmobiliariamg.com', 'agente123', '+54 2923 408097', 'http://localhost:8080/img/Analia.jpeg', 'AGENTE', 1, '2026-09-09 17:53:48'),
(3, 'Martin', 'Godoy', 'martin.godoy@inmobiliariamg.com', 'agente123', '+54 2922 432101', 'http://localhost:8080/img/Martin.jpeg', 'AGENTE', 1, '2026-09-09 17:53:48'),
(4, 'Antonella', 'Godoy', 'antonella.godoy@inmobiliariamg.com', 'agente123', '+54 2922 424945', 'http://localhost:8080/img/Antonella.jpeg', 'AGENTE', 1, '2026-09-09 17:53:48');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `consultas_crm`
--
ALTER TABLE `consultas_crm`
  ADD PRIMARY KEY (`id`),
  ADD KEY `propiedad_id` (`propiedad_id`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- Indices de la tabla `contratos`
--
ALTER TABLE `contratos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `propiedad_id` (`propiedad_id`),
  ADD KEY `inquilino_id` (`inquilino_id`),
  ADD KEY `agente_id` (`agente_id`);

--
-- Indices de la tabla `fotos_propiedad`
--
ALTER TABLE `fotos_propiedad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `propiedad_id` (`propiedad_id`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contrato_id` (`contrato_id`);

--
-- Indices de la tabla `propiedades`
--
ALTER TABLE `propiedades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `agente_id` (`agente_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `consultas_crm`
--
ALTER TABLE `consultas_crm`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `contratos`
--
ALTER TABLE `contratos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `fotos_propiedad`
--
ALTER TABLE `fotos_propiedad`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pagos`
--
ALTER TABLE `pagos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `propiedades`
--
ALTER TABLE `propiedades`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `consultas_crm`
--
ALTER TABLE `consultas_crm`
  ADD CONSTRAINT `consultas_crm_ibfk_1` FOREIGN KEY (`propiedad_id`) REFERENCES `propiedades` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `consultas_crm_ibfk_2` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `contratos`
--
ALTER TABLE `contratos`
  ADD CONSTRAINT `contratos_ibfk_1` FOREIGN KEY (`propiedad_id`) REFERENCES `propiedades` (`id`),
  ADD CONSTRAINT `contratos_ibfk_2` FOREIGN KEY (`inquilino_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `contratos_ibfk_3` FOREIGN KEY (`agente_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `fotos_propiedad`
--
ALTER TABLE `fotos_propiedad`
  ADD CONSTRAINT `fotos_propiedad_ibfk_1` FOREIGN KEY (`propiedad_id`) REFERENCES `propiedades` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`contrato_id`) REFERENCES `contratos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `propiedades`
--
ALTER TABLE `propiedades`
  ADD CONSTRAINT `propiedades_ibfk_1` FOREIGN KEY (`agente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
