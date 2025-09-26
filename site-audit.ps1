#!/usr/bin/env pwsh

# VibeCoding Site Performance & Accessibility Test Script

Write-Host "🚀 VibeCoding Site Audit & Performance Test" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5173"
$routes = @(
    "/",
    "/pricing", 
    "/enterprise",
    "/resources",
    "/learn",
    "/privacy",
    "/terms",
    "/stripe-test"
)

Write-Host "📊 Testing Routes Performance..." -ForegroundColor Yellow
Write-Host ""

foreach ($route in $routes) {
    $url = "$baseUrl$route"
    Write-Host "Testing: $route" -ForegroundColor Green
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        $stopwatch.Stop()
        
        $loadTime = $stopwatch.ElapsedMilliseconds
        $contentLength = $response.Content.Length
        
        Write-Host "  ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "  ⏱️  Load Time: ${loadTime}ms" -ForegroundColor $(if($loadTime -lt 1000) { "Green" } elseif($loadTime -lt 3000) { "Yellow" } else { "Red" })
        Write-Host "  📦 Content Size: $([math]::Round($contentLength/1024, 2))KB" -ForegroundColor Blue
        
        # Check for basic SEO elements
        $hasTitle = $response.Content -match "<title[^>]*>([^<]+)</title>"
        $hasDescription = $response.Content -match 'name="description"'
        $hasViewport = $response.Content -match 'name="viewport"'
        $hasH1 = $response.Content -match "<h1[^>]*>"
        
        Write-Host "  SEO Check:" -ForegroundColor Magenta
        if($hasTitle) { Write-Host "    Title: OK" -ForegroundColor Green } else { Write-Host "    Title: Missing" -ForegroundColor Red }
        if($hasDescription) { Write-Host "    Description: OK" -ForegroundColor Green } else { Write-Host "    Description: Missing" -ForegroundColor Red }
        if($hasViewport) { Write-Host "    Viewport: OK" -ForegroundColor Green } else { Write-Host "    Viewport: Missing" -ForegroundColor Red }
        if($hasH1) { Write-Host "    H1 Tag: OK" -ForegroundColor Green } else { Write-Host "    H1 Tag: Missing" -ForegroundColor Red }
        
        if ($hasTitle) {
            $title = $matches[1]
            Write-Host "    Title Content: $title" -ForegroundColor Gray
        }
        
    }
    catch {
        Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "🔍 Running Additional Checks..." -ForegroundColor Yellow
Write-Host ""

# Check if service worker exists
try {
    $swResponse = Invoke-WebRequest -Uri "$baseUrl/sw.js" -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host "📱 Service Worker: ✅ Found" -ForegroundColor Green
}
catch {
    Write-Host "📱 Service Worker: ❌ Not found (optional)" -ForegroundColor Yellow
}

# Check if manifest exists  
try {
    $manifestResponse = Invoke-WebRequest -Uri "$baseUrl/manifest.json" -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host "📱 Web Manifest: ✅ Found" -ForegroundColor Green
}
catch {
    Write-Host "📱 Web Manifest: ❌ Not found" -ForegroundColor Yellow
}

# Check favicon
try {
    $faviconResponse = Invoke-WebRequest -Uri "$baseUrl/favicon.ico" -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host "🎨 Favicon: ✅ Found" -ForegroundColor Green
}
catch {
    Write-Host "🎨 Favicon: ❌ Not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "✨ Site Audit Complete!" -ForegroundColor Cyan
Write-Host ""

# Summary recommendations
Write-Host "📋 Recommendations:" -ForegroundColor Yellow
Write-Host "1. Add dynamic meta titles and descriptions per page" -ForegroundColor White
Write-Host "2. Implement structured data (Schema.org) markup" -ForegroundColor White  
Write-Host "3. Add Open Graph and Twitter Card meta tags" -ForegroundColor White
Write-Host "4. Consider adding a web manifest for PWA features" -ForegroundColor White
Write-Host "5. Optimize images with proper alt tags" -ForegroundColor White
Write-Host "6. Add sitemap.xml for better SEO" -ForegroundColor White