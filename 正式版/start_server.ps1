$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "StarSprout Server - Keep Open"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not (Test-Path (Join-Path $root "index.html"))) {
    Write-Host ""
    Write-Host "ERROR: index.html was not found." -ForegroundColor Red
    Write-Host "Please fully extract the ZIP file before running the launcher."
    Write-Host ""
    Read-Host "Press Enter to close"
    exit 1
}

function Get-MimeType([string]$path) {
    switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
        ".html" { return "text/html; charset=utf-8" }
        ".htm"  { return "text/html; charset=utf-8" }
        ".css"  { return "text/css; charset=utf-8" }
        ".js"   { return "application/javascript; charset=utf-8" }
        ".json" { return "application/json; charset=utf-8" }
        ".webmanifest" { return "application/manifest+json; charset=utf-8" }
        ".png"  { return "image/png" }
        ".jpg"  { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".gif"  { return "image/gif" }
        ".svg"  { return "image/svg+xml" }
        ".ico"  { return "image/x-icon" }
        ".woff" { return "font/woff" }
        ".woff2"{ return "font/woff2" }
        default { return "application/octet-stream" }
    }
}

function Write-HttpResponse {
    param(
        [System.Net.Sockets.NetworkStream]$Stream,
        [int]$StatusCode,
        [string]$StatusText,
        [byte[]]$Body,
        [string]$ContentType,
        [bool]$HeadOnly = $false
    )

    $header = "HTTP/1.1 $StatusCode $StatusText`r`n" +
              "Content-Type: $ContentType`r`n" +
              "Content-Length: $($Body.Length)`r`n" +
              "Cache-Control: no-cache, no-store, must-revalidate`r`n" +
              "Pragma: no-cache`r`n" +
              "Expires: 0`r`n" +
              "Connection: close`r`n`r`n"

    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $Stream.Write($headerBytes, 0, $headerBytes.Length)

    if (-not $HeadOnly -and $Body.Length -gt 0) {
        $Stream.Write($Body, 0, $Body.Length)
    }
    $Stream.Flush()
}

$listener = $null
$port = 8806

foreach ($candidate in 8806..8840) {
    try {
        $testListener = [System.Net.Sockets.TcpListener]::new(
            [System.Net.IPAddress]::Loopback,
            $candidate
        )
        $testListener.Start()
        $listener = $testListener
        $port = $candidate
        break
    }
    catch {
        if ($testListener) {
            try { $testListener.Stop() } catch {}
        }
    }
}

if (-not $listener) {
    Write-Host ""
    Write-Host "ERROR: No available port was found between 8771 and 8799." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to close"
    exit 1
}

$url = "http://127.0.0.1:$port/index.html?v=287"

Clear-Host
Write-Host "==========================================" -ForegroundColor DarkYellow
Write-Host " StarSprout local server" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor DarkYellow
Write-Host ""
Write-Host "Project folder:"
Write-Host $root -ForegroundColor Cyan
Write-Host ""
Write-Host "Browser address:"
Write-Host $url -ForegroundColor Green
Write-Host ""
Write-Host "This window must remain open while using the app." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server."
Write-Host ""

Start-Process $url

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()

        try {
            $client.ReceiveTimeout = 5000
            $client.SendTimeout = 5000
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new(
                $stream,
                [System.Text.Encoding]::ASCII,
                $false,
                1024,
                $true
            )

            $requestLine = $reader.ReadLine()

            if ([string]::IsNullOrWhiteSpace($requestLine)) {
                continue
            }

            while ($true) {
                $line = $reader.ReadLine()
                if ([string]::IsNullOrEmpty($line)) { break }
            }

            $parts = $requestLine.Split(" ")
            if ($parts.Length -lt 2) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Bad Request")
                Write-HttpResponse $stream 400 "Bad Request" $body "text/plain; charset=utf-8"
                continue
            }

            $method = $parts[0].ToUpperInvariant()
            $rawPath = $parts[1].Split("?")[0]
            $decodedPath = [System.Uri]::UnescapeDataString($rawPath)

            if ($decodedPath -eq "/" -or [string]::IsNullOrWhiteSpace($decodedPath)) {
                $decodedPath = "/index.html"
            }

            $relativePath = $decodedPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
            $candidatePath = [System.IO.Path]::GetFullPath((Join-Path $root $relativePath))
            $rootFull = [System.IO.Path]::GetFullPath($root + [System.IO.Path]::DirectorySeparatorChar)

            if (-not $candidatePath.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
                Write-HttpResponse $stream 403 "Forbidden" $body "text/plain; charset=utf-8" ($method -eq "HEAD")
                continue
            }

            if (Test-Path $candidatePath -PathType Container) {
                $candidatePath = Join-Path $candidatePath "index.html"
            }

            if (-not (Test-Path $candidatePath -PathType Leaf)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                Write-HttpResponse $stream 404 "Not Found" $body "text/plain; charset=utf-8" ($method -eq "HEAD")
                continue
            }

            if ($method -ne "GET" -and $method -ne "HEAD") {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed")
                Write-HttpResponse $stream 405 "Method Not Allowed" $body "text/plain; charset=utf-8"
                continue
            }

            $bytes = [System.IO.File]::ReadAllBytes($candidatePath)
            $mime = Get-MimeType $candidatePath
            Write-HttpResponse $stream 200 "OK" $bytes $mime ($method -eq "HEAD")

            Write-Host ("[{0}] {1} {2}" -f (Get-Date -Format "HH:mm:ss"), $method, $decodedPath)
        }
        catch {
            Write-Host ("Request error: " + $_.Exception.Message) -ForegroundColor DarkYellow
        }
        finally {
            if ($reader) { $reader.Dispose() }
            if ($stream) { $stream.Dispose() }
            $client.Close()
        }
    }
}
finally {
    if ($listener) { $listener.Stop() }
}
