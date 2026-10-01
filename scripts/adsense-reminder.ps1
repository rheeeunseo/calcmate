# CalcMate 애드센스 재검토 알림 - 2026-10-26 에 작업 스케줄러가 한 번 실행한다.
#   -Print : 알림창 대신 내용을 출력 (동작 확인용)
param([switch]$Print)

$msg = @"
애드센스 재검토를 요청할 때가 됐습니다.

1. 터미널에서 아래를 실행합니다.
     cd C:\Users\dev03\calcmate && claude
2. "애드센스 재검토 전에 사이트 점검해줘" 라고 말합니다.
3. 점검이 끝나면 애드센스 > 사이트 > calcmate.co.kr 에서
   "문제를 수정했음을 확인합니다" 체크 후 [검토 요청] 을 누릅니다.

점검 전에는 누르지 마세요.
"@

if ($Print) { $OutputEncoding = [Text.Encoding]::UTF8; [Console]::OutputEncoding = [Text.Encoding]::UTF8; Write-Output $msg; exit 0 }

Add-Type -AssemblyName System.Windows.Forms
$form = New-Object System.Windows.Forms.Form -Property @{ TopMost = $true; WindowState = 'Minimized'; ShowInTaskbar = $false }
[System.Windows.Forms.MessageBox]::Show($form, $msg, 'CalcMate 애드센스 재검토 알림',
  [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information) | Out-Null
$form.Dispose()
