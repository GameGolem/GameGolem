#!/bin/sh

cd $(dirname $0)

cat _head.js \
    _main.js \
    css.js \
    utility.js \
    worker.js \
    worker_+*.js \
    $(ls -1 worker_*.js | grep -v "\+") \
    > _normal.user.js

# update installed script
#cat _normal.user.js > $HOME/.mozilla/firefox/*.default/gm_scripts/rycochets_castle_age_gol/rycochets_castle_age_gol.user.js

# release
#compiler=../compiler.jar
#cat _head.js > _release.user.js
#java -jar "$compiler" --js _normal.user.js >> _release.user.js
