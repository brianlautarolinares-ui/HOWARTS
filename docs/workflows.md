# Workflows

## Registro

Visitante -> formulario -> `POST /api/auth/register` -> rate limit -> Zod -> email único -> bcrypt -> usuario STUDENT.

## Login

Usuario -> credenciales -> rate limit -> búsqueda por email -> bcrypt compare -> JWT de sesión -> redirección a panel.

## Alta de curso

Profesora autenticada -> formulario -> Server Action -> verificación de rol -> Zod -> Prisma -> curso DRAFT o PUBLISHED -> revalidación de páginas públicas.

## Futuras fases

### Pago manual e inscripción (Fase 2)

ADMIN configura una cuenta de cobro -> el alumno elige un curso publicado y ve el importe y los datos configurados -> solicita acceso después de pagar -> se crea o conserva `Enrollment.PENDING` -> ADMIN revisa la solicitud en `/admin/pagos/solicitudes` y confirma medio, importe y referencia -> el endpoint protegido valida la operación y una transacción idempotente actualiza `Payment.APPROVED` y `Enrollment.ACTIVE`.

Un `Enrollment` `PENDING`, `CANCELLED` o sin pago aprobado no habilita contenido privado. El navegador nunca puede activar una inscripción por sí mismo.

La ruta protegida de acceso a cursos responde `401` sin sesión, `403` sin una inscripción habilitada y permite el acceso a ADMIN o a inscripciones `ACTIVE`/`COMPLETED`.

Los datos de cobro se guardan en `PaymentSettings`, se editan solo desde `/admin/pagos` y se muestran en el checkout. El destino todavía se configura como una sola cuenta; la elección de pasarela y los webhooks automáticos quedan pendientes.

### Clases y materiales del curso

ADMIN crea el curso con precio y estado, lo divide en etapas y registra cada clase con fecha/hora de Argentina y enlace de reunión opcional. Al pasar la fecha pactada, puede publicar el tema desarrollado, el PDF (máximo 10 MB) y el crédito de autor. Las inscripciones `ACTIVE` y `COMPLETED` pueden consultar el material desde su campus; la ruta del PDF vuelve a comprobar la sesión y la inscripción.

Los archivos se guardan en PostgreSQL para esta primera versión. El visor oculta controles de descarga/impresión y el PDF servido lleva una marca de agua por alumno y autor. Esto desalienta la redistribución, pero no puede impedir capturas del sistema operativo.

El progreso, las evaluaciones, los certificados, las automatizaciones y las suscripciones quedan fuera de la Fase 2.
