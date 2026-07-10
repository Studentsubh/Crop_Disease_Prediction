# Setup and Run (Quick Reference)

This file contains the minimal commands to get the project running locally (frontend + backend) on Windows or macOS/Linux. Copy-paste the sections you need into two terminals (one for backend, one for frontend).

## Prerequisites
- Python 3.10+ (3.12 tested in this workspace)
- Node.js 18+ and `npm`
- Git (optional)

---

## Backend (Windows PowerShell)

```powershell
cd backend
# create venv
python -m venv .venv
# activate
. .venv\Scripts\Activate.ps1
# install dependencies
pip install -r requirements.txt
# create .env (copy from .env.example if present) and edit keys
# e.g. edit backend/.env to set SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_ROLE_KEY, SECRET_KEY
# run migrations (safe even if none)
python manage.py migrate
# start development server
python manage.py runserver 8000
```

If you prefer cmd.exe:
```bat
cd backend
.venv\Scripts\activate.bat
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

## Backend (macOS / Linux)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# create/edit .env (backend/.env)
python manage.py migrate
python manage.py runserver 8000
```

---

## Frontend (Vite + React)

Open a separate terminal/PowerShell.

```bash
cd frontend
npm install
npm run dev
# The app will be available at http://localhost:5173 by default
```

To build a production bundle:

```bash
cd frontend
npm run build
# serve with a static server or copy files to your production host
```

---

## Quick verification
- Visit the frontend (default Vite port) and try uploading an image.
- The frontend calls the backend at `http://localhost:8000/api/predict/` by default. If your backend uses a different host/port, set `VITE_API_URL` or update `frontend/src/pages/PredictPage.jsx` accordingly.

## Common issues & tips
- If the file picker doesn't open: ensure the frontend dev server is the version that includes the single hidden file input (`frontend/src/pages/PredictPage.jsx`). Refresh the browser and clear cache if needed.
- If Supabase writes fail: confirm `backend/.env` has `SUPABASE_SERVICE_ROLE_KEY` (backend writes need service role key) and that the `predictions` table and `leaf-specimens` storage bucket exist.
- To view backend logs: watch the terminal where `manage.py runserver` is running.

## Handy one-liners
- Start backend (Windows PowerShell):
  - `. backend/.venv/Scripts/Activate.ps1; python backend/manage.py runserver 8000`
- Start frontend in one-line (POSIX):
  - `(cd frontend && npm run dev)`

---

If you'd like, I can also add a small `run-dev.ps1` or `Makefile` to start both servers with one command — tell me which you prefer.  
