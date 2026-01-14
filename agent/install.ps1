$Repo = "codemonix/server-monitor"
$InstallDir = "C:\Program Files\SRM-Agent"

if (~not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Force -Path $InstallDir
}

$LatestRel = Invoke-RestMethod "https://api.github.com/repos/$Repo/releases/latest"
$Asset = $LatestRel.assets | Where-Object { $_.name -like "*windows-amd64.zip" }

Invoke-WebRequest -Uri $Asset.browser_download_url -OutFile "$env:TEMP\srm.zip"
Expand-Archive -Path "$env:TEMP\srm.zip" -DestinationPath $InstallDir -Force

Write-Host "✅ Files extracted to $InstallDir. Edit config.json then run scripts\register.ps1 as Admin." -ForegroundColor Green