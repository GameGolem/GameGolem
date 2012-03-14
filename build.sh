#!/bin/sh
#
# Build script for Game-Golem

# Configuration file location
conf="$(dirname $0)/build.conf"

# Create default config file if it doesn't exists
if [ ! -f "$conf" ]; then
    echo "Writing default build.conf file"
    cat > "$conf" << 'END_OF_CONF'
# Configuration of Game-Golem unix build system
# This is a standard shell script that will be sourced by build.sh

# Working directory
#
#
# the default is the one which contains this script
workdir="$(dirname $0)"

# Path of js compiler
#
# Required to build the minimized version. You can download it from
# http://code.google.com/closure/compiler/
#
js_compiler="../compiler.jar"

# Path of chrome/chromium
#
# Required to build the packed Google Chrome extension.
# Will be detected automatically if you have chromium-browser
# in your PATH
#
chrome_browser="$(which chromium-browser)"

# Update installed script directly in Firefox data directory
#
# Set it to "Yes" to enable the following lines and you'll only need
# to hit F5 / refresh in Firefox
# It will work for all profiles, not only the current.
#
update_firefox="No"

# Generate Google Chrome extension
#
# Set it to "Yes" to generate the packed Google Chrmoe extension.
# You must obtain the GameGolem.pem file from Rycochet for this.
#
build_chrome="No"

# Generate _release.user.js
#
# Set it to "Yes" to generate the minimised version.
# This is only required for release, but is recommended as it can catch syntax errors!
#
build_release="No"

END_OF_CONF
fi

# Default configuration
workdir="$(dirname $0)"
js_compiler="../compiler.jar"
chrome_browser="$(which chromium-browser)"
update_firefox="No"
build_chrome="No"
build_release="No"

# Read configuration file (if exists)
[ -f "$conf" ] && . "$conf"

# Enter workdir
cd "$workdir"

# Remove old stuff
echo "Removing old build files."
rm -f _normal.user.js _min.user.js _head_revision.js _head_tortoise.js _head_version.js _version.js main.js
rm -f chrome/_version.js chrome/update.xml
rm -rf chrome/GameGolem/*
[ "$1" = "clean" ] && exit 1

# Compute revision number
if [ -d .svn ]; then
    vcs="svn"
else
    vcs="git svn"
fi
rev=`LANG=C $vcs info . | awk '/^Revision:/{print $2 + 1}'`
file=_version.txt
if [ -f "$file" ] ; then
    ver=`cat "$file"`
else
    echo "Error: missing $file"
    rc=1
fi
head=_head.tmpl
manifest=_manifest.txt
manilist=''
rc=0

for file in _version.tmpl main.tmpl ; do
    if [ -f "$file" ] ; then
        sed "s/\\\$REV\\\$/$rev/g;s/\\\$VER\\\$/$ver/g" $file > `basename $file .tmpl`.js
    else
        echo "Error: missing $file"
        rc=1
    fi
done
[ 0 = "$rc" ] || exit $rc

### generate _normal.user.js ###
out=_normal.user.js
echo "Joining files into $out"
if [ -f "$head" ] ; then
    sed "s/\\\$REV\\\$/$rev/g;s/\\\$VER\\\$/$ver/g" "$head" > "$out"
else
    echo "Error: missing $head"
    rc=1
fi
if [ ! -f $manifest ] ; then
    echo "Error: missing $manifest"
    rc=1
fi
[ 0 = "$rc" ] || exit $rc
cat _wrap_top.js >> "$out"
for file in `sed -e 's/#.*//g' $manifest` ; do
    if [ -f $file ] ; then
        cat "$file" >> "$out"
	manilist="$manilist,\"$file\""
    else
        echo "Error: missing $file"
        rc=1
    fi
done
cat _wrap_bottom.js >> "$out"
manilist="${manilist#,}"
[ 0 = "$rc" ] || exit $rc

### Google Chrome extension (unpacked) ###
echo "Creating unpacked Chrome extension"
# Create chrome build dir if doesn't exists
mkdir -p chrome/GameGolem
mkdir -p chrome/GameGolem/images
cp -r chrome/GameGolem.tmpl/* chrome/GameGolem/
cp -r images/*.png chrome/GameGolem/images/
cp golem.css chrome/GameGolem/
in=chrome/manifest.tmpl
out=chrome/GameGolem/manifest.json
if [ -f "$in" ] ; then
    sed "s/\\\$REV\\\$/$rev/g;s/\\\$VER\\\$/$ver/g;s/\\\$FILE\\\$/$manilist/g" "$in" > "$out"
else
    echo "Error: missing $in"
    rc=1
fi
for file in `sed -e 's/#.*//g' $manifest` ; do
    if [ -f $file ] ; then
        cp $file chrome/GameGolem/
    else
        echo "Error: missing $file"
        rc=1
    fi
done
[ 0 = "$rc" ] || exit $rc

### GOOGLE CHROME EXTENSION ###
# To build the "proper" chrome extension you need Chrome installed
# To get the GameGolem.pem file please ask Rycochet - and don't share it!!!
if [ "$build_chrome" = "Yes" ]; then
    if [ -f chrome/GameGolem.pem ]; then
        echo "Creating packed Chrome extension"
        "$chrome_browser" --no-message-box --pack-extension="$workdir/chrome/GameGolem" --pack-extension-key="$workdir/chrome/GameGolem.pem"
	if [ "$build_release" = "Yes" ]; then
	    map="s/\\\$REV\\\$/$rev/g;s/\\\$VER\\\$/$ver/g;s/\\\$REL\\\$/ Release/g;s/\\\$ISREL\\\$/true/g;s/\\\$REVORREL\\\$/ Release/g"
	else
	    map="s/\\\$REV\\\$/$rev/g;s/\\\$VER\\\$/$ver/g;s/\\\$REL\\\$/ Beta/g;s/\\\$ISREL\\\$/false/g;s/\\\$REVORREL\\\$/.$rev/g"
	fi
	sed "$map" chrome/update.tmpl > chrome/update.xml
        cp _version.js chrome/
   else
        echo "Would create packed Chrome extension, but you are missing chrome/GameGolem.pem"
    fi
fi

### MINIMISED VERSION ###
in=_normal.user.js
out=_min.user.js
if [ "$build_release" = "Yes" ]; then
    echo "Creating minimised version (will display any syntax errors)"
    if [ -f "$js_compiler" -a -f "$in" ]; then
	if [ -f $head ] ; then
	    map="s/\\\$REV\\\$/$rev/g;s/\\\$VER\\\$/$ver/g;s/\\\$REL\\\$/ Release/g;s/\\\$ISREL\\\$/true/g;s/\\\$REVORREL\\\$/ Release/g"
	    sed "$map" "$head" > "$out"
	else
	    echo "Error: missing $head"
	    rc=1
	fi
        java -jar "$js_compiler" --js "$in" >> "$out"
    else
        echo "Error: missing js compiler."
        rc=1
    fi
fi

### INSTALLED VERSION ###
in=_normal.user.js
if [ "$update_firefox" = "Yes" ]; then
    echo "Installing new version to Firefox"
    for script in "$HOME"/.mozilla/firefox/*.default/gm_scripts/rycochets_castle_age_gol/rycochets_castle_age_gol.user.js; do
        if [ -f "$script" ]; then
            cat "$in" > "$script"
        fi
    done
fi

[ 0 = "$rc" ] && echo "Build completed."
exit $rc
