// ==UserScript==
// @name           Rycochet's Castle Age Golem
// @namespace      golem
// @description    Auto player for castle age game
// @version        10
// @include        http*://apps.*facebook.com/castle_age/*
// @require        http://cloutman.com/jquery-latest.min.js
// @require        http://cloutman.com/jquery-ui-latest.min.js
// ==/UserScript==
// -- @include        http://www.facebook.com/common/error.html
// -- @include        http://www.facebook.com/reqs.php#confirm_46755028429_0
// -- @include        http://www.facebook.com/home.php
// -- @include        http://www.facebook.com/home.php*filter=app_46755028429*

// User changeable
var debug = true;

// Shouldn't touch
var VERSION = 10;
var APP = '46755028429';
var PREFIX = 'golem'+APP+'_';

// Private data
var Workers = [];
var $configWindow = null;
var userID = unsafeWindow.Env.user; // Facebook userid
var script_started = Date.now();

if(typeof GM_debug === 'undefined') {
	GM_debug = function(txt) { if(debug) { GM_log(txt); } };
}
