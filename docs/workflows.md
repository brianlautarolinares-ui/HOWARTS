# Workflows

## Registro

Visitante -> formulario -> `POST /api/auth/register` -> rate limit -> Zod -> email único -> bcrypt -> usuario STUDENT.

## Login

Usuario -> credenciales -> rate limit -> búsqueda por email -> bcrypt compare -> JWT de sesión -> redirección a panel.

## Alta de curso

Profesora autenticada -> formulario -> Server Action -> verificación de rol -> Zod -> Prisma -> curso DRAFT o PUBLISHED -> revalidación de páginas públicas.

## Futuras fases

La inscripción por pago, progreso, evaluaciones, certificados, automatizaciones y suscripciones quedan fuera de la Fase 1.
