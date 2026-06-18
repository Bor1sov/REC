$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$assetsDir = Join-Path $root 'assets'
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' } |
    Select-Object -First 1

function New-JpegEncoderParams {
    param([long]$Quality)

    $params = New-Object System.Drawing.Imaging.EncoderParameters 1
    $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
        [System.Drawing.Imaging.Encoder]::Quality,
        $Quality
    )

    return $params
}

function Save-OptimizedJpeg {
    param(
        [string]$Source,
        [string]$Target,
        [int]$MaxSide,
        [long]$Quality
    )

    $image = [System.Drawing.Image]::FromFile($Source)

    try {
        $width = $image.Width
        $height = $image.Height
        $scale = 1.0

        if ($MaxSide -gt 0) {
            $scale = [Math]::Min(1.0, $MaxSide / [double]([Math]::Max($width, $height)))
        }

        $newWidth = [Math]::Max(1, [int][Math]::Round($width * $scale))
        $newHeight = [Math]::Max(1, [int][Math]::Round($height * $scale))
        $bitmap = New-Object System.Drawing.Bitmap $newWidth, $newHeight, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)

        try {
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

            try {
                $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $graphics.DrawImage($image, 0, 0, $newWidth, $newHeight)
            } finally {
                $graphics.Dispose()
            }

            $encoderParams = New-JpegEncoderParams -Quality $Quality

            try {
                $bitmap.Save($Target, $jpegCodec, $encoderParams)
            } finally {
                $encoderParams.Dispose()
            }
        } finally {
            $bitmap.Dispose()
        }
    } finally {
        $image.Dispose()
    }
}

function Replace-If-Smaller {
    param(
        [string]$Source,
        [string]$Candidate
    )

    $oldSize = (Get-Item -LiteralPath $Source).Length
    $newSize = (Get-Item -LiteralPath $Candidate).Length

    if ($newSize -lt $oldSize) {
        Move-Item -Force -LiteralPath $Candidate -Destination $Source
        Write-Host ("optimized {0}: {1:N0} -> {2:N0}" -f (Split-Path -Leaf $Source), $oldSize, $newSize)
    } else {
        Remove-Item -Force -LiteralPath $Candidate
    }
}

$pngToJpeg = @(
    @{ Source = 'about-mobile.png'; Target = 'about-mobile.jpg'; Quality = 82; MaxSide = 1600 },
    @{ Source = 'faq.png'; Target = 'faq.jpg'; Quality = 82; MaxSide = 1600 },
    @{ Source = 'help.png'; Target = 'help.jpg'; Quality = 82; MaxSide = 1600 },
    @{ Source = 'news.png'; Target = 'news.jpg'; Quality = 82; MaxSide = 1600 }
)

foreach ($asset in $pngToJpeg) {
    $source = Join-Path $assetsDir $asset.Source
    $target = Join-Path $assetsDir $asset.Target

    if (Test-Path -LiteralPath $source) {
        $temp = "$target.tmp"
        Save-OptimizedJpeg -Source $source -Target $temp -MaxSide $asset.MaxSide -Quality $asset.Quality

        if ((Test-Path -LiteralPath $target) -and ((Get-Item -LiteralPath $target).Length -le (Get-Item -LiteralPath $temp).Length)) {
            Remove-Item -Force -LiteralPath $temp
        } elseif (Test-Path -LiteralPath $target) {
            Move-Item -Force -LiteralPath $temp -Destination $target
            Write-Host ("created {0}: {1:N0}" -f $asset.Target, (Get-Item -LiteralPath $target).Length)
        } else {
            Move-Item -Force -LiteralPath $temp -Destination $target
            Write-Host ("created {0}: {1:N0}" -f $asset.Target, (Get-Item -LiteralPath $target).Length)
        }
    }
}

Get-ChildItem -LiteralPath $assetsDir -Filter '*.jpg' -File | ForEach-Object {
    $quality = 82
    $maxSide = 1600

    if ($_.Name -eq 'white-texture.jpg') {
        $quality = 62
        $maxSide = 1200
    }

    if ($_.Length -lt 150KB -and $_.Name -ne 'white-texture.jpg') {
        return
    }

    $temp = "$($_.FullName).tmp"
    Save-OptimizedJpeg -Source $_.FullName -Target $temp -MaxSide $maxSide -Quality $quality
    Replace-If-Smaller -Source $_.FullName -Candidate $temp
}
