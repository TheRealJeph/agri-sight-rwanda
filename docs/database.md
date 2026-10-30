# Database
- Primary database: PostgreSQL via Django ORM and migrations; credentials only from environment variables.
- **User model decision (made before the first migration):** custom `accounts.User(AbstractUser)` with a unique email and
  an `email_verified` flag. Profile, preference, dataset, import-job, data-quality, report and audit models follow in Phase 2/4/6.
- `DJANGO_TEST_DB=sqlite` exists only to run tests where PostgreSQL is not installed. Never use it for real data.
- Agricultural records are NOT loaded into one large table yet. The verified pipeline works from files with Pandas; staging
  tables will be designed from the verified data model in Phase 4.
