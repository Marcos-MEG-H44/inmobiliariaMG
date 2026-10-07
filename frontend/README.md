# Frontend - Inmobiliaria MG (React + Vite SPA)

Aplicación web Single Page Application (SPA) desarrollada con **React 19**, **Vite**, **Bootstrap 5**, **FontAwesome 7**, **SockJS** y **StompJS**.

---

## Requisitos Previos Frontend

1. **Node.js** (versión 18.0 o superior).
2. **npm** (incluido con Node.js).
3. Servidor Backend Spring Boot corriendo en `http://localhost:8080`.

---

## Cómo Ejecutar el Frontend Localmente

### Paso 1: Navegar a la carpeta frontend e instalar dependencias
```bash
cd C:\xampp\htdocs\Inmobiliaria\frontend
npm install
```

### Paso 2: Iniciar el Servidor de Desarrollo (Vite)
```bash
npm run dev
```

La aplicación estará lista e indicará en consola:
🌐 **`http://localhost:5173`**

Abre `http://localhost:5173` en tu navegador web.

---

## Comandos Disponibles

- `npm run dev`: Inicia el servidor local de desarrollo con Hot Module Replacement (HMR).
- `npm run build`: Empaqueta la aplicación para producción en la carpeta `dist/`.
- `npm run preview`: Previsualiza la build de producción localmente.
- `npm run lint`: Ejecuta las reglas de validación de código ESLint.

---

## Cuentas de Acceso para Pruebas

Para probar las distintas funcionalidades del sistema, puedes iniciar sesión en el botón destacado **"Acceso / Iniciar Sesión"** en la barra superior con los siguientes usuarios (todos utilizan la contraseña **`agente123`**):

- **Administrador**: `admin@inmobiliariamg.com` / `agente123`
- **Agente 1**: `analia.gibelli@inmobiliariamg.com` / `agente123`
- **Agente 2**: `martin.godoy@inmobiliariamg.com` / `agente123`
- **Agente 3**: `antonella.godoy@inmobiliariamg.com` / `agente123`

---

## Tecnologías y Librerías Utilizadas

- **React 19**: Biblioteca UI principal.
- **Vite 8**: Empaquetador ultrarrápido con soporte HMR.
- **Bootstrap 5.3**: Framework de estilos responsivos y componentes visuales.
- **FontAwesome 7**: Iconografía vectorial integrada.
- **React Router DOM v7**: Enrutamiento y rutas protegidas.
- **SockJS & StompJS**: Conexión WebSockets para el Chat en Vivo en tiempo real.
