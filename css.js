/********** CSS code **********
* Gets pushed into the <head> on loading
*/

/*background: #66401B url("http://image2.castleagegame.com/1393/graphics/bg_jobs_tile.jpg") 0 0 repeat;*/

$('head').append("<style type=\"text/css\">\
.golem-config { float: none; margin-right: 0; }\
.golem-config > div { position: static; width: 196px; margin: 0; padding: 0; overflow: hidden; overflow-y: auto;  }\
.golem-config-fixed { float: right; margin-right: 200px; }\
.golem-config-fixed > div { position: fixed; }\
.golem-title { padding: 4px; overflow: hidden; border-bottom: 1px solid #aaaaaa; background: #cccccc url(http://cloutman.com/css/base/images/ui-bg_highlight-soft_75_cccccc_1x100.png) 50% 50% repeat-x; color: #222222; font-weight: bold; }\
.golem-panel .golem-panel-header { border: 1px solid #d3d3d3; cursor: pointer; margin-top: 1px; background: #e6e6e6 url(http://cloutman.com/css/base/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #555555; padding: 2px 2px 2px 2px; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; }\
.golem-panel .golem-icon { float: left; background-position: -32px -16px; }\
.golem-panel .golem-locked { float: right; background-position: -192px -96px; }\
.golem-panel .golem-panel-content { border: 1px solid #aaaaaa; border-top: 0 !important; padding: 2px 6px; background: #ffffff url(http://cloutman.com/css/base/images/ui-bg_glass_65_ffffff_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #212121; display: none; -moz-border-radius-bottomleft: 3px; -webkit-border-bottom-left-radius: 3px; border-bottom-left-radius: 3px; -moz-border-radius-bottomright: 3px; -webkit-border-bottom-right-radius: 3px; border-bottom-right-radius: 3px; }\
.golem-panel-show  .golem-panel-header { border: 1px solid #aaaaaa; border-bottom: 0 !important; -moz-border-radius-bottomleft: 0 !important; -webkit-border-bottom-left-radius: 0 !important; border-bottom-left-radius: 0 !important; -moz-border-radius-bottomright: 0 !important; -webkit-border-bottom-right-radius: 0 !important; border-bottom-right-radius: 0 !important; }\
.golem-panel-show  .golem-panel-header .golem-icon { background-position: -64px -16px; }\
.golem-panel-show  .golem-panel-content { display: block; }\
.golem-panel-sortable .golem-locked { display: none; }\
</style>");
