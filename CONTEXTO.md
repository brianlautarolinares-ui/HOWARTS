# CAMPUS EDUCATIVO: CONTEXTO DEL PROYECTO

## Estado por fases

- [x] FASE 1: Landing, registro/login, usuarios, catálogo, curso, panel alumno, panel profesora
- [ ] FASE 2: pagos manuales, inscripciones y control de acceso (pasarela pendiente de definición)
- [ ] FASE 3: Videos, PDFs, módulos, progreso, evaluaciones
- [ ] FASE 4: Certificados, QR, verificación pública
- [ ] FASE 5: n8n, emails, WhatsApp, recordatorios, reportes, estadísticas
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
- [ ] Definir pasarela de pago para automatizar cobros y webhooks.
- [ ] Ejecutar Vitest, typecheck y build cuando Node/npm estén disponibles.

## Regla de avance

No iniciar Fase 2 hasta que el propietario del proyecto escriba `continuar` y el checklist de Fase 1 esté aprobado.
