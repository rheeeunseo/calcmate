' 콘솔 창 없이 scripts\reminder.ps1 을 실행한다 (작업 스케줄러용).
Set sh = CreateObject("WScript.Shell")
sh.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File ""C:\Users\dev03\calcmate\scripts\reminder.ps1""", 0, False
