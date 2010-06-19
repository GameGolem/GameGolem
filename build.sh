#!/bin/sh 
#
# Build script fot _normal.user.js and _release.user.js
#
# Please copy this file before changing it unless you want to commit
# your modifications.

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
# This is only required for release!
#
build_release="No"


# Workdir
cd $(dirname $0)

# Remove old stuff
rm -f _normal.user.js _min.user.js chrome\GameGolem\golem.user.js _head_revision.js _head_tortoise.js

# Compute revision number
if [ -d .svn ]; then
    vcs="svn"
else
    vcs="git svn"
fi
rev=`LANG=C $vcs info . | awk '/^Revision:/{print $2 + 1}'`
sed "s/\\\$WCREV\\\$/$rev/" _head_revision.tmpl > _head_revision.js
sed "s/\\\$WCREV\\\$/$rev/" chrome/manifest.tmpl > chrome/GameGolem/manifest.json
sed "s/\\\$WCREV\\\$/$rev/" chrome/update.tmpl > chrome/update.xml

### generate _normal.user.js ###
echo "Joining files into _normal.user.js"
cat _head*.js \
    _main.js \
    css.js \
    utility.js \
    worker.js \
    $(ls -1 worker_+*.js) \
    $(ls -1 worker_*.js | grep -v "\+") \
    > _normal.user.js

### Google Chrome extension (unpacked) ###
echo "Copying to chrome/GameGolem/golem.user.js"
if [ ! -f chrome/GameGolem ]; then
    mkdir -p chrome/GameGolem
fi
cp -f -u chrome/GameGolem.tmpl/* chrome/GameGolem/
cp _normal.user.js chrome/GameGolem/golem.user.js

### GOOGLE CHROME EXTENSION ###
# To build the "proper" chrome extension you need Chrome installed
# *NOTE*: Chrome *CANNOT* be running - http://code.google.com/p/chromium/issues/detail?id=22901
# To get the GameGolem.pem file please ask Rycochet - and don't share it!!!
if [ "$build_chrome" = "Yes" ]; then
    if [ -d chrome/GameGolem.pem ]; then
        echo "Creating Google Chrome extension"
        $chrome_browser --no-message-box --pack-extension=chrome/GameGolem --pack-extension-key=chrome/GameGolem.pem
    else 
        echo "Would create Google Chrome extension, but you miss chrome/GameGolem.pem file"
    fi
fi

### MINIMISED VERSION ###
if [ "$build_release" = "Yes" ]; then
    echo "Creating minimised version (will also show errors)"
    if [ -r "$js_compiler" ]; then
      cat _head.js > _release.user.js
      java -jar "$js_compiler" --js _normal.user.js >> _release.user.js
      cat _head.js > _release_chrome.user.js
      java -jar "$js_compiler" --js _normal_chrome.user.js >> _release_chrome.user.js
    else
      echo "Error: missing js compiler."
    fi
fi

### INSTALLED VERSION ###
if [ "$update_firefox" = "Yes" ]; then
    echo "Installing new version to Firefox"
    for script in $HOME/.mozilla/firefox/*.default/gm_scripts/rycochets_castle_age_gol/rycochets_castle_age_gol.user.js; do
        if [ -f "$script" ]; then
            cat _normal.user.js > "$script"
        fi
    done
fi
