Add-Type -AssemblyName System.Drawing

$sourceSize = 243
$targetSize = 81
$iconDirectory = Join-Path $PSScriptRoot '..\src\assets\icons'

function New-IconCanvas {
  $bitmap = New-Object System.Drawing.Bitmap(
    $sourceSize,
    $sourceSize,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)

  return @{
    Bitmap = $bitmap
    Graphics = $graphics
  }
}

function Save-Icon {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [string]$FileName
  )

  $target = New-Object System.Drawing.Bitmap(
    $targetSize,
    $targetSize,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )
  $graphics = [System.Drawing.Graphics]::FromImage($target)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.DrawImage($Bitmap, 0, 0, $targetSize, $targetSize)
  $graphics.Dispose()

  $target.Save(
    (Join-Path $iconDirectory $FileName),
    [System.Drawing.Imaging.ImageFormat]::Png
  )
  $target.Dispose()
}

function New-StrokePen {
  param([System.Drawing.Color]$Color)

  $pen = New-Object System.Drawing.Pen($Color, 15)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  return $pen
}

function Draw-Home {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Color]$Color
  )

  $pen = New-StrokePen $Color
  $points = [System.Drawing.Point[]]@(
    (New-Object System.Drawing.Point(48, 114)),
    (New-Object System.Drawing.Point(121, 51)),
    (New-Object System.Drawing.Point(195, 114))
  )
  $Graphics.DrawLines($pen, $points)
  $Graphics.DrawLine($pen, 69, 102, 69, 191)
  $Graphics.DrawLine($pen, 174, 102, 174, 191)
  $Graphics.DrawLine($pen, 69, 191, 174, 191)
  $Graphics.DrawLine($pen, 105, 191, 105, 142)
  $Graphics.DrawLine($pen, 105, 142, 139, 142)
  $Graphics.DrawLine($pen, 139, 142, 139, 191)
  $pen.Dispose()
}

function Draw-Paw {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Color]$Color
  )

  $brush = New-Object System.Drawing.SolidBrush($Color)
  $Graphics.FillEllipse($brush, 92, 102, 60, 70)
  $Graphics.FillEllipse($brush, 50, 72, 37, 47)
  $Graphics.FillEllipse($brush, 89, 47, 37, 49)
  $Graphics.FillEllipse($brush, 131, 48, 37, 49)
  $Graphics.FillEllipse($brush, 169, 75, 37, 47)
  $brush.Dispose()
}

function Draw-Product {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Color]$Color
  )

  $pen = New-StrokePen $Color
  $Graphics.DrawRectangle($pen, 55, 69, 133, 124)
  $Graphics.DrawLine($pen, 55, 105, 188, 105)
  $Graphics.DrawLine($pen, 88, 69, 88, 105)
  $Graphics.DrawLine($pen, 155, 69, 155, 105)
  $Graphics.DrawLine($pen, 121, 105, 121, 193)
  $pen.Dispose()
}

function Draw-Vaccine {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Color]$Color
  )

  $pen = New-StrokePen $Color
  $Graphics.DrawLine($pen, 68, 175, 166, 77)
  $Graphics.DrawLine($pen, 85, 192, 183, 94)
  $Graphics.DrawLine($pen, 62, 181, 85, 204)
  $Graphics.DrawLine($pen, 159, 70, 190, 101)
  $Graphics.DrawLine($pen, 176, 53, 207, 84)
  $Graphics.DrawLine($pen, 196, 64, 214, 46)
  $Graphics.DrawLine($pen, 116, 127, 137, 148)
  $Graphics.DrawLine($pen, 131, 112, 152, 133)
  $pen.Dispose()
}

function Draw-Pill {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Color]$Color
  )

  $pen = New-StrokePen $Color
  $rect = New-Object System.Drawing.Rectangle(55, 84, 134, 76)
  $Graphics.DrawArc($pen, $rect, 45, 180)
  $Graphics.DrawArc($pen, $rect, 225, 180)
  $Graphics.DrawLine($pen, 82, 57, 189, 164)
  $Graphics.DrawLine($pen, 55, 133, 109, 79)
  $pen.Dispose()
}

function Draw-Notification {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Color]$Color
  )

  $pen = New-StrokePen $Color
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.StartFigure()
  $path.AddBezier(73, 166, 85, 145, 83, 112, 88, 93)
  $path.AddBezier(88, 93, 96, 62, 112, 53, 121, 53)
  $path.AddBezier(121, 53, 145, 53, 157, 72, 162, 93)
  $path.AddBezier(162, 93, 168, 116, 163, 145, 174, 166)
  $path.AddLine(174, 166, 73, 166)
  $path.CloseFigure()
  $Graphics.DrawPath($pen, $path)
  $Graphics.DrawArc($pen, 104, 157, 36, 38, 5, 170)
  $path.Dispose()
  $pen.Dispose()
}

function Draw-Profile {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Color]$Color
  )

  $pen = New-StrokePen $Color
  $Graphics.DrawEllipse($pen, 91, 49, 61, 61)
  $Graphics.DrawArc($pen, 58, 118, 127, 91, 190, 160)
  $pen.Dispose()
}

$icons = @(
  @{ Name = 'home'; Draw = ${function:Draw-Home} },
  @{ Name = 'pet'; Draw = ${function:Draw-Paw} },
  @{ Name = 'vaccine'; Draw = ${function:Draw-Vaccine} },
  @{ Name = 'medication'; Draw = ${function:Draw-Pill} },
  @{ Name = 'product'; Draw = ${function:Draw-Product} },
  @{ Name = 'notification'; Draw = ${function:Draw-Notification} },
  @{ Name = 'profile'; Draw = ${function:Draw-Profile} }
)

$states = @(
  @{ Suffix = ''; Color = [System.Drawing.ColorTranslator]::FromHtml('#6B7280') },
  @{ Suffix = '-active'; Color = [System.Drawing.ColorTranslator]::FromHtml('#FF6B5B') }
)

foreach ($icon in $icons) {
  foreach ($state in $states) {
    $canvas = New-IconCanvas
    & $icon.Draw $canvas.Graphics $state.Color
    $canvas.Graphics.Dispose()
    Save-Icon $canvas.Bitmap "$($icon.Name)$($state.Suffix).png"
    $canvas.Bitmap.Dispose()
  }
}

$featureIcons = @(
  @{ Name = 'feature-pet'; Draw = ${function:Draw-Paw}; Color = '#3B82F6' },
  @{ Name = 'feature-vaccine'; Draw = ${function:Draw-Vaccine}; Color = '#22C55E' },
  @{ Name = 'feature-medication'; Draw = ${function:Draw-Pill}; Color = '#A855F7' },
  @{ Name = 'feature-product'; Draw = ${function:Draw-Product}; Color = '#F97316' }
)

foreach ($icon in $featureIcons) {
  $canvas = New-IconCanvas
  $color = [System.Drawing.ColorTranslator]::FromHtml($icon.Color)
  & $icon.Draw $canvas.Graphics $color
  $canvas.Graphics.Dispose()
  Save-Icon $canvas.Bitmap "$($icon.Name).png"
  $canvas.Bitmap.Dispose()
}
