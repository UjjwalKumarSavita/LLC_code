[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$certPath = Join-Path $root ".local-runtime\certs\localhost.cer"

if (-not (Test-Path $certPath)) {
  throw "Missing local HTTPS certificate. Run scripts\start-local.cmd first."
}

Write-Host "Windows will ask whether to trust the LLC_code localhost certificate." -ForegroundColor Cyan
Write-Host "Approve only if the certificate path is:" -ForegroundColor Cyan
Write-Host $certPath -ForegroundColor Yellow
& certutil.exe -user -addstore Root $certPath
if ($LASTEXITCODE -ne 0) {
  throw "Certificate trust was not completed."
}
Write-Host "Trusted local LLC_code certificate. Reopen https://localhost:3000." -ForegroundColor Green
