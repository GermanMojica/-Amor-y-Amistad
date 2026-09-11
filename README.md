# Sorteo de Amigo Secreto

Aplicación web moderna, segura, responsive (mobile-first) y lista para producción en **Vercel** para realizar sorteos de **Amigo Secreto** con sugerencias personalizadas de regalos (*qué te gusta / qué no te gusta*).

![Sorteo de Amigo Secreto Banner](/public/og-image.jpg)

---

## Características Principales

1. **Enlace Único y Estados Globales**:
   - `REGISTRATION`: Registro abierto para que los participantes se unan y dejen sus preferencias de regalo.
   - `READY`: Registro cerrado por el organizador, listo para generar asignaciones.
   - `DRAWING`: Sorteo activo; cada persona consulta su asignación de forma 100% privada.
   - `FINISHED`: Todos los participantes han consultado su amigo secreto.
2. **Sugerencias y Pistas de Regalo Personalizadas (`giftNotes`)**:
   - Al registrarse, cada participante puede detallar qué le gusta, qué no le gusta, tallas o preferencias.
   - Al consultar su resultado, la persona asignada recibe la tarjeta con el nombre y la sección destacada de sugerencias de regalo.
3. **Prevención Estricta de Nombres Duplicados**:
   - Normalización canónica (eliminación de espacios redundantes, acentos y mayúsculas: `"Juan Pérez"` == `"  juan   perez  "` == `"JUAN PÉREZ"`).
   - Doble validación en frontend y restricción `@unique` a nivel de base de datos.
4. **Autenticación Segura de Participantes (PIN Secreto)**:
   - Cada participante define un **PIN de 4 dígitos** al registrarse.
   - Para consultar su asignación, debe ingresar su PIN personal.
   - **Privacidad garantizada**: Ningún usuario puede ver el resultado de otra persona alterando IDs o URLs.
5. **Algoritmo Matemático de Sorteo (Desarreglo / Derangement)**:
   - **Regla 1**: Nadie puede sacar su propio nombre ($P(i) \neq i$).
   - **Regla 2**: Cada participante da a exactamente 1 persona.
   - **Regla 3**: Cada persona recibe de exactamente 1 participante.
   - **Regla 4**: Para $N$ participantes existen exactamente $N$ asignaciones biyectivas.
   - **Regla 5**: Generación atómica en backend (`prisma.$transaction`) persistida en base de datos.
6. **Panel de Administración Protegido**:
   - Acceso discreto mediante PIN de Administrador (por defecto `2026`).
   - Gestión de participantes (ver lista, sugerencias de regalo y eliminar participantes).
   - Control de fases y ejecución del sorteo.
   - Opción de reiniciar sorteo con modal de confirmación.
   - Botón para copiar el enlace de acceso público.
7. **Diseño Visual & Experiencia Móvil**:
   - Paleta sobria y moderna en modo oscuro: Grafito, Índigo y Acentos Carmesí con efectos *Glassmorphism*.
   - Partículas de iluminación ambiental sutiles.
   - Optimizado para móviles y compatible con previsualizaciones Open Graph.

---

## Instalación y Desarrollo Local

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
Abre en tu navegador: [http://localhost:3000](http://localhost:3000).

---

## Pruebas Automatizadas

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
Simula 10 participantes consultando sus asignaciones simultáneamente mediante `Promise.all`:
```bash
node tests/concurrency-test.mjs
```

---

## Despliegue en Producción (Vercel)

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
   - `DATABASE_URL`: Tu cadena de conexión PostgreSQL.
   - `ADMIN_SECRET_PIN`: El PIN de administración (ej: `2026`).
   - `NEXT_PUBLIC_APP_URL`: La URL pública de tu app en Vercel.
3. Haz clic en **Deploy**.

---

## Estructura del Proyecto

```
├── app/
│   ├── api/
│   │   ├── admin/auth/          # Autenticación del organizador
│   │   ├── admin/draw/          # Generador de sorteo atómico
│   │   ├── admin/participants/  # Listado y eliminación de participantes
│   │   ├── admin/reset/         # Reinicio seguro del sorteo
│   │   ├── admin/state/         # Transiciones de estado
│   │   ├── draw/reveal/         # Revelación segura con PIN y notas de regalo
│   │   ├── participants/list-public/ # Lista pública sanitizada
│   │   ├── participants/register/    # Registro con validación anti-duplicados y notas
│   │   └── state/               # Estado global y conteos
│   ├── globals.css              # Sistema de diseño sobrio sin emojis
│   ├── icon.svg                 # Ícono SVG minimalista
│   ├── layout.tsx               # Metadatos SEO, OpenGraph y partículas luminosas
│   └── page.tsx                 # Controlador de vistas según estado
├── components/
│   ├── AdminModal.tsx           # Panel de control protegido del organizador
│   ├── AmbientParticles.tsx     # Partículas de luz ambiental
│   ├── DrawingView.tsx          # Vista de consulta con PIN y notas
│   ├── FinishedView.tsx         # Vista de sorteo finalizado
│   ├── Header.tsx               # Cabecera con estado en vivo y acceso admin
│   ├── ReadyView.tsx            # Vista de espera previo al sorteo
│   └── RegistrationView.tsx     # Formulario de registro con notas de regalo
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
│   ├── e2e-api-flow.mjs         # Test integral de endpoints y notas de regalo
│   └── concurrency-test.mjs     # Test de alta concurrencia
└── package.json
```
