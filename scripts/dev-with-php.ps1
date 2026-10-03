param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]] $ViteArgs
)

$ErrorActionPreference = 'Stop'

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$phpHost = '127.0.0.1'
$phpPort = 8000

function Test-PortListening {
  param(
    [string] $TargetHost,
    [int] $Port
  )

  $client = New-Object System.Net.Sockets.TcpClient

  try {
    $asyncResult = $client.BeginConnect($TargetHost, $Port, $null, $null)
    if (-not $asyncResult.AsyncWaitHandle.WaitOne(700, $false)) {
      return $false
    }

    $client.EndConnect($asyncResult) | Out-Null
    return $true
  } catch {
    return $false
  } finally {
    $client.Dispose()
  }
}

function Resolve-PhpBinary {
  $candidates = @(
    $env:PHP_BINARY
    $env:PHP_PATH
    'C:\xampp\php\php.exe'
    'C:\php\php.exe'
    'php'
  ) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }

  foreach ($candidate in $candidates) {
    if ($candidate -eq 'php') {
      return $candidate
    }

    if (Test-Path $candidate) {
      return $candidate
    }
  }

  return $null
}

$startedPhpHere = $false
$phpProcess = $null
$devExitCode = 0

if (Test-PortListening -TargetHost $phpHost -Port $phpPort) {
  Write-Host "[dev] PHP backend detectado en http://$phpHost`:$phpPort"
} else {
  $phpBinary = Resolve-PhpBinary
  if (-not $phpBinary) {
    throw 'No encontramos PHP para iniciar el backend local en el puerto 8000.'
  }

  $phpArgs = @('-S', "$phpHost`:$phpPort", '-t', $workspaceRoot)
  $phpProcess = Start-Process -FilePath $phpBinary -ArgumentList $phpArgs -WorkingDirectory $workspaceRoot -WindowStyle Hidden -PassThru
  $startedPhpHere = $true

  $deadline = (Get-Date).AddSeconds(8)
  while ((Get-Date) -lt $deadline) {
    if (Test-PortListening -TargetHost $phpHost -Port $phpPort) {
      break
    }

    Start-Sleep -Milliseconds 250
  }

  if (-not (Test-PortListening -TargetHost $phpHost -Port $phpPort)) {
    throw 'No pudimos iniciar el backend PHP en http://127.0.0.1:8000.'
  }

  Write-Host "[dev] PHP backend iniciado en http://$phpHost`:$phpPort"
}

try {
  & npm run dev:client -- @ViteArgs
  $devExitCode = $LASTEXITCODE
} finally {
  if ($startedPhpHere -and $phpProcess -and -not $phpProcess.HasExited) {
    Stop-Process -Id $phpProcess.Id -Force
  }
}

exit $devExitCode
