@echo off
SETLOCAL ENABLEEXTENSIONS
SETLOCAL ENABLEDELAYEDEXPANSION

rem usage: build [build|clean|inst|install|noinst|noinstall|rel|release] [-d]

rem build
rem noinst
rem noinstall	- builds, but no install is done

rem clean		- removes previous build files

rem inst
rem install		- doesn't build, only installs script in firefox

rem rel
rem release		- builds a release version (just minimizes for now)

rem -d			- shows more diagnostics on chrome build

rem the default action is build + install of non-release version

goto ENDINI

rem ----------------------------------------------------------------------
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
rem ----------------------------------------------------------------------

:ENDINI

rem ----------------------------------------------------------------------
rem Default options
rem ----------------------------------------------------------------------
set scriptname=GameGolem
set oldscriptname=rycochets_castle_age_gol
set golem=%cd%\
set tortoise=0
set chrome=1
set chrome_pack=0
set java=""
set compiler=""
set firefox=""
set firefox1=""
set firefox2=""
set wait=1
set release=0
set install=1
set script=%scriptname%.js
set diag=0

if /I "%1" == "rel"			shift&set release=1
if /I "%1" == "release"		shift&set release=1
if /I "%1" == "build"		shift&set install=0
if /I "%1" == "noinst"		shift&set install=0
if /I "%1" == "noinstall"	shift&set install=0

rem ----------------------------------------------------------------------
rem User-defined options via build.ini
rem ----------------------------------------------------------------------
if EXIST "build.ini" (
	for /F "eol=; tokens=1,2 delims==" %%a in (build.ini) do (
		if NOT "%%~b"=="" set %%a=%%~b
	)
)

if "%release%" == "1" set chrome_pack=1

if /I "%1" == "inst"		shift&goto install
if /I "%1" == "install"		shift&goto install
if /I "%1" == "-d"			shift&set diag=1

rem Version (not revision)
for /F "tokens=1 delims=" %%a in (_version.txt) do set version=%%~a

rem ----------------------------------------------------------------------
rem Delete old files...
rem ----------------------------------------------------------------------
echo.Deleting old build files
for %%a in ( %scriptname%.js %scriptname%.min.js _normal.user.js _min.user.js _version.js revision.js main.js ) do if EXIST %%a del /F %%a
for %%a in ( chrome\_version.js chrome\revision.js chrome\update.xml chrome\%scriptname%.crx ) do if EXIST %%a del /F %%a
if EXIST chrome\%scriptname%\ rmdir /S /Q chrome\%scriptname%
if /I "%1" == "clean" goto:eof

rem ----------------------------------------------------------------------
rem Manifest File Lists
rem ----------------------------------------------------------------------
if NOT EXIST "_manifest.txt" (
	echo.Missing _manifest.txt file - this contains the list of source files used to create Golem.
	goto:eof
)
set manifest=
set files=
for /F "eol=#" %%a in (_manifest.txt) do (
	if "!manifest!"=="" (set manifest="%%a") else (set manifest=!manifest!,"%%a")
	if "!files!"=="" (set files=--js "%%a") else (set files=!files! --js "%%a")
)

rem ----------------------------------------------------------------------
rem Current revision (assuming this copy is committed, so Update / Build / Commit)
rem ----------------------------------------------------------------------
set /A revision=0
set /A oldrev=0
rem TortoiseSVN version:
if "%tortoise%"=="1" (
	for /F "usebackq delims=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:'\ " %%a in (`SubWCRev.exe .`) do (
		set /A revision=1+%%a
		set /A oldrev=0+%%a
	)
)

rem ----------------------------------------------------------------------
rem fetch revision from command line "svn info" if not already set
rem ----------------------------------------------------------------------
if NOT "%revision%" == "0" goto nosvninfo
call svn info >nul 2>nul
if errorlevel 1 goto nosvninfo
for /F "usebackq tokens=1,* delims=:" %%A in (`svn info`) do (
	if /I "%%A" == "Revision" set /A revision=1+%%B
	if /I "%%A" == "Revision" set /A oldrev=0+%%B
)
:nosvninfo

rem ----------------------------------------------------------------------
rem If we can get the revision any other ways, place before here...
rem ----------------------------------------------------------------------
echo.Version %version%
echo.Revision %revision%
echo.Old Rev. %oldrev%
if NOT "%revision%"=="0" (
	call:VReplace _version.tmpl >_version.js
	call:VReplace revision.tmpl >revision.js
	call:VReplace main.tmpl >main.js
)

rem ----------------------------------------------------------------------
rem NORMAL VERSION - %scriptname%.js
rem ----------------------------------------------------------------------
echo.Joining files into %scriptname%.js
call:VReplace _head.tmpl >%scriptname%.js
type jquery-latest.min.js >>%scriptname%.js 2>nul
type jquery-ui.latest.min.js >>%scriptname%.js 2>nul
call:VReplace _head.tmpl >>%scriptname%.js
type _wrap_top.js >>%scriptname%.js 2>nul
for /F "eol=#" %%a in (_manifest.txt) do (
	type "%%a" >>%scriptname%.js 2>nul
)
type _wrap_bottom.js >>%scriptname%.js 2>nul
set script=%scriptname%.js

rem ----------------------------------------------------------------------
rem MINIMISED VERSION - This will fail on errors so use is advised - required for release!
rem ----------------------------------------------------------------------
rem Change path to compiler and source - obtain it from here:
rem http://code.google.com/closure/compiler/
echo.Java %java%
echo.Compiler %compiler%
if EXIST "%java%" (
	if EXIST "%compiler%" (
		echo.Creating minimised version - will display any syntax errors
		call:VReplace _head.tmpl >%scriptname%.min.js
		type jquery-latest.min.js >>%scriptname%.min.js 2>nul
		type jquery-ui.latest.min.js >>%scriptname%.min.js 2>nul
		call:VReplace _head.tmpl >>%scriptname%.min.js
		type _wrap_top.js >>%scriptname%.min.js 2>nul
		"%java%" -jar "%compiler%"  %files% >> %scriptname%.min.js
rem		"%java%" -jar "%compiler%" --warning_level VERBOSE %files% >> %scriptname%.min.js 2>error.log
		type _wrap_bottom.js >>%scriptname%.min.js 2>nul
rem While is may be smaller to use the minimised version in places, generally that interferes with debugging...
rem		set script=%scriptname%.min.js
	)
)

rem ----------------------------------------------------------------------
rem GOOGLE CHROME EXTENSION (unpacked) - chrome\%scriptname%
rem ----------------------------------------------------------------------
echo.Creating unpacked Chrome extension...
if NOT EXIST chrome\%scriptname% mkdir chrome\%scriptname%
if NOT EXIST chrome\%scriptname%\images mkdir chrome\%scriptname%\images
call:VReplace chrome\manifest.tmpl >chrome\%scriptname%\manifest.json
copy /Y chrome\%scriptname%.tmpl\* chrome\%scriptname% >nul 2>nul
copy /Y jquery-latest.min.js chrome\%scriptname%\ >nul 2>nul
copy /Y jquery-ui.latest.min.js chrome\%scriptname%\ >nul 2>nul
copy /Y images\*.png chrome\%scriptname%\images >nul 2>nul
copy /Y golem.css chrome\%scriptname% >nul 2>nul
for /F "eol=#" %%a in (_manifest.txt) do (
	copy /Y "%%a" chrome\%scriptname% >nul 2>nul
)

rem ----------------------------------------------------------------------
rem GOOGLE CHROME EXTENSION - chrome\%scriptname%.crx
rem ----------------------------------------------------------------------
rem To build the "proper" chrome extension you need Chrome installed
rem To get the %scriptname%.pem file please ask Rycochet - and don't share it!!!
if "%chrome_pack%"=="1" (
	if NOT "%revision%"=="0" (
		call:VReplace chrome\update.tmpl >chrome\update.xml
	)
	if EXIST "%chrome%" (
		if EXIST "%golem%chrome\%scriptname%.pem" (
			echo.Creating packed Chrome extension...
			if "%diag%" == "1" (
				"%chrome%" --pack-extension="%golem%chrome\%scriptname%" --pack-extension-key="%golem%chrome\%scriptname%.pem"
				if ERRORLEVEL 1 (
					echo.BUILD FAILED
					goto:eof
				)
			) ELSE (
				"%chrome%" --no-message-box --pack-extension="%golem%chrome\%scriptname%" --pack-extension-key="%golem%chrome\%scriptname%.pem"
				if ERRORLEVEL 1 (
					echo.BUILD FAILED - use -d flag to see why
					goto:eof
				)
			)
			copy /Y _version.js chrome >nul 2>nul
		) ELSE (
			echo.You need to obtain chrome\%scriptname%.pem from Rycochet to build the Chrome extension.
			echo.There is no need for building this if you are just editing for yourself - simply use the "Load Unpacked Extension..." button in the Chrome Extensions page.
		)
	)
)

:install
if NOT "%install%" == "1" goto:endinstall
rem ----------------------------------------------------------------------
rem GREASEMONKEY or SCRIPTISH VERSION - Means you only need to hit F5 / refresh in Firefox
rem ----------------------------------------------------------------------
rem Just change the path to your firefox installed version, only the '???' should need changing on Windows7
rem No use installing the "normal" version if the minimised version has been created - no debugging via GreaseMonkey anyway...
rem if EXIST "%firefox%" (
rem     echo.Installing new version to Firefox
rem     copy /Y %script% "%firefox%" >nul
rem )
if NOT "%revision%"=="0" (
	call:VReplace greasemonkey\%scriptname%.user.tmpl >greasemonkey\%scriptname%.user.js
	call:VReplace greasemonkey\%scriptname%.release.user.tmpl >greasemonkey\%scriptname%.release.user.js
	copy /Y _version.js greasemonkey >nul 2>nul
)
FOR %%F IN ("%firefox%","%firefox1%","%firefox2%") DO (
	IF NOT %%~F=="" IF EXIST "%%~F\golem.css" call:firefox %%F
)
:endinstall
echo.Finished

rem ----------------------------------------------------------------------
rem Wait for a keypress (optional)
rem ----------------------------------------------------------------------
if "%wait%"=="1" (
	echo.&pause&goto:eof
)
goto:eof

rem ---------------------  FUNCTIONS  ---------------------

rem ----------------------------------------------------------------------
rem usage: call:Replace <find> <replace> <filename>
rem Finds and replaces the text matching the first argument with the second argument in the file specified by the third argument.
rem ----------------------------------------------------------------------
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
rem usage: call:VReplace <template> > <file>
rem ----------------------------------------------------------------------
:VReplace
for /f "tokens=* delims=" %%A in (%1) do (
	set "line=%%A"
	if defined line (
		call set "line=%%line:$VER$=%version%%%"
		call set "line=%%line:$REV$=%revision%%%"
		call set "line=%%line:$OLDREV$=%oldrev%%%"
		if "%release%" == "1" (
			call set "line=%%line:$REVORREL$= Release%%"
			call set "line=%%line:$REL$= Release%%"
			call set "line=%%line:$ISREL$=true%%"
		) else (
			call set "line=%%line:$REVORREL$=.%revision%%%"
			call set "line=%%line:$REL$= Beta%%"
			call set "line=%%line:$ISREL$=false%%"
		)
		call set "line=%%line:$FILE$=%manifest%%%"
		echo.!line!
	) ELSE echo.
)
goto:eof

rem ----------------------------------------------------------------------
rem usage: call:firefox <path>
rem ----------------------------------------------------------------------
:firefox
if EXIST "%~1%scriptname%.js" goto:greasemonkey
if EXIST "%~1%oldscriptname%.user.js" goto:greasemonkey
if EXIST "%~1%scriptname%@golem.user.js" goto:scriptish
if EXIST "%~1%oldscriptname%@golem.user.js" goto:scriptish
goto:eof
:greasemonkey
echo.Installing new version to Greasemonkey (%~1)
copy /Y golem.css "%~1" >nul 2>nul
copy /Y %script% "%~1%scriptname%.js" >nul 2>nul
copy /Y greasemonkey\%scriptname%.user.js "%~1%oldscriptname%.user.js" >nul 2>nul
goto:eof

rem ----------------------------------------------------------------------
rem usage: call:scriptish <path>
rem ----------------------------------------------------------------------
:scriptish
echo.Installing new version to Scriptish (%~1)
copy /Y golem.css "%~1" >nul 2>nul
copy /Y %script% "%~1%scriptname%@golem.user.js" >nul 2>nul
copy /Y greasemonkey\%scriptname%.user.js "%~1%oldscriptname%@golem.user.js" >nul 2>nul
goto:eof
REM vi: ts=4
