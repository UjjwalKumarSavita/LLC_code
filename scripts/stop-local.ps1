[CmdletBinding()]
param([switch]$Infrastructure)

$root = Split-Path -Parent $PSScriptRoot
$runtime = Join-Path $root ".local-runtime"

foreach ($name in @("web", "judge-worker", "api")) {
  $file = Join-Path $runtime "$name.pid"
  if (Test-Path $file) {
    $savedPid = [int](Get-Content $file -Raw)
    Stop-Process -Id $savedPid -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $file -Force
    Write-Host "Stopped $name."
  }
}

if ($Infrastructure) {
  & wsl.exe -d LLC-Docker -u root -- docker compose `
    -f "/mnt/d/coding seekho/ZZZ_Project/LLC_code/compose.yaml" stop
  $keeper = Join-Path $runtime "wsl-keeper.pid"
  if (Test-Path $keeper) {
    $savedPid = [int](Get-Content $keeper -Raw)
    Stop-Process -Id $savedPid -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $keeper -Force
  }
  & wsl.exe --terminate LLC-Docker
  Write-Host "Stopped local infrastructure."
}
