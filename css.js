/********** CSS code **********
* Gets pushed into the <head> on loading
*/

/*background: #66401B url("http://image2.castleagegame.com/1393/graphics/bg_jobs_tile.jpg") 0 0 repeat;*/

$('head').append("<style type=\"text/css\">\
.golem-config { float: none; margin-right: 0; }\
.golem-config > div { position: static; width: 196px; margin: 0; padding: 0; overflow: hidden; overflow-y: auto;  }\
.golem-config-fixed { float: right; margin-right: 200px; }\
.golem-config-fixed > div { position: fixed; }\
#golem-dashboard { position: absolute; width: 600px; height: 185px; margin: 0; border-left: 1px solid black; border-right:1px solid black; overflow: hidden; background: white; z-index: 1; }\
#golem-dashboard tbody tr:nth-child(odd) { background: #eeeeee; }\
#golem-dashboard td, #golem-dashboard th { margin: 2px; text-align: center; padding: 0 8px; }\
#golem-dashboard > div { height: 163px; overflow-y: scroll; border-top: 1px solid #d3d3d3; }\
#golem-dashboard > div > div { padding: 2px; }\
table.golem-graph { height: 100px }\
table.golem-graph tbody th { text-align: right; max-width: 75px; }\
table.golem-graph tbody th div { line-height: 60px; height: 60px; }\
table.golem-graph tbody th div:first-child, table.golem-graph tbody th div:last-child { line-height: 20px; height: 20px; }\
table.golem-graph tbody td { margin: 0; padding: 0 !important; vertical-align: bottom; width: 5px; border-right: 1px solid white; }\
table.golem-graph tbody td div { margin: 0; padding: 0; background: #00aa00; width: 5px; border-top: 1px solid blue; }\
table.golem-graph tbody td div:last-child { background: #00ff00; }\
.golem-button { border: 1px solid #d3d3d3; display: inline-block; cursor: pointer; margin-left: 1px; margin-right: 1px; background: #e6e6e6 url(http://cloutman.com/css/base/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; font-weight: normal; font-size: 13px; color: #555555; padding: 2px 2px 2px 2px; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; }\
img.golem-button { margin-bottom: -6px }\
.golem-button:hover { border: 1px solid #aaaaaa; background: #dadada url(http://cloutman.com/css/base/images/ui-bg_glass_75_dadada_1x400.png) 50% 50% repeat-x; }\
.golem-tab-header { position: relative; top: 1px; border: 1px solid #d3d3d3; display: inline-block; cursor: pointer; margin-left: 1px; margin-right: 1px; background: #e6e6e6 url(http://cloutman.com/css/base/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #555555; padding: 2px 2px 1px 2px; -moz-border-radius-topleft: 3px; -webkit-border-top-left-radius: 3px; border-top-left-radius: 3px; -moz-border-radius-topright: 3px; -webkit-border-top-right-radius: 3px; border-top-right-radius: 3px; }\
.golem-tab-header-active { border: 1px solid #aaaaaa; border-bottom: 0 !important; padding: 2px; background: #dadada url(http://cloutman.com/css/base/images/ui-bg_glass_75_dadada_1x400.png) 50% 50% repeat-x; }\
\
.golem-title { padding: 4px; overflow: hidden; border-bottom: 1px solid #aaaaaa; background: #cccccc url(http://cloutman.com/css/base/images/ui-bg_highlight-soft_75_cccccc_1x100.png) 50% 50% repeat-x; color: #222222; font-weight: bold; }\
\
.golem-panel > .golem-panel-header, .golem-panel > * > .golem-panel-header { border: 1px solid #d3d3d3; cursor: pointer; margin-top: 1px; background: #e6e6e6 url(http://cloutman.com/css/base/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #555555; padding: 2px 2px 2px 2px; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; }\
.golem-panel > .golem-panel-content, .golem-panel > * > .golem-panel-content { border: 1px solid #aaaaaa; border-top: 0 !important; padding: 2px 6px; background: #ffffff url(http://cloutman.com/css/base/images/ui-bg_glass_65_ffffff_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #212121; display: none; -moz-border-radius-bottomleft: 3px; -webkit-border-bottom-left-radius: 3px; border-bottom-left-radius: 3px; -moz-border-radius-bottomright: 3px; -webkit-border-bottom-right-radius: 3px; border-bottom-right-radius: 3px; }\
.golem-panel-show  > .golem-panel-header, .golem-panel-show  > * > .golem-panel-header { border: 1px solid #aaaaaa; border-bottom: 0 !important; background: #dadada url(http://cloutman.com/css/base/images/ui-bg_glass_75_dadada_1x400.png) 50% 50% repeat-x; -moz-border-radius-bottomleft: 0 !important; -webkit-border-bottom-left-radius: 0 !important; border-bottom-left-radius: 0 !important; -moz-border-radius-bottomright: 0 !important; -webkit-border-bottom-right-radius: 0 !important; border-bottom-right-radius: 0 !important; }\
.golem-panel-show > .golem-panel-content, .golem-panel-show > * > .golem-panel-content { display: block; }\
.golem-panel-sortable .golem-lock { display: none; }\
\
.golem-title .golem-fixed-off { float: right; width: 16px; height: 16px; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAA9QTFRF3t7e3d3dY2NjVVVVAAAAIwZ7MQAAAAV0Uk5T%2F%2F%2F%2F%2FwD7tg5TAAAALklEQVR42mJgQQMMZAswM4EYTEgCEIAswIQkAJZkwqcCqxlMjKi2UMPpCAAQYAAAegPHJBcwkQAAAABJRU5ErkJggg%3D%3D) no-repeat; }\
.golem-title .golem-fixed-on { float: right; width: 16px; height: 16px; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAA9QTFRF3t7e3d3dY2NjVVVVAAAAIwZ7MQAAAAV0Uk5T%2F%2F%2F%2F%2FwD7tg5TAAAANUlEQVR42mJgQQMMxAkwMYMAE5IKsAALKQKMzExMTMwMeAxlZkbogbmDGd1hhAVI8BxAgAEA%2FjkDx9SMVaMAAAAASUVORK5CYII%3D) no-repeat; }\
.golem-panel .golem-panel-header .golem-icon { float: left; width: 16px; height: 16px; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFVVVVAAAA9QSfoAAAAAJ0Uk5T%2FwDltzBKAAAAIklEQVR42mJgRAMM1BNgwBBgwBBgwBBgIKSCkC0UOR0gwACBDgDx3iWVvgAAAABJRU5ErkJggg%3D%3D) no-repeat; }\
.golem-panel .golem-panel-header .golem-lock { float: right; width: 16px; height: 16px; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFVVVVAAAA9QSfoAAAAAJ0Uk5T%2FwDltzBKAAAAMUlEQVR42mJgRAMMRAswMDCgCDAwwETgAowoAgwMcCW4BRgJCqBqwbSWHL%2FAAUCAAQBuEQDPfStrmwAAAABJRU5ErkJggg%3D%3D) no-repeat;}\
.golem-panel-show .golem-panel-header .golem-icon { float: left; width: 16px; height: 16px; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFVVVVAAAA9QSfoAAAAAJ0Uk5T%2FwDltzBKAAAAIklEQVR42mJgRAMMNBNggAAkFQg%2BTAucz4hO09BhyAAgwAB%2F3gDxzGOmYgAAAABJRU5ErkJggg%3D%3D) no-repeat; }\
</style>");

//.golem-panel > .golem-panel-header .golem-icon { float: left; background-position: -32px -16px; }\
