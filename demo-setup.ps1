# demo-setup.ps1 - Insurance Recruit Template - Demo Mode Setup
# Run this script to start the site in demo mode

$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$dataDir = "$projectDir\data"
$dbPath = "$dataDir\app.db"

Clear-Host

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Insurance Agent Recruitment - Demo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill existing processes
Write-Host "[1/5] Cleaning ports..." -ForegroundColor Yellow

$portsToCheck = @(3000, 3001)
foreach ($port in $portsToCheck) {
    $procs = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($procs) {
        $procs | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
        Write-Host "  OK: Port $port freed" -ForegroundColor Green
    }
}
Start-Sleep -Seconds 1

# Step 2: Create .env.local with demo mode
Write-Host "[2/5] Setting up demo mode..." -ForegroundColor Yellow

$envContent = @"
ADMIN_PASSWORD=demo123
DEMO_MODE=true
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
"@

Set-Content -Path "$projectDir\.env.local" -Value $envContent -Encoding UTF8
Write-Host "  OK: .env.local created with DEMO_MODE=true" -ForegroundColor Green

# Step 3: Reset database
Write-Host "[3/5] Loading sample data..." -ForegroundColor Yellow

if (Test-Path $dbPath) {
    Remove-Item $dbPath -Force
    Write-Host "  OK: Old database removed" -ForegroundColor Green
}

if (Test-Path "$dbPath-wal") { Remove-Item "$dbPath-wal" -Force }
if (Test-Path "$dbPath-shm") { Remove-Item "$dbPath-shm" -Force }

if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}

Write-Host "  Running seed script..." -ForegroundColor Gray
Push-Location $projectDir
$env:NODE_NO_WARNINGS = "1"
cmd /c "npx tsx scripts/run-seed.ts >nul 2>nul"
Pop-Location

if (Test-Path $dbPath) {
    $dbSize = [math]::Round((Get-Item $dbPath).Length / 1KB)
    Write-Host "  OK: Database ready ($dbSize KB)" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Failed to create database" -ForegroundColor Red
    exit 1
}

# Step 4: Install dependencies
Write-Host "[4/5] Checking dependencies..." -ForegroundColor Yellow

Push-Location $projectDir
$nodeModulesExists = Test-Path "node_modules"
Pop-Location

if (-not $nodeModulesExists) {
    Write-Host "  Installing packages..." -ForegroundColor Gray
    Push-Location $projectDir
    npm install 2>&1 | Out-Null
    Pop-Location
    Write-Host "  OK: Packages installed" -ForegroundColor Green
} else {
    Write-Host "  OK: Dependencies already installed" -ForegroundColor Green
}

# Step 5: Start Next.js
Write-Host "[5/5] Starting Next.js server..." -ForegroundColor Yellow

Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$projectDir`" && npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 6

$ready = $false
for ($i = 1; $i -le 15; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch { Start-Sleep -Seconds 2 }
}

if ($ready) {
    Write-Host "  OK: Server running at http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "  WARN: Server may still be starting..." -ForegroundColor Yellow
}

# Open browser
Write-Host "  Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"

# Done
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Demo is ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Home page:    http://localhost:3000" -ForegroundColor White
Write-Host "  Application:  http://localhost:3000/apply" -ForegroundColor White
Write-Host "  Admin panel:  http://localhost:3000/admin" -ForegroundColor White
Write-Host ""
Write-Host "  DEMO MODE:    ON" -ForegroundColor Cyan
Write-Host "  Admin login:  Click login button (no password needed)" -ForegroundColor Cyan
Write-Host "  Changes:      Not saved" -ForegroundColor Cyan
Write-Host "  Password:     Cannot be changed" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Press Ctrl+C in server window to stop" -ForegroundColor Gray
Write-Host ""
