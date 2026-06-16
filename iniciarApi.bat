@echo off
REM -----------------------------
REM Start da API com Node portátil
REM -----------------------------

REM Caminho relativo do Node portátil
set NODE_EXE=..\node\node.exe

REM Confere se node.exe existe
if not exist "%NODE_EXE%" (
    echo Node.exe nao encontrado na pasta ..\node!
    pause
    exit /b
)

REM Lê a porta do .env (se existir), senão usa 3000
set PORT=3000
for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
    if "%%a"=="PORT" set PORT=%%b
)

echo Tentando iniciar a API na porta %PORT%...

REM Tenta rodar a API
"%NODE_EXE%" src\server.js

REM Se der erro de porta ocupada, sugere mudar
if errorlevel 1 (
    echo.
    echo ⚠️ Porta %PORT% possivelmente ocupada. Altere a PORT no arquivo .env.
)

pause
