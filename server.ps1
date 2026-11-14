param (
    [int]$Port = 8080,
    [string]$Root = $PSScriptRoot
)

$server = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

try {
    $server.Start()
    Write-Host "MARS EXPLORER HTTP Server running at http://localhost:$Port/"
    Write-Host "Serving files from: $Root"

    while ($true) {
        $client = $server.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII)
            $requestLine = $reader.ReadLine()

            if ([string]::IsNullOrEmpty($requestLine)) {
                $client.Close()
                continue
            }

            # Parse HTTP method and target path
            $parts = $requestLine.Split(' ')
            if ($parts.Length -lt 2) {
                $client.Close()
                continue
            }

            $method = $parts[0]
            $url = $parts[1].Split('?')[0].TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($url)) {
                $url = "index.html"
            }

            # Prevent directory traversal
            $safePath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($Root, $url))
            if (-not $safePath.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden")
                $header = "HTTP/1.1 403 Forbidden`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
                $hBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                $stream.Write($hBytes, 0, $hBytes.Length)
                $stream.Write($body, 0, $body.Length)
                $stream.Flush()
                $client.Close()
                continue
            }

            if (Test-Path $safePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($safePath).ToLower()
                $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                $bytes = [System.IO.File]::ReadAllBytes($safePath)

                $header = "HTTP/1.1 200 OK`r`n" +
                          "Content-Type: $mime`r`n" +
                          "Content-Length: $($bytes.Length)`r`n" +
                          "Access-Control-Allow-Origin: *`r`n" +
                          "Cache-Control: no-cache`r`n" +
                          "Connection: close`r`n`r`n"

                $hBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                $stream.Write($hBytes, 0, $hBytes.Length)
                $stream.Write($bytes, 0, $bytes.Length)
                $stream.Flush()
            } else {
                $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $header = "HTTP/1.1 404 Not Found`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
                $hBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                $stream.Write($hBytes, 0, $hBytes.Length)
                $stream.Write($body, 0, $body.Length)
                $stream.Flush()
            }
        } catch {
            # Ignore individual client stream disconnects
        } finally {
            $client.Close()
        }
    }
} finally {
    $server.Stop()
}
