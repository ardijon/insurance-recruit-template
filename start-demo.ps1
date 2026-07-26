# start-demo.ps1 — Insurance Recruit Template Demo
# Uses localtunnel (no account needed, works behind VPN)

$ErrorActionPreference = "SilentlyContinue"
$projectDir = "D:\New Projects\Insurance\manager"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Insurance Demo - Starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill anything on port 3000
$procs = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($procs) {
    $procs | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
    Start-Sleep -Seconds 2
}

# Start Next.js
Write-Host "[1/2] Starting Next.js server..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$projectDir`" && npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 8

# Check if server is up
Write-Host "[*] Checking server..." -ForegroundColor Yellow
$ready = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -UseBasicParsing | Out-Null
        $ready = $true
        break
    } catch { Start-Sleep -Seconds 2 }
}

if ($ready) {
    Write-Host "[OK] Server is running!" -ForegroundColor Green
} else {
    Write-Host "[!] Server might still be starting, continuing..." -ForegroundColor Yellow
}

# Start localtunnel
Write-Host "[2/2] Starting tunnel..." -ForegroundColor Green
Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  LINK FOR YOUR PHONE:" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

lt --port 3000
