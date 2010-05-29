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

# Update installed script directly in Firefox data directory
#
# Set it to "Yes" to enable the following lines and you'll only need
# to hit F5 / refresh in Firefox
# It will work for all profiles, not only the current.
#
update_firefox="No"


# Generate _release.user.js
#
# Set it to "Yes" to generate the minimised version.
# This is only required for release!
#
build_release="No"


# Workdir
cd $(dirname $0)

# Compute revision number
if [ -d .svn ]; then
    vcs="svn"
else
    vcs="git svn"
fi
rev=`LANG=C $vcs info . | awk '/^Revision:/{print $2}'`
sed "s/\\\$WCREV\\\$/$rev/" _head_tortoise.tmpl > _head_tortoise.js

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

### generate _normal.user.js ###
echo "Joining files into _normal_chrome.user.js"
cat _head*.js \
    _jquery*.min.js \
    _main.js \
    css.js \
    utility.js \
    worker.js \
    $(ls -1 worker_+*.js) \
    $(ls -1 worker_*.js | grep -v "\+") \
    > _normal_chrome.user.js

### INSTALLED VERSION ###
if [ "$update_firefox" = "Yes" ]; then
    echo "Installing new version to Firefox"
    for script in $HOME/.mozilla/firefox/*.default/gm_scripts/rycochets_castle_age_gol/rycochets_castle_age_gol.user.js; do
        if [ -f "$script" ]; then
            cat _normal.user.js > "$script"
        fi
    done
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
