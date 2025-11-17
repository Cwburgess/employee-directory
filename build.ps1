
# Build and package Next.js standalone for Azure App Service
$ErrorActionPreference = "Stop"

Remove-Item -Recurse -Force _deploy -ErrorAction SilentlyContinue

npm ci
npm run build

New-Item -ItemType Directory -Path "_deploy" | Out-Null
Copy-Item -Path ".next\standalone\*" -Destination "_deploy" -Recurse

New-Item -ItemType Directory -Path "_deploy\.next" -ErrorAction SilentlyContinue | Out-Null
Copy-Item -Path ".next\static" -Destination "_deploy\.next" -Recurse

if (Test-Path "public") {
  Copy-Item -Path "public" -Destination "_deploy" -Recurse
}

if (Test-Path "release.zip") { Remove-Item -Force "release.zip" }
Compress-Archive -Path "_deploy\*" -DestinationPath "release.zip"
