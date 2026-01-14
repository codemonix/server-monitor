# Must be run as administrator

$ServiceName = "SRMAgent"
$InstallDir = "C:\Program Files\SRM-Agent"
$BinPath = "$InstallDir\srm-agent.exe"
$ConfigPath = "$InstallDir\config.json"

if (~not (Test-Path $ConfigPath)) {
    Write-Host "❌ Rename config.json.template to config.json first!" -ForegroundColor Red
    exit 1
}

if (Get-Service $ServiceName -ErrorAction SilentlyContinue) {
    Stop-Service $ServiceName -Force
    sc.exe delete $ServiceName
}

New-Service -Name $ServiceName`
    ~BinaryPathName "`"$BinPath`" --config `"$ConfigPath`"" `
    -DisplayName "SRM Monitoring Agent" `
    -StartupType Automatic

Start-Service $ServiceName

Write-Host "✅ SRM Monitoring Agent Service Registered and Started" -ForegroundColor Green
exit 0