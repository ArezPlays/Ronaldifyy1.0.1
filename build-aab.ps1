# Script to build AAB with Java 17
# This script will download Java 17 if needed and build the AAB

$java17Path = "$PSScriptRoot\java17"
$java17Url = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.13+11/OpenJDK17U-jdk_x64_windows_hotspot_17.0.13_11.zip"

Write-Host "Checking for Java 17..." -ForegroundColor Yellow

# Check if Java 17 is already downloaded
if (-not (Test-Path "$java17Path\bin\java.exe")) {
    Write-Host "Java 17 not found. You need to install Java 17 manually." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please do one of the following:" -ForegroundColor Yellow
    Write-Host "1. Download Java 17 from: https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Cyan
    Write-Host "2. Install it to: $java17Path" -ForegroundColor Cyan
    Write-Host "   OR install it system-wide and set JAVA_HOME" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installing Java 17, run this script again or:" -ForegroundColor Yellow
    Write-Host "  cd android" -ForegroundColor Green
    Write-Host "  .\gradlew.bat bundleRelease" -ForegroundColor Green
    exit 1
}

# Set JAVA_HOME to the local Java 17
$env:JAVA_HOME = $java17Path
Write-Host "Using Java 17 from: $java17Path" -ForegroundColor Green

# Build the AAB
Write-Host ""
Write-Host "Building AAB..." -ForegroundColor Yellow
cd android
.\gradlew.bat bundleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Build successful!" -ForegroundColor Green
    Write-Host "AAB file location: android\app\build\outputs\bundle\release\app-release.aab" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "✗ Build failed. Please check the error messages above." -ForegroundColor Red
}
