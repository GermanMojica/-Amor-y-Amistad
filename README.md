# Sorteo de Amor y Amistad ❤️🎁

Aplicación web moderna, segura, mobile-first y lista para producción en **Vercel** para realizar sorteos de *Amor y Amistad* / *Amigo Secreto*.

![Sorteo de Amor y Amistad Banner](/public/og-image.jpg)

---

## 🌟 Características Principales

1. **Enlace Único y Estados Globales**:
   - `REGISTRATION`: Registro abierto para que los participantes se unan.
   - `READY`: Registro cerrado, listo para sortear.
   - `DRAWING`: Sorteo activo; cada persona consulta su amigo secreto de manera privada.
   - `FINISHED`: Todos los participantes han descubierto su amigo secreto.
2. **Prevención Estricta de Nombres Duplicados**:
   - Normalización canónica (eliminación de espacios múltiples, acentos y mayúsculas: `"Juan Pérez"` == `"  juan   perez  "` == `"JUAN PÉREZ"`).
   - Doble validación en frontend y restricción `@unique` a nivel de base de datos.
3. **Autenticación Segura de Participantes (PIN Secreto)**:
   - Cada participante define un **PIN de 4 dígitos** al registrarse.
   - Para descubrir su amigo secreto, debe ingresar su PIN.
   - **Garantía de privacidad**: Nadie puede ver el amigo secreto de otra persona alterando IDs o URLs.
4. **Algoritmo Matemático de Sorteo (Desarreglo / Derangement)**:
   - **Regla 1**: Nadie puede sacar su propio nombre ($P(i) \neq i$).
   - **Regla 2**: Cada participante da a exactamente 1 persona.
   - **Regla 3**: Cada persona recibe de exactamente 1 participante.
   - **Regla 4**: Para $N$ participantes existen exactamente $N$ asignaciones biyectivas.
   - **Regla 5**: Generación atómica en backend (`prisma.$transaction`) persistida en base de datos.
5. **Panel del Organizador Protegido**:
   - Acceso discreto mediante PIN de Administrador.
   - Gestión de participantes (ver lista y eliminar participantes no deseados).
   - Control de fases y disparador de sorteo.
   - Opción de reiniciar sorteo con confirmación segura.
   - Botón para copiar y compartir el link por WhatsApp.
6. **Diseño Visual & Experiencia Móvil**:
   - Paleta temática: Rubí, Oro Rosa, Oro Champán y Terciopelo Oscuro.
   - Efecto Glassmorphism con micro-interacciones.
   - Fondo con corazones flotantes animados.
   - Animación 3D de caja de regalo con lazo dorado y explosión de confeti (`canvas-confetti`).
   - Optimizado para WhatsApp con tarjetas OpenGraph y Favicon SVG.

---

## 🚀 Instalación y Desarrollo Local

### 1. Clonar o ingresar al proyecto
```bash
cd "c:\Users\Sena Tic\Desktop\German\Amor-Amistad"
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo `.env.example` a `.env`:
```env
# Base de datos local (SQLite)
DATABASE_URL="file:./dev.db"

# PIN de acceso para el panel del organizador
ADMIN_SECRET_PIN="2026"

# Entorno
NODE_ENV="development"
```

### 4. Inicializar base de datos
```bash
npx prisma db push
```

### 5. Iniciar servidor de desarrollo
```bash
npm run dev
```
Abre en tu navegador: [http://localhost:3000](http://localhost:3000) (o el puerto indicado en la terminal).

---

## 🧪 Pruebas Automatizadas

El proyecto incluye 3 suites de pruebas automatizadas:

### 1. Pruebas Unitarias y Monte Carlo (1,000 Sorteos Aleatorios)
Valida normalización de caracteres diacríticos, validación de inputs y propiedades matemáticas de permutación libre de puntos fijos:
```bash
npm test
```

### 2. Prueba End-to-End de Flujo Completo
Prueba el ciclo de vida completo contra los endpoints del servidor:
```bash
node tests/e2e-api-flow.mjs
```

### 3. Prueba de Concurrencia y Sorteos Simultáneos
Simula 10 participantes abriendo sus sobres exactamente en el mismo milisegundo mediante `Promise.all`:
```bash
node tests/concurrency-test.mjs
```

---

## 🌐 Despliegue en Producción (Vercel)

Para desplegar en Vercel con una base de datos PostgreSQL Serverless (Neon, Supabase o Vercel Postgres):

### Paso 1: Configurar Base de Datos PostgreSQL
1. Crea una base de datos en [Neon](https://neon.tech), [Supabase](https://supabase.com) o **Vercel Postgres**.
2. Copia la cadena de conexión `postgresql://user:password@host/dbname?sslmode=require`.

### Paso 2: Ajustar `prisma/schema.prisma` para PostgreSQL
Cambia el proveedor en `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Paso 3: Subir a GitHub y Vercel
1. Conecta tu repositorio de GitHub en [Vercel](https://vercel.com).
2. En la pestaña **Environment Variables** de Vercel, agrega:
   - `DATABASE_URL`: Tu conexión de PostgreSQL.
   - `ADMIN_SECRET_PIN`: El PIN que usarás como organizador (ej: `2026`).
   - `NEXT_PUBLIC_APP_URL`: La URL de tu app en Vercel (ej: `https://mi-sorteo.vercel.app`).
3. Haz clic en **Deploy**.

---

## 📁 Estructura del Proyecto

```
├── app/
│   ├── api/
│   │   ├── admin/auth/          # Autenticación del organizador
│   │   ├── admin/draw/          # Generador de sorteo atómico
│   │   ├── admin/participants/  # Listado y eliminación de participantes
│   │   ├── admin/reset/         # Reinicio seguro del sorteo
│   │   ├── admin/state/         # Transiciones de estado
│   │   ├── draw/reveal/         # Revelación segura con PIN
│   │   ├── participants/list-public/ # Lista pública sanitizada
│   │   ├── participants/register/    # Registro con validación anti-duplicados
│   │   └── state/               # Estado global y conteos
│   ├── globals.css              # Sistema de diseño, glassmorphism y animaciones
│   ├── icon.svg                 # Ícono SVG temático
│   ├── layout.tsx               # Metadatos SEO, OpenGraph y partículas flotantes
│   └── page.tsx                 # Controlador de vistas según estado
├── components/
│   ├── AdminModal.tsx           # Panel de control protegido del organizador
│   ├── DrawingView.tsx          # Vista de apertura de sobre con PIN y confeti
│   ├── FinishedView.tsx         # Vista de sorteo finalizado
│   ├── FloatingHearts.tsx       # Corazones animados en segundo plano
│   ├── Header.tsx               # Cabecera con estado en vivo y acceso admin
│   ├── ReadyView.tsx            # Vista de espera previo al sorteo
│   └── RegistrationView.tsx     # Formulario de registro y tarjeta de éxito
├── lib/
│   ├── auth.ts                  # Helpers de autenticación administrativa
│   ├── crypto.ts                # Hasheo de PINs con bcrypt y números aleatorios seguros
│   ├── db.ts                    # Instancia singleton de Prisma Client
│   ├── drawAlgorithm.ts         # Algoritmo matemático de desarreglo y validador
│   └── normalization.ts         # Normalización estricta de nombres y prevención de duplicados
├── prisma/
│   └── schema.prisma            # Modelos EventConfig, Participant y DrawAssignment
├── tests/
│   ├── run-tests.mjs            # Tests unitarios y Monte Carlo 1,000 iteraciones
│   ├── e2e-api-flow.mjs         # Test integral de endpoints
│   └── concurrency-test.mjs     # Test de alta concurrencia
└── package.json
```

---

## 🔒 Seguridad y Privacidad

- **Zero-Leakage Architecture**: Las asignaciones entre participantes se calculan y almacenan únicamente en backend y **nunca** se envían en masa al cliente.
- **PIN Hashing**: Los PINs de los participantes se hashean usando `bcrypt` antes de guardarse en base de datos.
- **Transacciones Atómicas**: Las asignaciones del sorteo y los reinicios se ejecutan dentro de transacciones de base de datos para evitar estados corruptos o inconsistencias.
