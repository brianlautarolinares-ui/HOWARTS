# Campus Educativo - Fase 1

Base funcional del LMS para una profesora que vende y dicta sus propios cursos.

## Incluye

- Landing pública.
- Registro e inicio de sesión con credenciales.
- Roles `STUDENT` y `ADMIN`.
- Catálogo y detalle de cursos publicados.
- Panel privado del alumno.
- Panel privado de la profesora.
- Alta básica de cursos desde administración.
- Validación de entradas con Zod.
- Contraseñas con bcrypt.
- Rate limiting distribuido para autenticación con Upstash Redis.
- Matriz RBAC validada tanto en middleware como en acciones del servidor.

## Inicio local

1. Copiar `.env.example` a `.env` y completar valores.
2. Crear una base PostgreSQL compatible con Prisma.
3. Ejecutar `npm install`.
4. Ejecutar `npx prisma migrate dev --name phase1`.
5. Ejecutar `npm run prisma:seed`.
6. Ejecutar `npm run dev`.
7. Abrir `http://localhost:3000`.

## Pruebas

- `npm run typecheck`
- `npm test`
- `npm run build`

## Seguridad

No usar la contraseña inicial del admin en producción. Configurar Upstash Redis antes del deploy. Mantener secretos solo en variables de entorno. La Fase 2 agregará Mercado Pago, webhooks e inscripciones automáticas.
