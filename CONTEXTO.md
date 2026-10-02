# CAMPUS EDUCATIVO: CONTEXTO DEL PROYECTO

## Estado por fases

- [x] FASE 1: Landing, registro/login, usuarios, catálogo, curso, panel alumno, panel profesora
- [x] FASE 2: pagos manuales, cursos por etapas, clases en vivo y materiales protegidos (pasarela automática aplazada)
- [ ] FASE 3 (en curso): grabaciones, seguimiento de clases y evaluaciones
- [ ] FASE 4: Certificados, QR, verificación pública
- [ ] FASE 5: emails transaccionales por evento, recordatorios, reportes y estadísticas (sin n8n)
- [ ] FASE 6: Suscripciones, promociones, cupones, packs, clases en vivo

## Pendientes antes de declarar Fase 1 lista para producción

- Ejecutar migración en Supabase de staging.
- Configurar `AUTH_SECRET` seguro y credenciales de Upstash Redis.
- Cambiar contraseña inicial del administrador.
- Probar registro, login, logout y RBAC con usuarios reales de prueba.
- Ejecutar `npm run typecheck`, `npm test` y `npm run build`.
- Verificar responsive en 320 px, 375 px, tablet y escritorio.
- Ejecutar revisión WCAG AA básica con teclado y lector de pantalla.
- Configurar backup diario de PostgreSQL en el proveedor elegido.

## Fase 2 - siguiente incremento

- [x] Modelar `Payment` con método manual, estado, importe y referencias idempotentes.
- [x] Cambiar nuevas inscripciones a `PENDING` hasta confirmar el pago.
- [x] Crear endpoint ADMIN para confirmar efectivo o transferencia.
- [x] Activar `Payment.APPROVED` y `Enrollment.ACTIVE` en una transacción idempotente.
- [x] Añadir control de acceso a cursos por `Enrollment.ACTIVE`/`COMPLETED` y rol ADMIN.
- [x] Añadir pruebas unitarias de acceso permitido y acceso indebido.
- [x] Crear bandeja ADMIN para revisar solicitudes pendientes y confirmar pagos manuales.
- [x] Permitir al ADMIN configurar los datos de cobro y mostrarlos en el checkout del curso.
- [x] Crear cursos con monto y publicación, organizarlos por etapas y pactar fecha/hora de clases.
- [x] Habilitar que ADMIN publique tema y PDF después de la clase.
- [x] Mantener el acceso a materiales para inscripciones `ACTIVE` y `COMPLETED`.
- [x] Guardar PDFs privados en PostgreSQL (máximo 10 MB) y estampar alumno y autor en cada página.
- [x] Mantener pagos manuales y aplazar pasarela/webhooks hasta elegir proveedor.
- [x] Probar flujo integral temporal: alta de curso, clase, material, solicitud, confirmación y acceso del alumno.
- [x] Verificar ausencia de desbordamiento horizontal en inicio, checkout y campus a 320 px y 375 px.
- [x] Verificar inicio, login, registro y checkout sin desbordamiento a 320 px, 375 px, 768 px y 1440 px.
- [x] Revisar etiquetas, landmark `main`, foco visible con teclado y contraste de controles principales en las rutas accesibles.
- [ ] Completar auditoría WCAG AA con lector de pantalla y revisión de las pantallas admin con tecnología asistiva.

## Fase 3 - incremento actual

- [x] Modelar enlaces de grabación, progreso por inscripción y evaluaciones con intentos.
- [x] Crear puntaje aprobatorio configurable y cálculo de respuestas en servidor.
- [x] Aplicar migración de grabaciones, progreso y evaluaciones.
- [x] Permitir al ADMIN asociar grabaciones y crear preguntas con puntaje mínimo.
- [x] Permitir al alumno pagado marcar clases completadas y rendir/reintentar evaluaciones.
- [x] Probar grabación, progreso persistente, aprobación y reintento fallido con datos QA temporales.
- [x] Pasan `npm test` (15), `npm run typecheck` y `npm run build`.
- [ ] Ejecutar auditoría WCAG AA formal y revisión con lector de pantalla.

## Regla de avance

No iniciar Fase 4 hasta que el propietario del proyecto escriba `continuar` y el checklist de Fase 3 esté aprobado.
