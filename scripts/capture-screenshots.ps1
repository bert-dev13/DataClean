$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$dir = "c:\projects\dataclean\screenshots"

if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

function Take-Screenshot($url, $outFile) {
    Write-Host "Capturing $outFile from $url ..."
    $args = @(
        "--headless=new",
        "--disable-gpu",
        "--screenshot=$outFile",
        "--window-size=1440,900",
        "--hide-scrollbars",
        $url
    )
    $proc = Start-Process -FilePath $edge -ArgumentList $args -Wait -PassThru -NoNewWindow
    Start-Sleep -Milliseconds 800
}

Take-Screenshot "http://localhost:3000/?step=1" "$dir\01_system_selection.png"
Take-Screenshot "http://localhost:3000/?step=2&system=ODeSSEE" "$dir\02_dataset_selection.png"
Take-Screenshot "http://localhost:3000/?step=3&system=ODeSSEE&dataset=odessee-household" "$dir\03_upload_screen.png"
Take-Screenshot "http://localhost:3000/?step=3&system=DBL&dataset=dbl-water&file=loaded" "$dir\03b_file_summary.png"
Take-Screenshot "http://localhost:3000/?step=4&system=DBL&dataset=dbl-water&sample=issues" "$dir\04_review_workspace.png"
Take-Screenshot "http://localhost:3000/?step=5&system=DBL&dataset=dbl-water&sample=valid" "$dir\05_final_export.png"

Write-Host "`nAll Screenshots Captured:"
Get-ChildItem $dir | Select-Object Name, Length
