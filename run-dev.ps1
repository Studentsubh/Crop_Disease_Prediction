<#
Run both backend and frontend dev servers in separate PowerShell windows.

Usage: Right-click -> Run with PowerShell, or from PowerShell:
  ./run-dev.ps1

The script will:
- Ensure a Python virtualenv exists in `backend/.venv` (creates it if missing).
- Launch a new PowerShell window for the backend and run `python manage.py runserver 8000`.
- Launch a new PowerShell window for the frontend and run `npm run dev`.

Edit `VITE_API_URL` below if your backend is hosted on a different host/port.
#>

Set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backendDir = Join-Path $root 'backend'
$frontendDir = Join-Path $root 'frontend'

# Optional: set this if your frontend needs a different API URL
$envViteApiUrl = 'http://localhost:8000'

Write-Host "Starting dev servers..."

# Ensure backend venv
if (-Not (Test-Path (Join-Path $backendDir '.venv'))) {
    Write-Host "Creating Python venv in $backendDir\.venv..."
    Push-Location $backendDir
    python -m venv .venv
    Pop-Location
}

# Backend command
$backendCommand = "Set-Location -Path '$backendDir'; `. .venv\Scripts\Activate.ps1`; Write-Host 'Backend: running migrations (safe)'; python manage.py migrate; Write-Host 'Backend: starting server at http://127.0.0.1:8000/'; python manage.py runserver 8000"

Start-Process -FilePath pwsh -ArgumentList ('-NoExit','-Command', $backendCommand) -WindowStyle Normal

# Frontend command: do NOT force install every time, but ensure node modules exist
$frontendCommand = "Set-Location -Path '$frontendDir'; if (-Not (Test-Path 'node_modules')) { Write-Host 'Installing frontend dependencies...'; npm install }; `$env:VITE_API_URL='$envViteApiUrl'; Write-Host 'Frontend: starting dev server'; npm run dev"

Start-Process -FilePath pwsh -ArgumentList ('-NoExit','-Command', $frontendCommand) -WindowStyle Normal

Write-Host "Launched backend and frontend windows. Close those windows to stop servers."
