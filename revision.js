// needed for stable trunk links when developing
var trunk_revision = 1164;
try {
    trunk_revision = parseFloat(("$Revision$".match(/\b(\d+)\s*\$/)||[0,0])[1]) || 1164;
} catch (e97) {
    console.log(e97.name + ' in Main: ' + e97.message);
}
console.log('GameGolem: trunk_revision ' + trunk_revision);
