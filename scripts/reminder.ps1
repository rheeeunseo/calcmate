# CalcMate 글쓰기 알림 - 월/목 아침에 작업 스케줄러가 실행한다.
# 대기 주제 수와 마지막 발행일을 읽어 알림창을 띄운다.
#   -Print : 알림창 대신 내용을 출력 (동작 확인용)
param([switch]$Print)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

try {
  $topics = (Get-Content (Join-Path $root 'content\topics.json') -Raw -Encoding UTF8 | ConvertFrom-Json).topics
  $pending = @($topics | Where-Object { $_.status -ne 'done' })
  $nextTopic = if ($pending.Count -gt 0) { $pending[0].title } else { '(대기 주제 없음 - 새 주제 추가 필요)' }

  $dates = Get-ChildItem (Join-Path $root 'content\articles') -Filter *.json |
    ForEach-Object { (Get-Content $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json).date }
  $last = ($dates | Sort-Object -Descending | Select-Object -First 1)
  $days = [int]((Get-Date) - [datetime]$last).TotalDays
  $total = $dates.Count
} catch {
  $pending = @(); $nextTopic = '(topics.json 을 읽지 못했습니다)'; $last = '?'; $days = 0; $total = 0
}

$msg = @"
블로그 글 쓸 시간입니다.

발행한 글       : $total 편
마지막 발행     : $last ($days 일 전)
대기 주제       : $($pending.Count) 개

다음 주제:
$nextTopic

터미널에서 아래를 실행한 뒤
  cd C:\Users\dev03\calcmate && claude
"글 하나 써줘" 라고 말하면 됩니다.
"@

if ($Print) { $OutputEncoding = [Text.Encoding]::UTF8; [Console]::OutputEncoding = [Text.Encoding]::UTF8; Write-Output $msg; exit 0 }

Add-Type -AssemblyName System.Windows.Forms
$form = New-Object System.Windows.Forms.Form -Property @{ TopMost = $true; WindowState = 'Minimized'; ShowInTaskbar = $false }
[System.Windows.Forms.MessageBox]::Show($form, $msg, 'CalcMate 글쓰기 알림',
  [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information) | Out-Null
$form.Dispose()
