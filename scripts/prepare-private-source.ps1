# Prepare a private backup of the public development repository.
# This script DOES NOT change the public repo, GitHub Pages or its history.
# Requires Windows PowerShell, git, GitHub CLI (gh) and gh auth login.
# Run from a local clone after reviewing this script.
$ErrorActionPreference = 'Stop'
$Source = 'mcoc1all1/summoner-index'
$Destination = 'mcoc1all1/summoner-index-source'
$TempPath = Join-Path ([IO.Path]::GetTempPath()) ('si-private-mirror-' + [guid]::NewGuid().ToString('N') + '.git')

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw 'Install/authenticate the GitHub CLI (gh) before running this script.' }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Install Git before running this script.' }
& gh auth status
if ($LASTEXITCODE -ne 0) { throw 'GitHub CLI is not authenticated.' }

$Existing = & gh repo view $Destination --json isPrivate --jq '.isPrivate' 2>$null
if ($LASTEXITCODE -eq 0) {
 if ($Existing -ne 'true') { throw "Destination exists but is not private: $Destination" }
 throw "Private destination $Destination already exists. Abort to avoid overwriting its branches."
}

Write-Host "Creating $Destination as PRIVATE..."
& gh repo create $Destination --private
if ($LASTEXITCODE -ne 0) { throw 'Unable to create the private repository.' }
$Visibility = & gh repo view $Destination --json isPrivate --jq '.isPrivate'
if ($LASTEXITCODE -ne 0 -or $Visibility -ne 'true') { throw 'Destination is not confirmed private; refusing to copy source.' }

try {
 Write-Host "Backing up the existing public repo to $TempPath"
 & git clone --mirror "https://github.com/$Source.git" $TempPath
 if ($LASTEXITCODE -ne 0) { throw 'Mirror clone failed.' }
 & git -C $TempPath remote set-url origin "https://github.com/$Destination.git"
 & git -C $TempPath push --mirror origin
 if ($LASTEXITCODE -ne 0) { throw 'Private mirror push failed.' }
 Write-Host "Private source backup created: https://github.com/$Destination"
 Write-Warning 'The original public repository and its Git history are STILL public. Do not treat the private backup as a completed source separation.'
 Write-Warning 'The public distribution repo, CI deployment credentials and GitHub Pages migration still need a deliberate clean-history cutover.'
} finally {
 if (Test-Path -LiteralPath $TempPath) { Remove-Item -LiteralPath $TempPath -Recurse -Force }
}
