@echo off
SETLOCAL ENABLEEXTENSIONS
SETLOCAL ENABLEDELAYEDEXPANSION

goto ENDINI

rem ----------------------------------------------------------------------
rem Please copy this section as "build.ini"
rem Edit to put in the correct paths for your system, and set options to 0 (disabled) or 1 (enabled) at need
[Golem]
; golem: absolute path to this development branch, include trailing \
golem:".\"

[TortoiseSVN]
; tortoise: if installed, allows the current Revision to be displayed
tortoise=0

[Chrome]
; chrome: path to google chrome.exe
; - winxp - C:\Documents and Settings\???\Local Settings\Application Data\Google\Chrome\Application\chrome.exe
; - win7  - C:\Users\???\AppData\Local\Google\Chrome\Application\chrome.exe
; chrome_pack: build the packed extension (obtain GameGolem.pem from Rycochet)
chrome="chrome.exe"
chrome_pack=0

[Compiler]
; java: full path to Java.exe
; compiler: path to Closure Compiler (http://code.google.com/closure/compiler/)
java="java.exe"
compiler=""

[Firefox]
; firefox: path to the firefox install of Golem, including filename
; - winxp - C:\Documents and Settings\???\AppData\Roaming\Mozilla\Firefox\Profiles\???.default\gm_scripts\rycochets_castle_age_gol\rycochets_castle_age_gol.user.js
; - win7  - C:\Users\???\AppData\Roaming\Mozilla\Firefox\Profiles\???.default\gm_scripts\rycochets_castle_age_gol\rycochets_castle_age_gol.user.js
firefox=""
firefox1=""
firefox2=""

[Wait]
; wait: wait for a keypress to quit
wait=1
rem   End "build.ini" section
rem ----------------------------------------------------------------------

:ENDINI

rem Default options
set golem=.\
set tortoise=0
set chrome=1
set chrome_pack=0
set java=""
set compiler=""
set firefox=""
set firefox1=""
set firefox2=""
set wait=1

if EXIST "build.ini" (
	for /F "eol=; tokens=1,2 delims==" %%a in (build.ini) do (
		if NOT "%%~b"=="" set %%a=%%~b
	)
)

for /F "tokens=1 delims=" %%a in (_version.txt) do (
	set version=%%~a
)

rem ----------------------------------------------------------------------
rem Delete old files...
echo.Deleting old user.js files
del /F /Q _normal.user.js _min.user.js .\chrome\GameGolem\golem.user.js 2>nul

rem ----------------------------------------------------------------------
rem Current revision (assuming this copy is committed, so Update / Build / Commit)
set /A revision=0
rem TortoiseSVN version:
if "%tortoise%"=="1" (
	for /F "delims=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:'\ " %%a in ('SubWCRev.exe .') do (
		set /A revision=1+%%a
	)
)
rem If we can get the revision any other ways, place before here...
if NOT "%revision%"=="0" (
	call:VReplace _head_version.tmpl >_head_version.js
	call:VReplace .\chrome\manifest.tmpl >.\chrome\GameGolem\manifest.json
)

rem ----------------------------------------------------------------------
rem NORMAL VERSION - _normal.user.js
echo.Joining files into _normal.user.js
type _head*.js >_normal.user.js 2>nul
type _main.js >>_normal.user.js 2>nul
type css.js >>_normal.user.js 2>nul
type utility.js >>_normal.user.js 2>nul
type worker.js >>_normal.user.js 2>nul
type worker_*.js >>_normal.user.js 2>nul
set script=_normal.user.js

rem --------------------------------------------------------------------------------------
rem MINIMISED VERSION - This will fail on errors so use is advised - required for release!
rem Change path to compiler and source - obtain it from here:
rem http://code.google.com/closure/compiler/
if EXIST "%java%" (
	if EXIST "%compiler%" (
		echo.Creating minimised version - will display any syntax errors
		copy _head.js _min.user.js >nul
		"%java%" -jar "%compiler%" --js "_normal.user.js" >> _min.user.js
		set script=_min.user.js
	)
)

rem ----------------------------------------------------------------------
rem GOOGLE CHROME EXTENSION (unpacked) - .\chrome\GameGolem
echo.Creating unpacked Chrome extension...
if NOT EXIST "chrome\GameGolem" (
	mkdir chrome\GameGolem
)
copy /Y chrome\GameGolem.tmpl\* chrome\GameGolem >nul 2>nul
copy /Y _normal.user.js .\chrome\GameGolem\golem.user.js >nul 2>nul

rem ----------------------------------------------------------------------
rem GOOGLE CHROME EXTENSION - .\chrome\GameGolem.crx
rem To build the "proper" chrome extension you need Chrome installed
rem *NOTE*: Chrome *CANNOT* be running - http://code.google.com/p/chromium/issues/detail?id=22901
rem To get the GameGolem.pem file please ask Rycochet - and don't share it!!!
if "%chrome_pack%"=="1" (
	if NOT "%revision%"=="0" (
		call:VReplace .\chrome\update.tmpl >.\chrome\update.xml
	)
	if EXIST "%chrome%" (
		if EXIST "%golem%chrome\GameGolem.pem" (
			echo.Creating packed Chrome extension...
			"%chrome%" --no-message-box --pack-extension="%golem%chrome\GameGolem" --pack-extension-key="%golem%chrome\GameGolem.pem"
		) ELSE (
			echo.You need to obtain chrome\GameGolem.pem from Rycochet to build the Chrome extension.
		)
	)
)

rem ----------------------------------------------------------------------
rem INSTALLED VERSION - Means you only need to hit F5 / refresh in Firefox
rem Just change the path to your firefox installed version, only the '???' should need changing on Windows7
rem No use installing the "normal" version if the minimised version has been created - no debugging via GreaseMonkey anyway...
rem if EXIST "%firefox%" (
rem 	echo.Installing new version to Firefox
rem 	copy /Y %script% "%firefox%" >nul
rem )
FOR %%F IN ("%firefox%","%firefox1%","%firefox2%") DO (
	IF EXIST "%%F" (
		echo.Installing new version to Firefox (%%F)
		copy /Y %script% %%F >nul 2>nul
	)
)

echo.Finished

rem ----------------------------------------------------------------------
rem Wait for a keypress (optional)
if "%wait%"=="1" (
	echo.&pause&goto:eof
)
goto:eof

rem ---------------------  FUNCTIONS  ---------------------

rem ----- Replace ----- (Finds and replaces the text matching the first argument with the second argument in the file specified by the third argument.)
rem  Usage -  call:Replace <find> <replace> <filename>
:Replace
for /f "tokens=1,* delims=]" %%A in ('"type %3|find /n /v """') do (
	set "line=%%B"
	if defined line (
		call set "line=echo.%%line:%~1=%~2%%"
		for /f "delims=" %%X in ('"echo."%%line%%""') do %%~X
	) ELSE echo.
)
goto:eof

rem ----------------------------------------------------------------------
rem VReplace file.tmpl >file.xyz
:VReplace
for /f "tokens=* delims=" %%A in (%1) do (
	set "line=%%A"
	if defined line (
		call set "line=%%line:$VER$=%version%%%"
		call set "line=%%line:$REV$=%revision%%%"
		echo.!line!
	) ELSE echo.
)
goto:eof