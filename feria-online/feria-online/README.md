# 🎪 FeriaOnline — Sistema de Ferias y Eventos Online

Sistema completo para crear y gestionar ferias online con venta de tickets, charlas, reuniones privadas y directorio de empresas.

---

## 🏗️ Arquitectura

```
feria-online/
├── backend/          # Node.js + Express + MySQL
│   └── src/
│       ├── config/
│       │   ├── database.js      # Conexión MySQL (pool)
│       │   └── schema.sql       # Tablas + seed admin
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── eventosController.js
│       │   ├── actividadesController.js  # charlas, reuniones, tickets
│       │   ├── empresasController.js
│       │   └── adminController.js
│       ├── middlewares/
│       │   └── auth.js          # JWT + requireRole + requireEventAccess
│       ├── routes/
│       │   └── index.js         # Todas las rutas /api/*
│       └── index.js             # Entry point Express
│
└── frontend/         # React 18 + Vite
    └── src/
        ├── context/
        │   └── AuthContext.jsx   # Estado global de sesión
        ├── services/
        │   └── api.js            # Axios + todos los servicios
        ├── components/
        │   └── common/
        │       ├── Navbar.jsx
        │       ├── Modal.jsx
        │       ├── EventCard.jsx
        │       └── Sidebars.jsx  # Admin, EventAdmin, Empresa
        └── pages/
            ├── HomePage.jsx
            ├── EventosPage.jsx
            ├── EventoDetailPage.jsx
            ├── EmpresasPage.jsx
            ├── EmpresaDetailPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── ProfilePage.jsx
            ├── admin/            # Panel superadmin
            ├── event-admin/      # Panel organizador de evento
            ├── empresa/          # Panel empresa
            └── participante/     # Mis tickets
```

---

## 👥 Roles del Sistema

| Rol | Descripción | Accesos |
|-----|-------------|---------|
| **admin** | Superadministrador | Crea eventos, asigna admins, gestiona usuarios y empresas |
| **admin_evento** | Organizador de evento | Crea charlas, reuniones y tickets en su evento asignado |
| **empresa** | Empresa expositora | Perfil corporativo, catálogo de productos, asiste a ferias |
| **participante** | Asistente | Inscripción a eventos/charlas, compra tickets |

---

## ⚙️ Instalación

### Requisitos
- Node.js >= 18
- MySQL >= 8.0
- npm >= 9

---

### 1. Base de datos MySQL

```sql
-- En tu cliente MySQL:
mysql -u root -p < backend/src/config/schema.sql
```

Esto crea la base de datos `feria_online` con todas las tablas y un usuario admin por defecto:
- **Email:** `admin@feria.com`
- **Password:** `Admin1234!`

---

### 2. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales MySQL

# Iniciar en modo desarrollo
npm run dev

# O en producción
npm start
```

El servidor corre en `http://localhost:5000`

#### Variables de entorno requeridas (`.env`):
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=feria_online
JWT_SECRET=cambia_esto_por_algo_muy_seguro
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

---

### 3. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Build para producción
npm run build
```

El frontend corre en `http://localhost:5173`

> El proxy de Vite redirige `/api/*` → `http://localhost:5000` automáticamente.

---

## 🚀 Flujo de uso

### Como Admin:
1. Ingresar con `admin@feria.com` / `Admin1234!`
2. Ir a **Panel Admin → Eventos → Nuevo evento**
3. Asignar un **admin de evento** (usuario registrado como participante)
4. Publicar el evento

### Como Admin de Evento:
1. Ingresar con la cuenta asignada
2. Ir a **Mi Evento → Charlas** para crear charlas con ponentes
3. Ir a **Mi Evento → Reuniones** para crear reuniones privadas con cupo y precio
4. Ir a **Mi Evento → Tickets** para crear tipos de entrada (General, VIP, Empresa)

### Como Empresa:
1. Registrarse eligiendo el tipo "Empresa"
2. Completar el perfil corporativo en **Mi Empresa → Dashboard**
3. Agregar productos/servicios en **Mi Empresa → Productos**
4. Inscribirse a ferias disponibles

### Como Participante:
1. Registrarse eligiendo "Participante"
2. Explorar eventos en la sección pública
3. Inscribirse a charlas gratuitas
4. Comprar tickets (se genera código QR único)
5. Reservar reuniones privadas

---

## 📡 API Endpoints principales

```
POST   /api/auth/register          Registro de usuarios
POST   /api/auth/login             Login → JWT
GET    /api/auth/me                Perfil del usuario autenticado

GET    /api/eventos                Lista pública de eventos
GET    /api/eventos/:id            Detalle con charlas/tickets/reuniones
POST   /api/eventos                [admin] Crear evento
PUT    /api/eventos/:id            [admin] Editar evento

POST   /api/charlas                [admin, admin_evento] Crear charla
POST   /api/charlas/:id/inscribirse Inscribirse a charla

POST   /api/reuniones              [admin, admin_evento] Crear reunión
POST   /api/reuniones/:id/reservar Reservar plaza en reunión

POST   /api/tickets                [admin, admin_evento] Crear ticket
POST   /api/tickets/:id/comprar    Comprar ticket (transacción atómica)
GET    /api/mis-compras            Tickets comprados por el usuario

GET    /api/empresas               Directorio público de empresas
PUT    /api/empresas/perfil        [empresa] Editar perfil
POST   /api/empresas/productos     [empresa] Agregar producto

GET    /api/admin/stats            [admin] Estadísticas generales
GET    /api/admin/usuarios         [admin] Lista de usuarios
```

---

## 🗄️ Modelo de datos

```
usuarios          → base de todos los roles
empresas          → perfil extendido para rol empresa
productos_empresa → catálogo de la empresa
eventos           → las ferias (creadas por admin, gestionadas por admin_evento)
charlas           → sesiones dentro de un evento
reuniones         → reuniones privadas con cupo y precio
tickets           → tipos de entrada para un evento
compras_tickets   → historial de compras con código QR único
inscripciones_charlas   → inscripciones a charlas (gratuitas)
reservas_reuniones      → reservas de reuniones
participacion_eventos   → registro de asistencia a eventos
```

---

## 🔒 Seguridad

- Contraseñas hasheadas con **bcryptjs** (salt rounds: 10)
- Autenticación con **JWT** (7 días de expiración)
- Rutas protegidas por **middleware de roles**
- Compra de tickets con **transacción MySQL atómica** (evita sobreventa)
- CORS configurado solo para el frontend

---

## 📦 Stack técnico

**Backend:**
- Node.js + Express 4
- MySQL2 (pool de conexiones)
- bcryptjs, jsonwebtoken, uuid

**Frontend:**
- React 18 + Vite
- React Router DOM 6
- Axios
- react-hot-toast
- date-fns

---

## 🔧 Personalización frecuente

**Cambiar moneda:** Buscar `$` en los archivos `.jsx` y reemplazar por tu símbolo.

**Agregar más roles:** Editar el ENUM en `schema.sql`, el middleware `auth.js` y agregar rutas en `routes/index.js`.

**Email de notificaciones:** Integrar **nodemailer** en `actividadesController.js` al confirmar compras.

**Pagos reales:** Integrar **Stripe** o **MercadoPago** en el endpoint `/api/tickets/:id/comprar`.

**Subida de imágenes:** Integrar **Cloudinary** o **AWS S3** con multer en el backend.
