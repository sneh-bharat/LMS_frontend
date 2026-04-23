# Test Patient Creation API
# This script tests the patient creation endpoint directly
# Run this to verify if the backend is working

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Patient Creation API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Minimal required fields
Write-Host "Test 1: Creating patient with minimal required fields..." -ForegroundColor Yellow

$minimalDTO = @{
    firstName = "Test"
    lastName = "Patient"
    dateOfBirth = "1990-01-01"
    gender = "MALE"
    mobilePrimary = "9999999999"
    mobileAlternate = "9999999998"
    email = "test@example.com"
    bloodGroup = "A_POS"
    patientCategory = "GENERAL"
    clinicId = 1
    isActive = $true
    addresses = @(
        @{
            addressLine1 = "123 Test Street"
            addressLine2 = "Apt 1"
            city = "Mumbai"
            district = "Mumbai"
            state = "Maharashtra"
            pinCode = "400001"
            addressType = "Home"
            isPrimary = $true
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "Sending DTO:" -ForegroundColor Green
Write-Host $minimalDTO
Write-Host ""

# Create temp file for DTO
$tempFile = [System.IO.Path]::GetTempFileName()
$minimalDTO | Out-File -FilePath $tempFile -Encoding UTF8

try {
    $response = Invoke-RestMethod -Uri "http://192.168.1.3:9040/api/v1/patients" -Method POST -ContentType "multipart/form-data" -FormData @{
        patientRequestDTO = Get-Item $tempFile
    } -ErrorAction Stop

    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    Write-Host "Error: $_"
}

# Clean up
Remove-Item $tempFile -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Instructions
Write-Host "If Test 1 fails, the issue is with the BACKEND server." -ForegroundColor Red
Write-Host "Check:" -ForegroundColor Yellow
Write-Host "1. Is backend running on http://192.168.1.3:9040?" -ForegroundColor Yellow
Write-Host "2. Check backend server logs for error details" -ForegroundColor Yellow
Write-Host "3. Verify clinicId: 1 exists in database" -ForegroundColor Yellow
Write-Host "4. Check if there are database constraints causing the error" -ForegroundColor Yellow
