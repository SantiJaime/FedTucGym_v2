# FedTucGym – Sistema de torneos

Aplicación web para gestionar torneos de gimnasia de la federación (Tucumán): gimnasios inscriben alumnos a torneos, jueces cargan puntajes, el administrador crea torneos y usuarios. UI y mensajes de error en **español**; el código mezcla español/inglés (`puntaje`, `Gimnasio`, `Alumnos`, `calcularEdadYCategoriaAl31Dic`).

No es un monorepo con workspace: dos proyectos npm independientes, sin git en la raíz, **sin tests** y **sin SQL/migraciones en el repo** (el esquema de Postgres vive solo en la BD).

```
backend/   Express 5 + TypeScript (ESM) + pg (SQL a mano, sin ORM)
frontend/  React 19 + Vite 6 + TypeScript + react-bootstrap
```

## Comandos

Backend (`cd backend`):
- `npm run dev` → `tsx watch src/index.ts`
- `npm run build` → `tsc && node fix_imports.js` (fix_imports reescribe imports para ESM en `dist/`), `npm start` → `node dist/index.js`
- Variables requeridas (ver `src/config/env.ts`, falla al arrancar si falta alguna): `PGHOST PGPORT PGUSER PGDATABASE PGPASSWORD PGSCHEMA JWT_SECRET JWT_REFRESH_SECRET COOKIE_SECRET NODE_ENV SHEETS_SCRIPT_URL SHEETS_SECRET`; `SHEETS_SECRET` (requerido, S3 cerrado); `PORT` (3000) y `CRON_SECRET` opcionales; sin `CRON_SECRET` los endpoints de cron rechazan todo. `.env.example` está incompleto. No leer ni commitear `backend/.env`.

Frontend (`cd frontend`):
- `npm run dev` (Vite, puerto 5173), `npm run build` (`tsc -b && vite build`), `npm run lint`
- `.env`: `VITE_URL_BACK_LOCAL`, `VITE_URL_BACK_DEPLOY` (ambas obligatorias). Deploy: `vercel.json` **en la raíz** (frontend, API y crons en un solo proyecto de Vercel); con `VITE_URL_BACK_DEPLOY=/api`. En local apuntar a `http://localhost:3000/api`. Railway queda solo como vuelta atrás hasta el corte (M12).

## Dominio

- **Roles**: `Administrador`, `Gimnasio`, `Juez`. Un *gimnasio es un usuario* (`users` con rol Gimnasio): `id_gym == userId`.
- **Members** = alumnos de un gimnasio (`full_name, birth_date, dni, id_gym, id_level, age, id_category`).
- **Categorías** (id): 1 Pre mini (6-7), 2 Mini (8-9), 3 Pre infantil (10-11), 4 Infantil (12-13), 5 Juvenil (14-15), 6 Mayores (16+), 7 Pulgas (2-5). Edad calculada **al 31 de diciembre del año en curso** (`backend/src/utils/categories.ts`). Se guardan `age` e `id_category` en la tabla; un cron anual de Vercel (1 ene 02:00 de Argentina, `/api/cron/categories`) llama al procedimiento SQL `actualizar_todas_las_categorias()`.
- **Niveles** (id 1-12): Escuelita, 1-B, 1-A, 2 … 10. Listas duplicadas en `frontend/src/constants/const.ts` (los ids deben coincidir con la BD).
- **Tournaments**: `name`, `date_range` (tipo Postgres `daterange`, `[start,end]`), `inscription_date_end`. Regla: `inscription_date_end < startDate <= endDate`. En `update`, `inscription_date_end` se recalcula como `startDate - 15 días`.
- **members_tournaments**: inscripción (`paid`, `scored`). La limpieza automática de inscripciones **no pagas** está **pausada** (ver S4): ningún flujo marca `paid = true`. Los gimnasios solo pueden inscribir o dar de baja hasta `inscription_date_end` inclusive; el Administrador puede hacerlo después.
- **Puntajes**: se gestionan íntegramente en Google Sheets vía `services/sheets.service.ts`; el backend ya no guarda ni sirve puntajes (el sistema anterior con tabla `puntajes`, `scores.service`/`scores.controller` y endpoints `/puntajes` está **deprecado**).
- Zona horaria de "hoy": `America/Argentina/Buenos_Aires`.
- **Google Sheets**: los jueces puntúan en una hoja de cálculo (Apps Script web app, `SHEETS_SCRIPT_URL`). `POST /tournaments/:tid/sheets` envía inscriptos al script; `GET /tournaments/:tid/sheets` devuelve `{scriptUrl}?sheet=<nombre>` para abrir la hoja. Un cron diario de Vercel (03:00 de Argentina, `/api/cron/export`) exporta los torneos con inscripción cerrada y `exported_at` nulo; si Sheets falla, reintenta al día siguiente.

## Backend (`backend/src`)

Capas: `routes → controllers → services → pg pool`, validación con Zod en `schemas/`.

- `app.ts` (exporta `app`, sin `listen`): Express, `helmet`, CORS con whitelist (`torneos-fedtucgim.vercel.app`, más `localhost:5173` fuera de producción, `credentials: true`), `cookie-parser` con secreto (cookies **firmadas**), morgan. Rutas montadas bajo `/api`: `/api/users`, `/api/tournaments`, `/api/members`, `/api/cron`. `trust proxy = 1` para obtener la IP real del cliente. `index.ts` solo hace `listen` en desarrollo; en Vercel, `api/index.mjs` (raíz) reexporta `backend/dist/app.js`. Los paths de endpoints de este documento van con el prefijo `/api`.
- `routes/cron.routes.ts`: `GET /api/cron/export` y `GET /api/cron/categories`, protegidos con `Authorization: Bearer <CRON_SECRET>`. Ya no se usa `node-cron`.
- Roles: usar siempre el enum `Role` de `constants/const.ts` (`Role.ADMIN`, `Role.GIMNASIO`, `Role.JUEZ`), nunca strings literales.
- `database/db.config.ts`: `Pool` con `search_path=PGSCHEMA`; parser de tipo `DATE` devuelve string crudo (evita desfase de TZ).
- `services/index.service.ts`: instancia singleton de cada servicio (`userService`, `membersService`, `tournamentService`, `sheetsService`); los controllers importan de acá.
- **La lógica pesada está en SQL de la BD**: vistas `members_view`, `users_view`; funciones `get_members_tournaments_by_gym`, `get_members_tournaments_by_category_and_level`, `get_available_members_for_tournament`, `get_members_tournaments`, `get_registered_members_by_tournament`, `get_users_by_full_name`; procedimiento `actualizar_todas_las_categorias`. Tablas: `users`, `members`, `tournaments`, `members_tournaments`, `refresh_tokens`. Para cambiar estas consultas hay que tocar la BD, no solo el repo. Los resultados paginados traen `total_count`; el tamaño de página es **20** fijo.
- Excepción: filtros de alumnos por gimnasio se arman dinámicamente en `utils/utils.ts` (`buildMembersQuery` / `buildCountMembersQuery`, parametrizados).
- **Auth** (`middleware/auth.ts`, `refreshAuth.ts`, `utils/jwt.config.ts`): login (`POST /users/login`) valida bcrypt y setea dos cookies `httpOnly` firmadas: `accessToken` (JWT con `JWT_SECRET`, 1 h) y `refreshToken` (JWT con `JWT_REFRESH_SECRET`, 24 h, guardado **hasheado SHA-256** en `refresh_tokens`). `authMiddleware([roles])` lee la cookie, verifica y deja `req.user = {userId, role, full_name}` (tipado en `types/express.d.ts`). `POST /users/refresh-token` valida el refresh contra la BD, emite nuevo access y **rota** el refresh conservando el vencimiento original (el anterior vale 30 s más para peticiones simultáneas). `logout` revoca el refresh en la BD; el access ya emitido sigue siendo válido hasta vencer. Login limitado a 5 fallos por IP+cuenta y 20 por IP cada 15 min (tabla `login_attempts`, SQL en `backend/sql/`). Cookies: `COOKIE_OPTIONS` de `constants/const.ts` (`httpOnly`, `signed`, `sameSite: lax`, `secure` en producción) más `maxAge`; se borran con `clearAuthCookies`.
- Autorización por recurso: un Gimnasio solo puede ver/operar sus propios datos. Las operaciones sobre un alumno pasan `gymScope(req)` (`utils/utils.ts`; `null` = Administrador) al service, que filtra por `id_gym` en el SQL: un recurso ajeno responde 404.
- Convención de controllers: validar con `DTO.parse(...)` (sin `safeParse` ni `if`): el `ZodError` llega a `errorHandler`, que lo responde 400 con `parseErrors` (une issues en un string). Errores `{ status, error }`, éxito `{ message, <entidad> }`. **No usar `try/catch` genéricos**: Express 5 reenvía los errores async a `errorHandler` (último middleware en `app.ts`), que traduce códigos de Postgres, JWT, Zod y body parser, y responde `{ status, error }`. Para errores de negocio, lanzar `AppError` (`AppError.notFound(...)`, `.conflict(...)`, etc.). Nunca registrar `err.detail` de Postgres: puede contener DNI. Params de URL se convierten con `Number()` antes de validar con `IdDTO`.
- Tipos globales sin import en `types/types.d.ts` (`FullMemberInfo`, `UserResponse`, `CategoryID`, `CreateMember`…).

### Endpoints (resumen; roles: A=Administrador, G=Gimnasio, J=Juez)
- `/users`: `GET /` (A), `GET /me` (sin middleware, valida cookie adentro), `GET /:id`, `GET /role/:rid` (A), `POST /` crear usuario (A), `POST /login`, `POST /logout`, `POST /refresh-token`, `PATCH /:id` (nombre), `DELETE /:id` (A)
- `/members` (A,G): `GET /:gid` (filtros `full_name,id_category,id_level,dni,page`), `GET /:gid/:mid`, `POST /`, `POST /:mid/tournament/:tid`, `PATCH /:id`, `DELETE /:id`
- `/tournaments`: `GET /date` próximos con inscripción abierta, `GET /date/past` paginados (A,G,J), `GET /:tid/category/:cid/level/:lid` inscriptos (A,J), `GET /:tid/category/:cid/level/:lid/gym/:gid` inscriptos del gimnasio (A,G), `GET /not-in/:tid/category/:cid/level/:lid/gym/:gid` alumnos disponibles, `GET /:tid/sheets` (A,G,J), `POST /:tid/sheets` (A), `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` (A), `DELETE /:tid/member/:mid` (A,G)
- `/puntajes`: **desmontado** (reemplazado por Google Sheets). Quedan sin uso `scores.routes`, `scores.controller`, `scores.service` y sus helpers en el frontend; no usar ni extender.

## Frontend (`frontend/src`)

Estructura por capas, todas con el mismo patrón:

`pages/` (una por ruta) → `hooks/useX.ts` (lógica + toasts + estado) → `helpers/xQueries.ts` (fetch) → backend.

- `main.tsx`: `BrowserRouter` + `Providers` (`UserProvider > GymsProvider > MembersProvider > TournamentsProvider > MembersTournamentsProvider`).- **Estado global**: React Context puro (sin Redux/Query). Cada dominio tiene `context/<x>/XContext.tsx` + `XProvider.tsx` y un hook `useXContext`. Los hooks `useMembers`, `useTournaments`, `useUsers`, `useGyms` combinan contexto + llamadas + `sonner` toasts.
- **Auth en cliente**: `UserProvider` llama `getMe()` al montar (`isInitializing`). `PrivateRoutes` (props `role[]`) redirige a `/` si no hay usuario y a `/inicio` si el rol no alcanza. Rutas en `routes/RoutesView.tsx`: `/` login, `/inicio`, `/mi-cuenta`, `/alumnos` (A,G), `/inscripcion-torneos` (A,G), `/puntajes` (A,J), `/historial-puntajes`, `/admin-torneos` (A), `/crear-usuario` (A).
- **Helpers de red**: todas las llamadas pasan por `request()` en `helpers/authQueries.ts`; **no usar `fetch` directo**. Envía `credentials: "include"`, ante 401 renueva la sesión una sola vez (compartida entre peticiones simultáneas) y reintenta una vez; login y logout usan `auth: false`. Todo error se lanza como `ErrorResponse {error, redirect?}` con un mensaje garantizado: el del backend o uno en español si no hay conexión o la respuesta no es JSON válido. Si `redirect` es true los hooks hacen `handleLogout()`. Mostrar errores con `toast.error(err.error, { id: err.error })` para no duplicarlos. **Todos usan `env.URL_BACK_DEPLOY`**; `URL_BACK_LOCAL` está definida pero no se usa → para desarrollo local hay que apuntar `VITE_URL_BACK_DEPLOY` al backend local.
- **Formularios**: mezcla de Formik+Yup (`FormikInputComp`, `FormComp`) y react-hook-form (`@hookform/resolvers`); esquemas Yup en `validation/`. UI: react-bootstrap + MUI + SweetAlert2 para confirmaciones, `sonner` para toasts.
- **Tipos**: interfaces globales ambientales en `types/*.d.ts` (sin import/export), p. ej. `FullMemberInfo`, `Tournament`, `Score`, `Pagination`, `UserRole`, `ErrorResponse`. `UserInfo` está declarada en dos archivos (`types.d.ts` y `userResponses.d.ts`, se fusionan).
- `utils/extraFunctions.ts`: `parseMember` (mapea ids de categoría/nivel a etiquetas usando `constants/const.ts`) y `validateDates` (copia de la del backend).
- Paginación del lado servidor (20 por página); contexto guarda `Pagination {total,page,perPage,totalPages}`.

## Cosas a tener en cuenta / deudas conocidas

- `users.service.ts` todavía usa `id_user` en `DELETE`, mientras que la tabla usa `id`: probablemente hoy falla. Antes de corregirlo, revisar qué pasa con los alumnos del gimnasio borrado (FK o cascada).
- `login` firma el access JWT por 1 h pero la cookie expira a los 30 min; el refresh endpoint pone cookie de 1 h.
- `GET /users/me` no usa `authMiddleware`. `GET /users/:id` lista `"Administrador"` dos veces (probable typo por `"Gimnasio"`).
- `registerToTournament` mapea códigos PG (23505 duplicado, 23503 FK, 23502 not null) a mensajes.
- Archivos con typo en el nombre: `members.shema.ts`, `creareScoreValidatorSchema.ts`.
- Sin tests, sin CI, sin migraciones versionadas.

## Plan de mejoras (auditoría 2026-11-22)

`[x]` hecho · `[ ]` pendiente · *(verificar)* depende de la BD, del Apps Script o de producción, que no están en el repo.

### Seguridad

Crítico:
- [x] **S1. Datos personales expuestos**: `GET /members` y los inscriptos por categoría/nivel permitían a cualquier gimnasio leer nombre, DNI y fecha de nacimiento de alumnos ajenos.
- [x] **S2. Sin control de propiedad al escribir**: un gimnasio podía crear, editar o borrar alumnos ajenos, e inscribirlos o darlos de baja de torneos.
- [x] **S3. Google Sheets sin autenticación**: `GET /:tid/sheets` exige login, el POST envía `secret` desde `SHEETS_SECRET` (requerido) y `doPost` del Apps Script lo valida contra la propiedad `SHEETS_SECRET` antes de tocar la hoja. Probado: un POST sin secreto responde `{"error":"No autorizado"}`. Apps Script responde 200 aunque rechace, por eso `exportTournamentToSheet` falla si la respuesta no trae `url`. *(verificar)* que `SHEETS_SCRIPT_URL` y `SHEETS_SECRET` estén cargadas en Vercel y que la implementación vieja del script esté archivada.
- [ ] **S4. Registro de pagos — PENDIENTE DE REVISIÓN**: la limpieza automática de impagas sigue pausada porque ningún flujo del código marca `paid = true`. El usuario recuerda que cada gimnasio registraba sus alumnos pagados, pero falta confirmar cómo (no existe endpoint ni pantalla para eso). No reactivar la limpieza hasta resolverlo.

Alto:
- [ ] **S5. Login sin límite de intentos**: código hecho (límite en BD, compatible con Vercel) y SQL ejecutado por el usuario el 2026-11-22. **Falta** quitar `ignoreMissingAttemptsTable` cuando la tabla exista en todos los entornos.
- [x] **S6. Renombrar usuarios ajenos**: solo el propio usuario o un Administrador, sin nombres duplicados. Corregida la columna en `UPDATE`.
- [x] **S7. Sesiones no revocadas**: logout revoca el refresh token y cada refresh lo rota.
- [x] **S8. Cierre de inscripción aplicado en el backend** para gimnasios, en altas y bajas. El Administrador puede operar después del cierre.
- [x] **S9. API `/puntajes` desmontada.**
- [x] **S10. Inyección de fórmulas en Sheets**: la exportación neutraliza textos que empiezan con `=`, `+`, `-` o `@`. Probado contra un mock; falta confirmarlo en la hoja real.

Medio:
- [x] **S11. Middleware de errores**: `errors/error.middleware.ts` y `errors/app.error.ts`. Las respuestas ya no exponen `error.message` ni detalles de Postgres. Solo lo conserva `scores.controller`, que está desmontado. Un JWT inválido o vencido responde 401 para que el frontend renueve la sesión; 403 queda para falta de permisos.
- [x] **S12.** `morgan` registra solo método, ruta, estado y tiempo: el query string, con DNI y nombres, ya no llega a los logs.
- [x] **S13.** `users_view` no incluye la contraseña (confirmado por el usuario).
- [x] **S14.** `helmet` en el backend, CSP y headers de seguridad en `vercel.json` (raíz), JWT fijado a `HS256` y `localhost` fuera de CORS cuando `NODE_ENV=production`.
- [x] **S15.** `PageDTO` exige página mayor o igual a 1: `page=0` responde 400.
- [ ] **S16. DNI en hoja pública**: la hoja se puede ver con el link y recibe nombre y DNI de inscriptos, muchos menores. Quitar el DNI de la exportación o restringir la lectura a cuentas específicas.

No cambiar: el error en el callback de CORS es lo que hoy frena el CSRF. Con `callback(null, false)` se abriría, porque, mientras no se quite CORS (M8), conviene no depender solo de `SameSite=Lax`.

### Rendimiento

- [x] **P1. Bucle infinito en `useGyms`**: un administrador en `/alumnos` consultaba `/users/role/3` sin parar. `handleLogout` y `setUser` ahora son estables.
- [x] **P2. Bucle ante errores en `useTournaments`**: si fallaba `/tournaments/date`, reintentaba indefinidamente.
- [x] **P3. Pool de Postgres**: agregados `pool.on("error")` y timeouts de conexión, inactividad y consulta.
- [x] **P4. Crons**: `sheetsService.exportPendingTournaments`, cron diario a las 03:00 de Argentina (hoy endpoint de Vercel, ver M9). SQL `exported_at` ejecutado por el usuario. Volver a ejecutarlo justo antes del deploy: el backend anterior no marca `exported_at` y el job nuevo reexportaría lo que ese backend exportó en el medio. Un torneo ya exportado no se reexporta si después se cambia su fecha; usar la exportación manual.
- [x] **P5. Paginación**: `ORDER BY` estable y `page` respetado en inscriptos por categoría y nivel. Las funciones SQL de inscriptos ordenan por nombre e id (`backend/sql/2026-11-22_pagination_order.sql`, ejecutado por el usuario).
- [x] **P6. Índices**: `backend/sql/2026-11-22_indexes.sql` (7 índices derivados de las consultas reales y medidos con 1 millón de alumnos y 2 millones de inscripciones). El usuario borró `idx_members_tournaments_id_member` e `idx_members_tournaments_id_tournament` por redundantes. `pg_trgm` descartado: la búsqueda por nombre se acota a un gimnasio (5 ms con 2.000 alumnos) y la extensión complica la migración a Supabase. Eliminados `GET /members` y `GET /tournaments`, que devolvían todas las filas y el frontend no usaba.
- [x] **P7. Bundle**: quitados Font Awesome, MUI, Emotion, `npm`, `axios` y `bootstrap-icons`; rutas con `React.lazy` y `LazyBoundary`; imágenes de `public/` de 448 KB a 56 KB.
- [x] **P8. Tablas**: `Alumnos` monta un único modal de edición, solo mientras se usa.

### Migración a Vercel (monorepo) y Supabase

Destino: frontend y backend en Vercel, con la API bajo `/api`, y Postgres en Supabase. Confirmar los detalles de Supabase y Vercel en su documentación al ejecutar cada paso.

Base de datos:
- [ ] **M1. Proyecto Supabase** en São Paulo, con las funciones de Vercel en `gru1`. Revisar el plan: pausa por inactividad y backups automáticos.
- [ ] **M2. No exponer datos**: restaurar en un schema propio, nunca en `public`; no exponerlo en la Data API y activar RLS en las tablas. Las claves de Supabase no deben llegar al frontend.
- [ ] **M3. Copia de prueba**: `pg_dump --schema=<PGSCHEMA> --no-owner --no-privileges` desde Railway, restaurar por el session pooler y comparar conteos, vistas, funciones y secuencias.
- [ ] **M4. Rol propio de la app** con permisos mínimos y `ALTER ROLE ... SET search_path` y `statement_timeout`. Quitar `options` y `statement_timeout` del `Pool`, porque el pooler puede rechazarlos.
- [ ] **M5. Conexión**: transaction pooler (puerto 6543), TLS verificado con el certificado de Supabase (sin `rejectUnauthorized: false`) y `max` bajo en el pool.

Aplicación:
- [x] **M6. Monorepo**: `app.ts` exporta `app`, rutas bajo `/api`, `api/index.mjs` y `vercel.json` en la raíz. *(verificar)* en el primer deploy: que Vercel conserve la ruta original tras el rewrite y que incluya `backend/node_modules` en la función.
- [ ] **M7. Frontend**: hecho en `vercel.json` (rewrite SPA excluye `/api`, CSP `connect-src 'self'`). **Falta** definir `VITE_URL_BACK_DEPLOY=/api` en Vercel y verificarlo.
- [ ] **M8. Cookies y CORS juntos**: `SameSite=Lax` ya está en `COOKIE_OPTIONS`. **Falta** quitar CORS (hoy lo que frena el CSRF) y validar que el login funcione en el mismo dominio.
- [ ] **M9. Cron**: endpoints y `crons` hechos, `node-cron` desinstalado. **Falta** definir `CRON_SECRET`, ejecutar `exported_at` y comprobar la primera ejecución. Resolver S4 antes de activar la limpieza. Ver "Cron diario en Vercel (M9)".
- [ ] **M10. Exportación a Sheets**: agregar timeout para respetar el límite de duración de las funciones.
- [ ] **M11. Variables** en Vercel: conexión a Supabase, JWT, cookies, `SHEETS_SCRIPT_URL`, `SHEETS_SECRET` y `CRON_SECRET`.

Corte:
- [ ] **M12. Pasaje a producción**: frenar escrituras, hacer el dump final, restaurar, validar conteos y cambiar el tráfico. Mantener Railway intacto unos días como vuelta atrás.

Estado de los SQL: `backend/sql/` está aplicado **solo en dev**. Dev recibe datos de las pruebas manuales: no llevarlos a producción. Partir de una copia limpia de producción y aplicar en orden `login_attempts`, `pagination_order`, `indexes` (incluye los dos `DROP INDEX`, de a una sentencia) y, justo antes de arrancar el backend nuevo, `exported_at`.

### Cron diario en Vercel (M9)

Estado: implementado en `routes/cron.routes.ts`; `sheetsService.exportPendingTournaments` es idempotente (P4). Si Sheets falla, el endpoint responde 500 y reintenta al día siguiente. Sin probar en Vercel.

Vercel Cron se declara de antemano en `vercel.json`, así que crear un torneo no puede agendar un cron propio. Un cron diario consulta la BD; crear un torneo solo guarda `inscription_date_end`.

```json
{ "crons": [
  { "path": "/api/cron/export", "schedule": "0 6 * * *" },
  { "path": "/api/cron/categories", "schedule": "0 5 1 1 *" }
] }
```

Vercel usa UTC: `0 6` son las 03:00 y `0 5 1 1 *` las 02:00 del 1 de enero de Argentina. Confirmar en su documentación los límites del plan; en Hobby el cron sería diario y podría ejecutarse en cualquier momento dentro de esa hora.

Migración previa, **antes de activar el cron**, para que la primera ejecución no reexporte el historial: `backend/sql/2026-11-22_exported_at.sql`.

Pasos del endpoint:

1. Rechazar la llamada si no trae `Authorization: Bearer <CRON_SECRET>`.
2. Borrar las inscripciones impagas de torneos cerrados. **Bloqueado por S4**: si `paid` no se actualiza, borraría todas las inscripciones.
3. Buscar los torneos pendientes (`$1` = hoy en `America/Argentina/Buenos_Aires`):

   ```sql
   SELECT id FROM tournaments
   WHERE inscription_date_end < $1 AND exported_at IS NULL;
   ```

4. Exportar cada torneo y, solo si salió bien, marcarlo:

   ```sql
   UPDATE tournaments SET exported_at = NOW() WHERE id = $1;
   ```

Resultado: sobrevive a reinicios y deploys, respeta cambios de fecha, ignora torneos borrados, funciona con cierres el 31 de diciembre y reintenta al día siguiente si Sheets falla.

## Pruebas manuales pendientes

Cubren S1-S15, P1-P8, el middleware de errores y los mensajes del frontend. Las pruebas automáticas se hicieron con una BD temporal y servicios simulados; estas confirman el comportamiento con el esquema real.

### Preparación

- [ ] Usar una **copia de la BD**, no producción: estas pruebas crean, editan y borran datos.
- [ ] Ejecutar en el schema de la app `backend/sql/2026-11-22_login_attempts.sql`, `2026-11-22_exported_at.sql`, `2026-11-22_pagination_order.sql` e `2026-11-22_indexes.sql`.
- [ ] Ejecutar `npm install` en `backend/` y en `frontend/`, y levantar ambos con `VITE_URL_BACK_DEPLOY` apuntando al backend local.
- [ ] Tener cuatro cuentas: Administrador, Gimnasio A, Gimnasio B y Juez, con alumnos en A y B, un torneo con inscripción abierta y otro cerrado.
- [ ] Para las pruebas por API, abrir la consola del navegador con la sesión iniciada y definir:

  ```js
  const API = "http://localhost:3000";
  const call = (method, path, body) => fetch(API + path, { method, credentials: "include", headers: body ? { "Content-Type": "application/json" } : {}, body: body && JSON.stringify(body) }).then(async (r) => console.log(r.status, await r.json()));
  ```

### Sesión y login (S5, S7)

- [ ] Login correcto con cada rol: entra a `/inicio` y ve solo sus opciones.
- [ ] Contraseña incorrecta: muestra "Nombre de usuario y/o contraseña incorrectos" una sola vez.
- [ ] Seis intentos fallidos con la misma cuenta: el sexto responde "Demasiados intentos fallidos", incluso con la contraseña correcta.
- [ ] Tras 15 minutos, o borrando la fila de `login_attempts`, se puede volver a entrar.
- [ ] Un login correcto antes del quinto fallo reinicia el contador.
- [ ] Borrar la cookie `accessToken` y recargar: la sesión se renueva sola.
- [ ] Copiar la cookie `refreshToken`, cerrar sesión y restaurarla: `POST /users/refresh-token` responde 401.
- [ ] Con varias pestañas abiertas y sin `accessToken`, recargarlas a la vez: ninguna cierra la sesión.
- [ ] Borrar ambas cookies y navegar: vuelve al login.

### Permisos por rol (S1, S2, S6)

Con sesión de **Gimnasio A**, usando un `id` de alumno de B:

- [ ] `call("GET", "/members")` → 404 (endpoint eliminado).
- [ ] `call("GET", "/members/<idB>?page=1")` → 403.
- [ ] `call("GET", "/members/<idA>/<alumnoB>")` → 404.
- [ ] `call("GET", "/tournaments/<tid>/category/<cid>/level/<lid>")` → 403.
- [ ] `call("POST", "/members", { full_name: "Prueba", birth_date: "2016-03-04", id_gym: <idB>, dni: 34567890, id_level: 1 })` → 403.
- [ ] `call("PATCH", "/members/<alumnoB>", { full_name: "Prueba", birth_date: "2016-03-04", id_gym: <idA>, dni: 34567890, id_level: 1 })` → 404 y el alumno no cambia.
- [ ] `call("DELETE", "/members/<alumnoB>")` → 404 y el alumno sigue existiendo.
- [ ] `call("POST", "/members/<alumnoB>/tournament/<abierto>")` → 404.
- [ ] `call("DELETE", "/tournaments/<tid>/member/<alumnoB>")` → 404 y la inscripción sigue.
- [ ] `call("PATCH", "/users/<idAdmin>", { full_name: "Prueba" })` → 403.
- [ ] Renombrarse con el nombre de otro usuario → 404 "nombre ya en uso".
- [ ] Renombrarse con un nombre libre → 200 y se puede iniciar sesión con él.

Flujos normales:

- [ ] Gimnasio: crear, editar, filtrar, paginar y borrar sus alumnos.
- [ ] Administrador: elegir un gimnasio en `/alumnos`, ver, editar y borrar sus alumnos.
- [ ] Administrador: crear usuario, y crear y borrar torneos.
- [ ] Juez: abrir `/puntajes` e `/historial-puntajes`; no puede entrar a `/alumnos`.

### Inscripciones (S8)

- [ ] Gimnasio inscribe y da de baja un alumno propio en un torneo abierto.
- [ ] El último día de inscripción todavía permite ambas acciones (hora de Argentina).
- [ ] En un torneo cerrado, por API, el gimnasio recibe 404 "la inscripción ya cerró" al inscribir y al dar de baja.
- [ ] El Administrador puede inscribir y dar de baja en un torneo cerrado.
- [ ] Inscribir dos veces al mismo alumno → "El alumno ya está registrado en el torneo".
- [ ] Las inscripciones impagas **no** se borran durante la noche (S4 pausado).

### Google Sheets (S3, S10, S16)

- [ ] `GET /tournaments/<tid>/sheets` sin sesión → 401; con sesión abre la hoja.
- [ ] Exportar un torneo como Administrador y comparar los inscriptos con la hoja.
- [ ] Revisar `get_registered_members_by_tournament`: si filtra por `paid = true`, la exportación queda incompleta.
- [ ] Un alumno llamado `=1+1` aparece como texto en la hoja, no como `2`.
- [ ] Al cerrar S3: un POST al script sin `secret` es rechazado y la exportación del backend sigue funcionando.

### Errores y mensajes (S11)

- [ ] `/puntajes` del backend responde 404 (S9).
- [ ] Detener el backend y operar: "No se pudo conectar con el servidor...".
- [ ] Detener Postgres con el backend activo: mensaje de error, y el backend sigue vivo al volver la BD (P3).
- [ ] Ninguna respuesta de error muestra nombres de tablas, columnas, SQL, stack traces ni DNI.
- [ ] Los logs del backend no contienen el `detail` de Postgres ni valores de DNI.
- [ ] Un POST desde un origen no permitido responde 403 y no modifica datos.

### Rendimiento (P1, P2)

- [ ] Como Administrador en `/alumnos`, la pestaña Network no muestra llamadas repetidas a `/users/role/3`.
- [ ] Con el backend caído en `/admin-torneos`, las peticiones se detienen y no se acumulan toasts.

### Exportación, paginación y pantallas (P4-P8)

- [ ] Tras el SQL de `exported_at`, los torneos ya cerrados tienen fecha en esa columna y los abiertos la tienen vacía.
- [ ] Con un torneo de prueba cerrado ayer y `exported_at` vacío, a las 03:00 aparece en la hoja y la columna se completa. La noche siguiente no se duplica.
- [ ] Tras `2026-11-22_pagination_order.sql`, los inscriptos de un torneo aparecen por nombre y ninguno se repite ni falta entre páginas.
- [ ] Recorrer todas las páginas de un listado con más de 20 alumnos: ninguno se repite ni falta.
- [ ] `/inicio` muestra el menú correcto para cada rol y con el aspecto esperado.
- [ ] En `/alumnos`, editar dos alumnos seguidos: cada modal muestra los datos de su fila y guarda bien.
- [ ] Crear un alumno desde el botón "Crear alumno" sigue funcionando.
- [ ] Network muestra que cada pantalla descarga su archivo al entrar, sin fuentes de Font Awesome.
- [ ] Favicon y logos se ven nítidos en navbar, footer, login y registro.

### Logs, headers y paginación (S12, S14, S15)

- [ ] Filtrar alumnos por nombre y DNI: los logs muestran solo la ruta, sin query string.
- [ ] Las respuestas del backend incluyen `X-Content-Type-Options: nosniff` y no incluyen `X-Powered-By`.
- [ ] Con `NODE_ENV=production`, un origen `http://localhost:5173` recibe 403.
- [ ] Un JWT firmado con otro algoritmo es rechazado con 401.
- [ ] `page=0` responde 400 con un mensaje claro, en alumnos y en torneos pasados.

### Después de desplegar

- [ ] La consola del navegador no muestra errores de Content Security Policy en ninguna pantalla.
- [ ] Recargar una ruta interna, como `/alumnos`, carga la app y no un 404.
- [ ] Las respuestas de Vercel incluyen `Content-Security-Policy`, `X-Frame-Options` y `X-Content-Type-Options`.
- [ ] Login, renovación de sesión y logout funcionan entre Vercel y el backend.
- [ ] Modales, confirmaciones, toasts, iconos, logos y estilos se ven correctamente.
