# 🏡 Inmobiliaria MG - Plataforma Web Integrada

Plataforma Web Full-Stack completa para la gestión inmobiliaria, administración de catálogo de propiedades, ruteo de consultas CRM por agente, reportes en PDF/Excel y comunicación en tiempo real mediante WebSockets.

---

## 🔑 Credenciales de Acceso para Evaluación y Prueba

Al iniciar el servidor backend por primera vez, el componente **`DataSeeder`** crea automáticamente la estructura de base de datos e inserta los usuarios de prueba iniciales. 

Todos los usuarios predeterminados comparten la misma contraseña: **`agente123`**.

| Nombre y Apellido | Correo Electrónico (Email) | Contraseña | Rol / Permisos | Capacidades en el Sistema |
| :--- | :--- | :--- | :--- | :--- |
| **Marcos Godoy** | `admin@inmobiliariamg.com` | `agente123` | **ADMIN** | **Control Total**: Crear, editar y eliminar propiedades; ver todas las consultas CRM del sistema; filtrar mensajes por agente; borrar consultas; dar de alta nuevos usuarios/agentes; y exportar reportes a Excel y PDF. |
| **Analia Gibelli** | `analia.gibelli@inmobiliariamg.com` | `agente123` | **AGENTE** | Panel de administración para cargar/modificar inmuebles y responder las consultas dirigidas exclusivamente a sus propiedades asignadas. |
| **Martin Godoy** | `martin.godoy@inmobiliariamg.com` | `agente123` | **AGENTE** | Gestión de inmuebles asignados y respuestas rápidas por WhatsApp / Email. |
| **Antonella Godoy** | `antonella.godoy@inmobiliariamg.com` | `agente123` | **AGENTE** | Gestión de inmuebles asignados y respuestas rápidas por WhatsApp / Email. |

> ℹ️ **Nota sobre Clientes y Registro**: Los visitantes del sitio público pueden navegar libremente el catálogo, enviar consultas directas y conversar por el chat en vivo. El alta de nuevas cuentas de Agentes y Administradores se realiza únicamente por el Administrador en la pestaña `/admin`.

---

## 🛠️ Requisitos del Sistema

Antes de comenzar, asegúrate de contar con lo siguiente instalado en tu equipo:

1. **XAMPP** (con los servicios **Apache** y **MySQL**).
2. **Java JDK 21** o superior.
3. **Node.js (v18.0 o superior)** y **npm**.
4. Naves de la última versión (Chrome, Edge, Firefox, Brave).

---

## 🚀 Guía Paso a Paso para Ejecución Local desde GitHub

### 📥 Paso 1: Clonar el Repositorio
Abre tu terminal y clona el proyecto en la carpeta deseada (ej. `C:\xampp\htdocs\`):
```bash
cd C:\xampp\htdocs
git clone https://github.com/tu-usuario/Inmobiliaria.git
cd Inmobiliaria
```

---

### 🗄️ Paso 2: Configurar XAMPP y la Base de Datos MySQL
1. Abre el panel de control de **XAMPP** (`XAMPP Control Panel`).
2. Haz clic en **Start** en los módulos de **Apache** y **MySQL**.
3. Abre tu navegador e ingresa a phpMyAdmin:
   👉 `http://localhost/phpmyadmin`
4. Crea la base de datos ejecutando la siguiente sentencia SQL en la pestaña **SQL**:
   ```sql
   CREATE DATABASE IF NOT EXISTS inmobiliaria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
5. *(Opcional)* Crea la carpeta de almacenamiento de imágenes en tu disco local para sincronizar fotos de XAMPP:
   `C:\xampp\img\`

> 💡 **Conexión Predeterminada del Backend (`application.properties`)**:
> - **Host**: `localhost:3306`
> - **Database**: `inmobiliaria`
> - **Username**: `root`
> - **Password**: *(vacía por defecto en XAMPP)*

---

### ☕ Paso 3: Iniciar el Backend (Spring Boot Java)
1. Abre una terminal de comandos (CMD o PowerShell) en la carpeta del backend:
   ```cmd
   cd C:\xampp\htdocs\Inmobiliaria\backend
   ```
2. Ejecute el wrapper de Maven para compilar e iniciar el servidor:
   - **En Windows**:
     ```cmd
     mvnw.cmd spring-boot:run
     ```
   - **En Linux / macOS**:
     ```bash
     ./mvnw spring-boot:run
     ```
3. Espera a ver el mensaje en consola:  
   `Started InmobiliariaApplication in X.XXX seconds`  
   🌐 **Servidor Backend listo en**: `http://localhost:8080`

---

### ⚛️ Paso 4: Iniciar el Frontend (React + Vite)
1. Abre una **segunda ventana o pestaña de terminal** en la carpeta del frontend:
   ```cmd
   cd C:\xampp\htdocs\Inmobiliaria\frontend
   ```
2. Instala las dependencias de Node.js:
   ```cmd
   npm install
   ```
3. Inicia el servidor de desarrollo Vite:
   ```cmd
   npm run dev
   ```
4. Abre tu navegador web e ingresa a:  
   🌐 **Aplicación Frontend en**: `http://localhost:5173`

---

## 🌟 Mapa de Funcionalidades Principales

1. **Navegación Pública y Búsqueda de Inmuebles (`http://localhost:5173`)**:
   - Catálogo interactivo con filtros combinados (operación, tipo de inmueble, precio min/máx, ambientes, dormitorios y ciudad).
   - Widget con la **cotización del Dólar Oficial / Peso Argentino** en tiempo real en la barra superior (Navbar).
   - Selector global de **Modo Claro / Modo Oscuro**.

2. **Ficha Detallada del Inmueble (`/propiedad/:id`)**:
   - Carrusel de fotos de alta resolución con contador de imágenes.
   - Especificaciones técnicas: **Superficie Total (m²)** y **Superficie Cubierta (m²)**, ambientes, dormitorios y baños.
   - Ficha del Agente asignado con botón de consulta directa por **WhatsApp**.
   - Formulario de **"Enviar mensaje directo"** que registra la consulta en el CRM con el título, dirección y referencia del inmueble.

3. **Panel de Administración (`/admin`)**:
   - **Gestión de Propiedades**: Formulario completo para crear, editar y eliminar propiedades, subir múltiples fotos, cargar m² cubiertos/totales y marcar propiedades como destacadas.
   - **Bandeja CRM de Consultas**: Muestra los envíos ordenados estrictamente por fecha de llegada.
     - *Ruteo por Agente*: Cada Agente ve los mensajes de sus propiedades; el Administrador ve todos los mensajes.
     - *Visualización Enriquecida*: Muestra la foto miniatura, dirección, estado actual del inmueble (`DISPONIBLE`, `RESERVADA`, `VENDIDA`, `ALQUILADA`) y canal de origen.
     - *Respuestas Rápidas*: Botones directos para responder por WhatsApp (con mensaje prellenado), Email (`mailto:`) y actualizar el estado de seguimiento.
     - *Borrado Exclusivo*: Botón de eliminación definitiva de consultas para el Administrador.
   - **Alta de Usuarios / Agentes**: Formulario exclusivo para que el Administrador registre nuevos Agentes o usuarios sin registro público.
   - **Exportación de Reportes**: Descarga inmediata del catálogo en formato **Excel (.csv)** y generación de fichas impresas en **PDF**.

4. **Consulta en Vivo / Chat con WebSockets**:
   - Widget flotante en la esquina inferior derecha.
   - **Alertas cuando está cerrado**: Emisión de tono sonoro sintético (Web Audio API) y badge parpadeante con contador de mensajes no leídos.
   - Botón **"Vaciar"** en la cabecera para limpiar la conversación actual.

---

## 📂 Estructura del Proyecto

```
Inmobiliaria/
├── backend/                       # Servidor Java Spring Boot
│   ├── src/main/java/com/mg/Inmobiliaria/
│   │   ├── config/                # DataSeeder, SecurityConfig, WebConfig, WebSocketConfig
│   │   ├── controller/            # Endpoints REST (Propiedad, ConsultaCrm, Auth, Chat, etc.)
│   │   ├── dto/                   # ConsultaCrmDTO, ChatMessageDTO, ContratoDTO, PagoDTO
│   │   ├── model/                 # Entidades JPA (Propiedad, ConsultaCrm, Usuario, FotoPropiedad, etc.)
│   │   ├── repository/            # Interfaces Spring Data JPA
│   │   └── service/               # Lógica de negocio y FileStorageService
│   ├── pom.xml                    # Dependencias Maven (Spring Boot 3/4, JPA, Web, WebSockets, MySQL)
│   └── README.md                  # Documentación específica del Backend
├── frontend/                      # Cliente SPA en React + Vite
│   ├── src/
│   │   ├── api/                   # inmobiliariaApi.js (Peticiones fetch y FormData)
│   │   ├── components/            # Navbar, Footer, ChatWidget, ConsultasCrm, PropertyCard, DolarWidget
│   │   ├── context/               # AuthContext (Sesión) y ThemeContext (Modo Oscuro/Claro)
│   │   ├── pages/                 # Home, Admin, Login, PropertyDetail
│   │   └── styles/                # custom.css y estilos Bootstrap
│   ├── package.json               # Dependencias npm (React 19, Vite, Bootstrap 5, FontAwesome)
│   └── README.md                  # Documentación específica del Frontend
└── README.md                      # Documentación principal del proyecto
```

---

## ❓ Solución de Problemas Frecuentes (Troubleshooting)

- **Error al conectar a MySQL**:
  Asegúrate de que MySQL esté iniciado en el XAMPP Control Panel y que no haya otro servicio ocupando el puerto `3306`.
- **Las imágenes no cargan**:
  Verifica que el backend esté ejecutándose en `http://localhost:8080`, ya que las imágenes locales son servidas a través de este servidor.
- **Error CORS al conectar Frontend con Backend**:
  El backend cuenta con `WebConfig` configurado para permitir peticiones desde `http://localhost:5173`. Asegúrate de usar dicho puerto para el frontend.

---

## 👨‍💻 Créditos y Licencia
**Inmobiliaria MG** - Desarrollado por Marcos E. Godoy  
Contacto: `godoy.marcos.cp@gmail.com`  
Proyecto de uso académico y profesional interno.
