param(
  [string]$DistPath = "dist"
)

$indexHtmlPath = Join-Path $DistPath "index.html"
$faviconPath = Join-Path $DistPath "favicon.svg"

if (-not (Test-Path $indexHtmlPath)) {
  Write-Error "dist/index.html does not exist at $indexHtmlPath"
  exit 1
}

if (-not (Test-Path $faviconPath)) {
  Write-Error "dist/favicon.svg does not exist at $faviconPath"
  exit 1
}

$content = [System.IO.File]::ReadAllText($indexHtmlPath, [System.Text.Encoding]::UTF8)

$requiredPatterns = @(
  @{ Pattern = 'src="/P\.I-Ecosis-Prototipo/assets/'; Name = 'JS asset base prefix' },
  @{ Pattern = 'href="/P\.I-Ecosis-Prototipo/assets/'; Name = 'CSS asset base prefix' },
  @{ Pattern = 'href="/P\.I-Ecosis-Prototipo/favicon\.svg"'; Name = 'Favicon base prefix' },
  @{ Pattern = '<title>EcoSis\s+[\u2014\u2013-]\s+Prot[\u00f3o]tipo</title>'; Name = 'Page title' },
  @{ Pattern = 'lang="pt-BR"'; Name = 'Language pt-BR' },
  @{ Pattern = 'content="noindex, nofollow"'; Name = 'Robots meta tag' }
)

foreach ($req in $requiredPatterns) {
  if ($content -notmatch $req.Pattern) {
    Write-Error "Verification failed: missing $($req.Name) (pattern: $($req.Pattern))"
    exit 1
  }
}

if ($content -match 'figma') {
  Write-Error "Verification failed: contains forbidden string 'figma'"
  exit 1
}

Write-Host "All dist verifications passed successfully!"
exit 0
