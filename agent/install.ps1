
$ErrorActionPreference = "Stop"
$Repo = "codemonix/server-monitor"
$InstallDir = "C:\Program Files\SRM-Agent"

if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
}

Write-Host "📥 Fetching latest SRM Agent release..." 
$LatestRel = Invoke-RestMethod "https://api.github.com/repos/$Repo/releases/latest"
$Asset = $LatestRel.assets | Where-Object { $_.name -like "*windows-amd64.zip" }

if (-not $Asset) {
    Write-Error "❌ Could not find a suitable release asset!" -ForegroundColor Red
    exit 1
}

$ZipPath = "$env:TEMP\srm-agent.zip"
Write-Host "📥 Downloading $($Asset.browser_download_url) ..."
Invoke-WebRequest -Uri $Asset.browser_download_url -OutFile $ZipPath
Expand-Archive -Path "$env:TEMP\srm-agent.zip" -DestinationPath $InstallDir -Force

Write-Host "✅ Files extracted to $InstallDir. Edit config.json then run scripts\register.ps1 as Admin." -ForegroundColor Green