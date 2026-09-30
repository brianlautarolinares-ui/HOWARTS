# CAMPUS EDUCATIVO: CONTEXTO DEL PROYECTO

## Estado por fases

- [x] FASE 1: Landing, registro/login, usuarios, catálogo, curso, panel alumno, panel profesora
- [ ] FASE 2: Mercado Pago, verificación automática de pagos, inscripciones, control de acceso
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

## Regla de avance

No iniciar Fase 2 hasta que el propietario del proyecto escriba `continuar` y el checklist de Fase 1 esté aprobado.
