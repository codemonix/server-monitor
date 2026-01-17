
$ErrorActionPreference = "Stop"
$Repo = "codemonix/server-monitor"
$InstallDir = "C:\Program Files\SRM-Agent"
$ConfigDir = "C:\ProgramData\srm-agent"

# Create install directory if it doesn't exist
if (-not (Test-Path $InstallDir)) {New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null }
if (-not (Test-Path $ConfigDir)) {New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null }

Write-Host "📥 Fetching latest SRM Agent release..." 
$LatestRel = Invoke-RestMethod "https://api.github.com/repos/$Repo/releases/latest"
$Asset = $LatestRel.assets | Where-Object { $_.name -like "*windows-amd64.zip" }

if (-not $Asset) {
    Write-Error "❌ Could not find a suitable release asset!" -ForegroundColor Red
    exit 1
}

# Download and extract
$ZipPath = "$env:TEMP\srm-agent.zip"
Write-Host "📥 Downloading version $($LatestRel.tag_name) ..."
Invoke-WebRequest -Uri $Asset.browser_download_url -OutFile $ZipPath
Expand-Archive -Path $ZipPath -DestinationPath $InstallDir -Force

# Setup config file if it doesn't exist
if (-not (Test-Path "$ConfigDir\config.json")) {
    if (Test-Path "$InstallDir\config.json.template") {
        Copy-Item "$InstallDir\config.json.template" "$ConfigDir\config.json"
        Write-Host "Created config.json from template in $ConfigDir" -ForegroundColor Yellow
    }
}

Write-Host "✅ Files extracted." -ForegroundColor Green
Write-Host "Step 1: Edit $ConfigDir\config.json" -ForegroundColor White
Write-Host "Step 2: Run '$InstallDir\scripts\register.ps1' as Admin" -ForegroundColor White