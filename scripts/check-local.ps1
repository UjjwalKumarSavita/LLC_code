$ErrorActionPreference = "Continue"
$checks = @(
  @{ Name = "Web"; Url = "http://localhost:3000/login" },
  @{ Name = "API"; Url = "http://127.0.0.1:4000/api/health" },
  @{ Name = "Piston"; Url = "http://127.0.0.1:2000/api/v2/runtimes" }
)
$failed = $false
foreach ($check in $checks) {
  try {
    $response = Invoke-WebRequest $check.Url -UseBasicParsing -TimeoutSec 8
    Write-Host ("[OK]   {0,-8} HTTP {1}" -f $check.Name, $response.StatusCode) -ForegroundColor Green
  } catch {
    Write-Host ("[FAIL] {0,-8} {1}" -f $check.Name, $_.Exception.Message) -ForegroundColor Red
    $failed = $true
  }
}

try {
  $containers = & wsl.exe -d LLC-Docker -u root -- sh -lc "docker ps --format '{{.Names}}::{{.Status}}'"
  foreach ($container in $containers) { Write-Host "[OK]   $container" -ForegroundColor Green }
} catch {
  Write-Host "[FAIL] Docker container status unavailable." -ForegroundColor Red
  $failed = $true
}

if ($failed) { exit 1 }
Write-Host "All local LLC_code services are healthy." -ForegroundColor Cyan
