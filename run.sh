#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/.venv"

if ! command -v python >/dev/null 2>&1; then
  echo "Error: python is not installed or not in PATH."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed or not in PATH."
  exit 1
fi

if [ ! -d "$VENV_DIR" ]; then
  echo "Creating Python virtual environment..."
  python -m venv "$VENV_DIR"
fi

echo "Installing backend dependencies..."
"$VENV_DIR/Scripts/python.exe" -m pip install --upgrade pip
"$VENV_DIR/Scripts/python.exe" -m pip install -r "$BACKEND_DIR/requirements.txt"

echo "Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install

echo "Starting backend and frontend..."
cd "$ROOT_DIR"

"$VENV_DIR/Scripts/python.exe" -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

(
  cd "$FRONTEND_DIR"
  npm run dev
) &
FRONTEND_PID=$!

cleanup() {
  echo ""
  echo "Stopping services..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "Backend:  http://127.0.0.1:8000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop both."

wait
