# Agri-Sight Rwanda — NISR Big Data Hackathon 2026

Our project is called Agri-Sight Rwanda, and our slogan is Better data. Stronger agriculture.

Agri-Sight Rwanda is a web-based agricultural data analytics and decision-support platform developed to help stakeholders better understand agricultural productivity across Rwanda.

We identified a challenge: agricultural data can contain valuable information, but accessing, comparing, and interpreting that information is not always easy. Agricultural planners and researchers need to understand differences between districts, crops, seasons, and years before making informed decisions.

To address this challenge, we developed Agri-Sight Rwanda using data from the National Institute of Statistics of Rwanda's Seasonal Agricultural Survey covering 2023 to 2025.

Our platform transforms cleaned agricultural data into interactive visualizations and analytical insights. Users can explore agricultural performance, compare districts, analyze crops and seasons, examine historical patterns, and assess data quality.

The project aligns with Track 1 of the Big Data Hackathon because it uses data and technology to support agricultural productivity. By making agricultural information more accessible and easier to interpret, we aim to support evidence-based planning and help stakeholders identify areas that may require further investigation and intervention.

Our vision is to make agricultural data more useful for the people making decisions that affect Rwanda's agricultural future.

Agri-Sight Rwanda: Better data. Stronger agriculture. Frontend: React + TypeScript + Vite. Backend: Django REST Framework. Dashboard indicators are computed from the supplied cleaned NISR files in `data/processed/`.

## Included

- Landing page based on the supplied UI/UX reference.
- Login, registration, verification, forgot-password and reset-password pages from the existing project.
- Productivity dashboard with live Django endpoint, filters for year/season/crop/district, charts, district comparisons, record table, and CSV export.
- Profile and settings pages aligned with the supplied references.
- Original submitted NISR archive in `data/source/nisr_user_submission.zip`.
- Supplied cleaned datasets preserved in `data/processed/`.
- Original UI/UX reference images in `docs/ui-reference/`.
- Transparent PNG logo in `frontend/public/logo/agri-sight-logo-transparent.png`.

## Data integrity and interpretation

The source archive and cleaned CSVs are preserved without editing their data values. The dashboard reads `district_crop_season_year.csv`. Yield comparisons use records marked `reliable` in the provided summary. The app labels the dataset as NISR Seasonal Agricultural Survey, 2023–2025. Dashboard numbers are descriptive signals; they do not establish the causes of yield differences. Some counts sum across summary rows and must not be interpreted as unique individuals across multiple years/seasons.

## Run on Windows (PowerShell)

### 1. Backend

Install Python and PostgreSQL if they are not already installed. From the project folder:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` with your local PostgreSQL credentials and a private Django secret. Then create a PostgreSQL database called `agrisight` (or set the values in `.env`) and run:

```powershell
python manage.py migrate
python manage.py runserver 8000
```

The analytics endpoint is read-only and loads the supplied summary CSV directly from `../data/processed/`.

### 2. Frontend (second terminal)

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The dashboard is available at `/dashboard`; the landing page is `/`. Vite proxies `/api` to `http://localhost:8000`.

## Important setup notes

- The archive intentionally does not include `node_modules`, `.venv`, or a real `.env`; install dependencies and create your own local environment.
- Email verification and password-reset email delivery depend on the email settings in your private `.env`. For a demo, Django console email backend prints messages in the backend terminal.
- Profile edits and settings preferences save through the existing authenticated Django profile/settings endpoints. Users must sign in to persist changes; anonymous visitors can browse the public dashboard.
- The dashboard API is public/read-only so judges can open the data dashboard without needing an account configured for email verification. Account-related pages continue to use the existing authentication endpoints.
- Frontend production build: `npm run build`. Backend syntax check: `python -m compileall backend`.
