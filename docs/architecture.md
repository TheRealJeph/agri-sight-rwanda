# Architecture
React + TypeScript (Vite, MUI) -> versioned REST API (/api/v1, Django REST Framework) -> PostgreSQL (application data).
Agricultural analysis runs in Pandas/NumPy in `backend/services/` and is independent of views and serializers.
React never talks to the database. In development Vite proxies `/api` to Django (localhost:8000).
Authentication: Django session auth (HttpOnly, SameSite=Lax cookies; CSRF; CORS limited to FRONTEND_ORIGIN).
