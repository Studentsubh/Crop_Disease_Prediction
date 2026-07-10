# Crop Disease Diagnostic Lab

A full-stack web application designed for agricultural diagnostics, allowing users to upload leaf images (Tomato and Corn/Maize) and receive disease predictions with confidence scores using a convolutional neural network (CNN) model.

The interface adopts a high-fidelity **"field-lab specimen card"** theme featuring dark warm-charcoal green backgrounds, crisp serif titles, technical mono-spaced data readouts, and a custom scan-line loading sweep.

---

## Technical Stack

*   **Frontend**: React (Vite), Tailwind CSS, Framer Motion (for page morphing & transitions), Lucide React.
*   **Backend**: Django, Django REST Framework, TensorFlow-CPU, Pillow (PIL), django-cors-headers.
*   **Deployment**: Frontend → Vercel/Netlify | Backend → Render (with waking-up state indicator).

---

## Directory Structure

```text
crop-disease-detection/
├── backend/
│   ├── requirements.txt
│   ├── manage.py
│   ├── core/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── predictions/
│       ├── apps.py
│       ├── serializers.py
│       ├── urls.py
│       ├── views.py
│       └── ml/
│           ├── labels.py
│           ├── preprocess.py
│           ├── model_loader.py
│           └── create_dummy_model.py
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── index.css
│       ├── App.jsx
│       ├── components/
│       │   ├── ScanLineAnimation.jsx
│       │   └── ResultCard.jsx
│       └── pages/
│           ├── LandingPage.jsx
│           └── PredictPage.jsx
└── README.md
```

---

## Local Development Guide

### 1. Backend Setup (Django)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a Python Virtual Environment:**
    *   **Windows (PowerShell):**
        ```powershell
        python -m venv venv
        .\venv\Scripts\Activate.ps1
        ```
    *   **Mac/Linux:**
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Initialize or Generate the Keras Model:**
    The backend contains an auto-generation utility. If you do not have the trained model file, running the Django dev server will **automatically** create a dummy `mobilenetv2_crop_disease.keras` model inside `backend/predictions/ml/models/` to ensure the system compiles and processes mock predictions immediately.
    
    To generate it manually, run:
    ```bash
    python predictions/ml/create_dummy_model.py --output predictions/ml/models/mobilenetv2_crop_disease.keras
    ```

5.  **Start the local Django server:**
    ```bash
    python manage.py runserver 8000
    ```
    The server will start at `http://localhost:8000`.

---

### 2. Frontend Setup (React + Vite)

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```

2.  **Install npm packages:**
    ```bash
    npm install
    ```

3.  **Start the Vite development server:**
    ```bash
    npm run dev
    ```
    The app will open locally at `http://localhost:5173`.

---

## Swapping In Your Trained Model

To replace the dummy model with your trained 94.3% accuracy MobileNetV2 `.keras` model:

1.  Place your trained `.keras` file into the `backend/predictions/ml/models/` directory.
2.  If the file name is different (e.g., `my_best_model.keras`), update the `MODEL_NAME` config variable in `backend/core/settings.py` or set it in your environment:
    ```bash
    export MODEL_NAME=my_best_model.keras
    ```
3.  If your training-time preprocessing differed (e.g. normalizing to `[-1, 1]` instead of dividing by `255.0`), modify the preprocessing modes in `backend/predictions/ml/preprocess.py` to match.

---

## Supabase Database Integration (Optional)

The application has a built-in "Recent Diagnostics Log Registry" panel. By default, it operates in **Demo Mode** with mock entries so the evaluator can see the log history working immediately.

To connect a live Supabase PostgreSQL database:

1.  **Create the table in Supabase SQL Editor:**
    ```sql
    create table predictions (
      id uuid primary key default gen_random_uuid(),
      created_at timestamptz not null default now(),
      predicted_class text not null,
      crop text not null check (crop in ('tomato', 'corn')),
      confidence numeric(5,4) not null,
      is_healthy boolean not null,
      image_filename text,
      image_url text
    );

    create index predictions_created_at_idx on predictions (created_at desc);
    ```

2.  **Create a Storage Bucket:**
    *   In the Supabase console, go to **Storage** → click **New Bucket**.
    *   Name it **`leaf-specimens`** and make sure it is configured as **Public** (so public URLs can load).

3.  **Add environment variables:**
    *   **Local Backend Environment:** Add a `.env` file or export variables:
        ```bash
        export SUPABASE_URL="https://your-project.supabase.co"
        export SUPABASE_KEY="your-anon-key"
        ```
    *   The Django application will detect these variables and automatically connect the database and storage logger.

---

## Deployment Steps

### 1. Database Setup
Ensure the SQL schema above has been run in your Supabase project.

### 2. Backend Deployment (Render Free Tier)
1.  Connect your GitHub repository to **Render**.
2.  Create a new **Web Service**.
3.  Set the **Root Directory** to `backend/`.
4.  Specify the **Build Command**:
    ```bash
    pip install -r requirements.txt
    ```
5.  Specify the **Start Command**:
    ```bash
    gunicorn core.wsgi
    ```
6.  Add **Environment Variables** in the Render settings:
    *   `SUPABASE_URL`: Your Supabase API URL.
    *   `SUPABASE_KEY`: Your Supabase Anon Key.
7.  **Note on Cold Starts:** If inactive, Render spins down the server. The frontend is built to show a pulsing "DIAGNOSTIC ENGINE WAKING UP..." alert during initial requests.

### 3. Frontend Deployment (Vercel)
1.  Connect the GitHub repository to **Vercel**.
2.  Import the repository and set the **Root Directory** to `frontend/`.
3.  Configure the **Environment Variable**:
    *   `VITE_API_URL`: Set this to your deployed Render URL (e.g., `https://crop-disease-backend.onrender.com`).
4.  Deploy.
