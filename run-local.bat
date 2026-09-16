@echo off
echo ===================================================
echo Starting AI-Powered IT Support Assistant
echo ===================================================

echo [1/2] Preparing Backend...
cd backend
if not exist .venv (
    echo Creating Python virtual environment...
    python -m venv .venv
)

echo Installing Backend requirements...
call .venv\Scripts\activate.bat
pip install -q -r requirements.txt

echo Launching FastAPI Backend on http://localhost:8000 ...
start "Backend Server" cmd /k "call .venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --port 8000"

cd ..

echo [2/2] Preparing Frontend...
cd frontend
if not exist node_modules (
    echo Installing Frontend npm packages...
    call npm install
)

echo Launching React Frontend on http://localhost:5173 ...
start "Frontend Server" cmd /k "npm run dev"

cd ..
echo ===================================================
echo Servers launched!
echo Frontend: http://localhost:5173
echo Swagger Docs: http://localhost:8000/docs
echo ===================================================
