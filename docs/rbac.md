# RBAC - Fase 1

| Acción | Visitante | Alumno | Profesora |
|---|---:|---:|---:|
| Ver landing y catálogo | Sí | Sí | Sí |
| Registrarse / iniciar sesión | Sí | - | - |
| Ver panel alumno | No | Sí | Sí |
| Ver panel profesora | No | No | Sí |
| Crear curso | No | No | Sí |
| Ver detalle de curso publicado | Sí | Sí | Sí |

Las restricciones se validan en middleware y nuevamente en Server Actions/Route Handlers sensibles.
