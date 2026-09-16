# AI-Powered IT Support Assistant

An end-to-end, local-first technical support assistant that stores support tickets, searches a seeded IT knowledge base using a deterministic local scoring algorithm (local RAG), and leverages Google Gemini to generate clear, step-by-step troubleshooting instructions.

---

## 🏗️ Architecture Diagram

```
React UI (Vite + TypeScript)
        │
        ▼  POST /api/tickets
 FastAPI Backend (Python)
        │
        ├──▶ Knowledge Base Search (Local RAG Token Matching)
        │           │
        │           ▼
        │     SQLite Database (Knowledge Base & Tickets)
        │
        └──▶ Google Gemini LLM API
                    │
                    ▼
          AI Troubleshooting Steps
```

---

## 🚀 Features

- **Technical Question Submission**: Enter IT questions via a clean, modern React interface.
- **Local RAG Context Retrieval**: Searches a local knowledge base of 15 seeded IT scenarios (Wi-Fi, VPN, BSOD, DNS, Outlook, etc.) using tokenized keyword matching and weighted scoring.
- **Google Gemini Integration**: Uses Google's official Gemini SDK (`gemini-3.6-flash` by default; configurable via `GEMINI_MODEL` env var) to construct clear troubleshooting steps.
- **Complete Ticket Persistence**: Stores exact user question, retrieved context, and generated AI response in SQLite database.
- **RESTful API**: Clean FastAPI backend with full input validation (min 5 chars, max 2000 chars) and HTTP status error handling.
- **Real-Time UI Loading & Error States**: Real loading indicators during active API calls and user-friendly error panels.
- **Recent Tickets History**: Switch between and inspect previously generated support tickets.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Vanilla CSS design system.
- **Backend**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0.
- **Database**: SQLite.
- **LLM Engine**: Google Gemini API (`google-genai` / `google-generativeai`).

---

## ⚙️ Environment Setup

1. Rename `backend/.env.example` to `backend/.env` (or create `backend/.env`):

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash
DATABASE_URL=sqlite:///./support_assistant.db
```

2. Replace `your_google_gemini_api_key_here` with a valid Google Gemini API key obtained from [Google AI Studio](https://aistudio.google.com/).

---

## 🏃 Quick Start / Local Run

### Option A: Using `run-local.bat` (Windows)

Simply double click or run:
```cmd
run-local.bat
```

---

### Option B: Manual Setup

#### 1. Start FastAPI Backend (Port 8000)

```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate

# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

- Backend API: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`

#### 2. Start React Frontend (Port 5173)

In a separate terminal window:

```bash
cd frontend
npm install
npm run dev
```

- React Frontend UI: `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint returning service status |
| `GET` | `/api/knowledge` | Returns all 15 seeded IT knowledge base problems and solutions |
| `POST` | `/api/tickets` | Accepts technical question, searches KB, queries Gemini, saves & returns ticket |
| `GET` | `/api/tickets` | Returns recent ticket history |
| `GET` | `/api/tickets/{id}` | Returns stored ticket by ID |

---

## 💡 Example Support Question

> **Question:** "My laptop connects to Wi-Fi but websites are not opening."

**Result:**
- **Retrieved Context**: Matches *Wi-Fi connected but no internet* and *DNS resolution failure*.
- **AI Response**: Provides ordered troubleshooting steps (Flush DNS with `ipconfig /flushdns`, reset Winsock, test DNS with `nslookup`, restart network adapter).
- **Persistence**: Saved with Ticket ID in SQLite.
