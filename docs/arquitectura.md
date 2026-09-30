# Arquitectura - Fase 1

```mermaid
flowchart LR
  U[Usuario] --> N[Next.js App Router]
  N --> A[NextAuth / Credentials]
  N --> Z[Zod]
  N --> P[Prisma]
  P --> DB[(PostgreSQL / Supabase)]
  A --> R[Upstash Redis rate limit]
```

La UI pública y privada vive en Next.js. Todas las operaciones sensibles se revalidan en servidor. Prisma centraliza el acceso a datos y PostgreSQL persiste usuarios, cursos e inscripciones.
