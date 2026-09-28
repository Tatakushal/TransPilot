# 🚛 TransPilot

TransPilot is a production-oriented fleet management platform for vehicles, drivers, trips, fuel, maintenance, reporting and administration.

## Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 4
- **Backend:** FastAPI, SQLAlchemy 2, Pydantic 2
- **Database:** SQLite for local development; PostgreSQL for production
- **Authentication:** database-backed bearer sessions with PBKDF2 password hashing
- **Deployment:** Vercel Vite frontend + FastAPI Python function at `api/index.py`

## Production deployment

TransPilot uses Vercel's standard Vite/Python deployment model. It does **not** depend on the Vercel Services beta.

Configure these Vercel environment variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Managed PostgreSQL connection string |
| `ADMIN_BOOTSTRAP_KEY` | One-time first-administrator initialization key |
| `AUTH_SECRET` | Long random application secret reserved for auth/integration features |
| `CORS_ORIGINS` | Optional comma-separated origins when the API is called cross-origin |

Use a managed PostgreSQL provider in production. Do not use the local SQLite database for a serverless production deployment.

After creating the first administrator through `/admin-setup`, rotate or remove `ADMIN_BOOTSTRAP_KEY`.

## Local development

### Prerequisites

- Node.js 22
- npm 10
- Python 3.12
- Git

### 1. Install frontend dependencies

```bash
npm ci
```

### 2. Install backend dependencies

```bash
cd backend
python -m venv .venv
```

Windows:

```bash
.venv\\Scripts\\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Then:

```bash
pip install -r requirements.txt
```

### 3. Configure the local backend

Copy `backend/.env.example` to `backend/.env` and set the local values.

The default local database is:

```
sqlite:///./transitops.db
```

For local frontend development against the FastAPI server, set:

```
VITE_API_URL=http://127.0.0.1:8000/api
```

### 4. Start the backend

From `backend/`:

```bash
python -m uvicorn main:app --reload
```

API: `http://127.0.0.1:8000`

Swagger: `http://127.0.0.1:8000/docs`

### 5. Start the frontend

From the repository root:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

## Authentication and administrator setup

Normal registration creates one of the supported non-admin roles:

- Fleet Manager
- Dispatcher
- Safety Officer
- Financial Analyst

The first administrator is created through `/admin-setup` using the private `ADMIN_BOOTSTRAP_KEY`.

The setup page has two modes:

- **Fresh workspace:** only available before an administrator exists; creates the first administrator after clearing an uninitialized workspace.
- **Keep existing data:** creates the first administrator without clearing existing operational data.

The destructive first-run operation is server-protected and cannot be used once an administrator already exists.

## Main product areas

- Dashboard with live fleet KPIs
- Operations Center
- Vehicles
- Drivers
- Trips and dispatch
- Fuel
- Maintenance
- Reports and CSV export
- Admin Control Center
  - Users
  - Roles and permissions
  - Audit logs
  - Active sessions
  - Session revocation
  - Password reset
  - System health
- Settings
- Role-aware navigation and onboarding
- Protected backend authorization

## Quality checks

Frontend:

```bash
npm run lint
npm run build
```

Backend:

```cd backend
python -m pytest -q
```

GitHub Actions runs both frontend and backend checks on pushes and pull requests to `main`.

## Repository structure

```
TransPilot/
├── api/
│   └── index.py              # Vercel FastAPI entrypoint
├── backend/
│   ├── main.py
│   ├── auth_api.py
│   ├── admin_api.py
│   ├── bootstrap_api.py
│   ├── authorization.py
│   ├── database.py
│   └── tests/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── routes/
│   └── services/
├── package.json
├── vite.config.ts
├── vercel.json
└── requirements.txt
```

## License

Project-specific licensing can be added when the repository is ready for public distribution.
