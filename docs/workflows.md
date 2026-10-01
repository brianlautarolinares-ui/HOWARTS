# Workflows

## Registro

Visitante -> formulario -> `POST /api/auth/register` -> rate limit -> Zod -> email único -> bcrypt -> usuario STUDENT.

## Login

Usuario -> credenciales -> rate limit -> búsqueda por email -> bcrypt compare -> JWT de sesión -> redirección a panel.

## Alta de curso

Profesora autenticada -> formulario -> Server Action -> verificación de rol -> Zod -> Prisma -> curso DRAFT o PUBLISHED -> revalidación de páginas públicas.

## Futuras fases

### Pago manual e inscripción (Fase 2)

Alumno solicita acceso -> se crea o conserva `Enrollment.PENDING` -> la profesora recibe efectivo o transferencia -> un administrador llama al endpoint protegido de confirmación -> se validan alumno, curso publicado, importe y referencia -> transacción idempotente actualiza `Payment.APPROVED` y `Enrollment.ACTIVE`.

Un `Enrollment` `PENDING`, `CANCELLED` o sin pago aprobado no habilita contenido privado. El navegador nunca puede activar una inscripción por sí mismo.

La ruta protegida de acceso a cursos responde `401` sin sesión, `403` sin una inscripción habilitada y permite el acceso a ADMIN o a inscripciones `ACTIVE`/`COMPLETED`.

La elección de pasarela, preferencias de pago y webhooks automáticos queda pendiente.

El progreso, las evaluaciones, los certificados, las automatizaciones y las suscripciones quedan fuera de la Fase 2.
