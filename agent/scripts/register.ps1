# Must be run as administrator

$ServiceName = "SRMAgent"
$ConfigDir = "C:\ProgramData\srm-agent"
$InstallDir = "C:\Program Files\SRM-Agent"
$ExePath = "$InstallDir\srm-agent.exe"


if (-not (Test-Path $ExePath)) {
    Write-Host "❌ Error: Agent binary not found at $ExePath" -ForegroundColor Red
    exit 1
}


if (Get-Service $ServiceName -ErrorAction SilentlyContinue) {
    Write-Host " Removing existing service..."
    Stop-Service $ServiceName -Force -ErrorAction SilentlyContinue
    & sc.exe delete $ServiceName
    Start-Sleep -Seconds 2
}

Write-Host " Registering $ServiceName ..."
New-Service -Name $ServiceName `
    ~BinaryPathName "`"$ExePath`"" `
    -DisplayName "SRM Monitoring Agent" `
    -Description "Service for SRM Monitoring Agent system metric collector" `
    -StartupType Automatic


& sc.exe failure $ServiceName reset= 86400 actions= restart/10000/restart/30000/restart/60000

Start-Service $ServiceName

Write-Host " ✅ Service $ServiceName registered and started." -ForegroundColor Green
exit 0