[CmdletBinding()]
param(
  [switch]$Setup,
  [string]$AdminEmail = "",
  [string]$AdminPassword = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$apiRoot = Join-Path $root "services\api"
$runtime = Join-Path $root ".local-runtime"
$distro = "LLC-Docker"
New-Item -ItemType Directory -Force -Path $runtime | Out-Null

function New-SecureHex([int]$Bytes = 32) {
  $buffer = New-Object byte[] $Bytes
  $generator = [Security.Cryptography.RandomNumberGenerator]::Create()
  try { $generator.GetBytes($buffer) } finally { $generator.Dispose() }
  return ([BitConverter]::ToString($buffer) -replace "-", "").ToLowerInvariant()
}

function Read-DotEnv([string]$Path) {
  $values = @{}
  foreach ($line in Get-Content -LiteralPath $Path) {
    if ($line -match '^\s*([^#][^=]*)=(.*)$') {
      $values[$matches[1].Trim()] = $matches[2].Trim()
    }
  }
  return $values
}

$composeEnv = Join-Path $root ".env"
$apiEnv = Join-Path $apiRoot ".env"
$webEnv = Join-Path $root ".env.local"
if (-not (Test-Path $composeEnv)) {
  if (-not $Setup) {
    throw "Missing root .env. Run scripts\start-local.cmd -Setup to generate private local secrets."
  }
  $databasePassword = New-SecureHex 24
  @(
    "POSTGRES_USER=llc_code"
    "POSTGRES_PASSWORD=$databasePassword"
    "POSTGRES_DB=llc_code"
    "POSTGRES_PORT=55432"
    "REDIS_PORT=6379"
    "PISTON_PORT=2000"
  ) | Set-Content -LiteralPath $composeEnv -Encoding UTF8
  Write-Host "Generated private Docker credentials in ignored .env." -ForegroundColor Green
}

if (-not (Test-Path $apiEnv)) {
  if (-not $Setup) {
    throw "Missing services\api\.env. Run scripts\start-local.cmd -Setup to generate private local secrets."
  }
  $composeValues = Read-DotEnv $composeEnv
  $databasePassword = $composeValues["POSTGRES_PASSWORD"]
  @(
    "NODE_ENV=development"
    "PORT=4000"
    "WEB_ORIGIN=http://localhost:3000"
    "DATABASE_URL=postgresql://llc_code:$databasePassword@127.0.0.1:55432/llc_code?schema=public"
    "REDIS_URL=redis://127.0.0.1:6379"
    "JWT_ACCESS_SECRET=$(New-SecureHex 32)"
    "JWT_REFRESH_SECRET=$(New-SecureHex 32)"
    "JWT_ACCESS_TTL=15m"
    "JWT_REFRESH_TTL=7d"
    "JUDGE_ENGINE_PROVIDER=piston"
    "JUDGE_ENGINE_URL=http://127.0.0.1:2000"
    "JUDGE_ENGINE_SECRET=$(New-SecureHex 32)"
    "JUDGE_WORKER_CONCURRENCY=2"
    "JUDGE_MAX_OUTPUT_KB=256"
  ) | Set-Content -LiteralPath $apiEnv -Encoding UTF8
  Write-Host "Generated private API secrets in ignored services\api\.env." -ForegroundColor Green
}

if (-not (Test-Path $webEnv)) {
  "API_BASE_URL=http://127.0.0.1:4000/api" |
    Set-Content -LiteralPath $webEnv -Encoding UTF8
}

function Assert-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found."
  }
}

function Test-ProcessFile([string]$Name) {
  $file = Join-Path $runtime "$Name.pid"
  if (-not (Test-Path $file)) { return $false }
  $savedPid = [int](Get-Content $file -Raw)
  return [bool](Get-Process -Id $savedPid -ErrorAction SilentlyContinue)
}

function Start-TrackedProcess(
  [string]$Name,
  [string]$FilePath,
  [string[]]$Arguments,
  [string]$WorkingDirectory
) {
  if (Test-ProcessFile $Name) {
    Write-Host "$Name is already running." -ForegroundColor DarkGray
    return
  }
  $escapedArguments = $Arguments | ForEach-Object {
    if ($_ -match '[\s"]') {
      '"' + ($_ -replace '(\\*)"', '$1$1\"' -replace '(\\+)$', '$1$1') + '"'
    } else {
      $_
    }
  }
  $process = Start-Process `
    -FilePath $FilePath `
    -ArgumentList ($escapedArguments -join " ") `
    -WorkingDirectory $WorkingDirectory `
    -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $runtime "$Name.out.log") `
    -RedirectStandardError (Join-Path $runtime "$Name.err.log") `
    -PassThru
  Set-Content -LiteralPath (Join-Path $runtime "$Name.pid") -Value $process.Id
  Write-Host "Started $Name (PID $($process.Id))." -ForegroundColor Green
}

function Wait-Http([string]$Name, [string]$Url, [int]$Seconds = 45) {
  for ($attempt = 0; $attempt -lt $Seconds; $attempt++) {
    try {
      $response = Invoke-WebRequest $Url -UseBasicParsing -TimeoutSec 3
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        Write-Host "$Name is ready: $Url" -ForegroundColor Green
        return
      }
    } catch {
      Start-Sleep -Seconds 1
    }
  }
  throw "$Name did not become ready at $Url. Check .local-runtime logs."
}

Assert-Command "node.exe"
Assert-Command "npm.cmd"
Assert-Command "wsl.exe"

if (-not (Test-ProcessFile "wsl-keeper")) {
  Start-TrackedProcess `
    -Name "wsl-keeper" `
    -FilePath "wsl.exe" `
    -Arguments @("-d", $distro, "-u", "root", "--", "sh", "-lc", "while true; do sleep 3600; done") `
    -WorkingDirectory $root
  Start-Sleep -Seconds 2
}

$composePath = "/mnt/d/coding seekho/ZZZ_Project/LLC_code/compose.yaml"
$infraCommand = @"
mkdir -p /run /var/run
if ! docker info >/dev/null 2>&1; then
  start-stop-daemon --start --background --make-pidfile --pidfile /run/docker.pid --exec /usr/bin/dockerd -- --host=unix:///var/run/docker.sock
fi
i=0
while ! docker info >/dev/null 2>&1 && [ `$i -lt 30 ]; do i=`$((i+1)); sleep 1; done
docker compose -f '$composePath' up -d postgres redis piston
"@
& wsl.exe -d $distro -u root -- sh -lc $infraCommand
if ($LASTEXITCODE -ne 0) { throw "Local infrastructure failed to start." }

for ($attempt = 0; $attempt -lt 30; $attempt++) {
  $health = & wsl.exe -d $distro -u root -- docker inspect --format "{{.State.Health.Status}}" llc-code-postgres 2>$null
  if ($health -eq "healthy") { break }
  Start-Sleep -Seconds 1
}
if ($health -ne "healthy") { throw "PostgreSQL did not become healthy." }

if ($Setup) {
  Write-Host "Installing and building the web application..." -ForegroundColor Cyan
  Push-Location $root
  try {
    & npm.cmd install
    if ($LASTEXITCODE -ne 0) { throw "Web dependency installation failed." }
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw "Web production build failed." }
  } finally { Pop-Location }

  Write-Host "Preparing and building the API..." -ForegroundColor Cyan
  Push-Location $apiRoot
  try {
    & npm.cmd install
    if ($LASTEXITCODE -ne 0) { throw "API dependency installation failed." }
    & npm.cmd run prisma:generate
    if ($LASTEXITCODE -ne 0) { throw "Prisma generation failed." }
    & npm.cmd run db:deploy
    if ($LASTEXITCODE -ne 0) { throw "Database migration failed." }
    if ($AdminEmail) { $env:BOOTSTRAP_ADMIN_EMAIL = $AdminEmail }
    if ($AdminPassword) { $env:BOOTSTRAP_ADMIN_PASSWORD = $AdminPassword }
    & npm.cmd run db:seed
    if ($LASTEXITCODE -ne 0) { throw "Database seed failed." }
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw "API production build failed." }
  } finally {
    Remove-Item Env:BOOTSTRAP_ADMIN_EMAIL -ErrorAction SilentlyContinue
    Remove-Item Env:BOOTSTRAP_ADMIN_PASSWORD -ErrorAction SilentlyContinue
    Pop-Location
  }
}

$apiEntry = Join-Path $apiRoot "dist\main.js"
$workerEntry = Join-Path $apiRoot "dist\judge-worker\main.js"
$nextEntry = Join-Path $root "node_modules\next\dist\bin\next"
foreach ($entry in @($apiEntry, $workerEntry, $nextEntry)) {
  if (-not (Test-Path $entry)) {
    throw "Missing build output '$entry'. Run .\scripts\start-local.ps1 -Setup first."
  }
}

$node = (Get-Command node.exe).Source
Start-TrackedProcess "api" $node @($apiEntry) $apiRoot
Wait-Http "API" "http://127.0.0.1:4000/api/health"
Start-TrackedProcess "judge-worker" $node @($workerEntry) $apiRoot
Start-TrackedProcess "web" $node @($nextEntry, "start", "-p", "3000") $root
Wait-Http "Web" "http://localhost:3000/login"

Write-Host ""
Write-Host "LLC_code is ready: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Run .\scripts\check-local.ps1 for a health report."
