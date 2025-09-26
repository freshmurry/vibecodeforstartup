#!/usr/bin/env pwsh

Write-Host "VibeCoding Site Audit" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan

$baseUrl = "http://localhost:5173"
$routes = @("/", "/pricing", "/enterprise", "/resources", "/stripe-test")

foreach ($route in $routes) {
    $url = "$baseUrl$route"
    Write-Host "Testing: $route" -ForegroundColor Green
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        $stopwatch.Stop()
        
        $loadTime = $stopwatch.ElapsedMilliseconds
        $contentLength = $response.Content.Length
        
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "  Load Time: ${loadTime}ms" -ForegroundColor Blue
        Write-Host "  Content Size: $([math]::Round($contentLength/1024, 2))KB" -ForegroundColor Blue
        
        # Basic SEO checks
        $hasTitle = $response.Content -match "<title"
        $hasDescription = $response.Content -match 'name="description"'
        $hasViewport = $response.Content -match 'name="viewport"'
        $hasH1 = $response.Content -match "<h1"
        
        Write-Host "  SEO Elements:" -ForegroundColor Magenta
        Write-Host "    Title: $(if($hasTitle) { 'Yes' } else { 'No' })" -ForegroundColor $(if($hasTitle) { 'Green' } else { 'Red' })
        Write-Host "    Description: $(if($hasDescription) { 'Yes' } else { 'No' })" -ForegroundColor $(if($hasDescription) { 'Green' } else { 'Red' })
        Write-Host "    Viewport: $(if($hasViewport) { 'Yes' } else { 'No' })" -ForegroundColor $(if($hasViewport) { 'Green' } else { 'Red' })
        Write-Host "    H1: $(if($hasH1) { 'Yes' } else { 'No' })" -ForegroundColor $(if($hasH1) { 'Green' } else { 'Red' })
    }
    catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "Audit Complete!" -ForegroundColor Cyan