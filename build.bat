@echo off
SETLOCAL ENABLEEXTENSIONS
SETLOCAL ENABLEDELAYEDEXPANSION

goto ENDINI

rem Please copy this section as "build.ini"
rem Edit to put in the correct paths for your system, and set options to 0 (disabled) or 1 (enabled) at need
rem Do not copy the "rem ..." lines
rem ----------------------------------------------------------------------
[Golem]
; golem: absolute path to this development branch, include trailing \
; !!!IMPORTANT - ".\" WILL NOT WORK!!!
golem=".\"

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

[Greasemonkey]
; firefox: path to the greasemonkey install of Golem, *excluding* filename, no trailing "/" - which should be "rycochets_castle_age_gol.user.js"
; this will also support Scriptish naming instead of GM - "rycochetscastleagegolem@golem.user.js"
; - winxp - C:\Documents and Settings\???\AppData\Roaming\Mozilla\Firefox\Profiles\???.default\gm_scripts\rycochets_castle_age_gol
; - win7  - C:\Users\???\AppData\Roaming\Mozilla\Firefox\Profiles\???.default\gm_scripts\rycochets_castle_age_gol
firefox=""
firefox1=""
firefox2=""

[Wait]
; wait: wait for a keypress to quit
wait=1
rem ----------------------------------------------------------------------
rem   End "build.ini" section

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

rem User-defined options
if EXIST "build.ini" (
	for /F "eol=; tokens=1,2 delims==" %%a in (build.ini) do (
		if NOT "%%~b"=="" set %%a=%%~b
	)
)

rem Version (not revision)
for /F "tokens=1 delims=" %%a in (_version.txt) do set version=%%~a

rem Files
if NOT EXIST "_manifest.txt" (
	echo.Missing _manifest.txt file - this contains the list of source files used to create Golem.
	goto:eof
)
set manifest=
set files=
for /F "eol=#" %%a in (_manifest.txt) do (
	if "!manifest!"=="" (set manifest="%%a") else (set manifest=!manifest!,"%%a")
	if "!files!"=="" (set files=--js %%a) else (set files=!files! --js %%a)
)

rem ----------------------------------------------------------------------
rem Delete old files...
echo.Deleting old user.js files
del /F /Q GameGolem.js GameGolem.min.js 2>nul

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
	call:VReplace _version.tmpl >_version.js
	call:VReplace main.tmpl >main.js
)

rem ----------------------------------------------------------------------
rem NORMAL VERSION - GameGolem.js
echo.Joining files into GameGolem.js
call:VReplace _head.tmpl >GameGolem.js
type jquery-latest.min.js >>GameGolem.js 2>nul
type jquery-ui.latest.min.js >>GameGolem.js 2>nul
call:VReplace _head.tmpl >>GameGolem.js
type _wrap_top.js >>GameGolem.js 2>nul
for /F "eol=#" %%a in (_manifest.txt) do (
	type "%%a" >>GameGolem.js 2>nul
)
type _wrap_bottom.js >>GameGolem.js 2>nul
set script=GameGolem.js

rem --------------------------------------------------------------------------------------
rem MINIMISED VERSION - This will fail on errors so use is advised - required for release!
rem Change path to compiler and source - obtain it from here:
rem http://code.google.com/closure/compiler/
if EXIST "%java%" (
	if EXIST "%compiler%" (
		echo.Creating minimised version - will display any syntax errors
		call:VReplace _head.tmpl >GameGolem.min.js
		type jquery-latest.min.js >>GameGolem.min.js 2>nul
		type jquery-ui.latest.min.js >>GameGolem.min.js 2>nul
		call:VReplace _head.tmpl >>GameGolem.min.js
		type _wrap_top.js >>GameGolem.min.js 2>nul
		"%java%" -jar "%compiler%"  %files% >> GameGolem.min.js
rem		"%java%" -jar "%compiler%" --warning_level VERBOSE %files% >> GameGolem.min.js 2>error.log
		type _wrap_bottom.js >>GameGolem.min.js 2>nul
rem While is may be smaller to use the minimised version in places, generally that interferes with debugging...
rem		set script=GameGolem.min.js
	)
)

rem ----------------------------------------------------------------------
rem GOOGLE CHROME EXTENSION (unpacked) - .\chrome\GameGolem
echo.Creating unpacked Chrome extension...
if NOT EXIST "chrome\GameGolem" (
	mkdir chrome\GameGolem
)
if NOT EXIST "chrome\GameGolem\images" (
	mkdir chrome\GameGolem\images
)
del /F /S /Q chrome\GameGolem >nul 2>nul
copy /Y chrome\GameGolem.tmpl\* chrome\GameGolem >nul 2>nul
call:VReplace .\chrome\manifest.tmpl >.\chrome\GameGolem\manifest.json
copy /Y jquery-latest.min.js chrome\GameGolem\ >nul 2>nul
copy /Y jquery-ui.latest.min.js chrome\GameGolem\ >nul 2>nul
copy /Y images\*.png chrome\GameGolem\images >nul 2>nul
copy /Y golem.css chrome\GameGolem >nul 2>nul
for /F "eol=#" %%a in (_manifest.txt) do (
	copy /Y "%%a" chrome\GameGolem >nul 2>nul
)

rem ----------------------------------------------------------------------
rem GOOGLE CHROME EXTENSION - .\chrome\GameGolem.crx
rem To build the "proper" chrome extension you need Chrome installed
rem To get the GameGolem.pem file please ask Rycochet - and don't share it!!!
if "%chrome_pack%"=="1" (
	if NOT "%revision%"=="0" (
		call:VReplace .\chrome\update.tmpl >.\chrome\update.xml
	)
	if EXIST "%chrome%" (
		if EXIST "%golem%chrome\GameGolem.pem" (
			echo.Creating packed Chrome extension...
			"%chrome%" --no-message-box --pack-extension="%golem%chrome\GameGolem" --pack-extension-key="%golem%chrome\GameGolem.pem"
			copy /Y _version.js .\chrome >nul 2>nul
		) ELSE (
			echo.You need to obtain chrome\GameGolem.pem from Rycochet to build the Chrome extension.
			echo.There is no need for building this is you are just editing for yourself - simply use the "Load Unpacked Extension..." button in the Chrome Extensions page.
		)
	)
)

rem ----------------------------------------------------------------------
rem GREASEMONKEY or SCRIPTISH VERSION - Means you only need to hit F5 / refresh in Firefox
if NOT "%revision%"=="0" (
	call:VReplace .\greasemonkey\GameGolem.user.tmpl >.\greasemonkey\GameGolem.user.js
	call:VReplace .\greasemonkey\GameGolem.release.user.tmpl >.\greasemonkey\GameGolem.release.user.js
	copy /Y _version.js .\greasemonkey >nul 2>nul
)
FOR %%F IN ("%firefox%","%firefox1%","%firefox2%") DO (
	IF NOT %%~F=="" IF EXIST "%%~F\golem.css" call:Firefox %%F
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
		call set "line=%%line:$FILE$=%manifest%%%"
		echo.!line!
	) ELSE echo.
)
goto:eof

rem ----------------------------------------------------------------------
rem Firefox path
:Firefox
if EXIST "%~1\GameGolem.js" goto:greasemonkey
if EXIST "%1\GameGolem@golem.user.js" goto:scriptish
goto:eof
:greasemonkey
echo.Installing new version to Greasemonkey (%~1)
copy /Y golem.css "%~1\" >nul 2>nul
copy /Y %script% "%~1\GameGolem.js" >nul 2>nul
copy /Y .\greasemonkey\GameGolem.user.js "%~1\rycochets_castle_age_gol.user.js" >nul 2>nul
goto:eof
:scriptish
echo.Installing new version to Scriptish (%~1)
copy /Y golem.css "%~1\" >nul 2>nul
copy /Y %script% "%~1\GameGolem@golem.user.js" >nul 2>nul
copy /Y .\greasemonkey\GameGolem.user.js "%~1\rycochets_castle_age_gol@golem.user.js" >nul 2>nul
goto:eof
