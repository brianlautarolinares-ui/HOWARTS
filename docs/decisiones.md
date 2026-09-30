# Decisiones técnicas

1. **NextAuth v5 con Credentials**: permite controlar el flujo de credenciales y usar bcrypt, cumpliendo la exigencia de no guardar contraseñas en texto plano.
2. **JWT de sesión**: reduce dependencias adicionales para la Fase 1. El rol viaja firmado dentro del token y las autorizaciones se revalidan en servidor.
3. **Prisma + PostgreSQL**: modelo explícito, migraciones reproducibles y compatibilidad con Supabase.
4. **Upstash Redis para rate limiting**: evita el falso sentido de seguridad de un contador en memoria cuando hay múltiples instancias serverless.
5. **Precio como entero en ARS**: evita errores de coma flotante. Para importes con centavos se deberá migrar a unidades mínimas.
6. **Inscripción manual modelada pero no automatizada**: prepara la relación alumno-curso sin invadir la Fase 2.
