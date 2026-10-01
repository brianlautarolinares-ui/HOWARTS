# Decisiones técnicas

1. **NextAuth v5 con Credentials**: permite controlar el flujo de credenciales y usar bcrypt, cumpliendo la exigencia de no guardar contraseñas en texto plano.
2. **JWT de sesión**: reduce dependencias adicionales para la Fase 1. El rol viaja firmado dentro del token y las autorizaciones se revalidan en servidor.
3. **Prisma + PostgreSQL**: modelo explícito, migraciones reproducibles y compatibilidad con Supabase.
4. **Upstash Redis para rate limiting**: evita el falso sentido de seguridad de un contador en memoria cuando hay múltiples instancias serverless.
5. **Precio como entero en ARS**: evita errores de coma flotante. Para importes con centavos se deberá migrar a unidades mínimas.
6. **Inscripción con estado pendiente**: una compra crea o actualiza una inscripción `PENDING`; solo la confirmación válida del proveedor puede pasarla a `ACTIVE`.
7. **Pagos manuales inicialmente**: `Payment` conserva método (`CASH` o `BANK_TRANSFER`), referencia opcional, importe en ARS y administrador que lo registró. `PaymentSettings` guarda una cuenta de cobro configurable por ADMIN y visible en el checkout. La pasarela y los webhooks quedan pendientes de decisión.
