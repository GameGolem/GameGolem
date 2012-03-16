// needed for stable trunk links when developing
var trunk_revision = 1193;
try {
    trunk_revision = parseFloat(("$Revision$".match(/\b(\d+)\s*\$/)||[0,0])[1]) || trunk_revision;
} catch (e97) {}
