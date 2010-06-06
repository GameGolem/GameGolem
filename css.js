/********** CSS code **********
* Gets pushed into the <head> on loading
*/
function do_css(){
$('head').append("<style type=\"text/css\">\
.red { background: red !important; }\
.golem-tooltip { display: none; position: absolute; top: 10000px; left: 10000px; min-width: 250px; z-index: 5; margin: 0; padding: 0; }\
.golem-tooltip > p { background: white; border: 1px solid #aaaaaa; margin: 0; padding: 5px; }\
.golem-tooltip > a { float: right; color: red; }\
.golem-config { float: none; margin-right: 0; }\
.golem-config > div { position: static; width: 196px; margin: 0; padding: 0; overflow: hidden; overflow-y: auto; }\
.golem-config #golem_fixed { float:right; margin:-2px; width:16px; height: 16px; background: url('data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%DE%DE%DE%DD%DD%DDcccUUU%00%00%00%23%06%7B1%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%00.IDATx%DAb%60A%03%0Cd%0B03%81%18LH%02%10%80%2C%C0%84%24%00%96d%C2%A7%02%AB%19L%8C%A8%B6P%C3%E9%08%00%10%60%00%00z%03%C7%24%170%91%00%00%00%00IEND%AEB%60%82') no-repeat; }\
.golem-config-fixed { float: right; margin-right: 200px; }\
.golem-config-fixed > div { position: fixed; }\
.golem-config-fixed #golem_fixed { background: url('data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%DE%DE%DE%DD%DD%DDcccUUU%00%00%00%23%06%7B1%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%005IDATx%DAb%60A%03%0C%C4%0901%83%00%13%92%0A%B0%00%0B)%02%8C%CCLLL%CC%0Cx%0CefF%E8%81%B9%83%19%DDa%84%05H%F0%1C%40%80%01%00%FE9%03%C7%D4%8CU%A3%00%00%00%00IEND%AEB%60%82') no-repeat; }\
#golem-dashboard { position: absolute; width: 600px; height: 185px; margin: 0; border-left: 1px solid black; border-right:1px solid black; overflow: hidden; background: white; z-index: 3; }\
#golem-dashboard thead th { cursor: pointer }\
#golem-dashboard thead th.golem-sort:after { content: '&darr;'; }\
#golem-dashboard thead th.golem-sort-reverse:after { content: '&uarr;'; }\
#golem-dashboard tbody tr:nth-child(odd) { background: #eeeeee; }\
#golem-dashboard tbody th { text-align: left; font-weight: normal; }\
#golem-dashboard td, #golem-dashboard th { margin: 2px; text-align: center; padding: 0 8px; }\
#golem-dashboard > div { height: 163px; overflow: hidden; overflow-y: scroll; border-top: 1px solid #d3d3d3; }\
#golem-dashboard > div > div { padding: 2px; }\
#golem-dashboard .golem-status { width: 100%; }\
#golem-dashboard .golem-status tbody th { text-align: right; padding: 2px; font-weight: bold; }\
#golem-dashboard .golem-status tbody td { text-align: left; }\
#golem-dashboard .overlay { position: absolute; left:10px; margin: 3px; color: white; text-shadow: black 0px 0px 2px; }\
table.golem-graph { height: 100px }\
table.golem-graph tbody th, table.golem-graph tbody td { border-top: 1px solid #dddddd; border-bottom: 1px solid #dddddd; }\
table.golem-graph tbody th { max-width: 75px; }\
table.golem-graph tbody th:first-child { text-align: right; border-left: 1px solid #dddddd; border-right: 1px solid #cccccc; }\
table.golem-graph tbody th:first-child div { line-height: 60px; height: 60px; }\
table.golem-graph tbody th:first-child div:first-child, table.golem-graph tbody th:first-child div:last-child { line-height: 20px; height: 20px; }\
table.golem-graph tbody th:last-child { text-align: left; border-right: 1px solid #dddddd; vertical-align: bottom; }\
table.golem-graph tbody th:last-child div { position: relative; height: 10px; margin: -10px 0 0; }\
table.golem-graph tbody th:last-child div:nth-last-child(1) { color: #ff0000; }\
table.golem-graph tbody th:last-child div:nth-last-child(2) { color: #0000ff; }\
table.golem-graph tbody th:last-child div:nth-last-child(3) { color: #00ffff; }\
table.golem-graph tbody th:last-child div:nth-last-child(4) { color: #aa00aa; }\
table.golem-graph tbody td { margin: 0; padding: 0 !important; vertical-align: bottom; width: 5px; border-right: 1px solid #dddddd; }\
table.golem-graph tbody td:nth-child(12n+1) { border-right: 1px solid #cccccc; }\
table.golem-graph tbody td div div { margin: 0; padding: 0; width: 5px; }\
table.golem-graph tbody td div.bars div:nth-last-child(1) { background: #00ff00; }\
table.golem-graph tbody td div.bars div:nth-last-child(2) { background: #00aa00; }\
table.golem-graph tbody td div.bars div:nth-last-child(3) { background: #ffff00; }\
table.golem-graph tbody td div.bars div:nth-last-child(4) { background: #ff00ff; }\
table.golem-graph tbody td div.goal div { position: relative; height: 1px; margin: -1px 0 0; }\
table.golem-graph tbody td div.goal div:nth-last-child(1) { background: #ff0000; }\
table.golem-graph tbody td div.goal div:nth-last-child(2) { background: #0000ff; }\
table.golem-graph tbody td div.goal div:nth-last-child(3) { background: #00ffff; }\
table.golem-graph tbody td div.goal div:nth-last-child(4) { background: #aa00aa; }\
.golem-button, .golem-button-active { border: 1px solid #d3d3d3; background: #e6e6e6 url(http://cloutman.com/css/base/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; display: inline-block; cursor: pointer; margin-left: 1px; margin-right: 1px; font-weight: normal; font-size: 13px; color: #555555; padding: 2px 2px 2px 2px; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; }\
.golem-button:hover, .golem-button-active { border: 1px solid #aaaaaa; background: #dadada url(http://cloutman.com/css/base/images/ui-bg_glass_75_dadada_1x400.png) 50% 50% repeat-x; }\
img.golem-button, img.golem-button-active { margin-bottom: -2px }\
.golem-tab-header { position: relative; top: 1px; border: 1px solid #d3d3d3; display: inline-block; cursor: pointer; margin-left: 1px; margin-right: 1px; background: #e6e6e6 url(http://cloutman.com/css/base/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #555555; padding: 2px 2px 1px 2px; -moz-border-radius-topleft: 3px; -webkit-border-top-left-radius: 3px; border-top-left-radius: 3px; -moz-border-radius-topright: 3px; -webkit-border-top-right-radius: 3px; border-top-right-radius: 3px; }\
.golem-tab-header-active { border: 1px solid #aaaaaa; border-bottom: 0 !important; padding: 2px; background: #dadada url(http://cloutman.com/css/base/images/ui-bg_glass_75_dadada_1x400.png) 50% 50% repeat-x; }\
.golem-title { padding: 4px; overflow: hidden; border-bottom: 1px solid #aaaaaa; background: #cccccc url(http://cloutman.com/css/base/images/ui-bg_highlight-soft_75_cccccc_1x100.png) 50% 50% repeat-x; color: #222222; font-weight: bold; }\
.golem-panel > .golem-panel-header, .golem-panel > * > .golem-panel-header { border: 1px solid #d3d3d3; cursor: pointer; margin-top: 1px; background: #e6e6e6 url(http://cloutman.com/css/base/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #555555; padding: 2px 2px 2px 2px; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; }\
.golem-panel > .golem-panel-content, .golem-panel > * > .golem-panel-content { border: 1px solid #aaaaaa; border-top: 0 !important; padding: 2px 6px; background: #ffffff url(http://cloutman.com/css/base/images/ui-bg_glass_65_ffffff_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #212121; display: none; -moz-border-radius-bottomleft: 3px; -webkit-border-bottom-left-radius: 3px; border-bottom-left-radius: 3px; -moz-border-radius-bottomright: 3px; -webkit-border-bottom-right-radius: 3px; border-bottom-right-radius: 3px; }\
.golem-panel-show > .golem-panel-header, .golem-panel-show > * > .golem-panel-header { border: 1px solid #aaaaaa; border-bottom: 0 !important; background: #dadada url(http://cloutman.com/css/base/images/ui-bg_glass_75_dadada_1x400.png) 50% 50% repeat-x; -moz-border-radius-bottomleft: 0 !important; -webkit-border-bottom-left-radius: 0 !important; border-bottom-left-radius: 0 !important; -moz-border-radius-bottomright: 0 !important; -webkit-border-bottom-right-radius: 0 !important; border-bottom-right-radius: 0 !important; }\
.golem-panel-show > .golem-panel-content, .golem-panel-show > * > .golem-panel-content { display: block; }\
.golem-panel-sortable .golem-lock { display: none; }\
.golem-panel-content br:last-child { clear: both; }\
.golem-panel .golem-panel-header .golem-icon { float: left; width: 16px; height: 16px; background: url('data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTEUUU%00%00%00%F5%04%9F%A0%00%00%00%02tRNS%FF%00%E5%B70J%00%00%00%22IDATx%DAb%60D%03%0C%D4%13%60%C0%10%60%C0%10%60%C0%10%60%20%A4%82%90-%149%1D%20%C0%00%81%0E%00%F1%DE%25%95%BE%00%00%00%00IEND%AEB%60%82') no-repeat; }\
.golem-panel .golem-panel-header .golem-lock { float: right; width: 16px; height: 16px; background: url('data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTEUUU%00%00%00%F5%04%9F%A0%00%00%00%02tRNS%FF%00%E5%B70J%00%00%001IDATx%DAb%60D%03%0CD%0B000%A0%0800%C0D%E0%02%8C(%02%0C%0Cp%25%B8%05%18%09%0A%A0j%C1%B4%96%1C%BF%C0%01%40%80%01%00n%11%00%CF%7D%2Bk%9B%00%00%00%00IEND%AEB%60%82') no-repeat;}\
.golem-panel-show .golem-panel-header .golem-icon { float: left; width: 16px; height: 16px; background: url('data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTEUUU%00%00%00%F5%04%9F%A0%00%00%00%02tRNS%FF%00%E5%B70J%00%00%00%22IDATx%DAb%60D%03%0C4%13%60%80%00%24%15%08%3EL%0B%9C%CF%88N%D3%D0a%C8%00%20%C0%00%7F%DE%00%F1%CCc%A6b%00%00%00%00IEND%AEB%60%82') no-repeat; }\
</style>");
}
