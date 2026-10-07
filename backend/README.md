# Backend - Inmobiliaria MG (Spring Boot REST API)

Este directorio contiene el servidor backend construido con **Java 21**, **Spring Boot 3 / 4**, **Spring Data JPA**, **Spring Security** y **WebSockets**.

---

## Requisitos Previos Backend

1. **Java JDK 21** o superior instalado (`java -version`).
2. **Servidor MySQL** (XAMPP o MySQL Server) corriendo en `localhost:3306`.
3. Base de datos MySQL nombrada `inmobiliaria`.

---

## Configuración de Base de Datos y XAMPP

El archivo de configuración se encuentra en:  
`src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/inmobiliaria?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### Paso 1: Crear la Base de Datos en MySQL
Ejecute la siguiente consulta en phpMyAdmin (`http://localhost/phpmyadmin`) o cliente SQL:
```sql
CREATE DATABASE IF NOT EXISTS inmobiliaria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## Cómo Ejecutar el Backend Localmente

### En Windows (PowerShell / CMD)
```cmd
cd C:\xampp\htdocs\Inmobiliaria\backend
mvnw.cmd spring-boot:run
```

### En Linux / macOS
```bash
cd /ruta/a/Inmobiliaria/backend
./mvnw spring-boot:run
```

El servidor REST y de WebSockets iniciará en:  
🌐 **`http://localhost:8080`**

---

## Usuarios Sembrados Automáticamente (`DataSeeder.java`)

Al arrancar por primera vez, Spring Boot ejecuta la clase `DataSeeder` que inicializa los siguientes usuarios en la base de datos MySQL (todos con contraseña **`agente123`**):

- **Administrador**: `admin@inmobiliariamg.com` / `agente123` (Rol: `ADMIN`)
- **Agente 1**: `analia.gibelli@inmobiliariamg.com` / `agente123` (Rol: `AGENTE`)
- **Agente 2**: `martin.godoy@inmobiliariamg.com` / `agente123` (Rol: `AGENTE`)
- **Agente 3**: `antonella.godoy@inmobiliariamg.com` / `agente123` (Rol: `AGENTE`)

---

## Endpoints REST Principales

### Propiedades (`/api/propiedades`)
- `GET /api/propiedades`: Listar todas las propiedades.
- `GET /api/propiedades/{id}`: Obtener detalle de una propiedad por ID.
- `GET /api/propiedades/buscar`: Búsqueda avanzada con filtros (ciudad, tipo, precio, ambientes, etc.).
- `POST /api/propiedades`: Crear una nueva propiedad (Multipart FormData).
- `PUT /api/propiedades/{id}`: Actualizar propiedad existente (Multipart FormData).
- `DELETE /api/propiedades/{id}`: Eliminar propiedad por ID.

### Consultas CRM (`/api/consultas`)
- `GET /api/consultas`: Listar todas las consultas por fecha de llegada descendente (Admin).
- `GET /api/consultas/agente/{agenteId}`: Listar consultas de propiedades asignadas a un agente (Agente).
- `POST /api/consultas`: Crear consulta desde el portal público.
- `PATCH /api/consultas/{id}/estado?estado={NUEVO_ESTADO}`: Cambiar estado (PENDIENTE, EN_PROCESO, ATENDIDA, CANCELADA).
- `DELETE /api/consultas/{id}`: Eliminar consulta (Exclusivo Administrador).

### Autenticación (`/api/auth`)
- `POST /api/auth/login`: Autenticar usuario (Email y Password).
- `POST /api/auth/register`: Registrar nuevo usuario/agente.

### WebSockets (`/ws-inmobiliaria`)
- Canal público de chat en tiempo real: `/topic/public`
- Envío de mensajes: `/app/chat.sendMessage` y `/app/chat.addUser`
