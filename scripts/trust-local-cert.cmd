@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0trust-local-cert.ps1" %*
