# 🚛 TransPilot

An AI-powered Fleet Management System built using **React + TypeScript + Vite** for the frontend and **FastAPI** for the backend.

---

# Prerequisites

Make sure the following are installed:

- Node.js (v18 or later)
- Python 3.11+
- Git

---

# Clone the Repository

```bash
git clone https://github.com/Tatakushal/TransPilot.git
cd TransPilot
```

---

# Frontend Setup

Open a terminal in the project root.

## Install dependencies

```bash
npm install
```

## Start the frontend

```bash
npm run dev
```

The frontend will start at:

```
http://localhost:5173
```

---

# Backend Setup

Open **another terminal**.

Navigate to the backend folder.

```bash
cd backend
```

## Create a Virtual Environment (Recommended)

### Windows

```bash
python -m venv .venv
```

Activate it:

```bash
.venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

## Upgrade pip

```bash
python -m pip install --upgrade pip
```

---

## Install Backend Dependencies

```bash
pip install fastapi uvicorn sqlalchemy pydantic python-multipart
```

---

## Run the Backend

```bash
python -m uvicorn main:app --reload
```

The backend will start at:

```
http://127.0.0.1:8000
```

Swagger API Documentation:

```
http://127.0.0.1:8000/docs
```

---

# Running the Project

### Terminal 1 (Backend)

```bash
cd backend
python -m uvicorn main:app --reload
```

### Terminal 2 (Frontend)

```bash
npm run dev
```

Open your browser:

```
http://localhost:5173
```

---

# Project Structure

```
TransPilot
│
├── backend/
│   ├── main.py
│   ├── ...
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── router/
│   └── ...
│
├── package.json
├── vite.config.ts
└── README.md
```

---

# Troubleshooting

### Backend won't start

Make sure you are inside the backend folder:

```bash
cd backend
```

If dependencies are missing:

```bash
pip install fastapi uvicorn sqlalchemy pydantic python-multipart
```

---

### Frontend won't start

Install dependencies again:

```bash
npm install
```

Then run:

```bash
npm run dev
```

---

### API Connection Error

Ensure the backend is running before starting the frontend.

Backend:

```
http://127.0.0.1:8000
```

Frontend:

```
http://localhost:5173
```

---

# Team

**TransPilot**

Developed as part of a Hackathon Project.
